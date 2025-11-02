-- 接触地点の一括更新用RPC関数

-- 既存のトリアージタグの接触地点を一括更新する関数
CREATE OR REPLACE FUNCTION update_contact_point(
  p_event_id UUID,
  p_old_value TEXT,
  p_new_value TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE triage_tags
  SET location = jsonb_set(
    location::jsonb,
    '{contact_point}',
    to_jsonb(p_new_value),
    true
  )
  WHERE event_id = p_event_id
    AND location->>'contact_point' = p_old_value;
END;
$$;

-- 関数の説明コメント
COMMENT ON FUNCTION update_contact_point IS '指定されたイベントの全トリアージタッグの接触地点を一括更新する。変更または削除時に使用。';
