# Forge Landing — History of Design Decisions

> История ключевых решений по дизайну и их обоснования. Для агентов которые подхватывают работу.
> Хронология: от 08.04.2026 до актуального. Смотри также `backlog.md` и `landing-design-brief.md`.

---

## Обзор

Soft neobrutalism. 12 секций. Container 900px. Mobile-first. Деплой на Vercel.

### Ключевые принципы

1. **Контент не менять** — тексты утверждены через 6 раундов swarm-дискуссии (`landing-copy.md`)
2. **12 секций обязательны** — убирать нельзя
3. **3 уровня восприятия в hero** — заголовок / действие / доверие
4. **Типографика через 4 токена** — `--text-xs/sm/base/lg`, не добавлять новые размеры
5. **Висячие предлоги через `&nbsp;`** — везде

---

## История решений

### Hero (блок 1)

**Итерации:**

1. **Центрированный layout** (начало) — классика, но "generic" и слишком много визуальных уровней (9 штук: nav-logo, nav-cta, section-label, h1, subtitle, cta, cta-sub, social-proof, logos). Арт-директор насчитал 9 уровней, заказчик — 5 «посылов».

2. **Left-align + компактная иерархия** — свели к 3 уровням восприятия: h1 / subtitle+CTA / social proof. Section-label сделан ghost (без рамки/фона). Логотипы → плоский текст. Переделка не помогла — всё равно "мешанина".

3. **Split layout vs full viewport** — сравнили оба варианта (compare.html). Взяли full-viewport с **marquee под hero**. Hero = 100dvh - 72px. Marquee — чёрная полоса с бегущими логотипами + "7 лет / 200+" оранжевым. Логотипы тянем с tetraform.art (белые на прозрачном + `filter: brightness(0) invert(1)`).

4. **Marquee fix** — поначалу через CSS animation, но при drag-to-scroll ломалась непрерывность. Переписали на JS (`requestAnimationFrame`) — seamless loop без перезапуска.

5. **Hero container** — был 1200px (шире секций), потом свели к 900px как у всех секций (единая сетка).

6. **Pixel-perfect эволюция:**
   - Начальный вариант: `min-height: calc(100dvh - 72px)` где 72px — магическое число для nav height
   - 08.04 (`6b8e56e`): добавили `min-height: auto` на mobile чтобы marquee не прилипал — **сломали центрирование**, контент уехал к верху, снизу появился пробел
   - 10.04: финал — `min-height: calc(100dvh - 72px - env(safe-area-inset-top, 0px))` учитывает safe-area iPhone с notch/Dynamic Island. Mobile-override убран, hero снова fill viewport + flex-center

7. **Висячие предлоги в h1** — `не&nbsp;делать` и т.д. через `&nbsp;`.

**Главный урок:** в neobrutalism иерархия важнее "стильности". 9 уровней = визуальный шум. Маркетинговый принцип: шум должен работать на иерархию, а не против неё.

---

### Aha-таблица (блок 2)

1. **Изначально:** классическая HTML-таблица. На мобайле — горизонтальный скролл, колонка "После" была за экраном (главный контент!).

2. **Зачёркнутый "Сейчас"** — арт-директор предложил `line-through + opacity`, заказчик сказал «тяжело читать». Итерации:
   - `color: var(--text); opacity: 0.4` — слишком размыто
   - `color: #999; strike #666` — норм, но странно (разный цвет текста и линии)
   - **Финал:** `color: #555; strike #ccc` → потом `color: #999; strike #999` (одним цветом) — стабильно читается

3. **Пропорции колонок** 22/30/48% — максимум веса на "После". Убрали `white-space: nowrap` с первого столбца (ломал мобайл).

4. **Колонка "После" — оранжевая заливка** на всей колонке, не только header.

5. **Мобайл: таблица → карточки** через CSS `display: block` + `::before` labels. Заголовок процесса с белым фоном и оранжевым текстом (раньше был чёрный фон — давил). На 5 карточках подряд чёрные заголовки перегружают визуально.

---

### Триггеры (блок 3 "Узнаёте?")

1. **Сетка 3+2** — пятая карточка повисла в одиночку. Выглядело багом.

2. **Пробовали 4 колонки со span** на первой и пятой — в 900px стало тесно, текст развалился.

3. **Финал:** 2 колонки с `grid-column: span 2` на 5-й карточке (полная ширина внизу).

4. **Left-borders чередующихся цветов** (оранж/синий) — красиво, но синий больше нигде не используется. Свели к оранжевому везде.

5. **Мобайл reorder** — порядок карточек на мобилке отличается, чтобы цвета left-border чередовались (сейчас все оранжевые, но reorder остался: nth-child(4) → order 5, nth-child(5) → order 4).

---

### Блок 4 "Ценности" (было "Процесс")

**Главная переделка:** изначально блок 4 дублировал блок 6 по смыслу (оба про процесс — 4 шага). Решили радикально:

1. **Сменили контент** через copy.md: блок 4 стал "Что вы получаете" (ценности: Ясность, Предсказуемость, Непрерывность, Независимость). Блок 6 остался "Этапы".

2. **Layout итерации:**
   - Карточки как в блоке 3 → монотонно
   - Голый горизонтальный список → "не в стиле neobrutalism"
   - Чередующиеся оранж/чёрные ячейки с номерами → заказчик: «выглядит как порнхаб, громоздко»
   - **Финал:** горизонтальные полоски в одной общей рамке с тенью 8px. Номера чёрные, заголовки оранжевые (акцент на содержании, не на цифрах).

---

### Блок 5 "Точка Б"

- Оранжевый фон (не orange-light — нужен был эмоциональный удар)
- 3 абзаца с `border-top: 2px solid black` между ними (арт-директор: «не слипаются в один кусок»)
- Тень `--shadow-xl` (12px) — кульминация блока

---

### Блок 6 "Этапы"

- Horizontal timeline: 4 шага с коннектор-линией между номерами
- Номера увеличены с 40px до 52px, шрифт 1.4rem, тень `--shadow`
- Коннектор 3px вместо 2px
- Текст left-aligned (был centered — разбивался на огурцы)
- Заголовки шагов оранжевые (Аудит, План, Внедрение, Передача)

---

### Блок 7 "Сомнения"

- Accordion (первый открыт по дефолту)
- Оранжевые акценты: `+` знак и left-border 6px на открытом barrier
- Начальный hack: `max-height: 400px` (было 200px — обрезало длинные ответы). Потом заменили на JS `scrollHeight + 36` — точная высота, без «пустого transition» при закрытии. Resize-слушатель пересчитывает открытый accordion при ротации/resize
- `+` вращается → `×` при раскрытии

---

### Блок 8 "Альтернативы"

1. **Изначально:** чёрный header + оранжевый Forge-блок. Заказчик: «тяжело на мобилке, давит».

2. **Облегчение:** белый header + border-bottom, оранжевый Forge-блок остался.

3. **Flex fix:** Forge-блок прибит к низу карточки через `display: flex; flex-direction: column` + `margin-top: auto` на `.comp-forge` (было криво из-за разной длины текста проблемы).

