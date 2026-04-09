# Forge Landing — Backlog

> Последнее обновление: 09.04.2026 — SEO-пасс (JSON-LD, favicons, OG, a11y)

## Pending

### Дизайн
- [ ] Section labels — решить глобально: pill или ghost (сейчас pill везде)
- [ ] Ломаная сетка: расширить контейнер для таблицы (#2), кейсов (#9), альтернатив (#8)
- [ ] Мобильная адаптация — полный проход по всем блокам на 375px
- [ ] SVG логотипы клиентов вместо текста (где не найдены)
- [ ] Микро-CTA под блоком "Узнаёте?" — "Если хоть одно — пора поговорить" + ссылка на аудит (opt)

### Инфраструктура
- [ ] Форкнуть Telegram MCP и добавить high-level метод `upload_chat_photo(chat_id, file_path)` — сейчас автозагрузка аватара не работает из-за JSON long precision в params `invoke_mtproto`. Скилл `forge-tg-create` пока делает fallback «поставь вручную»

### SEO / аналитика
- [ ] Google Search Console + Yandex Webmaster (после привязки домена)
- [ ] Analytics (GA4 или Я.Метрика) — отдельный спринт с cookie-banner и политикой ПДн
- [ ] Обновить canonical/og:url/sameAs на кастомный домен (сейчас github.io placeholder)
- [ ] Lighthouse audit на live (SEO ≥ 95, A11y ≥ 90) — ручной прогон в Chrome DevTools

## Done

### Hero и marquee
- [x] Hero: full viewport, left-align, marquee trust strip
- [x] Marquee: drag-to-scroll через requestAnimationFrame, seamless loop
- [x] Логотипы клиентов в marquee (12 шт) — белые PNG с filter
- [x] Hero container 900px (был 1200px) — единая сетка со всеми секциями
- [x] Декор: сетка точек на фоне hero, "AI" в правом верхнем углу

### Типографика
- [x] Типографика: 14 размеров → 4 токена (--text-xs/sm/base/lg)
- [x] Висячие предлоги: все 12 блоков через `&nbsp;`

### Секции
- [x] Блок 2: зачёркнутый текст, пропорции колонок, оранжевая колонка "После", мобайл → карточки
- [x] Блок 3: 2 колонки 2+2+1, все оранжевые left-border, мобайл reorder
- [x] Блок 4: сменили с "Процесс" на "Ценности" (copy.md), горизонтальные полоски в общей рамке, оранжевые заголовки
- [x] Блок 5: оранжевый фон, border-top разделители между абзацами
- [x] Блок 6: horizontal timeline, крупные номера 52px, оранжевые заголовки шагов
- [x] Блок 7: accordion с оранжевым `+` и left-border на открытом
- [x] Блок 8: белый header (было чёрный), flex + margin-top: auto для Forge-блока
- [x] Блок 9: Tetraform full-width, Syl + Ivy 2-col, оранжевые цифры + подписи, counter animation, обновлённые stats (94% Сбер / 7000 Красный Крест / 2 Tagline)
- [x] Блок 10: 2 колонки, oversized декоративные символы (₽ ⇄ </> 30)
- [x] Блок 11: фото основателя + оранжевый left-border, FORGE заглавными, стек 16 pills в 2 строки центрированы
- [x] Блок 12: оранжевый фон (исключён из nth-child(even)), белая карточка split-layout, одна кнопка

### Навигация
- [x] Sticky nav + бургер на всех экранах (neobrutalism стиль)
- [x] Mobile menu — fullscreen overlay, border-rows, hover-slide
- [x] ID на всех секциях (potencial, situacii, cennosti, rezultat, etapy, somneniya, sravnenie, proekty, garantii, o-kompanii)

### Инфраструктура
- [x] Реорганизация папок: `landing-v2/` + `/tmp/forge-landing/` → единая `landing/` с git-репо внутри
- [x] Миграция с GitHub Pages на Vercel (auto-deploy из main)
- [x] Lead form modal + API endpoint `/api/lead` (Vercel function)
- [x] Airtable + Telegram notification для лидов
- [x] Секреты в Vercel Environment Variables

### SEO
- [x] robots.txt
- [x] sitemap.xml
- [x] og-template.html + OG-image с тёмной полосой и enterprise логотипами
- [x] Фавиконки (SVG + PNG 32 + apple-touch-icon 180, оранжевая F на cream)
- [x] Мета-теги (title, description, og:*, twitter card, canonical, theme-color, mobile)
- [x] JSON-LD structured data: ProfessionalService + FAQPage + WebSite
- [x] ProfessionalService enrichment: slogan, serviceType, contactPoint, parentOrganization, @id
- [x] FAQPage answers byte-match DOM (rich snippets ready)
- [x] a11y: main landmark, skip link, prefers-reduced-motion
- [x] Inter 400 cyrillic preload, decoding="async" на marquee лого
- [x] Норникель: белый SVG с кириллическим "НОРНИКЕЛЬ" для marquee
- [x] W3C HTML validator: 0 errors / 0 warnings на live

### Анимации и интерактив
- [x] Hero entrance stagger (label → h1 → subtitle → cta, delay 0.15-0.75s)
- [x] CTA shadow pulse (hero + final) — 2 повтора
- [x] Decorative "AI" в hero-inner::after (14rem на десктопе, 7rem на мобилке, opacity 0.07)
- [x] Scroll fade-in всех секций, threshold 0.25, duration 0.8s
- [x] Staggered children — карточки, строки таблицы, job-cards, stack-strip пунктиры
- [x] Counter animation для цифр в кейсах (94%, 7 000, 24K+, 274, -25%), easeOutExpo 2s
- [x] Timeline draw — connector lines «рисуются» scaleX/scaleY, стаггер per step
- [x] Point B entrance — scale(0.96)→1 + opacity, свой observer threshold 0.4
- [x] Marquee — hover slow 0.5x, momentum после drag, prefers-reduced-motion
- [x] Accordion — smooth scrollHeight вместо max-height hack, recalc на resize
- [x] Nav shadow при скролле (zero-blur sm shadow)
- [x] Job-card hover — translateX(4px) с !important
- [x] Декоративные символы в trigger cards (↗ ? ! # »), guarantees (₽ ⇄ </> 30), point-b (◆)
- [x] Active state (0.05s transition) + tap feedback на мобилке (webkit-tap-highlight transparent)
- [x] prefers-reduced-motion — отключает все анимации, counter показывает финал сразу

### Форма и лиды
- [x] Модалка с формой (4 поля: имя, компания, контакт, задача опционально)
- [x] Стили neobrutalism — чёрные рамки, жёсткие тени, square corners
- [x] Красный border для пустых обязательных / зелёный для заполненных (placeholder-shown трюк)
- [x] Лейбл синхронизирован с цветом поля (красный/зелёный/чёрный)
- [x] Orange focus shadow / green shadow для валидных полей
- [x] Оранжевый крестик закрытия
- [x] Success state — вся форма исчезает, большая галочка «Отправлено!», autoclose через 6s
- [x] Escape / клик по backdrop закрывают модалку
- [x] Body scroll lock при открытии
- [x] Validation на клиенте + на сервере (allowlist sources)
- [x] Airtable typecast: true — автосоздание новых Source опций
- [x] Cache buster на main.js (критичный фикс — без него JS кешировался)

### CTAs
- [x] Все primary CTAs → форма (hero, nav, mobile-menu, final-cta)
- [x] Telegram остался только вторичной кнопкой в final-cta + footer ссылка
- [x] Final CTA reorder: form (primary) → telegram (secondary) — как в landing-copy.md
- [x] Button reset CSS для <button> с классами .btn / .nav-cta / .mobile-menu-cta
- [x] Mobile menu закрывается при клике на форм-кнопку

### Тексты (по changelog 2026-04-09)
- [x] «2-4 недели» → «3-4 недели» (6 мест + meta + JSON-LD)
- [x] «30 минут» → «60 минут» (3 места)
- [x] «проприетарная платформа» → «закрытая платформа, которую знаем только мы»
- [x] «core business» → «профиль», «n8n» → «собственные пилоты» (секция 8)
- [x] Убрана фраза «работаете напрямую с командой» (секция 8, карточка 3)

### Мелочи
- [x] safe-area-inset-top для Telegram in-app браузера (нав прилипает к верхней грани)
- [x] Vertical border между колонками «Сейчас» и «После AI» в таблице (блок 2)
