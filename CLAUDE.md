# triage-tag-system（トリアージタグシステム）

## What / Why

災害医療現場でのトリアージタグ管理を電子化する Web アプリ。

## 技術スタック

Next.js 14 + React 18 + TypeScript + Tailwind CSS + shadcn/ui + Supabase（Auth + PostgreSQL）。バージョンの権威は `package.json`。

## 仕様書

- `docs/` 配下のドキュメントを参照

## 共通規約との関係

本プロジェクトは Next.js + Tailwind 標準スタックに準拠する。

- **アーキテクチャ方針・基本開発ルール・検証コマンド・品質ゲート・環境変更トリガー・テスト構成** は `c:/work/CLAUDE.md` に従う
- **開発ワークフロー・確認判断基準・AI 提案規範・事実断定検証・開発体制・ルール育成・横断俯瞰** は `~/.claude/CLAUDE.md` に従う

## TTS 固有事項

### 検証コマンド（共通に加える）

- `npm test` — Jest テスト
- `npm run test:e2e` — Playwright テスト

### 品質ゲートの追加

共通規約の 3 層防御に加え：

**エラー監視: Sentry**

- 本番環境のみ有効（`NODE_ENV === 'production'`）
- DSN 未設定時は自動無効化
- 無料枠: 5,000 エラー/月

**環境変数バリデーション**

- `lib/env.ts` で zod によるビルド時チェック
- 設定漏れはビルド段階でエラー

## ロールバック運用

triage-tag-system.netlify.app への機能追加は、失敗時に常に直前の安定状態へ戻せる仕組みを前提とする。仕組み本体は `da2777a`（PR #30）で永続化済。

### 不変ルール

- **DB スキーマは forward-only**: 追加（`CREATE TABLE` / `ALTER TABLE ADD COLUMN` with NULL or DEFAULT / `CREATE INDEX`）のみ。`DROP TABLE` / `DROP COLUMN` / `TRUNCATE` / `DELETE FROM <table>;`（WHERE 無し）/ `ALTER COLUMN ... SET NOT NULL` は禁止。`.github/workflows/sql-guard.yml` が PR で機械的に拒否する
- **既存環境変数は不変**: 追加のみ。既存キーの変更・削除を含む PR はレビューで差し戻す
- **PR は squash merge のみ**: GitHub 設定で強制済。各機能は main 上に単一コミットで残るため `git revert <sha>` で確実に打ち消せる
- **`supabase/データ投入手順.md` `supabase/マイグレーション手順.md` の TRUNCATE/DROP を本番 DB に対して実行しない**: これらの SQL はローカル／開発用

### ロールバック手順

機能追加で異常を検知したら：

```bash
bash scripts/rollback.sh <feat-merge-sha>
```

内部処理: `git checkout main` → `git pull --ff-only` → `git revert --no-edit <sha>` → `git push origin main`。Netlify が main HEAD（revert commit）を自動再ビルドして本番反映。所要 1〜3 分。詳細は [`docs/runbooks/rollback.md`](docs/runbooks/rollback.md)。

### anchor タグ（任意）

長期保持の保険として、機能追加サイクル前に `release/<YYYY-MM-DD>-pre-<scope>` タグを推奨。現アンカー: `release/2026-05-13-pre-feat` → `bc52c22`。タグなしでも `git revert <merge-sha>` で復帰可能。
