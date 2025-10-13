# 献立ガチャ - 購入者向けECサイト (consumer-site)

規格外野菜をガチャ風UIで楽しく選択・購入できるECサイトです。

## 🚀 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **認証・DB**: Supabase
- **決済**: Stripe Checkout
- **アニメーション**: Framer Motion
- **状態管理**: Zustand
- **フォーム**: React Hook Form + Zod

## 📁 ディレクトリ構成

```
consumer-site/
├── app/                      # App Router
│   ├── (auth)/              # 認証関連ページ
│   │   ├── login/
│   │   └── signup/
│   ├── api/                 # API Routes
│   │   ├── stripe/          # Stripe関連
│   │   │   ├── checkout/
│   │   │   └── webhook/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── reviews/
│   │   └── chat/
│   ├── products/[id]/       # 商品詳細
│   ├── cart/                # カート
│   ├── checkout/            # チェックアウト
│   ├── orders/              # 注文履歴
│   ├── chat/[sellerId]/     # チャット
│   ├── profile/             # プロフィール
│   ├── vegetables/[name]/farmers/  # 野菜別出品一覧
│   └── layout.tsx           # ルートレイアウト
├── components/              # コンポーネント
│   └── navigation/          # ナビゲーション
├── lib/                     # ユーティリティ
│   ├── supabase/           # Supabaseクライアント
│   ├── stripe.ts           # Stripeクライアント
│   └── auth-helpers.ts     # 認証ヘルパー
├── types/                   # 型定義
│   └── database.ts         # データベース型
└── .env.example            # 環境変数テンプレート
```

## 🛠 セットアップ

### 1. 環境変数の設定

`.env.example` を `.env.local` にコピーして必要な値を設定:

```bash
cp .env.example .env.local
```

必要な環境変数:
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseサービスロールキー
- `STRIPE_SECRET_KEY`: Stripe秘密キー
- `STRIPE_WEBHOOK_SECRET`: Stripe Webhook署名シークレット
- `SENDGRID_API_KEY` または `RESEND_API_KEY`: メール送信APIキー
- `NEXT_PUBLIC_APP_URL`: アプリケーションURL

### 2. Supabaseのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `/supabase/migrations/` 内のSQLファイルを実行:
   - `001_initial_schema.sql`: テーブル作成
   - `002_rls_policies.sql`: RLSポリシー設定

### 3. Stripeのセットアップ

1. [Stripe](https://stripe.com)でアカウントを作成
2. テストモードの秘密キーを取得
3. Webhookエンドポイントを設定:
   - URL: `https://your-domain.com/api/stripe/webhook`
   - イベント: `checkout.session.completed`
4. Webhook署名シークレットを取得

### 4. 依存パッケージのインストール

```bash
npm install
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 🔐 認証

Supabaseの Email/Password 認証を使用しています。

- ログイン: `/auth/login`
- 新規登録: `/auth/signup`

## 💳 決済フロー

1. ユーザーがカートに商品を追加
2. チェックアウト画面で配送先情報を入力
3. `/api/stripe/checkout` で仮注文とStripe Checkoutセッションを作成
4. Stripe Checkoutページで決済
5. 決済完了後、`/api/stripe/webhook` で注文確定・在庫減算・メール送信

## 📝 主要機能

### ✅ 実装済み（骨組み）

- ✅ ユーザー認証（ログイン・新規登録）
- ✅ 商品一覧・詳細表示
- ✅ カート機能
- ✅ Stripe Checkout決済
- ✅ 注文履歴
- ✅ レビュー投稿
- ✅ 販売者とのチャット
- ✅ プロフィール管理

### 🚧 今後実装予定

- ガチャUIアニメーション（Framer Motion）
- 画像アップロード（Supabase Storage）
- リアルタイムチャット（Supabase Realtime）
- メール通知（SendGrid/Resend）
- カート状態管理（Zustand）
- フォームバリデーション（React Hook Form + Zod）

## 🔒 セキュリティ

- Supabase RLSによるデータアクセス制御
- Stripe秘密キーは `server-only` で保護
- Webhook署名検証
- 全APIエンドポイントで認証チェック

## 📋 命名規則

- **金額**: `*_yen` (INT型、最小単位：円)
- **ロール**: `profiles.role` = 'buyer' | 'seller' | 'admin'
- **auth.users** を起点にした一貫したユーザー管理

## 🚀 デプロイ

### Vercel (推奨)

```bash
vercel
```

環境変数を Vercel ダッシュボードで設定してください。

## 📚 次のステップ

1. Supabaseプロジェクトとマイグレーションの実行
2. Stripeアカウントの設定とWebhook設定
3. 環境変数の設定
4. 画像アップロード機能の実装
5. ガチャUIの実装
6. メール通知の実装
7. リアルタイムチャットの実装

詳細なセットアップ手順は `SETUP.md` を参照してください。

## 🤝 関連プロジェクト

- **seller-site**: 販売者（農家）管理サイト（未実装）
- **admin-site**: 管理者管理サイト（未実装）

全プロジェクトは同じSupabaseプロジェクトとDBを共有します。

## 📄 ライセンス

MIT
