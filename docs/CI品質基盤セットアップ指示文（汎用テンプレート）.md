# CI/品質基盤セットアップ指示文（汎用テンプレート）

> **用途**: 新規プロジェクトで AI（Claude Code / Cursor Agent 等）に渡して、CI/品質基盤を一括構築させるための指示文。
> **前提**: Next.js + TypeScript + Tailwind CSS + Supabase 構成。他スタックでも原則は同じ（ツール名を読み替え）。
> **実績**: EAR（Emergency Activity Recording）プロジェクトで検証済み（2026-02）。

---

## AI への指示文（コピペ用）

以下をそのまま AI に貼り付けて使用する。`{{変数}}` はプロジェクトに合わせて置換すること。

---

### 指示文ここから

````
以下の「3層防御 + 監視 + バックアップ」をこのプロジェクトにセットアップしてください。
各層でやること・なぜ必要か・やらないとどうなるかを理解した上で実装すること。

## 前提情報
- パッケージマネージャ: {{npm / pnpm / bun}}
- フレームワーク: {{Next.js 14 / 15 等}}
- ホスティング: {{Netlify / Vercel / AWS 等}}
- DB: {{Supabase / PlanetScale / 自前PostgreSQL 等}}
- リポジトリ: {{GitHub private / public}}
- OS: {{Windows / Mac / Linux}}（Windows の場合は改行コード正規化が必須）

---

## 第1層: Pre-commit hooks（ローカル品質ゲート）

### 目的
コミット前にコード品質をチェックし、壊れたコードがリポジトリに入るのを防ぐ。

### やること
1. husky + lint-staged をインストール
2. `.husky/pre-commit` に `npx lint-staged` を設定
3. `package.json` に lint-staged の設定を追加:
   - `*.{ts,tsx}`: ESLint（`--max-warnings 0`）+ Prettier
