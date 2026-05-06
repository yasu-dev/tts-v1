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
