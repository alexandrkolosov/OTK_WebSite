# Гайд по переносу `.dc.html` → Astro + Tailwind

Этот документ — единый контракт для всех, кто переносит страницы дизайн-экспорта
(`source/*.dc.html`) в Astro-страницы (`src/pages/*.astro`). Эталон, на который
надо равняться во всём: **`src/pages/index.astro`** (страница Home). Открой его и
повторяй те же приёмы.

## Золотые правила

1. **Точность превыше всего.** Весь русский текст, цифры, alt-тексты, порядок
   секций, ссылки-якоря — переносятся дословно. Никакой отсебятины, никаких
   «улучшений» копирайта. Внешний вид должен совпадать с исходным макетом.
2. **Не трогай общие файлы.** `global.css`, `tailwind.config.mjs`,
   `src/layouts/BaseLayout.astro`, `src/components/*` — только читать. Всё, что
   нужно для твоей страницы, делай внутри одного файла страницы (массивы данных
   + разметка), как в `index.astro`. Не создавай новых общих компонентов.
3. **Одна страница = один файл** в `src/pages/`. Не редактируй чужие страницы.

## Структура страницы

Каждая страница оборачивается в `BaseLayout`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionHead from '../components/SectionHead.astro';
import Corners from '../components/Corners.astro';
// ...массивы данных для повторяющихся блоков...
const jsonLd = JSON.stringify({ /* граф из <helmet> исходника */ });
---
<BaseLayout
  title="…из <title> исходника…"
  description="…из meta description…"
  keywords="…из meta keywords, если есть…"
  path="/services"           /* чистый маршрут этой страницы */
  ogTitle="…og:title…"       /* если есть */
  ogDescription="…og:description…"
  active="services"          /* ключ для подсветки в шапке */
  jsonLd={jsonLd}
>
  … секции …
</BaseLayout>
```

SEO-мета, `og:*`, `<link rel=canonical>`, `application/ld+json` берутся из блока
`<helmet>` соответствующего `.dc.html`. Шапку/подвал/шрифты/`<head>` НЕ дублируй —
их даёт `BaseLayout`.

## Карта маршрутов (замена ссылок)

Маршруты — **русские слаги** (точно как в `source/sitemap.xml` и canonical
исходника), с завершающим слэшем. Имя файла страницы = слаг: файл
`src/pages/uslugi.astro` даёт URL `/uslugi/`.

| Исходник | Маршрут | Файл |
| --- | --- | --- |
| `Home.dc.html` | `/` | `src/pages/index.astro` |
| `Services.dc.html` | `/uslugi/` | `src/pages/uslugi.astro` |
| `Fleet.dc.html` | `/avtopark/` | `src/pages/avtopark.astro` |
| `Cases.dc.html` | `/keysy/` | `src/pages/keysy.astro` |
| `About.dc.html` | `/o-kompanii/` | `src/pages/o-kompanii.astro` |
| `Blog.dc.html` | `/blog/` | `src/pages/blog/index.astro` |
| `Contacts.dc.html` | `/kontakty/` | `src/pages/kontakty.astro` |
| `Article.dc.html` (Свой водитель/аутсорсинг) | `/blog/svoy-voditel-ili-autsorsing/` | `src/pages/blog/svoy-voditel-ili-autsorsing.astro` |
| `Article-44fz.dc.html` | `/blog/transportnoe-obsluzhivanie-44-fz/` | `src/pages/blog/transportnoe-obsluzhivanie-44-fz.astro` |
| `Article-glonass.dc.html` | `/blog/glonass-monitoring-rashody/` | `src/pages/blog/glonass-monitoring-rashody.astro` |
| `Article-taxi-policy.dc.html` | `/blog/korporativnoe-taksi-pravila/` | `src/pages/blog/korporativnoe-taksi-pravila.astro` |
| `Article-checklist.dc.html` | `/blog/proverka-transportnogo-podryadchika/` | `src/pages/blog/proverka-transportnogo-podryadchika.astro` |
| `Article-tms.dc.html` | `/blog/tms-dlya-avtoparka/` | `src/pages/blog/tms-dlya-avtoparka.astro` |
| `Article-mail-routes.dc.html` | `/blog/perevozka-korrespondencii-marshrut/` | `src/pages/blog/perevozka-korrespondencii-marshrut.astro` |

Якоря сохраняются: `Services.dc.html#tms` → `/uslugi/#tms`.
Внешние ссылки (`https://t.me/otktrans`, `tel:`, `mailto:`) — без изменений.
Картинки: `img/xxx.jpg` → `/img/xxx.jpg` (лежат в `public/img/`).
`active`-ключи: `home | services | fleet | cases | about | blog | contacts`.

