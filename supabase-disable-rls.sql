-- ============================================
-- Отключение RLS для приложения «Вишлист»
-- Выполни в SQL Editor один раз
--
-- Почему: при включённом RLS без политик Supabase
-- возвращает пустые данные. Приложение само фильтрует
-- по user_id / owner_id в запросах.
-- ============================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishes DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
