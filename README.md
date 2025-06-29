# THE WORLD DOOR - フルフィルメント・ビジネス・ターミナル

高級中古品販売のための統合型フルフィルメント管理システム

## 🏗️ アーキテクチャ

### フロントエンド
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** + カスタムNexus Design System
- **リアルタイムデータ更新**

### バックエンド
- **Next.js API Routes**
- **Prisma ORM**
- **PostgreSQL** (本番環境)
- **SQLite** (開発環境)
- **JWT認証** (実装準備済み)

## 🚀 主要機能

### セラー向け機能
- 📊 ダッシュボード（売上・在庫統計）
- 📦 在庫管理（商品登録・編集・削除）
- 🚚 納品管理
- 💰 売上管理
- 🔄 返品管理
- 📈 月次レポート生成

### スタッフ向け機能
- 👷 タスク管理（優先度・進捗管理）
- 🔍 検品・出荷管理
- 📍 ロケーション管理（バーコードスキャン対応）
- 📸 商品撮影
- 🚛 配送管理
- 📋 業務レポート

### 共通機能
- 🎨 Nexus Design System（6地域カラーリング）
- 🌓 ダークモード対応
- 📱 レスポンシブデザイン
- 🔔 リアルタイム通知（概念実装）
- 📊 高度なKPIダッシュボード
- 🏷️ バーコード生成・印刷
- 🖼️ 画像アップロード（最大20枚）

## 📦 セットアップ

### 前提条件
- Node.js 18以上
- PostgreSQL（本番環境）または SQLite（開発環境）

### インストール手順

1. **リポジトリのクローン**
```bash
git clone https://github.com/your-org/the-world-door.git
cd the-world-door
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
`.env.local` ファイルを作成し、以下を設定：
```env
DATABASE_URL="your-database-url"
JWT_SECRET="your-secret-key"
```

詳細は [環境変数設定ガイド](docs/environment-setup.md) を参照してください。

4. **データベースのセットアップ**
```bash
npm run db:generate
npm run db:push
npm run db:seed  # 初期データの投入（オプション）
```

5. **開発サーバーの起動**
```bash
npm run dev
```

http://localhost:3001 でアプリケーションにアクセスできます。

## 🏛️ プロジェクト構造

```
fbt-v1/
├── app/                    # Next.js App Router
│   ├── api/               # APIルート（バックエンド）
│   ├── components/        # Reactコンポーネント
│   ├── (pages)/          # ページコンポーネント
│   └── globals.css       # グローバルスタイル
├── lib/                   # 共通ライブラリ
│   ├── auth.ts           # 認証サービス
│   ├── api-config.ts     # API設定
│   └── hooks/            # カスタムフック
├── prisma/               # データベース設定
│   └── schema.prisma     # Prismaスキーマ
├── public/               # 静的ファイル
├── types/                # TypeScript型定義
└── docs/                 # ドキュメント
```

## 🔌 API エンドポイント

主要なAPIエンドポイント（すべて `/api/` 配下）：

- **認証**: `/auth/login`, `/auth/logout`, `/auth/session`
- **在庫**: `/inventory`, `/inventory/stats`
- **商品**: `/products`, `/products/[id]/history`
- **タスク**: `/tasks`
- **レポート**: `/reports/analytics`, `/reports/monthly`

## 🧪 テスト

```bash
# E2Eテストの実行
npm run test

# UIモードでのテスト
npm run test:ui

# テストレポートの表示
npm run test:report
```

## 📚 ドキュメント

- [技術スタック詳細](docs/technology-stack.md)
- [UI/UX実装ガイド](docs/uiux指示.md)
- [API実装ガイド](API_IMPLEMENTATION.md)
- [環境変数設定](docs/environment-setup.md)

## 🤝 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して変更内容を議論してください。

## 📄 ライセンス

[MIT](LICENSE) 