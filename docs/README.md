# トリアージタッグシステム

災害・事故などの大規模救護現場において、トリアージタッグ情報の電子化・リアルタイム共有・搬送管理を実現するWebアプリケーション。

## 📋 目次

1. [概要](#概要)
2. [主要機能](#主要機能)
3. [技術スタック](#技術スタック)
4. [セットアップ](#セットアップ)
5. [使用方法](#使用方法)
6. [ドキュメント](#ドキュメント)

## 概要

本システムは、従来の紙タグ運用に加え、PWAを中心としたモバイル端末上での迅速な登録・更新・集計を可能にし、情報の一元管理・誤記防止・搬送最適化を実現します。

### 利用ロール

- **指揮本部（Command）**: 全体状況の把握・分析
- **トリアージ部隊（Triage）**: 現場でのタグ登録・判定
- **搬送部隊（Transport）**: 搬送指示・病院割当
- **搬送チーム（Transport Team）**: 搬送中のステータス更新
- **病院（Hospital）**: 患者受入・収容報告

## 主要機能

### ✅ 実装済み機能

- **トリアージ登録**: QRスキャン、STARTウィザード、バイタルサイン記録
- **患者管理**: 詳細情報表示・編集、画像アップロード、音声入力
- **搬送管理**: 病院・救急隊割当、搬送ステータス追跡
- **リアルタイム更新**: Supabase Realtimeによる即時反映
- **地図表示**: 患者位置の可視化（Leaflet）
- **画像管理**: 最大15枚、自動圧縮、拡大表示

### 🚧 未実装機能（Phase 2以降）

- オフライン対応（IndexedDB）
- PDF/CSV出力
- 統計ダッシュボード
- 搬送先レコメンド
- 再トリアージ履歴管理

詳細は [`実装済み機能一覧.md`](./実装済み機能一覧.md) を参照

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **UI**: React 18 + Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **ストレージ**: Supabase Storage
- **リアルタイム**: Supabase Realtime
- **地図**: Leaflet + React-Leaflet
- **QRコード**: html5-qrcode

## セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd tts-v1

# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.localにSupabaseの認証情報を設定
```

### 環境変数

`.env.local`に以下を設定：

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

### ビルド

```bash
npm run build
npm start
```

## 使用方法

### 1. ログイン

- デモアカウントでログイン（実際のSupabaseアカウントが必要）

### 2. ダッシュボードへのアクセス

各ロール専用のダッシュボードにアクセス：

- 指揮本部: `/command`
- トリアージ部隊: `/triage/scan`
- 搬送部隊: `/transport`
- 搬送チーム: `/transport-team`
- 病院: `/hospital`

### 3. 基本操作

#### トリアージ登録（/triage/scan）
1. QRコードをスキャン
2. STARTウィザードで判定
3. バイタルサイン入力
4. 画像・音声情報の追加
5. 登録完了

#### 搬送管理（/transport）
1. 患者を選択
2. 病院・救急隊を割当
3. 搬送開始

#### 搬送チーム（/transport-team）
1. 割当患者を確認
2. QRスキャンまたは手動選択
3. ステータス更新（病院準備→病院へ→病院）

#### 病院（/hospital）
1. 搬送中患者を確認
2. 受入ステータス変更
3. 患者受入完了

## ドキュメント

- [`実装済み機能一覧.md`](./実装済み機能一覧.md) - 実装状況の詳細
- [`機能仕様.md`](./機能仕様.md) - 完全な機能仕様（計画含む）
- [`仕様.md`](./仕様.md) - 技術仕様書
- [`Supabase管理情報.txt`](./Supabase管理情報.txt) - データベース設定

### その他のドキュメント

- 業務フロー図: `TTS業務フロー.png`
- システムアーキテクチャ: `system-architecture.drawio`
- プロジェクト構造: `project-structure.drawio`
- トリアージタッグ見本: `トリアージタッグ表.png`, `トリアージタッグ裏.png`

## ライセンス

（ライセンス情報を記載）

## お問い合わせ

（連絡先を記載）
