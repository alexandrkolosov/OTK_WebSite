# ОТК — сайт корпоративного транспортного обслуживания

Сайт компании ОТК (otktrans.ru): услуги, автопарк, кейсы, блог, контакты с формой
заявки. Реализован из дизайн-макета на **Astro + Tailwind CSS** с переносом
дизайн-системы «Industry» один-в-один (токены в `tailwind.config.mjs` + слой
компонентов в `src/styles/global.css`).

## Стек

- **Astro 5** — статическая генерация страниц (SEO, скорость), плюс один
  серверный endpoint для формы (адаптер `@astrojs/vercel`).
- **Tailwind CSS 3** — вёрстка утилитами поверх токенов дизайн-системы.
- Barlow / Barlow Condensed (Google Fonts).

## Разработка

```bash
npm install
npm run dev        # http://localhost:4321
```

## Сборка

```bash
npm run build      # → .vercel/output (статика + serverless-функция формы)
```

Все контентные страницы пререндерятся в статику; `/api/contact/` деплоится как
serverless-функция (адаптер `@astrojs/vercel`).

## Деплой на Vercel

Проект настроен под Vercel (`@astrojs/vercel`). Два способа:

**Через дашборд (проще всего):**
1. [vercel.com/new](https://vercel.com/new) → Import Git Repository → выберите
   `alexandrkolosov/OTK_WebSite`. Framework Preset определится как **Astro**
   автоматически, отдельные настройки сборки не нужны.
2. В **Settings → Environment Variables** добавьте `TELEGRAM_BOT_TOKEN` и
   `TELEGRAM_CHAT_ID` (значения — см. `.env.example`).
3. **Deploy**. Каждый `git push` в `main` будет автоматически деплоиться.

**Через CLI:**
```bash
npm i -g vercel
vercel            # первый раз — привяжет проект (нужен вход в аккаунт)
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_CHAT_ID
vercel --prod
```

После деплоя привяжите домен `otktrans.ru` в **Settings → Domains**.

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
