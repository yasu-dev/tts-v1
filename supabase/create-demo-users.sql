-- デモユーザー作成スクリプト
-- Supabase SQL Editorで実行してください

-- 注意: このスクリプトはauth.usersテーブルに直接挿入しますが、
-- 通常はSupabase Dashboard UIから作成することを推奨します

-- 方法1: Supabase Dashboard UIで作成（推奨）
-- 1. Authentication → Users → Add User
-- 2. 以下のメールアドレスとパスワードで4つのユーザーを作成：
--    - ic@demo.com / password
--    - tri@demo.com / password
--    - trn@demo.com / password
--    - hsp@demo.com / password
-- 3. "Auto Confirm User" にチェック（Email確認をスキップ）

-- 方法2: SQLで直接作成（上級者向け）
-- ⚠️ この方法はSupabaseのバージョンによって動作しない可能性があります

-- 指揮本部ユーザー
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'ic@demo.com',
  crypt('password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"IC"}',
  FALSE,
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- トリアージ担当ユーザー
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'tri@demo.com',
  crypt('password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"TRI"}',
  FALSE,
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- 搬送担当ユーザー
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'trn@demo.com',
  crypt('password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"TRN"}',
  FALSE,
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- 医療機関ユーザー
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'hsp@demo.com',
  crypt('password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"HSP"}',
  FALSE,
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- 確認クエリ
SELECT
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at,
  raw_user_meta_data->>'role' as user_role
FROM auth.users
WHERE email IN ('ic@demo.com', 'tri@demo.com', 'trn@demo.com', 'hsp@demo.com')
ORDER BY email;
