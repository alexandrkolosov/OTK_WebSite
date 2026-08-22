# Страницы услуг + переименование — план реализации

> **Для исполнителя:** задачи по порядку; после каждой — сборка `npm run build` и проверка `grep` по `dist/`. Юнит-тестов в проекте нет, верификация = успешная сборка + наличие нужного контента/SEO в собранном HTML + визуальная проверка в браузере.

**Goal:** 5 детальных SEO-лендингов услуг под `/uslugi/*` из единого источника данных, + переименование «корпоративное такси» → «Аренда авто с экипажем по заявке» по всему сайту.

**Architecture:** данные услуг в `src/data/services.ts` (single source of truth) → индекс `/uslugi/` и динамический маршрут `/uslugi/[slug]` рендерят из них. Дизайн — существующие компоненты/стили.

**Tech Stack:** Astro 5 (static), Tailwind, existing `BaseLayout`, `SectionHead`, стили `blueprint`/`table`/`btn`.

## Global Constraints
- Контент только на фактах; «типовые сценарии» помечать как иллюстративные; НЕ выдумывать клиентов/отзывы/цены (цены — «по запросу»).
- Реальные факты: авто до −30% к рынку; водители 10+ лет; низкая аварийность; TMS (ГЛОНАСС/GPS + приложение водителя + топливные карты/парковки + оплата штрафов + скоринг аварийности); результаты с /keysy/: −23% расходов, 99,4% вовремя, −15% стоимости.
- Никакого слова «такси» как названия услуги. Услуга #2 = «Аренда авто с экипажем по заявке», URL `/uslugi/arenda-avto-s-ekipazhem/`.
- Блог-статья `/blog/korporativnoe-taksi-pravila/`: URL НЕ менять, контент переформулировать.

---

### Задача 1: Данные услуг `src/data/services.ts`
**Файлы:** Create `src/data/services.ts`
**Содержимое:** массив 5 услуг, у каждой: `slug, name, navLabel, seoTitle, seoDescription, heroLead, whatIncludes[], howItWorks[{n,title,body}], conditions[[label,value]], forWhom, whyOtk[], example (иллюстративный сценарий), faq[{q,a}]`. Экспорт `services` + типы.
**Verify:** `npx astro check` / импорт без ошибок при сборке (шаг после задачи 2).

### Задача 2: Шаблон детальной страницы `src/pages/uslugi/[slug].astro`
**Файлы:** Create `src/pages/uslugi/[slug].astro`
**Содержимое:** `getStaticPaths()` из `services`; секции по структуре (Hero → Что входит → Как работает → Условия → Кому подходит → Почему ОТК → Типовой сценарий → FAQ → CTA); JSON-LD Service + FAQPage + BreadcrumbList; передаёт `seoTitle/seoDescription/path/active="services"` в BaseLayout.
**Verify:** `npm run build` → в `dist/client/uslugi/arenda-avto-s-voditelem/index.html` есть H1, FAQ, `"@type":"FAQPage"`.

### Задача 3: Переписать индекс `src/pages/uslugi.astro`
**Файлы:** Modify `src/pages/uslugi.astro`
**Содержимое:** карточки услуг из `services` (name + короткое описание + «Подробнее →» на `/uslugi/<slug>/`); переименовать #2; сохранить hero/CTA/«как формируется стоимость».
**Verify:** сборка; в `dist/.../uslugi/index.html` есть ссылки на 5 детальных URL и нет слова «такси».

### Задача 4: Переименование на главной и в кейсах
**Файлы:** Modify `src/pages/index.astro`, `src/pages/keysy.astro`
**Содержимое:** заменить «корпоративное такси» → «аренда авто с экипажем (по заявке)» в тексте, ссылках, title/meta, JSON-LD.
**Verify:** `grep -ri "такси" dist/client/index.html dist/client/keysy/` → пусто (кроме, если осталось, — проверить).

### Задача 5: `public/llms.txt`
**Файлы:** Modify `public/llms.txt`
**Содержимое:** починить ссылки услуг на реальные новые URL; переименовать «корпоративное такси»; обновить факты (TMS-функции, преимущества).
**Verify:** ссылки услуг соответствуют реальным страницам.

### Задача 6: `public/sitemap.xml`
**Файлы:** Modify `public/sitemap.xml`
**Содержимое:** добавить 5 URL услуг (`<lastmod>2026-08-22`), приоритеты 0.8–0.9.
**Verify:** валидный XML, 20 `<url>`.

### Задача 7: Блог-статья про «такси»
**Файлы:** Modify `src/pages/blog/korporativnoe-taksi-pravila.astro`
**Содержимое:** URL/slug не трогать; заголовок и текст переформулировать под «аренду авто с экипажем / поездки сотрудников», убрать позиционирование услуги как «такси».
**Verify:** сборка; URL прежний; в тексте нет услуги-«такси».

### Задача 8: Финальная сборка и проверка
**Verify:** `npm run build` → `[build] Complete!`; grep: счётчики Метрики/GA на новых страницах; открыть 1–2 страницы в браузере (визуально).

### Задача 9: Деплой
`git add -A && commit && push` → на сервере `cd /opt/otk && git pull && npm run build && systemctl restart otk` → **очистить кэш DDoS-Guard** → добавить новые URL в переобход Вебмастера.
