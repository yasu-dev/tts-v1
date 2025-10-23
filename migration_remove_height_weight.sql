-- ================================================
-- トリアージタッグから身長・体重フィールドを削除
-- ================================================
-- 作成日: 2025-10-23
-- 目的: 紙のトリアージタッグとの整合性を保つため
--
-- 【重要】実行前に必ずバックアップを取得してください
-- バックアップコマンド例:
-- pg_dump -U postgres -d your_database > backup_$(date +%Y%m%d_%H%M%S).sql
-- ================================================

-- 1. 影響を受けるレコード数を確認
SELECT
    COUNT(*) as total_records,
    COUNT(CASE WHEN patient_info->>'height' IS NOT NULL THEN 1 END) as records_with_height,
    COUNT(CASE WHEN patient_info->>'weight' IS NOT NULL THEN 1 END) as records_with_weight
FROM triage_tags;

-- 2. 削除対象のデータを確認（念のため）
SELECT
    id,
    tag_number,
    patient_info->>'name' as name,
    patient_info->>'height' as height,
    patient_info->>'weight' as weight
FROM triage_tags
WHERE patient_info->>'height' IS NOT NULL OR patient_info->>'weight' IS NOT NULL
LIMIT 10;

-- 3. height と weight を削除（実行）
-- 【注意】この操作は不可逆です。実行前に必ずバックアップを確認してください。
UPDATE triage_tags
SET patient_info = patient_info - 'height' - 'weight',
    updated_at = NOW()
WHERE patient_info ? 'height' OR patient_info ? 'weight';

-- 4. 削除後の確認
SELECT
    COUNT(*) as total_records,
    COUNT(CASE WHEN patient_info->>'height' IS NOT NULL THEN 1 END) as records_with_height,
    COUNT(CASE WHEN patient_info->>'weight' IS NOT NULL THEN 1 END) as records_with_weight
FROM triage_tags;

-- 期待結果: records_with_height と records_with_weight が 0 になること

-- ================================================
-- ロールバック手順:
-- バックアップから復元する以外の方法はありません。
-- psql -U postgres -d your_database < backup_YYYYMMDD_HHMMSS.sql
-- ================================================
