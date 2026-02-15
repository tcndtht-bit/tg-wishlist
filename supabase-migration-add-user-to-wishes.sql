-- Миграция: добавить владельца к карточкам желаний
-- Выполни в SQL Editor один раз
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id);
