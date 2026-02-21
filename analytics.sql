-- ================================================================
-- Analytics schema for I Want That So Bad
-- Run in Supabase Dashboard → SQL Editor
-- ================================================================

-- 1. Events stream
CREATE TABLE IF NOT EXISTS analytics_events (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name   text NOT NULL,
  user_id      text,                          -- 'tg_123456' (matches users.id)
  source       text CHECK (source IN ('bot', 'miniapp')),
  properties   jsonb DEFAULT '{}'::jsonb,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ae_user_id    ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS idx_ae_event_name ON analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_ae_created_at ON analytics_events (created_at DESC);

-- 2. Daily snapshots (aggregate state per user)
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date   date NOT NULL,
  user_id         text,
  wishes_total    int DEFAULT 0,
  wishes_no_list  int DEFAULT 0,
  wishes_no_label int DEFAULT 0,
  wishlists_total int DEFAULT 0,
  labels_total    int DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (snapshot_date, user_id)
);

CREATE INDEX IF NOT EXISTS idx_as_user_id      ON analytics_snapshots (user_id);
CREATE INDEX IF NOT EXISTS idx_as_snapshot_date ON analytics_snapshots (snapshot_date DESC);

-- 3. Cohort month on users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS cohort_month text;  -- 'YYYY-MM'
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_seen_at timestamptz DEFAULT now();

-- 4. Plan fields for future monetisation
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_started_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- 5. Creation method on wishes (for direct SQL queries)
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS created_method text;  -- 'image'|'link'|'text'|'manual'
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS created_via text;     -- 'bot'|'miniapp'

-- ================================================================
-- RLS: allow inserts from anon/authenticated keys
-- Adjust to match your existing RLS policy style
-- ================================================================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "anon insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "service select analytics" ON analytics_events
  FOR SELECT USING (true);

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "service all snapshots" ON analytics_snapshots
  USING (true) WITH CHECK (true);
