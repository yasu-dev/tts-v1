-- =====================================================================
-- Triage Tag System - ベーステーブル定義（統合版）
-- 作成日: 2026-03-23
-- 目的: Supabase環境再構築用の完全なCREATE TABLE定義
-- 出典: docs/仕様.md + 実アプリコードからの差分カラム追加
-- =====================================================================
-- 実行順序: このファイルを最初に実行すること
-- 後続: add-triage-tag-fields.sql → scene-maps-table.sql
--        → contact-point-functions.sql → rls-policies.sql
-- =====================================================================

-- UUID生成用の拡張（Supabaseではデフォルトで有効）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== 共通: updated_at 自動更新トリガー関数 =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== 1. 災害イベントテーブル =====
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  location_polygon JSONB,
  command_post_location JSONB,
  communication_mode TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'active',
  contact_points TEXT[] DEFAULT '{}',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trigger_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===== 2. トリアージタグテーブル（中核） =====
CREATE TABLE IF NOT EXISTS triage_tags (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  anonymous_id TEXT NOT NULL,
  tag_number TEXT NOT NULL,

  -- 患者情報
  patient_info JSONB,

  -- 主訴・症状
  chief_complaint JSONB,

  -- 位置情報
  location JSONB NOT NULL,

  -- 生体所見
  vital_signs JSONB NOT NULL,

  -- トリアージ区分
  triage_category JSONB NOT NULL,

  -- 再トリアージ履歴
  retriage_history JSONB DEFAULT '[]',

  -- 添付情報
  attachments JSONB DEFAULT '{"images":[],"audio_notes":[],"drone_images":[]}',

  -- 処置記録
  treatments JSONB DEFAULT '[]',

  -- 搬送情報
  transport JSONB DEFAULT '{"status":"not_transported"}',

  -- 搬送割当（搬送チームダッシュボード用）
  transport_assignment JSONB,

  -- 転帰情報
  outcome JSONB,

  -- 監査情報
  audit JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, tag_number)
);

-- triage_tags インデックス
CREATE INDEX IF NOT EXISTS idx_triage_tags_category
  ON triage_tags ((triage_category->>'final'));

CREATE INDEX IF NOT EXISTS idx_triage_tags_transport_status
  ON triage_tags ((transport->>'status'));

CREATE TRIGGER trigger_triage_tags_updated_at
  BEFORE UPDATE ON triage_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===== 3. 地理エリアテーブル =====
CREATE TABLE IF NOT EXISTS geographic_areas (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  bounds JSONB NOT NULL,
  priority_score INTEGER DEFAULT 0,
  estimated_casualty_count INTEGER DEFAULT 0,
  severity_distribution JSONB DEFAULT '{"red":0,"yellow":0,"green":0,"black":0}',
  drone_analysis JSONB,
  assigned_team_ids TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 4. 医療機関マスタ =====
CREATE TABLE IF NOT EXISTS hospitals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  location JSONB NOT NULL,
  contact JSONB NOT NULL,
  capabilities JSONB NOT NULL,
  current_load JSONB DEFAULT '{"total_capacity":0,"current_patients":0,"accepting_status":"accepting","last_updated":""}',
  transport_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trigger_hospitals_updated_at
  BEFORE UPDATE ON hospitals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===== 5. 隊/車両テーブル =====
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  members JSONB DEFAULT '[]',
  current_location JSONB,
  status TEXT DEFAULT 'standby',
  assigned_area_ids TEXT[] DEFAULT '{}',
  assigned_casualty_ids TEXT[] DEFAULT '{}',
  vehicle JSONB,
  activity_log JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trigger_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===== 6. ユーザーロールテーブル =====
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  assigned_area_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, event_id)
);

-- ===== 7. 監査ログテーブル（WORM: 追記専用） =====
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_number BIGSERIAL,
  previous_hash TEXT,
  current_hash TEXT NOT NULL,

  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  resource_type TEXT,
  resource_id TEXT,
  action TEXT NOT NULL,
  changes JSONB,

  ip_address INET,
  user_agent TEXT,
  device_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- audit_logs: RLS有効化 + 追記専用ポリシー
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audit logs are append-only" ON audit_logs FOR DELETE USING (false);
CREATE POLICY "Audit logs cannot be updated" ON audit_logs FOR UPDATE USING (false);
CREATE POLICY "Audit logs insert for authenticated" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Audit logs select for authenticated" ON audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- ===== 8. オフライン同期用状態テーブル =====
CREATE TABLE IF NOT EXISTS sync_state (
  device_id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id),
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  pending_changes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trigger_sync_state_updated_at
  BEFORE UPDATE ON sync_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===== 完了通知 =====
DO $$
BEGIN
  RAISE NOTICE '=============================================';
  RAISE NOTICE 'ベーステーブル作成完了（8テーブル）';
  RAISE NOTICE '  1. events';
  RAISE NOTICE '  2. triage_tags';
  RAISE NOTICE '  3. geographic_areas';
  RAISE NOTICE '  4. hospitals';
  RAISE NOTICE '  5. teams';
  RAISE NOTICE '  6. user_roles';
  RAISE NOTICE '  7. audit_logs';
  RAISE NOTICE '  8. sync_state';
  RAISE NOTICE '※ scene_maps は scene-maps-table.sql で別途作成';
  RAISE NOTICE '=============================================';
END $$;

-- スキーマキャッシュの更新を通知
NOTIFY pgrst, 'reload schema';
