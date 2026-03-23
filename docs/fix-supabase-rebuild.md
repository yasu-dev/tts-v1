# Supabase環境 現状復帰（再構築）

## 背景

- Supabase環境がSupabase側により削除された（意図的な削除ではない）
- 3日後にデモを控えており、AWS移行はリスクが高い
- 現状復帰として新規Supabaseプロジェクトを作成し、同等の環境を再構築する
- 傷病者データ（実運用データ）は復元不可だが、スキーマ・デモデータは再現可能

---

## 1. 修正内容の詳細化

### 1.1 やること

新規Supabaseプロジェクトを作成し、以下を再構築する:

| 項目           | 内容                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| DBスキーマ     | 9テーブル（events, triage_tags, hospitals, teams, geographic_areas, user_roles, scene_maps, audit_logs, sync_state） |
| DBインデックス | GiST, GIN, B-tree合計12個                                                                                            |
| DB関数         | update_contact_point(), update_updated_at_column(), update_scene_maps_updated_at()                                   |
| RLSポリシー    | 全テーブルに authenticated_full_access（デモ用） + scene_maps個別4ポリシー                                           |
| Auth設定       | Email/Password認証、Email確認無効化（デモ用）                                                                        |
| デモユーザー   | 4アカウント（ic/tri/trn/hsp@demo.com）                                                                               |
| デモデータ     | イベント1件、病院3件、タグ7件、チーム2件                                                                             |
| Storage        | triage-images バケット（Public） + ポリシー3件                                                                       |
| Realtime       | triage_tags, hospitals テーブルのReplication有効化                                                                   |
| 環境変数       | .env.local + Netlify環境変数の更新                                                                                   |

### 1.2 やらないこと

- AWS移行（デモ後に別タスクで実施）
- 実運用データの復元（不可能）
- RLSポリシーの本番化（デモフェーズのまま維持）
- スキーマ変更・機能追加（現状復帰のみ）

### 1.3 修正前後の振る舞いの差分

| 項目         | Before（削除前）  | After（再構築後） |
| ------------ | ----------------- | ----------------- |
| Supabase URL | 旧プロジェクトURL | 新プロジェクトURL |
| Anon Key     | 旧キー            | 新キー            |
| DBスキーマ   | 同一              | 同一              |
| RLSポリシー  | 同一              | 同一              |
| デモデータ   | 同一              | 同一              |
| 実運用データ | 存在していた      | なし（復元不可）  |
| UI/機能      | 変更なし          | 変更なし          |

**UIの変化: なし**（環境変数の差し替えのみ）

---

## 2. 実現手段

### 2.1 重要な発見: ベーステーブルCREATE TABLE文の不在

コードベース調査の結果、以下が判明:

- **ベーステーブルのCREATE TABLE文**は [docs/仕様.md:126-283](docs/仕様.md) にのみ存在
- `supabase/` ディレクトリの既存SQLファイルは、ALTER TABLE（カラム追加）・RLS・関数のみ
- **仕様書のCREATE TABLE文にない、実際に使用されているカラム**が2つ存在:
  - `events.contact_points` (TEXT[]) — [components/ContactPointManager.tsx](components/ContactPointManager.tsx), [app/triage/scan/page.tsx](app/triage/scan/page.tsx) で使用
  - `triage_tags.transport_assignment` (JSONB) — [app/(dashboard)/transport-team/](<app/(dashboard)/transport-team/>) 等で多数使用

→ 仕様書のCREATE TABLE + 上記2カラム追加 + 既存ALTER TABLE = 完全なスキーマとして統合SQLを新規作成する。

### 2.2 新規作成ファイル

| ファイル                       | 役割                                     |
| ------------------------------ | ---------------------------------------- |
| `supabase/000-base-schema.sql` | 全テーブルのCREATE TABLE（統合・完全版） |

### 2.3 既存ファイル（変更なし・そのまま使用）

| ファイル                               | 役割                                           | 実行順             |
| -------------------------------------- | ---------------------------------------------- | ------------------ |
| `supabase/000-base-schema.sql`         | ベーステーブル作成                             | 1                  |
| `supabase/add-triage-tag-fields.sql`   | triage_tags カラム追加（IF NOT EXISTS で冪等） | 2                  |
| `supabase/scene-maps-table.sql`        | scene_maps テーブル＋RLS                       | 3                  |
| `supabase/contact-point-functions.sql` | RPC関数                                        | 4                  |
| `supabase/rls-policies.sql`            | 全テーブルRLS（デモ用）                        | 5                  |
| `supabase/storage-setup.md`            | Storageバケット設定手順                        | 6（手動）          |
| `supabase/create-demo-users.sql`       | デモユーザー作成                               | 7（Dashboard推奨） |
| `supabase/demo-data.sql`               | デモデータ投入                                 | 8                  |

