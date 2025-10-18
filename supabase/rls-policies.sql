-- Row Level Security (RLS) Policies for Triage Tag System

-- ===== events テーブル =====
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "events_select_policy" ON events
  FOR SELECT
  USING (true);

-- IC, ADM のみが作成・更新可能
CREATE POLICY "events_insert_policy" ON events
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM')
    )
  );

CREATE POLICY "events_update_policy" ON events
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM')
    )
  );

-- ===== triage_tags テーブル =====
ALTER TABLE triage_tags ENABLE ROW LEVEL SECURITY;

-- 全認証ユーザーが読み取り可能
CREATE POLICY "triage_tags_select_policy" ON triage_tags
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- TRI, DMAT, IC が作成可能
CREATE POLICY "triage_tags_insert_policy" ON triage_tags
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('TRI', 'DMAT', 'IC', 'ADM')
    )
  );

-- TRI, DMAT, IC, TRN, HSP が更新可能
CREATE POLICY "triage_tags_update_policy" ON triage_tags
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('TRI', 'DMAT', 'IC', 'TRN', 'HSP', 'ADM')
    )
  );

-- ===== hospitals テーブル =====
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- 全認証ユーザーが読み取り可能
CREATE POLICY "hospitals_select_policy" ON hospitals
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- HSP, IC, ADM が更新可能
CREATE POLICY "hospitals_update_policy" ON hospitals
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('HSP', 'IC', 'ADM')
    )
  );

-- ===== teams テーブル =====
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 全認証ユーザーが読み取り可能
CREATE POLICY "teams_select_policy" ON teams
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- IC, ADM が作成・更新可能
CREATE POLICY "teams_insert_policy" ON teams
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM')
    )
  );

CREATE POLICY "teams_update_policy" ON teams
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM')
    ) OR
    auth.uid() IN (
      SELECT jsonb_array_elements(members)->>'user_id'::uuid FROM teams WHERE id = teams.id
    )
  );

-- ===== geographic_areas テーブル =====
ALTER TABLE geographic_areas ENABLE ROW LEVEL SECURITY;

-- 全認証ユーザーが読み取り可能
CREATE POLICY "geographic_areas_select_policy" ON geographic_areas
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- IC, ADM が作成・更新可能
CREATE POLICY "geographic_areas_insert_policy" ON geographic_areas
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM')
    )
  );

CREATE POLICY "geographic_areas_update_policy" ON geographic_areas
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM')
    )
  );

-- ===== user_roles テーブル =====
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のロールを読み取り可能
CREATE POLICY "user_roles_select_policy" ON user_roles
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM')
    )
  );

-- IC, ADM のみが作成・更新可能
CREATE POLICY "user_roles_insert_policy" ON user_roles
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM')
    )
  );

CREATE POLICY "user_roles_update_policy" ON user_roles
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('IC', 'ADM')
    )
  );

-- ===== 監査ログテーブル（追加の場合） =====
-- 将来的に監査ログテーブルを追加する場合は以下のようなポリシーを設定
-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "audit_logs_select_policy" ON audit_logs
--   FOR SELECT
--   USING (
--     auth.uid() IN (
--       SELECT user_id FROM user_roles WHERE role IN ('AUD', 'ADM')
--     )
--   );
--
-- CREATE POLICY "audit_logs_insert_policy" ON audit_logs
--   FOR INSERT
--   WITH CHECK (auth.role() = 'authenticated');

COMMENT ON POLICY "events_select_policy" ON events IS '全ユーザーが災害イベントを参照可能';
COMMENT ON POLICY "triage_tags_select_policy" ON triage_tags IS '全認証ユーザーがトリアージタグを参照可能';
COMMENT ON POLICY "triage_tags_insert_policy" ON triage_tags IS 'TRI, DMAT, IC, ADM がトリアージタグを作成可能';
COMMENT ON POLICY "triage_tags_update_policy" ON triage_tags IS 'TRI, DMAT, IC, TRN, HSP, ADM がトリアージタグを更新可能';
