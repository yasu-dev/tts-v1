# MGC-V1 - 献立ガチャサービス

献立ガチャサービスの開発プロジェクト

## 🏗️ アーキテクチャ

### フロントエンド
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**

### バックエンド
- **Next.js API Routes**
- **Supabase** (Database & Authentication)

### システム構成
- **クライアント層**: ユーザーインターフェース
- **フロントエンド層**: Next.js アプリケーション
- **バックエンド層**: API Routes
- **データベース層**: Supabase (PostgreSQL)
- **外部サービス層**: 連携サービス（未定）

## 📦 セットアップ

### 前提条件
- Node.js 18以上
- Supabaseアカウント

### インストール手順

1. **依存関係のインストール**
```bash
npm install
```

2. **環境変数の設定**
`.env.local` ファイルを作成し、以下を設定：
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. **開発サーバーの起動**
```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## 🏛️ プロジェクト構造

```
mgc-v1/
├── app/                    # Next.js App Router
│   ├── api/               # APIルート（バックエンド）
│   ├── components/        # Reactコンポーネント
│   ├── (pages)/          # ページコンポーネント
│   └── globals.css       # グローバルスタイル
├── lib/                   # 共通ライブラリ
│   ├── hooks/            # カスタムフック
│   └── utils/            # ユーティリティ
├── public/               # 静的ファイル
├── types/                # TypeScript型定義
├── e2e/                  # E2Eテスト
└── docs/                 # ドキュメント（別途作成予定）
```

## 🧪 テスト

```bash
# E2Eテストの実行
npm run test

# ユニットテストの実行
npm run test:unit
```

## 🤝 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して変更内容を議論してください。

## 📄 ライセンス

Private