### 2.4 環境変数の更新対象

#### ローカル: `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://[新プロジェクト].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[新anon key]
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Netlify: 環境変数（ダッシュボードで設定）

```
NEXT_PUBLIC_SUPABASE_URL=https://[新プロジェクト].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[新anon key]
NEXT_PUBLIC_APP_URL=https://[Netlify URL]
NEXT_PUBLIC_SENTRY_DSN=[既存のまま]
SENTRY_ORG=leadx-5g
SENTRY_PROJECT=tts-v1
```

### 2.5 `000-base-schema.sql` の内容方針

[docs/仕様.md:126-283](docs/仕様.md) のCREATE TABLE文をベースに、以下を統合:

1. `events` テーブルに `contact_points TEXT[]` カラムを追加
2. `triage_tags` テーブルに `transport_assignment JSONB` カラムを追加
3. `triage_tags` テーブルに `chief_complaint JSONB` カラムを追加（仕様書ではコメントのみ、add-triage-tag-fieldsで追加されるが、ベースに含めた方が明確）
4. `updated_at` 自動更新用の汎用トリガー関数を定義
5. `audit_logs`, `sync_state` は仕様書通りに含める（現在コードからは未参照だが、将来必要かつ削除する理由がない）

### 2.6 Supabase ダッシュボード手動設定

以下はSQLでは設定できず、ダッシュボードで手動操作が必要:

1. **Auth設定**: Authentication → Settings → Email Auth
   - "Enable email confirmations" → OFF
   - "Enable email change confirmations" → OFF

2. **Realtime設定**: Database → Replication
   - `triage_tags` テーブル → Realtime有効化
   - `hospitals` テーブル → Realtime有効化

3. **Storageバケット作成**: Storage → New bucket
   - Name: `triage-images`
   - Public: ON

4. **デモユーザー作成**: Authentication → Users → Add User
   - ic@demo.com / password（Auto Confirm User: ON）
   - tri@demo.com / password（Auto Confirm User: ON）
   - trn@demo.com / password（Auto Confirm User: ON）
   - hsp@demo.com / password（Auto Confirm User: ON）

### 2.7 実行手順（全体フロー）

```
手順1: Supabaseダッシュボードで新プロジェクト作成
  └─ Region: Northeast Asia (Tokyo)
  └─ Project URL, anon key を取得

手順2: SQL Editor で SQLファイルを順番に実行
  └─ 000-base-schema.sql        ← 新規作成
  └─ add-triage-tag-fields.sql   ← 既存（冪等）
  └─ scene-maps-table.sql        ← 既存
  └─ contact-point-functions.sql  ← 既存
  └─ rls-policies.sql            ← 既存

手順3: Storage ポリシー設定（storage-setup.md の SQL を実行）

手順4: ダッシュボード手動設定
  └─ Auth: Email確認OFF
  └─ Realtime: triage_tags, hospitals
  └─ Storage: triage-images バケット作成

手順5: デモユーザー作成（ダッシュボード推奨）

手順6: デモデータ投入
  └─ demo-data.sql

手順7: 環境変数更新
  └─ .env.local（ローカル）
  └─ Netlify環境変数（本番）

手順8: ローカル動作確認
  └─ npm run dev → ログイン → データ表示確認

手順9: Netlifyデプロイ確認
  └─ 本番環境でログイン → データ表示確認
```

---

## 3. 影響範囲の分析

### 3.1 既存機能への影響

| 機能                   | 影響 | 理由                                   |
| ---------------------- | ---- | -------------------------------------- |
| ログイン/ログアウト    | なし | Supabase Auth APIは同一仕様            |
| 指揮本部ダッシュボード | なし | Supabase Clientの接続先URLが変わるだけ |
| トリアージ入力         | なし | 同上                                   |
| 搬送管理               | なし | 同上                                   |
| 病院ダッシュボード     | なし | 同上                                   |
| 災害現場図             | なし | 同上                                   |
| 画像アップロード       | なし | Storage設定を同一にするため            |
| リアルタイム更新       | なし | Realtime設定を同一にするため           |
| 接触地点管理           | なし | RPC関数を再作成するため                |

