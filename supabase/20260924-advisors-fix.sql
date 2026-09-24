-- triage-tag-system の Supabase Advisors（2026-09-24 実測）への対処。アプリの正しい使い方（ログイン後の操作）は変えない。
-- 2026-09-24 に管理 API で triage-tag-system へ 1 トランザクションで適用済み（本ファイルは記録）。
-- forward-only（DROP・TRUNCATE・SET NOT NULL を含まない）。新しいテーブルは作らない。

-- 1) auth_rls_initplan（WARN 10 件）: auth.role() / auth.uid() を (select …) に包み、行ごとの再評価をやめる。条件の意味は同じ
ALTER POLICY authenticated_full_access ON public.events
  USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
ALTER POLICY authenticated_full_access ON public.geographic_areas
  USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
ALTER POLICY authenticated_full_access ON public.hospitals
  USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
ALTER POLICY authenticated_full_access ON public.teams
  USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
ALTER POLICY authenticated_full_access ON public.triage_tags
  USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
ALTER POLICY authenticated_full_access ON public.user_roles
  USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
ALTER POLICY "Authenticated users can insert scene maps" ON public.scene_maps
  WITH CHECK ((select auth.uid()) IS NOT NULL);
ALTER POLICY "Authenticated users can read scene maps" ON public.scene_maps
  USING ((select auth.uid()) IS NOT NULL);
ALTER POLICY "Creator can delete scene maps" ON public.scene_maps
  USING ((select auth.uid()) = created_by);
ALTER POLICY "Creator can update scene maps" ON public.scene_maps
  USING ((select auth.uid()) = created_by);

-- 2) unindexed_foreign_keys（INFO 3 件）
CREATE INDEX IF NOT EXISTS idx_geographic_areas_event_id ON public.geographic_areas (event_id);
CREATE INDEX IF NOT EXISTS idx_teams_event_id ON public.teams (event_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_event_id ON public.user_roles (event_id);

-- 3) anon_security_definer_function_executable（WARN）: ログインしていない利用者が SECURITY DEFINER 関数を実行できないようにする。
--    アプリはログイン必須の /triage/scan（components/ContactPointManager.tsx）からのみ呼ぶ。authenticated と service_role は従来どおり実行できる
REVOKE EXECUTE ON FUNCTION public.update_contact_point(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_contact_point(uuid, text, text) TO authenticated, service_role;

-- 4) function_search_path_mutable（WARN 3 件）: search_path を固定する（関数内の未修飾名は従来どおり public を参照する）
ALTER FUNCTION public.update_contact_point(uuid, text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_scene_maps_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;
