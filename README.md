# MGC-V1 - 献立ガチャサービス

規格外野菜をガチャ風UIで楽しく購入できる、農家と消費者をつなぐECプラットフォーム

## 🌟 プロジェクト概要

献立ガチャは、規格外野菜を活用した革新的なECプラットフォームです。
- **消費者**: ガチャ演出で楽しく野菜を選び、複数の農家から購入可能
- **販売者（農家）**: スマホで簡単に商品登録・在庫管理・売上確認
- **管理者**: 販売者管理・月次振込・レビュー管理などを一元管理

## 🏗️ アーキテクチャ

### 技術スタック
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UI**: shadcn/ui
- **バックエンド**: Supabase (Database & Authentication)
- **決済**: Stripe Checkout
- **テスト**: Playwright (E2E), Jest (Unit)

### システム構成
本プロジェクトは3つのアプリケーションで構成されています：
1. **購入者向けECサイト** (`consumer-site/`): スマホファーストのショッピング体験
2. **管理者向け管理サイト** (メインプロジェクト): PCファーストの管理画面
3. **販売者向け管理サイト** (未実装): スマホファーストの出品・在庫管理

すべてのアプリが同一のSupabaseプロジェクトとデータベースを共有します。

## 📦 セットアップ

### 前提条件
- Node.js 18以上
- Supabaseアカウント
- Stripeアカウント（決済機能を使用する場合）

### インストール手順

1. **依存関係のインストール**
```bash
npm install

# consumer-siteの依存関係もインストール
cd consumer-site
npm install
cd ..
```

2. **環境変数の設定**

メインプロジェクトの `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

consumer-siteの `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **データベースのセットアップ**
```bash
# Supabaseプロジェクトで docs/kondate-gacha-spec-final.md 内のDDLを実行
```

4. **開発サーバーの起動**

管理者サイト:
```bash
npm run dev
# http://localhost:3000
```

購入者向けECサイト:
```bash
cd consumer-site
npm run dev
# http://localhost:3000
```

## 🏛️ プロジェクト構造

```
mgc-v1/
├── app/                      # 管理者向けサイト (Next.js App Router)
│   ├── components/ui/       # 共通UIコンポーネント
│   ├── privacy-policy/      # プライバシーポリシー
│   ├── terms/               # 利用規約
│   ├── layout.tsx
│   └── globals.css
├── consumer-site/           # 購入者向けECサイト
│   ├── app/
│   │   ├── (auth)/          # 認証ページ
│   │   ├── api/             # APIルート
│   │   ├── cart/            # カート
│   │   ├── checkout/        # チェックアウト
│   │   ├── chat/            # チャット
│   │   ├── orders/          # 注文履歴
│   │   ├── product/         # 商品詳細
│   │   ├── profile/         # プロフィール
│   │   └── vegetables/      # 野菜検索
│   ├── components/          # コンポーネント
│   ├── lib/                 # ライブラリ
│   │   ├── auth-helpers.ts  # 認証ヘルパー
│   │   ├── stripe.ts        # Stripe連携
│   │   └── supabase/        # Supabaseクライアント
│   └── types/               # 型定義
├── lib/                     # 共通ライブラリ
│   ├── hooks/              # カスタムフック
│   ├── image-processor.ts  # 画像処理
│   └── utils.ts            # ユーティリティ
├── e2e/                     # E2Eテスト (Playwright)
├── docs/                    # ドキュメント
│   ├── kondate-gacha-spec-final.md  # 仕様書
│   ├── project-structure.drawio     # プロジェクト構造図
│   ├── system-architecture.drawio   # システムアーキテクチャ図
│   └── UIイメージ.png               # UI画像
├── scripts/                 # スクリプト
├── public/                  # 静的ファイル
└── supabase/               # Supabase設定
```

## 🧪 テスト

```bash
# E2Eテストの実行
npm run test

# ユニットテストの実行
npm run test:unit

# テストの監視モード
npm run test:unit:watch

# カバレッジレポート
npm run test:unit:coverage
```

## 🗄️ データベース

詳細なデータモデルとRLSポリシーについては、`docs/kondate-gacha-spec-final.md` を参照してください。

主要テーブル:
- `profiles`: ユーザープロフィール（buyer/seller/admin）
- `sellers`: 販売者（農家）情報
- `products` & `product_skus`: 商品とSKU
- `orders` & `order_items`: 注文情報
- `reviews`: レビュー
- `chats` & `chat_messages`: チャット
- `payouts`: 振込管理

## 🚀 デプロイ

推奨デプロイ先: Vercel

```bash
# ビルド確認
npm run build

# 本番環境起動
npm run start
```

各アプリケーションは個別にデプロイしてください。

## 📚 ドキュメント

- [仕様書](./docs/kondate-gacha-spec-final.md): システム全体の仕様
- [アーキテクチャ図](./docs/architecture-diagrams.md): システム・アプリ構成図（Mermaid形式）
- [ECサイトデモ操作手順書](./docs/ec-site-demo-guide.md): 購入者向けECサイトの操作マニュアル
- [デプロイメントサマリー](./DEPLOYMENT-SUMMARY.md): デプロイ情報
- プロジェクト構造図（draw.io形式）: [project-structure.drawio](./docs/project-structure.drawio)
- システムアーキテクチャ図（draw.io形式）: [system-architecture.drawio](./docs/system-architecture.drawio)

## 🤝 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して変更内容を議論してください。

## 📄 ライセンス

Private