4. Prettier 設定ファイル（`.prettierrc`）を作成:
   ```json
   {
     "semi": true,
     "singleQuote": true,
     "trailingComma": "es5",
     "printWidth": 100,
     "tabWidth": 2,
     "plugins": ["prettier-plugin-tailwindcss"]
   }
````

5. eslint-config-prettier をインストールして ESLint と Prettier の競合を解消
6. prettier-plugin-tailwindcss をインストール（Tailwind 使用時のみ）

### Windows 対応（Windows 開発の場合のみ）

`.gitattributes` を作成して改行コードを正規化:

```
* text=auto
*.sh text eol=lf
.husky/* text eol=lf
*.bat text eol=crlf
*.cmd text eol=crlf
*.png binary
*.jpg binary
*.pdf binary
```

**理由**: Windows は CRLF、Linux/CI は LF を使う。これがないと husky が CI で改行コードエラーで落ちる。

---

## 第2層: GitHub Actions CI（PR品質ゲート）

### 目的

PR マージ前に型チェック・lint・ビルド・セキュリティ監査を自動実行。ローカルチェックをすり抜けた問題をキャッチ。

### やること

#### CI ワークフロー（`.github/workflows/ci.yml`）

```yaml
name: CI

on:
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Quality Check
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Security audit
        run: npm audit --audit-level=high
        continue-on-error: true
```

**ポイント**:

- `concurrency` で同一PRの重複実行を自動キャンセル（無料枠節約）
- `npm audit` は誤検知が多いため `continue-on-error: true`（ブロッカーにしない）
- `timeout-minutes: 10` で暴走防止

#### CodeQL セキュリティスキャン（`.github/workflows/codeql.yml`）

```yaml
name: CodeQL

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 3 * * 1' # 毎週月曜 12:00 JST

concurrency:
  group: codeql-${{ github.ref }}
  cancel-in-progress: true

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    timeout-minutes: 15
    permissions:
      security-events: write

    steps:
      - uses: actions/checkout@v4

      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript

      - uses: github/codeql-action/analyze@v3
```

**なぜ必要か**: ESLint では検出できない XSS・SQL インジェクション等のセキュリティ脆弱性を検出。

---

## 第3層: Dependabot（依存関係の自動更新）

### 目的

依存ライブラリの脆弱性を週次で自動検出し、更新PRを作成。手動チェックだと見逃すリスクが高い。

### やること

#### `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
    open-pull-requests-limit: 5
    labels:
      - dependencies
```

#### Security updates の有効化

```bash
gh api repos/{owner}/{repo}/automated-security-fixes -X PUT
```

---

## 第4層: エラー監視（Sentry）

### 目的

本番で発生したエラーをリアルタイムで検知。ユーザー報告を待たずに問題を発見できる。

### やること

1. `@sentry/nextjs` をインストール
2. 以下のファイルを作成:

#### `instrumentation-client.ts`（プロジェクトルート）

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  enabled: process.env.NODE_ENV === 'production',
});
```

#### `instrumentation.ts`（プロジェクトルート）

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      enabled: process.env.NODE_ENV === 'production',
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      enabled: process.env.NODE_ENV === 'production',
    });
  }
}
```

#### `app/global-error.tsx`

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>エラーが発生しました</h2>
          <button onClick={() => reset()}>再試行</button>
        </div>
      </body>
    </html>
  );
}
```

#### `next.config.js` に追加

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  disableSourceMapUpload: true,
});
```

#### `next.config.js` の `experimental` に追加

```javascript
experimental: {
  instrumentationHook: true,
},
```

3. 環境変数バリデーション（`lib/env.ts` 等）に追加:
   ```typescript
   NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
   ```

### 注意点

- バンドルサイズ +12-16KB (gzip)。小規模アプリなら許容範囲
- DSN 未設定時は自動的に無効化されるため、開発環境に影響なし
- 無料枠: 5,000 エラー/月（個人〜小規模チームには十分）

---

## 第5層: DB バックアップ（GitHub Actions + Supabase CLI）

### 目的

データベースの定期バックアップ。Supabase の自動バックアップは Pro プラン（$25/月）のみ。無料プランでは自前でバックアップが必要。

### やること

#### `.github/workflows/backup.yml`

```yaml
name: Database Backup

on:
  schedule:
    - cron: '0 18 * * *' # 毎日 03:00 JST (18:00 UTC)
  workflow_dispatch: {} # 手動実行も可能

jobs:
  backup:
    name: Supabase DB Backup
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Create backup directory
        run: mkdir -p backup

      - name: Dump schema
        run: supabase db dump --db-url "${{ secrets.SUPABASE_DB_URL }}" -f backup/schema.sql

      - name: Dump data
        run: supabase db dump --db-url "${{ secrets.SUPABASE_DB_URL }}" --data-only --use-copy -f backup/data.sql

      - name: Upload backup as artifact
        uses: actions/upload-artifact@v4
        with:
          name: db-backup-${{ github.run_id }}
          path: backup/
          retention-days: 30
```

#### GitHub Secrets 設定

1. Supabase ダッシュボード → 上部「Connect」ボタン → **Method を「Session Pooler」に変更**
2. 表示されたURIをコピー（`aws-0-...pooler.supabase.com` 形式）
3. `[YOUR-PASSWORD]` をDBパスワードに置換
4. GitHub リポジトリ → Settings → Secrets and variables → Actions → New repository secret
5. Name: `SUPABASE_DB_URL`, Value: 上記の接続URL

### 注意点

- **Direct connection ではなく Session Pooler を使うこと**（GitHub Actions ランナーはIPv6で接続するため、Direct connection だと Network unreachable エラーになる）
- Artifact 保存期間は 30 日（無料枠）
- 1回あたり約2-3分 × 30日 = 月60-90分（GitHub Actions 無料枠 2,000分/月に十分収まる）
- `workflow_dispatch` で手動実行可能（マイグレーション前のバックアップ等に便利）

---

## 環境変数バリデーション（lib/env.ts）

### 目的

環境変数の設定漏れをビルド時に検出。本番デプロイ後に「環境変数が足りなくて動かない」を防ぐ。

### やること

```typescript
import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  // プロジェクト固有の NEXT_PUBLIC_ 変数を追加
});

const serverSchema = z.object({
  // サーバーサイドのみで使う変数（API キー等）
});

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

export const serverEnv = serverSchema.parse({
  // process.env.XXX を列挙
});
```

**なぜ手動で `process.env.XXX` を渡すか**: Next.js はビルド時に `NEXT_PUBLIC_` をリテラル置換するため、`process.env` を丸ごと渡すと値が入らない。

---

## セットアップ後の確認チェックリスト

- [ ] `git commit` 時に ESLint + Prettier が自動実行される
- [ ] PR 作成時に CI（tsc + lint + build + audit）が走る
- [ ] PR 作成時に CodeQL セキュリティスキャンが走る
- [ ] Dependabot が週次で依存更新 PR を作成する
- [ ] Sentry DSN を設定後、本番エラーがダッシュボードに表示される
- [ ] DB バックアップが手動実行で成功し、Artifact が生成される
- [ ] `npm run build` がエラーなく通る

---

## コスト見積もり（個人・小規模チーム）

| ツール         | プラン    | 月額   | 制限                  |
| -------------- | --------- | ------ | --------------------- |
| GitHub Actions | Free      | $0     | private 2,000分/月    |
| CodeQL         | Free      | $0     | public/private 無制限 |
| Dependabot     | Free      | $0     | 制限なし              |
| Sentry         | Developer | $0     | 5,000 エラー/月       |
| **合計**       |           | **$0** |                       |

---

## 既知の注意事項（調査済み）

| 項目                   | 詳細                                                                           |
| ---------------------- | ------------------------------------------------------------------------------ |
| HSTS                   | Netlify/Vercel が自動付与。手動追加すると重複リスク                            |
| CORS                   | ドメイン間違いでアプリ全壊。Supabase 直接呼出構成なら影響小                    |
| npm audit              | 誤検知が多い。`--audit-level=high` + `continue-on-error: true` で運用          |
| Sentry バンドル        | +12-16KB(gzip)。ビルドメモリ増加リスクあり（Netlify 無料枠で問題なし実績あり） |
| eslint-config-prettier | 2025年7月にサプライチェーン攻撃歴。v10.1.8+ で修正済み                         |
| GitHub Actions 無料枠  | private リポ 2,000分/月。CI + バックアップで月100-200分程度なら余裕            |

```

---

## カスタマイズガイド

### Vercel にホスティングする場合
- `netlify.toml` の代わりに `vercel.json` でヘッダー管理
- Vercel は HSTS を自動付与

### pnpm / bun を使う場合
- CI の `npm ci` → `pnpm install --frozen-lockfile` / `bun install --frozen-lockfile`
- `actions/setup-node` の `cache` → `pnpm` / 削除（bun は別途セットアップ）
- lint-staged の `npx` → `pnpm exec` / `bunx`

### テストを追加する場合
- CI ワークフローに `npm test` ステップを追加
- Playwright を使う場合は `playwright.config.ts` を作成し、CI に `npx playwright install --with-deps` を追加

### Branch Protection を追加する場合（複数人開発時）
- GitHub Pro ($4/月) が必要（private リポ）
- Settings → Branches → Branch protection rules で `main` に設定
- 「Require status checks to pass」で CI ジョブを必須に
```
