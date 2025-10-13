# 献立ガチャ consumer-site セットアップガイド

このドキュメントでは、consumer-siteの初期構築から起動までの手順を説明します。

## 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント
- Stripeアカウント

## 📋 セットアップ手順

### 1. Supabaseプロジェクトの作成

1. https://supabase.com にアクセス
2. 「New project」をクリック
3. プロジェクト名、データベースパスワード、リージョンを設定
4. プロジェクトが作成されるまで数分待機

### 2. データベースのセットアップ

1. Supabase ダッシュボードで「SQL Editor」を開く
2. `/supabase/migrations/001_initial_schema.sql` の内容をコピー＆ペーストして実行
3. `/supabase/migrations/002_rls_policies.sql` の内容をコピー＆ペーストして実行
4. テーブルとRLSポリシーが正しく作成されたことを確認

### 3. Supabase APIキーの取得

1. Supabase ダッシュボードで「Settings」→「API」を開く
2. 以下の情報をコピー:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - anon public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - service_role key (`SUPABASE_SERVICE_ROLE_KEY`)

### 4. Stripeアカウントのセットアップ

1. https://stripe.com にアクセス
2. アカウント作成（まずはテストモードで）
3. ダッシュボードで「開発者」→「APIキー」を開く
4. 「シークレットキー」をコピー (`STRIPE_SECRET_KEY`)

### 5. Stripe Webhookの設定

1. Stripe ダッシュボードで「開発者」→「Webhook」を開く
2. 「エンドポイントを追加」をクリック
3. エンドポイントURL: `https://your-domain.com/api/stripe/webhook`
   - ローカル開発の場合: Stripe CLIを使用（後述）
4. 「イベント」で `checkout.session.completed` を選択
5. エンドポイント作成後、「署名シークレット」をコピー (`STRIPE_WEBHOOK_SECRET`)

### 6. 環境変数の設定

`consumer-site` ディレクトリで `.env.local` を作成:

```bash
cd consumer-site
cp .env.example .env.local
```

`.env.local` を編集して以下の値を設定:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Mail (後で設定)
SENDGRID_API_KEY=
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7. 依存パッケージのインストール

```bash
npm install
```

### 8. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 🧪 ローカルでのStripe Webhookテスト

Stripe CLIを使用して、ローカル開発環境でWebhookをテストできます。

### 1. Stripe CLIのインストール

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
https://github.com/stripe/stripe-cli/releases/latest
```

### 2. Stripe CLIでログイン

```bash
stripe login
```

### 3. Webhookをローカルにフォワード

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

表示される `whsec_xxx` をコピーして `.env.local` の `STRIPE_WEBHOOK_SECRET` に設定

### 4. 別のターミナルで開発サーバーを起動

```bash
npm run dev
```

### 5. テストイベントをトリガー

```bash
stripe trigger checkout.session.completed
```

## 🔍 動作確認

### 1. 新規登録

1. http://localhost:3000/auth/signup にアクセス
2. メールアドレスとパスワードで登録
3. Supabaseダッシュボードの「Authentication」→「Users」で確認

### 2. プロフィール作成

登録後、Supabase SQL Editorで以下を実行（テストユーザー用）:

```sql
-- ユーザーIDを確認
SELECT id, email FROM auth.users;

-- プロフィール作成（上記のidを使用）
INSERT INTO public.profiles (user_id, role, full_name, nickname)
VALUES ('user-id-here', 'buyer', 'テスト太郎', 'テスト');

-- 購入者プロフィール作成
INSERT INTO public.buyer_profiles (user_id, default_shipping)
VALUES ('user-id-here', '{
  "name": "テスト太郎",
  "postal_code": "123-4567",
  "prefecture": "東京都",
  "city": "渋谷区",
  "address1": "渋谷1-2-3",
  "phone": "090-1234-5678"
}'::jsonb);
```

### 3. テストデータの投入

販売者と商品のテストデータを作成:

```sql
-- 販売者ユーザー作成（Supabase Authから手動で作成後）
INSERT INTO public.profiles (user_id, role, full_name)
VALUES ('seller-user-id', 'seller', '山田農園');

INSERT INTO public.sellers (user_id, farm_name, introduction, prefecture)
VALUES ('seller-user-id', '山田農園', '新鮮な野菜をお届けします', '千葉県');

-- 商品作成
INSERT INTO public.products (seller_id, name, description, origin, irregular_reason, category)
VALUES (
  'seller-user-id',
  'トマト',
  '甘くて美味しいトマトです',
  '千葉県',
  '形が不揃い',
  '果菜'
) RETURNING id;

-- 上記で取得したidを使用してSKU作成
INSERT INTO public.product_skus (product_id, weight_grams, price_yen, stock)
VALUES ('product-id', 500, 800, 100);
```

### 4. 商品閲覧・購入フロー

1. トップページで商品を検索
2. 商品詳細ページで確認
3. カートに追加
4. チェックアウトで配送先入力
5. Stripe Checkoutで決済（テストカード: `4242 4242 4242 4242`）
6. 注文完了ページで確認

## ⚠️ トラブルシューティング

### Supabase接続エラー

- 環境変数が正しく設定されているか確認
- Supabaseプロジェクトが起動しているか確認
- ネットワーク接続を確認

### Stripe Webhookが動作しない

- `STRIPE_WEBHOOK_SECRET` が正しいか確認
- Stripe CLIが起動しているか確認
- Webhookエンドポイントが正しいか確認

### RLSエラー

- ユーザーがログインしているか確認
- プロフィールが作成されているか確認
- RLSポリシーが正しく設定されているか確認

## 📝 次のステップ

セットアップが完了したら、以下の機能を実装していきます:

1. ガチャUIの実装（Framer Motion）
2. 画像アップロード機能
3. リアルタイムチャット
4. メール通知
5. カート状態管理（Zustand）
6. フォームバリデーション強化

詳細は `README.md` を参照してください。
