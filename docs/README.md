# The World Door - Fulfillment Business Terminal

最終更新日: 2025年1月13日

高級中古品販売のための統合型フルフィルメント管理システム

## 概要

The World Doorは、高級中古品の入荷から販売までの全プロセスを管理する統合システムです。Next.js 14（App Router）を使用したフルスタックアプリケーションとして構築されています。

## 主な機能

- **商品管理**: 入荷 → 検品 → 保管 → 出品 → 発送 → 配送までの完全なライフサイクル管理
- **在庫管理**: バーコードスキャンによるロケーション管理
- **AI品質検査**: 画像認識による自動品質評価
- **動画記録**: 検品・梱包作業の記録機能
- **マルチチャネル出品**: eBay連携による自動出品
- **配送管理**: 複数配送業者との統合
- **スタッフ管理**: ロールベースのアクセス制御
- **2要素認証**: セキュアなログイン機能

## 技術スタック

- **フレームワーク**: Next.js 14.2.5 (App Router)
- **言語**: TypeScript 5.3.3
- **スタイリング**: Tailwind CSS 3.4.1
- **データベース**: Prisma 5.7.0 + SQLite (開発環境)
- **認証**: JWT + bcrypt
- **テスト**: Playwright 1.45.0, Jest 29.7.0
- **リアルタイム通信**: Socket.io 4.7.5
- **ファイルストレージ**: AWS S3

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の変数を設定:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="your-nextauth-secret"
AWS_REGION="ap-northeast-1"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
S3_BUCKET_NAME="your-bucket-name"
```

### 3. データベースのセットアップ

```bash
# Prismaクライアントの生成
npm run db:generate

# データベーススキーマの適用
npm run db:push

# 初期データの投入
npm run db:seed
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは http://localhost:3002 で起動します。

## 主要なスクリプト

```bash
npm run dev          # 開発サーバー起動 (ポート3002)
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバー起動
npm run test         # E2Eテスト実行
npm run test:unit    # ユニットテスト実行
npm run db:studio    # Prisma Studio起動
```

## ディレクトリ構成

```
.
├── app/                    # Next.js App Router
│   ├── api/               # APIルート
│   ├── components/        # 共通コンポーネント
│   ├── (pages)/          # ページコンポーネント
│   └── globals.css       # グローバルスタイル
├── lib/                   # ユーティリティ、サービス、リポジトリ
│   ├── hooks/            # カスタムフック
│   ├── repositories/     # データアクセス層
│   └── services/         # ビジネスロジック層
├── prisma/               # データベーススキーマと移行
├── public/               # 静的ファイル
├── e2e/                  # Playwrightテスト
└── docs/                 # プロジェクトドキュメント
```

## 開発ルール

開発作業を行う際は、[開発作業規則](./開発作業規則.md)を必ず確認してください。特に以下の点が重要です：

1. **真実性の確保**: すべてのレポートは事実に基づく
2. **UIテストの必須実施**: Playwrightによる動作確認を必ず実施

## テスト

### E2Eテスト

```bash
# 全テストの実行
npm run test

# 特定のテストファイルの実行
npm run test <test-file-name>

# UIモードでの実行
npx playwright test --ui
```

### ユニットテスト

```bash
# テストの実行
npm run test:unit

# ウォッチモード
npm run test:unit:watch

# カバレッジレポート
npm run test:unit:coverage
```

## ライセンス

プロプライエタリ - 無断複製・配布を禁じます