## Конвертация inline-стилей в Tailwind

Повторяй маппинг из `index.astro`. Основное:

| Inline | Tailwind |
| --- | --- |
| `max-width:1320px;margin:0 auto` | `max-w-container mx-auto` |
| `padding:clamp(72px,9vw,128px) clamp(20px,4vw,56px)` | `py-[clamp(72px,9vw,128px)] px-[clamp(20px,4vw,56px)]` |
| `border-bottom:1px solid var(--color-divider)` | `border-b border-divider` |
| `font-family:var(--font-heading)` | `font-heading` |
| `text-transform:uppercase` | `uppercase` |
| `letter-spacing:0.14em` | `tracking-[0.14em]` |
| `color:var(--color-accent-700)` | `text-accent-700` |
| `background:var(--color-bg)` | `bg-bg` |
| `color:var(--color-text)` | `text-text` |
| `font-size:clamp(30px,3.6vw,50px)` | `text-[clamp(30px,3.6vw,50px)]` |
| `line-height:1.6` | `leading-[1.6]` |
| `display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:clamp(22px,2.2vw,34px)` | `grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[clamp(22px,2.2vw,34px)]` |

**Прозрачность текста через color-mix** (текст на светлом фоне):
`color-mix(in srgb, var(--color-text) 72%, transparent)` → `text-text/[0.72]`
(так же 78→`/[0.78]`, 65→`/[0.65]`, 62→`/[0.62]`, 55→`/[0.55]`, 50→`/[0.5]`).

**Текст/границы на тёмном фоне** — цвет `#f2f2f3` с альфой пиши hex8:
72%→`#f2f2f3b8`, 62%→`#f2f2f39e`, 60%→`#f2f2f399`, 55%→`#f2f2f38c`,
45%→`#f2f2f373`, 35%→`#f2f2f359`, 30%→`#f2f2f34d`, 18%→`#f2f2f32e`.
Пример: `color:#f2f2f3;border-color:color-mix(in srgb,#f2f2f3 35%,transparent)` →
`text-[#f2f2f3] border-[#f2f2f359]`.

**Сложные фоны** (градиенты, `color-mix` для фона секции, grid-паттерн hero) —
оставляй как есть в атрибуте `style=""`. Не мучайся переводить их в утилиты.
Пример: `style="background:color-mix(in srgb, var(--color-accent) 6%, var(--color-bg))"`.

## Классы дизайн-системы (использовать как есть)

- **Кнопки:** `class="btn btn-primary"` / `btn-secondary` / `btn-ghost`. Внутри
  размеры — утилитами: `min-h-[52px] px-[26px] tracking-[0.07em] uppercase`.
- **Карточки:** `class="card blueprint …"` + внутри `<Corners />`. `.card-kicker`,
  `.card-body` — как в исходнике.
- **Чертёжная рамка:** любой элемент с `class="blueprint"` ОБЯЗАН содержать
  `<Corners />` (это 4 уголка-креста). Если в исходнике есть
  `<i class="corner tl"></i>…` — заменяй их одним `<Corners />`.
- **Теги:** `class="tag tag-accent|tag-outline|tag-success|tag-warning|tag-neutral"`.
- **Таблицы:** `class="table"`.
- **Duotone-картинки:** обёртка `class="… duotone"`, `<img>` внутри.
- **Формы:** `.field`, `.input`, `.radio` + `.dot`, `.seg` + `.seg-opt` — как в
  дизайн-системе (см. readme дизайн-системы и `global.css`).
- **Секционный заголовок** («NN · Тема» + H2): используй
  `<SectionHead kicker="01 · Услуги" title="…" />`. Если отступ снизу другой —
  `mb="mb-[…]"`.

## Повторяющиеся блоки

Данные повторяющихся карточек/строк выноси в массив во frontmatter и рендери
через `.map(...)`, как сделано в `index.astro` (services, safety, cases, faq).
Это уменьшает ошибки и повторяет эталонный стиль.

## Чек-лист самопроверки перед завершением

- [ ] Весь текст и числа перенесены дословно, порядок секций сохранён.
- [ ] Все ссылки переведены на чистые маршруты; якоря на месте.
- [ ] Каждый `.blueprint` содержит `<Corners />`.
- [ ] `img/…` → `/img/…`.
- [ ] SEO: title/description/keywords/og/jsonLd перенесены из `<helmet>`.
- [ ] `active` и `path` соответствуют странице.
- [ ] Общие файлы не изменены.
- [ ] Синтаксис Astro валиден (frontmatter `---`, JSX-атрибуты, закрытые теги).
