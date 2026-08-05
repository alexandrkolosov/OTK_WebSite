# ОТК — сайт корпоративного транспортного обслуживания

Сайт компании ОТК (otktrans.ru): услуги, автопарк, кейсы, блог, контакты с формой
заявки. Реализован из дизайн-макета на **Astro + Tailwind CSS** с переносом
дизайн-системы «Industry» один-в-один (токены в `tailwind.config.mjs` + слой
компонентов в `src/styles/global.css`).

## Стек

- **Astro 5** — статическая генерация страниц (SEO, скорость), плюс один
  серверный endpoint для формы (адаптер `@astrojs/node`).
- **Tailwind CSS 3** — вёрстка утилитами поверх токенов дизайн-системы.
- Barlow / Barlow Condensed (Google Fonts).

## Разработка

```bash
npm install
npm run dev        # http://localhost:4321
```

## Сборка и запуск (продакшн)

```bash
npm run build      # → dist/ (статические страницы + серверный entry)
node ./dist/server/entry.mjs   # запускает Node-сервер (по умолчанию порт 4321)
```

Все контентные страницы пререндерятся в статику; на сервере работает только
`/api/contact/` (обработчик формы).

## Форма заявки → Telegram

Форма на `/kontakty/` отправляет заявку в Telegram через бота. Задайте секреты
в `.env` (см. `.env.example`):

```
TELEGRAM_BOT_TOKEN=токен_от_@BotFather
TELEGRAM_CHAT_ID=id_чата_или_группы
```

- Токен — у [@BotFather](https://t.me/BotFather).
- `chat_id` — напишите боту (или добавьте в группу) и откройте
  `https://api.telegram.org/bot<ТОКЕН>/getUpdates`, возьмите `chat.id`
  (для группы — со знаком минус).

Без заданных секретов endpoint возвращает контролируемую ошибку, а форма
показывает пользователю сообщение «не удалось отправить» (токен не раскрывается).
Проверка: `POST /api/contact/` c JSON `{name, phone|email, company?, task?}`.

## Структура

```
src/
  layouts/      BaseLayout.astro (SEO/JSON-LD/шапка/подвал), ArticleLayout.astro
  components/   Header, Footer, Hero, Logo, SectionHead, Corners
  pages/        index, uslugi, avtopark, keysy, o-kompanii, kontakty, 404
                blog/ (индекс + 7 статей), api/contact.ts
  styles/       global.css (токены + слой компонентов дизайн-системы)
public/         img/, logo.svg, favicon.svg, robots.txt, sitemap.xml, llms.txt
docs/           CONVERSION_GUIDE.md — контракт переноса макета в код
```

URL-схема — русские слаги, как в `sitemap.xml` и canonical (`/uslugi/`,
`/avtopark/`, `/keysy/`, `/o-kompanii/`, `/kontakty/`, `/blog/<slug>/`).

Исходный дизайн-экспорт лежит локально в `source/` (в git не коммитится).
