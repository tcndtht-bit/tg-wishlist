# Пошаговая настройка Supabase для вишлиста

Подробная инструкция для новичков. Выполняй шаги по порядку.

---

## Часть 1: Регистрация и создание проекта

### Шаг 1.1. Создать аккаунт

1. Открой в браузере: **https://supabase.com**
2. Нажми **Start your project** (или «Начать»)
3. Выбери **Sign in with GitHub** — войди через свой GitHub-аккаунт
4. Разреши Supabase доступ к GitHub (нажми **Authorize**)

---

### Шаг 1.2. Создать новый проект

1. После входа нажми **New Project**
2. Если спросят организацию — выбери **Personal** или создай новую
3. Заполни форму:
   - **Name:** `wishlist-app` (или любое имя)
   - **Database Password:** придумай надёжный пароль и **обязательно сохрани** в надёжное место (записная книжка, менеджер паролей)
   - **Region:** выбери ближайший (например, `Frankfurt` для Европы)
4. Нажми **Create new project**
5. Подожди 1–2 минуты, пока проект создаётся (появится зелёная галочка)

---

### Шаг 1.3. Сохранить ключи доступа

1. В левом меню нажми **Project Settings** (иконка шестерёнки)
2. Слева выбери **API**
3. Скопируй и сохрани в текстовый файл:
   - **Project URL** — ссылка вида `https://xxxxx.supabase.co`
   - **anon public** (ключ в разделе «Project API keys») — длинная строка, начинающаяся с `eyJ...`

Эти данные понадобятся позже для подключения приложения к Supabase. **Не публикуй их в интернете.**

---

## Часть 2: Создание таблиц в базе данных

### Шаг 2.1. Открыть редактор SQL

1. В левом меню Supabase нажми **SQL Editor**
2. Нажми **New query** (новая закладка)

---

### Шаг 2.2. Создать первую таблицу — пользователи

Скопируй этот код в окно редактора и нажми **Run** (или Ctrl+Enter):

```sql
-- Таблица пользователей (из Telegram)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Должно появиться сообщение «Success. No rows returned».

---

### Шаг 2.3. Создать таблицу вишлистов

```sql
-- Таблица вишлистов
CREATE TABLE IF NOT EXISTS wishlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  privacy TEXT DEFAULT 'private' CHECK (privacy IN ('private', 'public', 'shared')),
  owner_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Скопируй, вставь в редактор и нажми **Run**.

---

### Шаг 2.4. Создать таблицу соавторов (для совместного режима)

```sql
-- Кто имеет доступ к совместному вишлисту
CREATE TABLE IF NOT EXISTS wishlist_collaborators (
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (wishlist_id, user_id)
);
```

Скопируй, вставь и нажми **Run**.

---

### Шаг 2.5. Создать таблицу карточек желаний

```sql
-- Карточки желаний
CREATE TABLE IF NOT EXISTS wishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  price TEXT,
  currency TEXT,
  size TEXT,
  link TEXT,
  comment TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Скопируй, вставь и нажми **Run**.

---

### Шаг 2.6. Создать связь карточек с вишлистами

Одна карточка может быть в нескольких вишлистах:

```sql
-- Связь: какая карточка в каких вишлистах
CREATE TABLE IF NOT EXISTS wishlist_items (
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  wish_id TEXT NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
  PRIMARY KEY (wishlist_id, wish_id)
);
```

Скопируй, вставь и нажми **Run**.

---

### Шаг 2.7. Создать таблицу бронирований (для публичных вишлистов)

```sql
-- Кто забронировал какую карточку
CREATE TABLE IF NOT EXISTS reservations (
  wish_id TEXT NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (wish_id)
);
```

Скопируй, вставь и нажми **Run**.

---

### Шаг 2.8. Создать таблицу подписок на публичные вишлисты

```sql
-- Подписки: пользователь открыл публичный вишлист по ссылке — он появляется в его списке
CREATE TABLE IF NOT EXISTS followed_public_wishlists (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, wishlist_id)
);
```

Скопируй, вставь и нажми **Run**.

---

### Шаг 2.9. Создать таблицу категорий (если храним на сервере)

```sql
-- Категории пользователя (теги)
CREATE TABLE IF NOT EXISTS categories (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  PRIMARY KEY (user_id, name)
);
```

Скопируй, вставь и нажми **Run**.

---

### Шаг 2.10. Проверить, что таблицы созданы

1. В левом меню нажми **Table Editor**
2. Должны быть видны таблицы: `users`, `wishlists`, `wishlist_collaborators`, `followed_public_wishlists`, `wishes`, `wishlist_items`, `reservations`, `categories`

Если все есть — база данных готова.

---

## Часть 3: Настройка прав доступа (безопасность)

Сейчас таблицы пустые и без правил. Позже мы добавим RLS (Row Level Security), когда будем подключать приложение. Пока оставляем как есть.

Если захочешь сразу включить базовую защиту, можно выполнить:

```sql
-- Включить RLS на всех таблицах (пока разрешаем всё)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE followed_public_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Временная политика: разрешить всё (потом заменим на проверку Telegram)
CREATE POLICY "allow_all" ON users FOR ALL USING (true);
CREATE POLICY "allow_all" ON wishlists FOR ALL USING (true);
CREATE POLICY "allow_all" ON wishlist_collaborators FOR ALL USING (true);
CREATE POLICY "allow_all" ON followed_public_wishlists FOR ALL USING (true);
CREATE POLICY "allow_all" ON wishes FOR ALL USING (true);
CREATE POLICY "allow_all" ON wishlist_items FOR ALL USING (true);
CREATE POLICY "allow_all" ON reservations FOR ALL USING (true);
CREATE POLICY "allow_all" ON categories FOR ALL USING (true);
```

**Внимание:** политика `allow_all` — временная. В production её нужно заменить на проверку пользователя.

---

## Часть 4: Миграция для владельца карточек

Выполни в SQL Editor (один раз):

```sql
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id);
```

Это нужно для хранения, кто создал каждую карточку.

---

## Часть 5: Подключение к приложению

1. Открой `index.html` в редакторе
2. Найди строки (в начале скрипта):
   ```js
   const SUPABASE_URL = '';
   const SUPABASE_ANON_KEY = '';
   ```
3. Вставь свои значения из Шага 1.3:
   - В `SUPABASE_URL` — твой Project URL
   - В `SUPABASE_ANON_KEY` — твой anon public ключ
4. Сохрани файл и задеплой

После этого приложение будет сохранять данные в Supabase, и совместный режим заработает.

---

## Часть 6: Что дальше

После выполнения этих шагов у тебя будет:

- Проект Supabase
- База данных с нужными таблицами
- URL и API-ключ для подключения

Следующий этап — изменить `index.html`, чтобы приложение читало и сохраняло данные в Supabase вместо `localStorage`. Эту часть сделаем отдельно, когда ты скажешь, что Supabase настроен.

---

## Часто задаваемые вопросы

**Где взять пароль от базы?**  
Тот, который ты задавал при создании проекта. Он нужен только для прямого подключения к PostgreSQL (через DBeaver и т.п.). Для приложения используются API URL и anon key.

**Можно ли удалить таблицу и создать заново?**  
Да. В Table Editor выбери таблицу → три точки → Delete table. Потом создай её снова через SQL Editor.

**Сколько это стоит?**  
Бесплатный тариф Supabase даёт 500 МБ базы и 2 ГБ трафика в месяц. Для личного проекта обычно хватает.
