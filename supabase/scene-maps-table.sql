-- 災害現場図テーブル
-- Created: 2026-03-06
-- Feature: feat-disaster-scene-map

CREATE TABLE IF NOT EXISTS scene_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '無題の現場図',
  data JSONB NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_scene_maps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_scene_maps_updated_at
  BEFORE UPDATE ON scene_maps
  FOR EACH ROW
  EXECUTE FUNCTION update_scene_maps_updated_at();

-- RLS有効化
ALTER TABLE scene_maps ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは全件閲覧可能（全ロール）
CREATE POLICY "Authenticated users can read scene maps"
  ON scene_maps
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 認証済みユーザーは作成可能（IC/ADMのロール判定はフロントエンドで実施）
CREATE POLICY "Authenticated users can insert scene maps"
  ON scene_maps
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 作成者は更新可能
CREATE POLICY "Creator can update scene maps"
  ON scene_maps
  FOR UPDATE
  USING (auth.uid() = created_by);

-- 作成者は削除可能
CREATE POLICY "Creator can delete scene maps"
  ON scene_maps
  FOR DELETE
  USING (auth.uid() = created_by);
