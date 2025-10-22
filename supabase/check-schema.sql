-- triage_tagsテーブルの現在のスキーマを確認

-- 全カラムを表示
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'triage_tags'
ORDER BY ordinal_position;

-- 特に重要なカラムの存在確認
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'triage_tags'
  AND column_name IN (
    'patient_info',
    'vital_signs',
    'chief_complaint',
    'conveyer',
    'execution_places',
    'rescue_place',
    'enforcement_organization',
    'conditions',
    'vital_signs_records'
  )
ORDER BY column_name;
