-- Row Level Security (RLS) Policies for Triage Tag System
-- デモフェーズ用: 認証済みユーザーに全操作を許可するシンプルポリシー
-- 適用日: 2026-03-12

-- ===== events テーブル =====
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_full_access" ON events
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ===== triage_tags テーブル =====
ALTER TABLE triage_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_full_access" ON triage_tags
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ===== hospitals テーブル =====
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_full_access" ON hospitals
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ===== teams テーブル =====
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_full_access" ON teams
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ===== geographic_areas テーブル =====
ALTER TABLE geographic_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_full_access" ON geographic_areas
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ===== user_roles テーブル =====
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_full_access" ON user_roles
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ===== scene_maps テーブル =====
-- 別途 supabase/scene-maps-table.sql で定義済み（RLS有効、4ポリシー設定済み）
-- ここでは変更しない

-- ==========================================================================
-- 将来の本番移行用: ロールベースポリシー（参考）
-- user_roles テーブルによるロール管理が運用開始した後に差し替える
-- ==========================================================================
--
-- CREATE POLICY "events_select_policy" ON events
--   FOR SELECT USING (true);
-- CREATE POLICY "events_insert_policy" ON events
--   FOR INSERT WITH CHECK (
--     auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM'))
--   );
-- CREATE POLICY "events_update_policy" ON events
--   FOR UPDATE USING (
--     auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM'))
--   );
--
-- CREATE POLICY "triage_tags_select_policy" ON triage_tags
--   FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "triage_tags_insert_policy" ON triage_tags
--   FOR INSERT WITH CHECK (
--     auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('TRI', 'DMAT', 'IC', 'ADM'))
--   );
-- CREATE POLICY "triage_tags_update_policy" ON triage_tags
--   FOR UPDATE USING (
--     auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('TRI', 'DMAT', 'IC', 'TRN', 'HSP', 'ADM'))
--   );
--
-- CREATE POLICY "hospitals_select_policy" ON hospitals
--   FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "hospitals_update_policy" ON hospitals
--   FOR UPDATE USING (
--     auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('HSP', 'IC', 'ADM'))
--   );
--
-- CREATE POLICY "teams_select_policy" ON teams
--   FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "teams_insert_policy" ON teams
--   FOR INSERT WITH CHECK (
--     auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM'))
--   );
-- CREATE POLICY "teams_update_policy" ON teams
--   FOR UPDATE USING (
--     auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM'))
--   );
--
-- CREATE POLICY "geographic_areas_select_policy" ON geographic_areas
--   FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "geographic_areas_insert_policy" ON geographic_areas
--   FOR INSERT WITH CHECK (
--     auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM'))
--   );
-- CREATE POLICY "geographic_areas_update_policy" ON geographic_areas
--   FOR UPDATE USING (
--     auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM'))
--   );
--
-- CREATE POLICY "user_roles_select_policy" ON user_roles
--   FOR SELECT USING (
--     auth.uid() = user_id OR
--     auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM'))
--   );
-- CREATE POLICY "user_roles_insert_policy" ON user_roles
--   FOR INSERT WITH CHECK (
--     auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM'))
--   );
-- CREATE POLICY "user_roles_update_policy" ON user_roles
--   FOR UPDATE USING (
--     auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM'))
--   );
