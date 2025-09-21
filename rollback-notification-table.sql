-- 後戻り用：Notificationテーブル削除SQL
DROP TABLE IF EXISTS "notifications";

-- 削除確認用
SELECT name FROM sqlite_master WHERE type='table' AND name='notifications';