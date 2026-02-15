-- ============================================
-- Создание таблиц для Supabase
-- Копируй и запускай по ОДНОМУ блоку в SQL Editor
-- ============================================

-- 1. Пользователи (из Telegram)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Вишлисты
CREATE TABLE IF NOT EXISTS wishlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  privacy TEXT DEFAULT 'private' CHECK (privacy IN ('private', 'public', 'shared')),
  owner_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Соавторы (кто может редактировать совместный вишлист)
CREATE TABLE IF NOT EXISTS wishlist_collaborators (
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (wishlist_id, user_id)
);

-- 4. Карточки желаний
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

-- 5. Связь: какая карточка в каких вишлистах (одна карточка — много вишлистов)
CREATE TABLE IF NOT EXISTS wishlist_items (
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  wish_id TEXT NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
  PRIMARY KEY (wishlist_id, wish_id)
);

-- 6. Бронирования (кто забронировал карточку в публичном вишлисте)
CREATE TABLE IF NOT EXISTS reservations (
  wish_id TEXT NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (wish_id)
);

-- 7. Подписки на публичные вишлисты (когда пользователь открыл по ссылке)
CREATE TABLE IF NOT EXISTS followed_public_wishlists (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, wishlist_id)
);

-- 8. Категории пользователя
CREATE TABLE IF NOT EXISTS categories (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  PRIMARY KEY (user_id, name)
);
