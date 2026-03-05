# Подключение Metabase к Supabase

Гайд по развёртыванию Metabase на Railway и подключению к аналитике.

---

## 1. Регистрация на Railway

1. Зайди на [railway.app](https://railway.app)
2. Sign up через GitHub
3. New Project → Deploy from GitHub (или One-Click Deploy)

---

## 2. Деплой Metabase

**Способ A: через Railway Template**

1. [Metabase на Railway](https://railway.app/template/metabase) → Deploy Now
2. Подтверди репозиторий и дождись сборки

**Способ B: вручную**

1. New Project → Deploy from GitHub Repo
2. Выбери репозиторий `metabase/metabase` или используй Docker image
3. Variables:
   - `MB_DB_TYPE=postgres`
   - `MB_DB_DBNAME=metabase`
   - `MB_DB_PORT=5432`
   - `MB_DB_USER`, `MB_DB_PASS`, `MB_DB_HOST` — из отдельной Postgres-базы Railway (Add PostgreSQL service)

**Способ C: через Docker (самый простой)**

1. New Project → Empty Project
2. Add Service → Docker Image → `metabase/metabase`
3. Add PostgreSQL service (для хранения данных Metabase)
4. У Metabase-сервиса: Settings → Variables → добавить env vars для подключения к Postgres

---

## 3. Публичный URL

1. Metabase service → Settings → Networking
2. Generate Domain — получишь `xxx.up.railway.app`
3. Или подключи свой домен

---

## 4. Первый запуск Metabase

1. Открой URL
2. Onboarding: создай админ-аккаунт (email + пароль)
3. Skip настройку примера базы — добавим Supabase вручную

---

## 5. Подключение Supabase

1. Settings (шестерёнка) → Admin Settings → Databases → Add database
2. Database type: **PostgreSQL**
3. Параметры (из Supabase Dashboard → Project Settings → Database):

   | Поле | Значение |
   |------|----------|
   | Host | `db.xxx.supabase.co` |
   | Port | `5432` |
   | Database name | `postgres` |
   | Username | `postgres` |
   | Password | твой DB password (не anon key) |
   | Use a secure connection (SSL) | включено |

4. Advanced: SSL mode = `require` (или `verify-full` при своих сертификатах)
5. Save

> **Важно:** используй Database password из Supabase (Connection string → URI), не anon key. Anon key — для API, для прямого подключения к Postgres нужен пароль пользователя `postgres`.

---

## 6. Создание дашборда

1. New → Question
2. Pick your data → `analytics_events` (или другая таблица)
3. Создай несколько вопросов:

**Новые пользователи по дням:**
```sql
SELECT 
  date_trunc('day', created_at)::date as day,
  count(*) as users
FROM analytics_events 
WHERE event_name = 'user_registered'
GROUP BY 1 
ORDER BY 1 DESC
```

**События по типам:**
```sql
SELECT 
  event_name,
  count(*) as count,
  count(distinct user_id) as unique_users
FROM analytics_events
GROUP BY event_name
ORDER BY count DESC
```

**Создание карточек по способам (properties):**
```sql
SELECT 
  properties->>'method' as method,
  source,
  count(*) as count
FROM analytics_events 
WHERE event_name = 'wish_created'
GROUP BY 1, 2
ORDER BY 3 DESC
```

4. New → Dashboard → Add questions to dashboard
5. Добавь графики (line chart, bar chart, number)

---

## 7. Ограничение доступа (опционально)

- Admin → People → создай пользователей, если нужна команда
- Admin → Permissions → ограничь доступ к базе по группам

---

## Альтернатива: Metabase Cloud

Если не хочешь хостить сам — [metabase.com](https://www.metabase.com/pricing/) предлагает облачный вариант. Подключение к Supabase то же: Add database → PostgreSQL → host/port/db/password. Минус — платная подписка.