---

### Блок 9 "Кейсы"

1. **3 колонки в 900px** — жесть, ~280px на карточку, текст по 1-2 слова в строку.

2. **Арт-директор предлагал:** убрать цветные фоны. Оставили цветные.

3. **Финал:** Tetraform full-width сверху, Syl + Ivy в 2 колонки снизу. Каждая карточка в своём цвете.

4. **Цифры stat оранжевые** (94%, 7 000, 2 Tagline, 7, 17, 6 мес, 24K+, 274, -25%). Counter animation через IntersectionObserver.

5. **Tetraform stats обновились:** MQL x3 / +40% / Tagline → 94% Сбер / 7 000 Красный Крест / 2 Tagline.

---

### Блок 10 "Гарантии"

1. **Изначально 4 колонки в 900px** — снова огурцы.

2. **2 колонки** на всех экранах.

3. **Фишка из neobrutalism гайда:** oversized decorative symbols в углу каждой карточки (opacity 4%):
   - Фикс-прайс → **₽**
   - Поэтапная оплата → **⇄**
   - Код — ваш → **`</>`**
   - Месяц поддержки → **30**

4. **Оранжевый top-border** 4px на карточках. Заголовки пробовали сделать оранжевыми — сливались с top-border, откатили.

---

### Блок 11 "О компании"

1. **Фото основателя** 200px слева, рамка + тень, текст справа.

2. **Оранжевая вертикальная черта** (border-left 6px) на about-content.

3. **FORGE** в заголовке заглавными, F оранжевая (`<span style="color:var(--orange)">F</span>ORGE`).

4. **Логотипы клиентов** пробовали вставить под текстом — выглядело грязно (разные размеры, Норникель серый прямоугольник). Убрали — они уже в marquee.

5. **Стек из 16 технологий** pill-бейджи:
   - Пробовали группировку по категориям (AI/Автоматизация/Инфра) — получилось «как в магазине полки», откатили
   - Финал: один плоский ряд, центрированы, в 2 строки, с `border-top` разделителем сверху
   - Claude/OpenAI пробовали выделить оранжевым — заказчик: «зачем это?» Откатили.

---

### Блок 12 "Финальный CTA"

**Много итераций:**

1. **Чёрный фон** — воспринимался как футер, сливался с ним.

2. **Оранжевый фон** — но `section:nth-child(even)` перезаписывал на `--bg-alt`. Фикс: `section:nth-child(even):not(.final-cta)`.

3. **Layout:**
   - Центрированный → «сливается в полотно»
   - Split (текст слева, кнопки справа) → лучше
   - Карточка внутри оранжевого фона → финал

4. **Эволюция кнопок:**
   - Начальный вариант: одна кнопка «Написать в Telegram» (обе версии вели в Telegram, дубль убрали)
   - После модалки формы: одна кнопка «Получить план» → открывает модалку
   - Финал (как в `landing-copy.md` §12): **две кнопки** — primary «Записаться на аудит» (форма) + secondary «Написать в Telegram» (ссылка в новое окно). Порядок: форма первой, Telegram вторым — согласно оригинальной копии

5. **Все primary CTAs на лендинге → модалка формы** (`7d458d5`). Hero, nav, mobile-menu, final-cta — все открывают модалку. Telegram остался только как вторичная опция в final-cta + футере. Логика: форма = лид в CRM, Telegram = direct-chat (теряются лиды). Форма даёт контроль над пайплайном

6. **CTA sub** ("Без обязательств...") — перенесли под кнопки справа

---

### Типографика — рефакторинг

**Было:** 14 уникальных значений `font-size` по всему файлу (0.7 / 0.75 / 0.8 / 0.85 / 0.875 / 0.9 / 0.95 / 1 / 1.05 / 1.1 / 1.25 / 1.3 / 1.4).

**Стало:** 4 токена
```css
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.1rem;
```

**Правило:** не добавлять новые размеры. Если нужен другой — пересмотреть дизайн.

---

### Навигация + бургер меню

1. **Бургер видим на всех экранах** (не только мобайле) — дизайн решение.

2. **Стиль бургера** — neobrutalism: рамка, тень, hover-lift, оранжевый фон при открытии.

3. **Mobile menu** — fullscreen overlay с left-aligned ссылками, border-rows между пунктами, hover-slide вправо на 12px.

4. **ID на секциях** — `potencial`, `situacii`, `cennosti`, `rezultat`, `etapy`, `somneniya`, `sravnenie`, `proekty`, `garantii`, `o-kompanii`.

---

### Реорганизация папок (08.04.2026)

- **Было:** `landing-v2/` + `/tmp/forge-landing/` (копирование вручную)
- **Стало:** одна папка `landing/` с git-репо внутри
- **Деплой:** Vercel auto-deploy из `main`, раньше был GitHub Pages
- Подробности: `AGENT-HANDOFF.md` в папке лендинга

---

### SEO и форма (09.04.2026)

**Базовая инфраструктура (первый заход):**
- Добавлены `robots.txt`, `sitemap.xml`, `og-template.html`, фавиконки
- OG-image с тёмной полосой внизу и enterprise логотипами
- Лид-форма модалка → `/api/lead` (Vercel function) → Airtable + Telegram notification
- Валидация полей с зелёной/красной тенью
- Секреты в Vercel Environment Variables (не в коде!)

### SEO-пасс (09.04.2026, второй заход)

Выполнено по промпту `Outputs/Prompts/forge-seo-markup.md`. Все изменения закоммичены и задеплоены на Vercel (`forge-six-blue.vercel.app`).

**Meta-теги в `<head>`:**
- `canonical`, `og:url`, `og:site_name`, `og:locale=ru_RU`
- `og:image` (6 тегов: url/secure_url/type/width/height/alt) с cache buster `?v=1`
- Twitter Card `summary_large_image` с title/description/image/alt
- Mobile metas: `theme-color=#F97316`, `color-scheme`, `apple-mobile-web-app-*`, `format-detection`

**Structured data (JSON-LD):**
- **ProfessionalService** с `@id` для cross-linking, `slogan`, `serviceType` (4 категории), `contactPoint` (Telegram как sales), `parentOrganization` (Tetraform), `hasOfferCatalog` (4 услуги), `knowsAbout`, `founder`, `sameAs`
- **FAQPage** — 5 вопросов из секции «Сомнения», тексты byte-exact match с DOM (требование Google для rich snippets)
- **WebSite** — отдельный блок, `publisher` ссылается на ProfessionalService через `@id`
- НЕ добавляли: `Organization` (дубль ProfessionalService), `BreadcrumbList` (не применимо на single-page), `Review`/`AggregateRating` (нет реальных отзывов)

**Favicons:**
- `favicon.svg` — оранжевая F на cream `#FFFDF5`, чёрная рамка (совпадает с `.logo` в CSS)
- `favicon-32.png` + `apple-touch-icon.png` — PNG fallbacks сгенерированы через Pillow (геометрия без шрифтов для надёжности)

