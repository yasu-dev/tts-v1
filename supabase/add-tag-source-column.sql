-- triage_tags.tag_source: タグ番号取得手段の記録（QR / RFID / 手入力）
-- 実行日: 2026-05-13
-- 方針: forward-only（NULL 許容、CHECK 制約、追加のみ）
-- ロールバック時もカラムは残存させる（既存レコードの tag_source 値も維持）

ALTER TABLE triage_tags
  ADD COLUMN IF NOT EXISTS tag_source TEXT
  CHECK (tag_source IS NULL OR tag_source IN ('qr', 'rfid', 'manual'));

CREATE INDEX IF NOT EXISTS idx_triage_tags_tag_source ON triage_tags(tag_source);

COMMENT ON COLUMN triage_tags.tag_source IS
  'タグ番号の取得手段: qr=QRコードスキャン, rfid=RFIDタグスキャン, manual=手入力, NULL=既存レコードまたは未指定';

NOTIFY pgrst, 'reload schema';