### 3.2 API/DB/外部連携への影響

| 対象              | 影響                                         |
| ----------------- | -------------------------------------------- |
| Supabase REST API | URLとキーが変更される（環境変数で吸収）      |
| Supabase Auth     | 新プロジェクトの認証基盤に切り替わる         |
| Supabase Realtime | 新プロジェクトのWebSocket接続に切り替わる    |
| Supabase Storage  | 新プロジェクトのStorage URLに切り替わる      |
| Netlify           | 環境変数更新でビルド・デプロイに影響なし     |
| Sentry            | 影響なし（Supabase非依存）                   |
| GitHub Actions CI | 影響なし（CIはビルド・Lint・型チェックのみ） |

### 3.3 非機能への影響

| 項目         | 影響                                                     |
| ------------ | -------------------------------------------------------- |
| 性能         | なし（同一スキーマ・インデックス）                       |
| セキュリティ | なし（同一RLSポリシー）                                  |
| 可用性       | Supabase側のリージョン・プラン次第（同一リージョン推奨） |
| メモリ       | なし                                                     |
| ログ         | なし                                                     |

### 3.4 テスト観点・確認事項

#### ローカル環境テスト

| #   | テスト項目       | 確認方法                                  | 期待結果                       |
| --- | ---------------- | ----------------------------------------- | ------------------------------ |
| 1   | ビルド成功       | `npm run build`                           | エラーなし                     |
| 2   | ログイン         | ic@demo.com でログイン                    | /command に遷移                |
| 3   | ロール別遷移     | tri/trn/hsp でログイン                    | 各ダッシュボードに遷移         |
| 4   | データ表示       | 指揮本部ダッシュボード                    | 赤2黄2緑2黒1 = 計7件表示       |
| 5   | リアルタイム     | Supabaseでデータ編集 → ダッシュボード確認 | リアルタイム反映               |
| 6   | トリアージ入力   | /triage/scan でタグ新規作成               | 保存成功、ダッシュボードに反映 |
| 7   | 搬送割当         | 指揮本部から搬送割当                      | transport_assignment更新       |
| 8   | 接触地点管理     | 接触地点の追加・編集・削除                | events.contact_points更新      |
| 9   | 画像アップロード | トリアージ入力で画像添付                  | Storage保存、表示              |
| 10  | 災害現場図       | 新規作成・編集・保存                      | scene_maps CRUD動作            |

#### 本番環境テスト（Netlify）

| #   | テスト項目             | 確認方法                     |
| --- | ---------------------- | ---------------------------- |
| 1   | デプロイ成功           | Netlifyダッシュボードで確認  |
| 2   | ログイン               | 本番URLでic@demo.comログイン |
| 3   | 上記テスト2-10の本番版 | 本番URLで同様の確認          |

---

## 4. 類似箇所の横展開

### 4.1 コードベース全体の確認

| 確認項目                   | 結果                     |
| -------------------------- | ------------------------ |
| Supabase URLのハードコード | なし（全て環境変数経由） |
| Supabase Keyのハードコード | なし（全て環境変数経由） |
| 旧プロジェクト固有IDの参照 | なし                     |
| `.env.local` のGitコミット | なし（.gitignore済み）   |

### 4.2 環境変数の参照箇所

Supabase環境変数は以下3ファイルでのみ参照（環境変数名は変更なし）:

| ファイル                                                 | 使用方法                        |
| -------------------------------------------------------- | ------------------------------- |
| [lib/supabase/client.ts](lib/supabase/client.ts)         | `createBrowserClient(URL, KEY)` |
| [lib/supabase/server.ts](lib/supabase/server.ts)         | `createServerClient(URL, KEY)`  |
| [lib/supabase/middleware.ts](lib/supabase/middleware.ts) | `createServerClient(URL, KEY)`  |
| [lib/env.ts](lib/env.ts)                                 | Zodバリデーション               |

→ 環境変数名 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` は既存のまま。値のみ差し替え。

### 4.3 同種の問題の横展開

該当なし。Supabaseへの依存は上記に集約されており、環境変数の差し替えで完結する。

---

## チェックリスト

- [x] 変更対象のファイル・関数がすべて特定されている
- [x] 各変更の方針（何をどう変えるか）が明記されている
- [x] DB変更がある場合、マイグレーション方針が記載されている（000-base-schema.sql 新規作成）
- [x] 影響を受ける既存機能が列挙されている（影響なし）
- [x] テスト観点が記載されている
- [x] 未確定事項・判断保留がゼロである