**OG-image (несколько итераций):**
1. v1: cream фон + faded grayscale логотипы → в Telegram preview логи нечитаемые
2. v2: тёмная полоса внизу (160→170px) + белые логи в натуральном виде
3. v3: убрала лейбл «НАМ ДОВЕРЯЮТ» (после downscale невидим), увеличила лого до 80px height, М.Видео override до max-width 260px
4. v4: заменила English Норникель на русскую SVG-версию (см. ниже)
5. Fix F в оранжевом квадрате: font-size 280→240, top 70→40, square 400→460 — появился воздух от нижней грани
6. Рендер: `window-size=1200x720` → crop до `1200x630` через Pillow (Chrome headless quirk — при точном `1200x630` отрезает ~50px снизу)

**Норникель на русском:**
- `assets/logos/nornickel-ru.svg` — белый SVG с кириллическим «НОРНИКЕЛЬ»
- Использованы оригинальные path-ы N-логотипа + SVG `<text>` с Inter/Arial Black fallback
- Применяется в marquee (обе ссылки в `index.html`) и OG-картинке
- `nornickel.svg` (английский белый) и `nornickel-ru.png` (цветной) остались в ассетах на всякий случай

**A11y:**
- `<main id="main-content">` оборачивает от hero до final-cta
- `.skip-link` в начале body с focus-visible стилями
- `@media (prefers-reduced-motion: reduce)` — глушит marquee animation, fade-in, все transitions

**Performance:**
- Inter 400 Cyrillic subset preload (Google Fonts v20 — URL может ротироваться, есть комментарий в коде)
- `decoding="async"` на 24 marquee-лого + `photo_founder.jpg`
- `loading="lazy"` на `photo_founder.jpg` (было)
- Performance не ставили целью (Google Fonts съедают бюджет)

**Validation:**
- W3C HTML validator (через JSON API `validator.w3.org/nu/`) — **0 errors / 0 warnings** на live
- JSON-LD парсится + все required поля присутствуют (проверено скриптом)
- FAQ DOM-to-JSON-LD 5/5 byte-exact (Google примет rich snippets)
- Lighthouse audit — пока не прогнан (требует ручной запуск в Chrome DevTools)

