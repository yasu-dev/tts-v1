# トリアージタッグシステム (Triage Tag System)

災害時のトリアージタッグ管理システムのMVP実装

## 概要

東京消防庁へのプレゼンテーション用に開発した、タブレットで操作可能なトリアージタッグ管理Webアプリケーションです。

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + React 18 + TypeScript
- **UI**: Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase (PostgreSQL) ※次のステップで接続予定
- **認証**: Supabase Auth ※次のステップで接続予定
- **追加ライブラリ**:
  - html5-qrcode: QRコード読取
  - react-leaflet: 地図表示
  - zod: バリデーション
  - date-fns: 日付処理

## 実装済み機能

### ✅ 基本機能
- プロジェクト構造とTypeScript型定義
- 認証画面（ログイン）
- 共通UIコンポーネント:
  - QRスキャナー
  - START法ウィザード
  - 音声入力

### ✅ 各ユーザーロール画面
1. **指揮本部ダッシュボード** (`/command`)
   - リアルタイムトリアージ状況表示
   - トリアージ区分別統計
   - フィルタリング機能

2. **トリアージ入力画面** (`/triage/scan`)
   - QRコードスキャン
   - START法による自動判定
   - 手動入力対応

3. **搬送管理画面** (`/transport`)
   - 割り当てられた傷病者リスト
   - 搬送先選択
   - ナビゲーション機能（準備済み）

4. **医療機関ダッシュボード** (`/hospital`)
   - 病床状況管理
   - 搬送予定患者リスト
   - 受入状況更新

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成：

```bash
cp .env.example .env.local
```

※次のステップでSupabaseの接続情報を設定します

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## デモアカウント（モック認証）

現在はモック認証が実装されています。以下のメールアドレスで各画面にアクセス可能です（パスワードは任意）：

- `ic@demo.com` - 指揮本部
- `tri@demo.com` - タッグ付け部隊
- `trn@demo.com` - 搬送部隊
- `hsp@demo.com` - 医療機関

## 次のステップ

### Supabase接続

1. Supabaseプロジェクト作成
2. データベーススキーマ適用（`docs/仕様.md`参照）
3. 環境変数設定
4. 認証機能の実装
5. リアルタイム同期の実装

## プロジェクト構造

```
tts-v1/
├── app/
│   ├── (auth)/
│   │   └── login/          # ログイン画面
│   ├── (dashboard)/
│   │   ├── command/        # 指揮本部
│   │   ├── triage/         # トリアージ入力
│   │   ├── transport/      # 搬送管理
│   │   └── hospital/       # 医療機関
│   ├── api/                # API Routes（準備済み）
│   ├── components/         # 共通コンポーネント
│   └── globals.css
├── lib/
│   ├── types/              # TypeScript型定義
│   ├── supabase/           # Supabase設定（プレースホルダー）
│   └── validation/         # バリデーションスキーマ
├── docs/                   # 仕様書
└── public/                 # 静的ファイル
```

## 開発ガイドライン

### コーディング規約

- TypeScriptの型を厳密に使用
- コンポーネントは`'use client'`ディレクティブを適切に使用
- Tailwind CSSのユーティリティクラスを使用
- 仕様書（`docs/仕様.md`）に従った実装

### コミットメッセージ

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル変更
refactor: リファクタリング
test: テスト追加・修正
```

## ライセンス

Private - 東京消防庁プレゼンテーション用

## 作成者

開発: Claude Code + yasu-dev
日付: 2025-10-18
