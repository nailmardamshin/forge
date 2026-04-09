# Forge Landing — Backlog

> Последнее обновление: 09.04.2026

## Pending

### Дизайн
- [ ] Норникель — найти SVG на русском языке (белый на прозрачном) для marquee и блока 11
- [ ] Section labels — решить глобально: pill или ghost (сейчас pill везде)
- [ ] Ломаная сетка: расширить контейнер для таблицы (#2), кейсов (#9), альтернатив (#8)
- [ ] Мобильная адаптация — полный проход по всем блокам на 375px
- [ ] SVG логотипы клиентов вместо текста (где не найдены)
- [ ] Микро-CTA под блоком "Узнаёте?" — "Если хоть одно — пора поговорить" + ссылка на аудит (opt)

### Инфраструктура
- [ ] Форкнуть Telegram MCP и добавить high-level метод `upload_chat_photo(chat_id, file_path)` — сейчас автозагрузка аватара не работает из-за JSON long precision в params `invoke_mtproto`. Скилл `forge-tg-create` пока делает fallback «поставь вручную»

### SEO / аналитика
- [ ] Google Search Console + Yandex Webmaster
- [ ] Analytics (GA4 или Я.Метрика)
- [ ] Schema.org structured data (Organization, WebPage, BreadcrumbList)

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
- [x] Фавиконки
- [x] Мета-теги (title, description, og:*)
