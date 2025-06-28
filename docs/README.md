# base-project

base-project は `.cursor` の共通ルールを利用したモノレポ構成で、**frontend** と **backend** の２つのディレクトリを含む雛形プロジェクトです。

## 概要

- **`.cursor/`**: AIエージェント（Cursor/ClaudeCode）向けのルール定義
- **`frontend/`**: フロントエンド用の技術スタックと骨組み生成指示
- **`backend/`**: バックエンド用の技術スタックと骨組み生成指示

## セットアップ

1. ルートで依存関係をインストール:
   ```bash
   npm install
   ```
   ※npmワークスペース機能により、`frontend` と `backend` 両方の依存がインストールされます。

2. コードスキャフォールド（雛形生成）:
   - フロントエンド:
     ```bash
     npm run scaffold:fe
     ```
   - バックエンド:
     ```bash
     npm run scaffold:be
     ```

3. 開発用サーバ起動:
   - フロントエンド:
     ```bash
     npm run dev:fe
     ```
   - バックエンド（実装後）:
     ```bash
     npm run dev:be
     ```

## ディレクトリ構成

詳細は [`directory-structure.md`](./directory-structure.md) を参照してください。

## フロントエンド開発の流れ

1. `frontend/technology-stack.md` で使用技術を確認
2. `frontend/instructions.mdc` を実行して骨組みを生成
3. 実装 → `npm run dev:fe` で動作確認

## バックエンド開発の流れ

1. `backend/technology-stack.md` で使用技術を確認
2. `backend/instructions.mdc` を実行して骨組みを生成
3. 実装 → `npm run dev:be` で動作確認
