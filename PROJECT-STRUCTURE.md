# I Want That So Bad — структура проекта

## 1. Фронт (Telegram Mini App)
- **Репозиторий:** TG mini app → GitHub Pages
- **Стек:** HTML + CSS + vanilla JS (без React/Vue)
- **Файлы:** index.html, style.css, app.js
- **Внешние:** Supabase (БД, auth, storage), Link Scraper (анализ ссылок/фото/текста)
- **Деплой:** GitHub Actions → _site/ → Pages; секреты подставляются в app.js (SUPABASE_URL, SUPABASE_ANON_KEY, LINK_SCRAPER_URL)

## 2. Бот
- **Репозиторий:** tg-wishlist-backend-bot
- **Стек:** Python, pyTelegramBotAPI, requests
- **Функции:** /start, приём фото/ссылок/текста («хочу» / «I wish»), вызов Link Scraper, выдача WebApp-кнопки с prefill-данными
- **Env:** BOT_TOKEN, WEB_APP_URL, LINK_SCRAPER_URL, SCRAPER_API_KEY
- **Деплой:** свой (VPS/Railway/etc.)

## 3. Link Scraper
- **Репозиторий:** link-scraper
- **Стек:** Node.js, Express, Puppeteer, Supabase (для store-wish-text)
- **API:**
  - GET /?url=... — парсинг страницы товара (OG, DOM)
  - POST /analyze-image — разбор фото (OpenRouter/Gemini Vision)
  - POST /store-wish-text + GET /wish-text?id=&analyze=1 — текст «хочу…» в LLM
  - GET /health
- **Env:** OPENROUTER_API_KEY / GROQ_API_KEY, SCRAPER_API_KEY, MAX_PAGES, RATE_MAX
- **Кэш:** URL (5 мин), wish-text in-memory (10 мин)

## 4. БД (Supabase)
- **Таблицы:** users, wishlists, wishes, wishlist_items, categories, reservations, wishlist_collaborators, followed_public_wishlists
- **Storage:** wish-images

## 5. Потоки
- Telegram → Бот → Link Scraper (фото, ссылки, текст)
- Фронт ↔ Supabase (CRUD, live feed)
- Фронт → Link Scraper (парсинг ссылки по фото с главной)

## 6. Аналитика
Сейчас нет. Нужно проектировать: таблица событий в Supabase / внешний сервис / логи в боте и т.д.
