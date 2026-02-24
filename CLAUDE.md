# triage-tag-system（トリアージタグシステム）

## What / Why

災害医療現場でのトリアージタグ管理を電子化するWebアプリ。

## 技術スタック

Next.js 14 + React 18 + TypeScript + Tailwind CSS + shadcn/ui + Prisma(SQLite) + Supabase Auth。バージョンの権威は package.json。

## 仕様書

- docs/ 配下のドキュメントを参照

## アーキテクチャ方針

- App Router使用（app/ディレクトリ直下構成、src/なし）
- Server Components優先、Client Componentsは必要時のみ
- DB: 現行SQLite + Prisma。マネージドDB移行はADR決定後
- UIコンポーネント: shadcn/ui + Lucide Icons標準
- データ取得はServer Components直接。API Routeは外部連携等の必要時のみ

## 開発体制

- Cursor Agent（右パネル）と Claude Code（左パネル）の併用開発
- CLAUDE.md を Single Source of Truth とし、.cursor/rules/ は補足ルール
- 方針・ルールは両ツールで統一。矛盾時は CLAUDE.md が優先

## 開発ルール

- 指示外の変更は提案→承認後に実施
- UI変更は承認フロー必須（例外: 誤字修正, aria属性, 明確なバグ修正）
- 依存バージョン変更はPRで提案
- 新規GET APIは原則禁止（例外あり、PRに理由記載）

## ルールの育成

- 開発中に新たなルール・制約を発見した場合、AIはユーザーに「ルールとして追加してよいか」を確認する
- ユーザーが承認した場合のみ、CLAUDE.md または .cursor/rules/ に追記する
- 勝手にルールを追加・変更・削除しない

## 検証コマンド

- `npm run build` — ビルド確認
- `npx tsc --noEmit` — 型チェック
- `npm run lint` — Lint
- `npm run format:check` — Prettierフォーマットチェック
- `npm run format` — Prettier自動整形
- `npm test` — Jestテスト
- `npm run test:e2e` — Playwrightテスト

## 品質ゲート（3層防御）

コミット→PR→運用の全段階で品質を自動チェックする。

### 第1層: Pre-commit hooks（ローカル）

- husky + lint-staged がコミット時に自動実行
- .ts/.tsx → ESLint（`--max-warnings 0`）+ Prettier
- .js/.json/.md/.css → Prettier
- **`--no-verify` でのスキップ禁止**（第2層で検出される）

### 第2層: GitHub Actions CI（PR時）

- `tsc --noEmit` → `next lint` → `prettier --check` → `next build` → `npm audit`
- CodeQL セキュリティスキャン（PR時 + 毎週月曜）
- PRマージにはCI通過が必要

### 第3層: Dependabot（週次自動）

- 毎週月曜に依存更新PRを自動作成（最大5件）
- Security Updates 有効

### エラー監視: Sentry

- 本番環境のみ有効（`NODE_ENV === 'production'`）
- DSN未設定時は自動無効化
- 無料枠: 5,000エラー/月

### 環境変数バリデーション

- `lib/env.ts` でzodによるビルド時チェック
- 設定漏れはビルド段階でエラー

## 環境変更時のトリガー

以下の変更を行った場合、対応する検証を必ず実行すること。

| 変更内容                | 必須検証                                          |
| ----------------------- | ------------------------------------------------- |
| .ts/.tsx ファイル変更   | `npx tsc --noEmit` + `npm run lint`               |
| package.json / 依存変更 | `npm install` + `npm run build`                   |
| 環境変数の追加・変更    | `lib/env.ts` にスキーマ追加 + `.env.example` 更新 |
| DB スキーマ変更         | マイグレーション作成 + `npm run build`            |
| CI/ワークフロー変更     | PRで動作確認                                      |