**Что осталось SEO:**
- Google Search Console + Yandex Webmaster (подать sitemap https://forge-ai.io/sitemap.xml)
- Analytics (GA4 / Я.Метрика) — отдельный спринт с cookie-banner и политикой ПДн

**Кастомный домен forge-ai.io (09.04.2026):**
- Привязан к Vercel-деплою
- 12 placeholder'ов `nailmardamshin.github.io/forge` → `forge-ai.io` в `index.html`
  (canonical, og:url, og:image×2, og:image:secure_url×2, twitter:image×2,
  JSON-LD `@id` для ProfessionalService/WebSite + их `url`/`logo`/`image`,
  publisher `@id` reference)
- `sitemap.xml` `<loc>` обновлён
- `robots.txt` Sitemap URL обновлён
- OG image cache buster `?v=1` → `?v=2` — чтобы Telegram/Facebook перезапросили превью
  под новым URL и не отдавали кешированную старую картинку

### Lighthouse audit (09.04.2026)

Прогнан через `npx lighthouse` на live (Vercel). Обе конфигурации:

| Категория | Desktop | Mobile |
|---|:---:|:---:|
| Performance | **99** | **96** |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| SEO | **100** | **100** |

Цели промпта (SEO ≥ 95, A11y ≥ 90) перевыполнены с большим запасом.

Изначально mobile a11y был 91 — Lighthouse нашёл 2 проблемы в footer:
1. Текст #666 на #000 = 3.67:1 контраст (WCAG AA требует 4.5:1 для normal text)
2. Telegram-ссылка в footer полагается только на цвет (`text-decoration: none` глобально)

Фикс (`41a715a`):
```css
footer { color: #999; }  /* было #666, контраст 7.6:1 */
footer a { color: var(--orange); text-decoration: underline; text-underline-offset: 2px; }
footer a:hover { color: #fff; }
```

После фикса mobile a11y → **100**.

### Мобильная адаптация 375/360/320 (09.04.2026)

Проход по live через Playwright (mobile viewport, reduced-motion эмуляция, full-page screenshot).

**Результаты:**
- Ноль horizontal overflow на всех трёх ширинах (`scrollWidth === clientWidth`)
- Все 12 секций разложены корректно, нет обрезанного текста, touch-targets адекватные
- Burger menu, accordion (барьеры), модалка лид-формы — все работают на touch
- Marquee скролл, анимации, hover-эффекты (без hover на touch) — OK

**Найденный и закрытый баг (`e433642`): mobile-menu overflow.**

- `.mobile-menu` использовал `justify-content: center` + padding `80px / 40px`
- 10 пунктов + CTA = ~724px контента
- Доступно при высоте 812 (iPhone 12): 692px → overflow 32px
- Доступно при высоте 667 (iPhone SE): 547px → overflow 177px
- Центрирование резало первый пункт «Потенциал» сверху (уходил под nav)

Fix:
```css
.mobile-menu {
  justify-content: flex-start;  /* было center */
  overflow-y: auto;              /* scroll fallback */
  overscroll-behavior: contain;
}
.mobile-menu a {
  padding: 12px 0;  /* было 14px */
}
```

Теперь на всех экранах первый пункт виден сразу под nav bar. Если не влезает (очень короткий экран) — скроллится внутри меню.

---

## Юридическая обвязка — Политика + Согласие (09.04.2026)

Большой блок, подробные правила и архитектура — в **`legal/README.md`** (читать первым перед любыми правками в `legal/` или consent-флоу). Здесь — только хронология и ключевые решения.

### Публикация Политики и Согласия (`4837630`)

**Задача:** опубликовать юр-документы от юриста + добавить обязательную галочку согласия в форму лида. Промпт постановки: `Outputs/Prompts/forge-legal-docs.md`.

**Проблема с исходниками.** Оригиналы в `Forge/Assets/Docs/` (`1. Политика.docx`, `6. Согласие ИП.docx`) написаны **не под Forge, а под ООО Тетраформ**. Политика ссылается на `tetraform.art`, `info@tetraform.art`, адрес Тетраформа как сервис-провайдера. Публиковать «как есть» нельзя — нарушение ФЗ-152 (Политика должна описывать обработку ПД именно на том домене, где размещена) + репутационный риск (чужая компания на своём лендинге).

**Выбранный сценарий — вариант В (адаптация без юриста):**
- Удалить все упоминания Тетраформа, `tetraform.art`, их адрес и email
- Сузить перечень обрабатываемых ПД до того, что **реально собирает форма** (имя / компания / Telegram-или-телефон / задача). В оригинале был раздут: ФИО, паспорт, пол, банковские карты, расчётные счета — лишнее и юридически опасное
- Оставить всю юридическую обвязку по 152-ФЗ, структуру разделов, формулировки прав субъекта, сроки хранения
- Email оператора — личный `nail.mardamshin@gmail.com` (временно, будет заменён на рабочий)
- Адрес ИП **не публиковать** (выбор Наиля, вариант A из трёх обсуждённых: email-only / регион / полный). ФЗ-152 формально допускает email-only как канал связи. Адрес всё равно публичен в ЕГРИП
- Дата вступления в силу — `01.10.2025` (backdate, выбор Наиля)
- Реквизиты ИП из оригинального Согласия (ОГРНИП `318213000013925`, ИНН `213005562106`) — перепроверены и подтверждены

**Структура публикации:**
- `legal/privacy-policy.html` — 8 разделов + TOC, max-width 720px
- `legal/consent.html` — 5 разделов, тот же layout
- `legal/legal.css` — neobrutalism-облегчённый (без анимаций/теней, акцент на читабельности юр-текста)
- `<meta name="robots" content="noindex, nofollow">` на обеих страницах — юр-страницы не индексируются
- Клаженый table на мобайле стакается в карточки (`display: block` + hidden `thead`)

**Чекбокс согласия в форме:**
- Перед кнопкой Отправить в `#leadForm`
- **Не pre-checked** — согласие = активное действие (ФЗ-152 + GDPR)
- HTML5 `required` не использовали — у формы `novalidate`, валидация в JS
- Стили: квадрат 20×20, чёрная рамка 2px, при отметке — оранжевый фон + белый чекмарк через `::after` border rotation trick

**Бэкенд `api/lead.js`:**
- Серверная валидация `body.consent !== true` → 400 (клиентскую проверку обойти тривиально)
- Захват IP через `x-forwarded-for` + User-Agent
- 5 новых полей в Airtable `Leads` (созданы через MCP `create_field`): `Consent given` (checkbox), `Consent timestamp` (dateTime Europe/Moscow), `Consent text version` (singleLineText), `IP` (singleLineText), `User agent` (multilineText)
- `consent_text_version` в `main.js` — источник правды для юр-аудита «под какой редакцией человек дал согласие»

### Ревью (`a4d99c2`)

Code-reviewer agent прошёлся по фиче и нашёл 2 реальных бага (критичных — 0):

1. **Silent lead loss.** В `api/lead.js` если ни `AIRTABLE_API_KEY`, ни Telegram env vars не настроены — handler возвращал `200 { ok: true }` и юзер видел «Отправлено!», но лид исчезал. Пре-существующий баг, обострившийся с consent-трекингом (пользователь думает «согласие записано», а записи нет). Фикс: при отсутствии обоих каналов сразу `500` до любой обработки.

2. **Залипающий красный бордер на чекбоксе.** После ошибки consent → пользователь ставит галочку → получает ошибку другого поля → красный бордер на чекбоксе не снимался. Фикс: чистить `.form-consent.error` в начале submit-обработчика.

Остальной чек-лист (нет Тетраформа, noindex, cleanUrls, `=== true` строгая проверка, синхронизация дат, идентичные реквизиты) — пройден.

### Документация для будущих агентов (`3f151d6`)

Создан `legal/README.md` — главный гардрейл для любых правок юр-слоя:
- История адаптации и реквизиты
- ⛔ Чего нельзя без юриста (юр.смысл, структура, расширение перечня ПД, pre-checked, удаление серверной валидации)
- ✅ Что можно (косметика, обновление email, добавление каналов с правилами синхронизации)
- Версионирование `consent_text_version` — когда бампать и зачем
- Таблица Airtable-полей, troubleshooting, чек-лист перед деплоем

Указатели на README добавлены в `DEPLOY.md` и `Forge/.forge-rules.md` — чтобы агенты находили правила раньше, чем начнут ломать.

---

## Cookies + Яндекс Метрика + цели (09–10.04.2026)

### Cookies-баннер и gate на аналитику (`e070a1c`)

**Решения до старта:**
- **Баннер simple, не granular** — у нас только одна категория cookies для согласия (аналитика), тогглы избыточны
- **Кнопки равного размера и контраста** — «Только необходимые» + «Принять». Dark patterns запрещены GDPR
- **Webvisor включить с маскированием полей формы** — получить тепловые карты и клики, но не сливать PII в Яндекс
- **Кнопка «Управление cookies»** в футере — для отзыва согласия
- **Шрифты самохостинг** (уже было сделано отдельно) — убирает Google Fonts из CSP-рисков
- **Адрес Google Fonts в Политике** — планировался, но убран после обнаружения самохостинга

**Архитектура (вся в `main.js`):**
```
localStorage.forge_cookie_consent = {
  analytics: true/false,
  version: "2025-10-01",
  timestamp: ISO
}
```

- На `DOMContentLoaded`: `getConsent()` → если `null` → `showBanner()`, если `analytics: true` → `loadMetrica()`
- `loadMetrica()` — стандартный Metrica snippet инлайн, но вызывается **только из обработчика Accept** или при restore сохранённого согласия. Никакого `<script>` в head, никакого `<link rel="preconnect" href="mc.yandex.ru">`. До согласия Яндекс **вообще ничего не знает** о визите
- `CONSENT_VERSION` — если бампнуть, restored-решения начинают считаться невалидными → баннер показывается заново. Мост к будущим изменениям §9 Политики
- `saveConsent()` обёрнута в try/catch — в приватном режиме Safari localStorage бросает, не ломаем сайт, просто баннер покажется ещё раз

**Webvisor маскирование:**
- На `#leadForm` и всех inputs (name/company/contact/task) добавлен класс `ym-hide-content` — Метрика заменяет содержимое на звёздочки в записях

**Политика §9 (в `privacy-policy.html`):**
- Категории cookies (технические vs аналитические)
- Яндекс Метрика с ООО «Яндекс», серверы в РФ, ссылки на их политики
- Webvisor с явным упоминанием маскирования
- Согласие + отзыв + браузерные настройки
- Явный отказ от ретаргетинга и профилирования

Даты синхронизированы во всех местах с исходной Политикой: Политика meta = `01.10.2025`, Согласие meta = `01.10.2025`, `consent_text_version` = `2025-10-01`, `CONSENT_VERSION` = `2025-10-01`. Раздел 9 про cookies добавлен к той же дате ретроактивно — backdate-стратегия консистентна для всей редакции.

### Metrica ID + цели (`5c4bedd`, `0e0dd7e`)

Счётчик создан в кабинете: **108474355**. Заменили `METRICA_COUNTER_ID = null` на реальный ID.

**Три кастомные цели через JS-события:**
- `lead_modal_opened` — intent (открыл модалку), параметр `source` (hero / nav / final-cta / footer / modal / mobile-menu)
- `lead_submitted` — реальная конверсия (успешный ответ бэкенда), параметр `source`
- `telegram_click` — делегированный listener на `a[href*="t.me/"]`, параметры `href` + `location` (nav / modal / footer / hero / other)

**Helper `window.forgeTrackGoal(name, params)`** — graceful no-op если Метрика не загружена (отказ от cookies / блокировка). Не ломает сайт для пользователей без согласия.

**Почему автоцель Метрики «Отправка формы» оставили:**
- Стреляет на нативный `submit` event (то есть на **попытку**, даже если валидация блокирует). Наш `lead_submitted` — только на успех бэкенда. Дельта = провалы (нет галочки / сервер валится / сеть упала). Полезный sanity signal
- Бесплатный safety net: если кастомный `lead_submitted` сломается, автоцель всё равно посчитает

### CSP fix для Webvisor WebSocket (`94889a8`)

При debug-тесте через `?_ym_debug=1` обнаружены CSP-ошибки:
```
Refused to connect to 'wss://mc.yandex.com/solid.ws' because it violates
the following Content Security Policy directive:
"connect-src 'self' https://mc.yandex.ru ..."
```

**Причина:** Webvisor открывает WebSocket на `wss://mc.yandex.com/solid.ws` для стриминга сессий. В `vercel.json` CSP `connect-src` были только `https://` адреса Метрики — `wss://` к ним автоматически не подтягивается, нужны отдельные записи.

**Фикс:** добавлены 4 `wss://` записи в `connect-src`:
- `wss://mc.yandex.ru`
- `wss://mc.yandex.com`
- `wss://mc.webvisor.com`
- `wss://mc.webvisor.org`

Заодно дополнен `script-src` и `img-src` с `mc.webvisor.org` и `frame-src` с `mc.yandex.com` для консистентности (Метрика иногда тянет ассеты с них).

**Debug-результат** (после фикса, из `?_ym_debug=1`):
```
✓ PageView. Counter 108474355. URL: https://forge-ai.io/
✓ Reach goal. Goal id: lead_modal_opened. Params: {source: 'hero'}
✓ Reach goal. Goal id: lead_modal_opened. Params: {source: 'nav'}
✓ Reach goal. Goal id: lead_submitted. Params: {source: 'hero'}
✓ Reach goal. Goal id: telegram_click. Params: {href: '...', location: 'modal'}
✓ Form goal (автоцель) — параллельно
✓ Ext link (автоцель) — параллельно
```

Красных CSP-ошибок больше нет. Цели зарегистрированы в кабинете Метрики как JavaScript-события.

### Пост-ревью фиксы (`abbda8f`, 10.04.2026)

Второй проход ревьюера по полному стеку (cookies + legal + Metrica + CSP). Критичных — 0. Нашли 2 important и 1 minor, все закрыли.

**1. Google Fonts на legal-страницах.** Ирония момента: `legal/privacy-policy.html` и `consent.html` **сами** грузили Inter + Space Grotesk с `fonts.googleapis.com` / `fonts.gstatic.com` — то есть до согласия, на странице которая как раз _рассказывает как мы обрабатываем данные_. Страница Политики оказалась data-leaking endpoint'ом. Основной `index.html` был давно локализован (mirror of rules in `@font-face`), но на legal-страницах это пропустили.

**Фикс:** скопированы `@font-face` декларации из `style.css` в `legal/legal.css` с путями `../assets/fonts/...`. Из обеих HTML-страниц удалены три строки (`preconnect` googleapis + `preconnect` gstatic + `<link href="googleapis.com/css2?...">`). Добавлены `<link rel="preload">` на локальные woff2 для скорости.

Оставшиеся файлы с упоминанием Google Fonts (`og-template.html`, `compare.html`) — не в user-flow, отмечены как out-of-scope.

**2. Reject-after-accept не выгружал Метрику.** Сценарий: пользователь нажал Accept → Метрика загрузилась и стартовал webvisor-сокет → позже открыл «Управление cookies» → нажал «Только необходимые». Раньше `saveConsent(false)` просто записывал решение в localStorage, но `window.ym` в runtime продолжал жить, hit'ы продолжали лететь до следующего reload. Это делало §9.6 Политики («после отзыва согласия передача данных прекращается») **технически неверным** в моменте.

**Фикс:** reject-обработчик сохраняет `wasLoaded = metricaLoaded` перед `saveConsent`, и если Метрика была активна — вызывает `window.location.reload()`. После релоада gate отрабатывает заново, видит `analytics: false` и не загружает Метрику. Первому отказнику (кто никогда не принимал) reload не делается — не для него.

Trade-off: UX-мигание при отзыве — приемлемо, это ожидаемое поведение при критичной настройке.

**3. Stale snippets в `legal/README.md`.** Код в документации показывал `METRICA_COUNTER_ID = null` и `consent_text_version = '2025-10-01'` в примерах, когда live-код содержал реальный ID и версию. Создавало «verification trap» — агент читает README, идёт в код, видит расхождение, начинает сомневаться что правильно. Хуже — мог бы «откатить» код в соответствие с документом.

**Фикс:** обновлены snippets до актуальных значений. Troubleshooting-инструкция («проверь что не null») оставлена как есть — она корректна.

### Откат даты обратно к 01.10.2025 (10.04.2026)

Во время сессии с cookies я (Сил) без явного согласования с Наилем бампнула дату Политики с `01.10.2025` на `15.10.2025` — логика была «значимая правка текста → новая версия → новая дата». Решение правильное по сути, но выбор конкретной даты 15 октября был моей импровизацией, не подтверждённой заказчиком.

После ревью Наиль заметил расхождение и попросил вернуть `01.10.2025`. Ролбэк одним проходом: обе HTML-страницы, `consent_text_version` + `CONSENT_VERSION` в `main.js`, snippets в `legal/README.md` и `design-history.md`. Логика: «раздел 9 про cookies добавлен ретроактивно к той же редакции Политики от 01.10.2025, backdate-стратегия консистентна».

**Урок сессии:** версия/дата юридического документа — блокирующий параметр, выбирать его должен заказчик, не агент. Даже если решение «бампнуть дату» правильное, **конкретное значение** надо согласовывать.

### Уроки сессии

1. **Документы от юриста всегда аудировать перед публикацией.** Даже если юрист «сделал под твой проект» — проверить на остатки от других клиентов, плейсхолдеры, расхождения с реальным перечнем полей формы. Расхождение = нарушение ФЗ-152
2. **Legal-обвязка и UI-реализация — две разные работы.** Юр-тексту нельзя менять смысл, UI-части обязаны соответствовать тексту дословно. Если не совпадает — менять UI, не текст
3. **Server-side валидация обязательна.** Клиентскую проверку consent можно обойти одной строкой в DevTools. Для юр-аудита нужен неподдельный пруф
4. **Cache buster — после каждой правки CSS/JS.** Иначе debug идёт по старому коду, теряешь час на воспроизведение проблем, которых уже нет
5. **CSP для внешних сервисов — `https://` и `wss://` это разные директивы.** Добавляя Metrica/Webvisor/Intercom/Hotjar — проверяй через debug-mode всё семейство протоколов и доменов
6. **Webvisor + PII = потенциальная бомба.** Маскирование полей формы — не опция, а обязательное условие. Проверять в записи сессии руками, а не полагаться на наличие класса в HTML
7. **Legal-страницы сами не должны течь данные.** Страница Политики обработки ПД не может сама быть data-leaking endpoint'ом (Google Fonts, аналитика, внешние трекеры). Если такое находится — это не «minor UX», это полноценное нарушение ФЗ-152, которое выглядит особенно нелепо в контексте документа. При создании новых юр-страниц проверять все внешние ресурсы в `<head>` прежде чем публиковать
8. **Конкретные значения юридических параметров — согласовывать.** «Бампнуть дату Политики» — правильное решение. Но конкретное значение (15 октября vs 02 октября vs сегодня) — прерогатива заказчика, а не агента. Любой юр-параметр с потенциальным внешним эффектом = блокирующий вопрос, спрашивать явно

---

## SEO-аудит итерации P0–P2 (09–10.04.2026)

Параллельно с legal-обвязкой и Metrica запустила независимого SEO-аудитора (`subagent_type: general-purpose`), который оценивал live-версию через curl + Playwright + Lighthouse CLI. 4 прогона — baseline, после P0, после P1, после P2. Каждый раз аудитор видел только live-сайт, без контекста предыдущих правок.

### Baseline (до любых SEO-правок)

Аудитор нашёл 4 критичных проблемы (P0) и 5 важных (P1):
- `photo_founder.jpg` 958 KB (исходник с Canon EOS R6, никогда не пережимался)
- Google Fonts render-blocking chain 2.2 сек на mobile
- Vercel отдаёт `Cache-Control: max-age=0` на все статические ассеты
- Footer-legal ссылки #777 на #fffdf5 = 4.39:1 (WCAG AA fail)
- 25 `<img>` без width/height атрибутов (CLS риск)
- Нет Content-Security-Policy
- Preload только 1 из 3 шрифтов
- `rel="noopener"` отсутствует на tetraform.art ссылке
- Legal-страницы 200 OK, но не в sitemap и не noindex

**Lighthouse baseline (mobile):** Perf 88, A11y 96, BP 100, SEO 100. **Grade B+.**

### P0 фиксы (коммиты `edf05ba` + `0246ff4` + `1a74f0d`)

**1. photo_founder: 958 KB → 95 KB (~10× экономия).** `<picture>` с WebP 320/640 + JPG 640 fallback. Первая попытка обрезала в квадрат (300×300 → 640×640) — в hero-секции `.about-photo img { width: 200px }` + HTML `<img height="640">` как presentational hint растянули портретный контейнер до 200×960, лицо вытянулось комично. Пофиксила через CSS: `height: auto; aspect-ratio: 2/3; object-fit: cover` (отменяет HTML height-hint, фиксирует пропорции). В HTML width/height привели к реальным 640×960. Итог: 200×300 портрет, CLS 0.

**2. Self-host шрифтов.** Скачала 3 woff2 в `assets/fonts/`:
- `inter-cyrillic.woff2` (18 KB — обслуживает и 400 и 600 через variable font)
- `inter-latin.woff2` (48 KB)
- `spacegrotesk-latin-700.woff2` (13 KB)

5 `@font-face` деклараций с `unicode-range` в `style.css` поверх. Убраны все ссылки на `fonts.googleapis.com` / `fonts.gstatic.com`. Все 3 предзагружены через `<link rel="preload" as="font">`. Бонус: **IP пользователей больше не утекают в Google** (GDPR плюс для B2B enterprise).

Результат на mobile: **FCP 2.8s → 1.3s**, **LCP 2.8s → 2.1s**, **Performance 88 → 99**.

**3. Vercel cache headers.** В `vercel.json`:
- `/assets/*` → `max-age=31536000, immutable`
- `/assets/fonts/*` → + `Access-Control-Allow-Origin: *`
- `/*.css`, `/*.js` → `max-age=31536000, immutable` (cache-busting через `?v=` query)
- Добавлен `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()` (opt-out FLoC)

**4. Footer-legal contrast.** `#777` → `#999` (контраст ~7.5:1, AAA).

### P1 фиксы (коммиты `d25e06f` + `670b128`)

**P1 #1 — 24 marquee-logo width/height.** Python-скрипт прошёлся по `<img class="marquee-logo">` и вставил natural dimensions из файлов (nornickel-ru.svg 86×14, khl 700×768, alfa-bank/mvideo/sber/rzhd/danon/black-science/teachbase 292×100, yasno 700×171, skyeng-w.svg 1172×400, rsv.svg 320×108). Lighthouse `unsized-images` audit score 0.5 → 1.0. **Speed Index mobile 4.6s → 2.3s (−50%)** — браузер перестал перерисовывать layout при загрузке каждого лого.

**P1 #2 — Strict Content-Security-Policy:**
```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
font-src 'self'; img-src 'self' data:; connect-src 'self'; form-action 'self';
frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests
```
`'unsafe-inline'` в `style-src` — потому что в HTML 13 inline `style=""` атрибутов (колонки таблицы, orange accent на «F», margin-top). Альтернатива — nonce на каждый, но overkill. Все `<script>` внешние (main.js + JSON-LD data), inline script нет.

**P1 #3 — `rel="noopener noreferrer"` на tetraform.art.** 7/7 `target="_blank"` ссылок (tetraform, 2× Telegram, 2× privacy, 2× consent) получили атрибут.

**P1 #4 — Legal-страницы noindex.** Проверила — уже имеют `<meta name="robots" content="noindex, nofollow">` с момента публикации. В sitemap их добавлять не надо.

### P2 фиксы (коммиты `60c96ab` + `670b128` + `8c791f5`)

**P2 #1 — khl.png 51 KB → 14.8 KB.** Resize 700×768 → 175×192 (retina 4× от display 48px). Natural ratio сохранена. HTML width/height обновлены.

**P2 #2 — Honeypot для формы:**
- `<div class="hp-field" aria-hidden="true">` с input `name="website" tabindex="-1" autocomplete="off"`
- CSS: `position: absolute; left: -9999px; width:1px; height:1px; opacity:0`
- Сервер (`api/lead.js`): `if (body.website) return 200 ok` — молча 200, чтобы боты не узнали что заблокированы и не retry

**P2 #3 — Touch targets ≥44px (WCAG 2.5.5).** Паттерн везде одинаковый: `display: inline-block; padding: Npx 4px; margin: -Npx 0` (negative margin компенсирует padding — увеличиваем tap area без визуального сдвига):
- `.burger`: `min-width/height: 44px` + `padding: 12px 10px` + flex centering
- `footer a`: `padding: 14px 4px; margin: -14px 0`
- `.footer-legal a`: то же
- `.footer-legal-btn` (новая «Управление cookies»): то же
- `.case-link` (новый класс для «Все кейсы на tetraform.art»): `padding: 12px 4px`

**P2 #4 — HowTo JSON-LD для секции «Этапы».** 4-й JSON-LD блок поверх ProfessionalService + FAQPage + WebSite. 4 HowToStep (Аудит → План → Внедрение → Передача), `totalTime: P28D`. Google может показать как карусель шагов в SERP.

**P2 #5 — CSP для Yandex Metrica (case study).** В момент P2 я превентивно добавила в CSP `mc.yandex.ru`, `mc.yandex.com`, `mc.webvisor.com` — на всякий случай, хотя Metrica counter ID был `null` (loader noop). Через 30 минут параллельный агент коммитнул реальный counter ID `108474355` → Metrica активировалась. **Если бы я НЕ добавила CSP заранее — Metrica бы сломалась мгновенно** (my strict CSP `script-src 'self'` блокировал бы `https://mc.yandex.ru/metrika/tag.js`). Урок: при strict CSP и roadmap с аналитикой — подготовь CSP директивы заранее.

### Регрессия от cookie banner + a11y fix (`670b128`)

После P2 Lighthouse mobile a11y упал **100 → 92**. Причина — cookie banner от параллельного агента:
- `.cookie-banner-desc a`: оранжевая ссылка `#F97316` на cream `#FFFDF5` = **2.52:1** (AA требует 4.5)
- `.cookie-btn-accept`: белый текст на оранжевом = **2.60:1**
- `.footer-legal-btn`: 15px высота, touch target fail

**Fixes:** ссылка → чёрный текст + оранжевый `text-decoration-color` (контраст 18+:1). Кнопка accept → чёрный текст на оранжевом (5.12:1). footer-legal-btn → тот же padding-hack как footer-legal a.

Результат: **a11y 92 → 100**.

### Финальный прогон и Telegram footer fix (`8c791f5`)

P2-аудитор подтвердил всё, но нашёл последнюю мелочь: Telegram-ссылка в `.footer-brand` осталась **36px** высотой (остальные footer-ссылки получили 46px). Несогласованность паттернов + WCAG 2.5.5 AAA fail.

**Fix:** `footer a` padding увеличен 8→14 + margin −8→−14. Теперь все 3 footer-ссылки 46-48px, консистентно.

### Копирайт: meta description + hero subtitle (`e0df36a` + `e65666a` + `75c7a1f`)

**Meta description** сокращён с 172 до 143 символов (Google обрезает в SERP после ~155). Старый вариант терял «М.Видео в портфолио» — сильный social proof. Новый:
> «Автоматизация рутины, генерация контента, аналитика. Внедряем за 3-4 недели, фикс-прайс. 200+ проектов. Альфа-Банк, Норникель, КХЛ в портфолио.»

**Hero subtitle + og:description + twitter:description** синхронизированы, единый текст:
> «Автоматизируем рутину и открываем возможности, которых раньше не было с помощью AI. 3-4 недели, фикс-прайс.»

Смысловые изменения: «убираем» → «автоматизируем» (точнее), «добавляем» → «открываем» (эмоциональнее, обещает новые возможности). В hero — с nbsp для висячих предлогов.

`<title>` остался прежним («Forge — внедрение AI в бизнес», 33 char) — копирайт-решение Наиля.

### Финальные Lighthouse-метрики

| Прогон | Mobile | Desktop | Grade |
|---|---|---|---|
| Baseline | 88 / 96 / 100 / 100 | 99 / 96 / 100 / 100 | B+ |
| После P0 | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | A |
| После P1 | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | A |
| После P2 | **99 / 100 / 100 / 100** | **100 / 100 / 100 / 100** | A (97) |

**Core Web Vitals mobile final:**
- FCP: 1.0s
- LCP: 1.9–2.0s (шум ±0.2)
- TBT: 20–70ms (шум)
- CLS: **0**
- Speed Index: 2.0–2.3s (было 5.0s)

**Grade A** на двух независимых аудитах. Все Definition of Done из промпта `forge-seo-markup.md` закрыты с большим запасом (цели SEO≥95 / A11y≥90 — фактически 100/100).

### Что осознанно НЕ сделали в P2

- **CSS minification** (~2 KB экономии) — нужен build step или ручная прегенерация
- **`unminified-javascript`** (~2 KB) — то же
- **Forced reflow 31ms в main.js** — требует глубокой инспекции, риск сломать анимации
- **Modern image formats для marquee логов** (~50 KB) — совместимость с CSS filter, логи уже 1.4–15 KB
- **Много H2 на странице** (13, рекомендация 5-8) — семантически оправдано, не трогаем
- **HSTS preload флаг** — Vercel уже отдаёт `includeSubDomains; preload` по умолчанию

### Уроки SEO-сессии

1. **Всегда запускай независимого аудитора ДО и ПОСЛЕ каждого этапа.** Baseline без бейзлайна = нечего сравнивать. Я прогнала 4 аудита за сессию — каждый раз картина менялась, некоторые проблемы появлялись от соседних правок (cookie banner regression)
2. **HTML presentational hints на `<img>` могут затмевать CSS.** `<img width="640" height="960">` работает как низкоприоритетный CSS `{ width: 640px; height: 960px }` — если CSS задаёт только width, height остаётся от HTML-атрибута. Явно ставь `height: auto` в CSS
3. **CSP превентивно для будущих интеграций.** Если roadmap включает Metrica/GA/Intercom — добавляй домены в CSP заранее. Lighthouse не скажет «а вот тут будет сломано через час»
4. **Touch target padding-hack с negative margin.** Простой способ увеличить tap area без визуального сдвига: `padding: Npx 4px; margin: -Npx 0`. Работает для inline-block элементов в любом контексте
5. **Speed Index — главный индикатор perceived perf.** Performance score может быть 99, но Speed Index 4.6s — значит картинка «медленно проявляется» на глаз. Для mobile критично unsized images + shifting layout = continuous repaint
6. **FORGE custom font-stack.** Space Grotesk не имеет Cyrillic, поэтому заголовки на русском → fallback system-ui. Это ОК, но знай это при замене fonts

---

## Cloudflare reverse proxy + мобильные регрессии (10.04.2026)

### Проблема: Vercel частично блокируется РКН в РФ без VPN

После переезда на кастомный домен `forge-ai.io` пошли жалобы: у Ксюши форма не отправляется, у Наиля в incognito без VPN сайт грузит **только HTML** — ни CSS, ни картинок, ни шрифтов. С VPN всё работает.

**Диагностика:**
- В Vercel-логах попыток POST от Ксюши **вообще нет** — её fetch не долетал до сервера
- HTML грузился (один edge Vercel), статика — нет (другие IP заблокированы DPI)
- Классический паттерн РКН/ТСПУ: точечные блокировки IP-диапазонов foreign-хостингов. Vercel формально не в реестре, но работает через раз

**Решение — Cloudflare proxy перед Vercel (`не commit, внешняя инфра`).**

### Выбор Cloudflare, не миграция

Рассматривали два варианта:
1. **Перенос на российский хостинг** (Timeweb/Selectel/свой VPS) — ~3-5 часов работы, переписывать serverless function в Node.js+nginx, терять Vercel auto-deploy / env vars / логи / SSL-автовыпуск
2. **Cloudflare reverse proxy перед Vercel** — 15-20 минут, бесплатно, ничего не переписывать, индустриальный стандарт

Выбран CF, потому что CF — слишком большой для блокировки РКН (обслуживает 20% интернета, включая русские госсайты и банки). Когда РКН фильтрует, CF — безопасная гавань.

### Setup flow

1. Зарегистрировала аккаунт CF (email only, бесплатный tier)
2. Добавила домен `forge-ai.io`, CF автоматически просканировал DNS-записи reg.ru и импортировал их. В импорт попали `A @` → `216.198.79.1` и `CNAME www` → `3a695a0ad9e5408d.vercel-dns-017.com`
3. Переключила обе записи в **Proxied** (оранжевое облачко) — CF прокси активен
4. На странице «AI crawlers» выбрала **«Do not block»** (разрешить AI-ботам индексировать сайт — Forge хочет быть видимым для ChatGPT/Claude/Perplexity пользователей в 2026). Опция «Instruct via robots.txt» **выключена** — у нас собственный `robots.txt`, не даём CF его перезаписывать
5. CF выдал пару nameserver'ов `felipe.ns.cloudflare.com` / `veda.ns.cloudflare.com`
6. На reg.ru переключила NS с `ns1.reg.ru / ns2.reg.ru` на cloudflare. Reg.ru предупредил «все ресурсные записи будут удалены» — OK, записи теперь в CF
7. DNSSEC проверила — был выключен, не блокировал переход
8. SSL mode → **Full** (не Flexible, не Full Strict) — CF проверяет наличие cert у Vercel, но без строгой валидации. Избегаем конфликтов на apex

### DNS propagation — тонкий момент

После смены NS:
- **Cloudflare DNS (1.1.1.1), Yandex DNS (77.88.8.8), Quad9 (9.9.9.9)** увидели новые NS за 10-15 минут
- **Google DNS (8.8.8.8)** залип на старой записи на несколько часов. Смотришь — одна инстанция Google DNS возвращает `216.198.79.1` (старый Vercel), другая — `95.163.244.138` (ещё более старая reg.ru-парковка)
- Причина: предыдущий TTL у A-записей reg.ru был ~1 день. Пока TTL не истечёт — кеш не обновляется

Это **временная проблема**, через 2-4 часа Google DNS автоматом обновляется. Для тестирования сразу — можно на Mac добавить `1.1.1.1` как DNS и `sudo dscacheutil -flushcache`.

**Важный урок:** после смены NS на CF всегда иметь в виду ~4 часа окна, когда часть трафика ещё идёт через старые IP. Не рассылать ссылку сразу после переезда — дать кешам осесть.

### Hero mobile layout regression (найдено и исправлено)

Параллельно с CF-миграцией Наиль заметил: на iPhone hero смотрится странно — «мало сверху, много снизу». Разбор через git log показал что я сама это сломала 08.04 в коммите `6b8e56e` (при том же пассе что добавлял trigger-иконки и point-b стрелку):

- **До коммита:** `.hero-viewport { min-height: calc(100dvh - 72px) }`, hero flex:1 + align-items:center → контент центрирован симметрично, воздух сверху и снизу поровну
- **В коммите `6b8e56e`:** добавила `min-height: auto` на mobile + поменяла `.hero-inner` padding. Намерение — не растягивать hero на весь экран. Реальность — сломала центрирование: `flex: 1` всё равно тянул hero внутри parent, `align-items: center` центрировал в несимметричной высоте, результат — контент уехал к верху
- **09.04 fix (`ce308bc`, неудачный):** попытка 1 — `flex: none; align-items: flex-start` + `padding: 48px 20px 36px`. Убирало растяжение, но user в iPhone всё ещё видел пустое место снизу (причина осталась неясной)
- **10.04 финал (`9cb7958`):** полностью откатила мобильный override. Формулу viewport привела к виду `calc(100dvh - 72px - env(safe-area-inset-top, 0px))` — учитывает safe-area iPhone с notch (на Dynamic Island +59px к высоте nav). Mobile padding — симметричный `24px 20px`. Hero снова центрируется в full viewport на всех экранах

**Урок:** когда меняешь layout-критичные правила в рамках «большого пасса по анимациям» — отдельно прогоняй мобилку. Маленький коммит сломал визуал на 2 дня, потому что я не запустила mobile preview после анимаций.

### Form submit button stuck state (`72e1e19`)

**Баг:** после успешной отправки формы юзер закрывает модалку → открывает снова → кнопка «Отправить» висит серая с текстом «Отправляем…».

**Причина:** В `main.js` обработчик submit сбрасывает `submitBtn.disabled` и `textContent` только в catch-ветке. В success-ветке кнопка остаётся disabled="Отправляем…" — работает закрытие через setTimeout → closeModal → resetModalState, но `resetModalState()` **не трогает кнопку** (только form fields и status).

**Фикс:** добавила сброс кнопки + consent-error в `resetModalState()`:
```js
const submitBtn = leadForm?.querySelector('.lead-submit');
if (submitBtn) {
  submitBtn.disabled = false;
  submitBtn.textContent = 'Отправить';
}
const consentLabel = leadForm?.querySelector('.form-consent');
if (consentLabel) consentLabel.classList.remove('error');
```

Теперь при каждом открытии модалки (включая повторное) состояние чистое.

### Form field states: убрали красное empty-state (`1b3230d`)

**Было:** пустые required-поля — **красная** рамка + красный label (#d14). Заполненные валидные — зелёная рамка + зелёная тень. Optional task — чёрная до заполнения, зелёная после.

**Заказчик:** «слишком агрессивно — юзер ещё ничего не сделал, а мы уже кричим красным».

**Стало:** все empty-поля нейтральные (чёрная рамка как у всех остальных neobrutalism элементов). Зелёное состояние — только при успешном заполнении. Валидация пустых обязательных полей — через JS-проверку на submit (`main.js`), не через CSS-индикатор состояния.

Логика: позитивное подкрепление (зелёный) за правильный ввод, без «ругани» на старте.

### Hero: убрали em-dash из кнопки CTA

«Получить план внедрения AI — бесплатно» → «Получить план внедрения AI, бесплатно» (замена на запятую). Em-dash с пробелами — классический AI-tell (ChatGPT/Claude их рассыпают). Убираем отовсюду в hero, где заказчик увидит.

Ранее (`c3f7814`) убрали em-dash из subtitle и cta-sub. Button был пропущен — добрали сегодня (`9cb7958`).

### Копирайт: полный список изменений hero (справочно)

Наиль 09.04 попросил заменить смысловые формулировки в hero subtitle без отката:
- «Убираем рутину» → «Автоматизируем рутину» (точнее)
- «добавляем возможности» → «открываем возможности» (эмоциональнее, обещание)

Синхронизировано в `og:description`, `twitter:description`, `main.js` meta description. `<title>` не трогали.

---

## Актуальные открытые вопросы (см. backlog.md)

- Автоматическая загрузка аватара Telegram-группы через MTProto (ограничение: JSON long precision)
- Google Search Console + Yandex Webmaster (после fix DNS `forge-ai.io`)
- (опционально) CSS/JS minification через Vercel build step
- (опционально) `forced-reflow-insight` в main.js — найти и пофиксить

---

## Связанные документы

- `landing-copy.md` — source of truth для всех текстов (не менять!)
- `landing-design-brief.md` — актуальные токены и стили
- `backlog.md` — текущий бэклог
- `AGENT-HANDOFF.md` — инструкция для параллельных агентов
- `DEPLOY.md` — как деплоить
- `prompt-ui-designer.md` — промт для UI-дизайнера (анимации, финальная полировка)
