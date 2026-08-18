# Деплой сайта ОТК на VPS в Yandex Cloud

Сайт — это статические страницы + один серверный endpoint формы. Собирается в
самодостаточный Node-сервер (`dist/server/entry.mjs`), который на VPS работает
за Nginx (TLS, кэш, gzip). Всё отдаётся с вашего сервера в России — без внешних
CDN, которые могут блокироваться.

Итоговая схема: **Nginx (порт 443/80, TLS) → статика из `dist/client` + `/api/` в Node (порт 4321)**.

---

## 0. Что понадобится
- Аккаунт в [Yandex Cloud](https://console.yandex.cloud/) с привязанным биллингом.
- Доступ к DNS домена `otktrans.ru` (там, где куплен домен) — чтобы поменять A-запись.
- Токен Telegram-бота и `chat_id` (для формы) — см. `.env.example`.
- SSH-ключ (если нет: `ssh-keygen -t ed25519` — получится `~/.ssh/id_ed25519.pub`).

---

## 1. Создать виртуальную машину

Консоль Yandex Cloud → **Compute Cloud** → **Создать ВМ**:
- **Образ:** Ubuntu 24.04 LTS.
- **Платформа/ресурсы:** 2 vCPU, 2 ГБ RAM (гарантированная доля 50% — хватает), диск 20 ГБ SSD.
- **Сеть:** публичный IP — выберите **статический** (Reserve), чтобы адрес не менялся.
- **Доступ:** логин, например `deploy`; вставьте содержимое `~/.ssh/id_ed25519.pub`.
- Создайте ВМ, запишите её **публичный IP** (например `51.250.x.x`).

Настройте **группу безопасности** (Security Group) для ВМ — разрешить входящие:
- TCP **22** (SSH), TCP **80** (HTTP), TCP **443** (HTTPS). Остальное закрыто.

Подключитесь по SSH:
```bash
ssh deploy@ВАШ_IP
```

---

## 2. Направить домен на сервер

У регистратора домена `otktrans.ru` замените записи (удалив старые, которые вели на Vercel):
```
A     @     ВАШ_IP
A     www   ВАШ_IP
```
Подождите обновления DNS (обычно минуты, иногда до нескольких часов). Проверить:
```bash
dig +short otktrans.ru      # должен вернуть ВАШ_IP
```

---

## 3. Базовая настройка сервера (на ВМ)

```bash
sudo apt update && sudo apt -y upgrade
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs git nginx
# сборка картинок (sharp) требует этих библиотек
sudo apt -y install build-essential
node -v && npm -v      # проверка
```

---

## 4. Забрать код и собрать

```bash
sudo mkdir -p /opt/otk && sudo chown -R $USER:$USER /opt/otk
git clone https://github.com/alexandrkolosov/OTK_WebSite.git /opt/otk
cd /opt/otk
npm ci
```

Создайте `.env` с секретами Telegram (файл не в git):
```bash
cp .env.example .env
nano .env
# впишите:
# TELEGRAM_BOT_TOKEN=1234567890:AA...
# TELEGRAM_CHAT_ID=-1001234567890
```

Соберите:
```bash
npm run build      # создаст dist/client (статика) и dist/server/entry.mjs
```

---

## 5. Запустить Node-сервер как службу (systemd)

Создайте юнит:
```bash
sudo nano /etc/systemd/system/otk.service
```
Вставьте (замените `deploy`, если логин другой):
```ini
[Unit]
Description=OTK site (Astro Node server)
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/otk
Environment=HOST=127.0.0.1
Environment=PORT=4321
EnvironmentFile=/opt/otk/.env
ExecStart=/usr/bin/node ./dist/server/entry.mjs
Restart=always
RestartSec=3
User=deploy
Group=deploy

[Install]
WantedBy=multi-user.target
```
Запуск и автозапуск при перезагрузке:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now otk
sudo systemctl status otk          # должно быть active (running)
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4321/   # → 200
```

---

## 6. Nginx (статика + прокси формы)

```bash
sudo nano /etc/nginx/sites-available/otk
```
Вставьте:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name otktrans.ru www.otktrans.ru;

    root /opt/otk/dist/client;
    index index.html;

    gzip on;
    gzip_comp_level 5;
    gzip_min_length 1024;
    gzip_types text/css application/javascript image/svg+xml application/json application/xml font/woff2;

    # хешированные ассеты — кэшируем надолго
    location /_astro/ { add_header Cache-Control "public, max-age=31536000, immutable"; try_files $uri =404; }
    location /fonts/  { add_header Cache-Control "public, max-age=31536000, immutable"; try_files $uri =404; }

    # форма → Node
    location /api/ {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # статические страницы (trailingSlash: always → /путь/index.html)
    location / {
        try_files $uri $uri/index.html $uri/ =404;
    }

    error_page 404 /404.html;
}
```
Активировать:
```bash
sudo ln -s /etc/nginx/sites-available/otk /etc/nginx/sites-enabled/otk
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```
Проверьте по IP в браузере (`http://ВАШ_IP`) — сайт должен открыться (по IP TLS ещё нет, это нормально).

---

## 7. HTTPS (Let's Encrypt)

Когда DNS уже указывает на сервер:
```bash
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d otktrans.ru -d www.otktrans.ru
# выберите редирект HTTP→HTTPS, когда спросит
```
Certbot сам пропишет 443-блок и настроит автопродление. Проверка продления:
```bash
sudo certbot renew --dry-run
```

Готово — откройте **https://otktrans.ru**.

---

## 8. Обновление сайта в будущем

После новых изменений в GitHub:
```bash
cd /opt/otk
git pull
npm ci
npm run build
sudo systemctl restart otk
```
(Nginx перезапускать не нужно — статику он берёт из `dist/client` напрямую.)

По желанию можно автоматизировать это через GitHub Actions (webhook/SSH-деплой) — скажите, настрою.

---

## Проверки и диагностика
- Статус приложения: `sudo systemctl status otk`, логи: `journalctl -u otk -e`.
- Nginx: `sudo nginx -t`, логи: `/var/log/nginx/error.log`.
- Форма: отправьте тестовую заявку — должна прийти в Telegram. Если нет — проверьте
  `.env` (верный `TELEGRAM_CHAT_ID`, бот добавлен в группу) и `journalctl -u otk`.
- Обновили `.env`? Перезапустите службу: `sudo systemctl restart otk`.

Теперь весь сайт (страницы, CSS, шрифты, картинки, форма) отдаётся с вашего
сервера в РФ — проблема с блокировкой внешнего CDN исчезает.
