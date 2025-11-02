-- 紙のトリアージタッグ詳細項目を追加するマイグレーション
-- 実行日: 2025-10-22

-- 既存カラムの確認（chief_complaintが存在するか）
-- 存在しない場合は追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'triage_tags' AND column_name = 'chief_complaint'
  ) THEN
    ALTER TABLE triage_tags ADD COLUMN chief_complaint JSONB;
  END IF;
END $$;

-- triage_tagsテーブルに新規カラムを追加
ALTER TABLE triage_tags
  -- 搬送機関
  ADD COLUMN IF NOT EXISTS conveyer TEXT,

  -- トリアージ実施場所（複数選択可）
  ADD COLUMN IF NOT EXISTS execution_places TEXT[],
  ADD COLUMN IF NOT EXISTS execution_place_other TEXT,

  -- 救出場所
  ADD COLUMN IF NOT EXISTS rescue_place TEXT,

  -- トリアージ実施機関
  ADD COLUMN IF NOT EXISTS enforcement_organization TEXT,
  ADD COLUMN IF NOT EXISTS enforcement_organization_other TEXT,

  -- 症状・傷病名（複数選択可）
  ADD COLUMN IF NOT EXISTS conditions TEXT[],
  ADD COLUMN IF NOT EXISTS condition_other TEXT,

  -- バイタルサイン複数回記録（JSONB形式）
  ADD COLUMN IF NOT EXISTS vital_signs_records JSONB;

-- インデックスを追加（検索性能向上）
CREATE INDEX IF NOT EXISTS idx_triage_tags_conveyer ON triage_tags(conveyer);
CREATE INDEX IF NOT EXISTS idx_triage_tags_rescue_place ON triage_tags(rescue_place);
CREATE INDEX IF NOT EXISTS idx_triage_tags_enforcement_organization ON triage_tags(enforcement_organization);

-- GINインデックスを追加（配列検索用）
CREATE INDEX IF NOT EXISTS idx_triage_tags_execution_places ON triage_tags USING GIN(execution_places);
CREATE INDEX IF NOT EXISTS idx_triage_tags_conditions ON triage_tags USING GIN(conditions);

-- JSONBインデックスを追加（バイタルサイン検索用）
CREATE INDEX IF NOT EXISTS idx_triage_tags_vital_signs_records ON triage_tags USING GIN(vital_signs_records);

-- コメントを追加
COMMENT ON COLUMN triage_tags.conveyer IS '搬送機関名';
COMMENT ON COLUMN triage_tags.execution_places IS 'トリアージ実施場所（複数選択可: scene/post/vehicle/other）';
COMMENT ON COLUMN triage_tags.execution_place_other IS 'トリアージ実施場所のその他詳細';
COMMENT ON COLUMN triage_tags.rescue_place IS '救出場所';
COMMENT ON COLUMN triage_tags.enforcement_organization IS 'トリアージ実施機関（doctor/paramedic/other）';
COMMENT ON COLUMN triage_tags.enforcement_organization_other IS 'トリアージ実施機関のその他詳細';
COMMENT ON COLUMN triage_tags.conditions IS '症状・傷病名（複数選択可: contusion/fracture/sprain/amputation/burn/other）';
COMMENT ON COLUMN triage_tags.condition_other IS '症状・傷病名のその他詳細';
COMMENT ON COLUMN triage_tags.vital_signs_records IS 'バイタルサイン複数回記録（1st/2nd/3rd）JSONB形式';

-- スキーマキャッシュの更新を通知
NOTIFY pgrst, 'reload schema';
