# fix: Supabase RLS有効化 + CLAUDE.md技術スタック記述の修正

## 背景

Supabase Security Advisorが7件のエラーを報告。調査の結果、以下2点が判明した。

1. publicスキーマの6テーブルでRLSが無効 → anon keyで全データにアクセス可能
2. CLAUDE.mdの技術スタック記述（Prisma + SQLite）が現行コードと不一致

---

## 1. 修正内容の詳細化

### 修正A: 6テーブルのRLS有効化 + シンプルポリシー適用

**何を変えるか:**

以下6テーブルに対して、RLSを有効化し「認証済みユーザーのみ全操作可能」ポリシーを設定する。

| テーブル           | 現状RLS | 現状ポリシー                | 修正後RLS | 修正後ポリシー                |
| ------------------ | ------- | --------------------------- | --------- | ----------------------------- |
| `events`           | 無効    | 2個（手動追加、名前不統一） | **有効**  | 既存2個を削除 → 新規1個に統一 |
| `triage_tags`      | 無効    | 0個                         | **有効**  | 新規1個                       |
| `hospitals`        | 無効    | 0個                         | **有効**  | 新規1個                       |
| `teams`            | 無効    | 0個                         | **有効**  | 新規1個                       |
| `geographic_areas` | 無効    | 0個                         | **有効**  | 新規1個                       |
| `user_roles`       | 無効    | 0個                         | **有効**  | 新規1個                       |
| `scene_maps`       | 有効    | 4個（正常）                 | 変更なし  | 変更なし                      |

**各テーブルに適用するポリシー（全テーブル共通パターン）:**

```sql
ALTER TABLE <テーブル名> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_full_access" ON <テーブル名>
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

**`events` テーブルのみ追加作業:**

既存の不統一ポリシーを削除してから新ポリシーを適用する。

```sql
DROP POLICY IF EXISTS "Allow authenticated users to read events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to update events" ON events;
```

**なぜこのポリシーか:**

- 現フェーズはデモ段階であり、ロール別の細粒度制御は不要
- 全てのアプリ機能はSupabase Auth認証後に使用するため、`auth.role() = 'authenticated'` で動作を維持できる
- 将来本番移行時にロールベースポリシー（`supabase/rls-policies.sql`）に差し替え可能

**修正前後の振る舞いの差分:**

| 操作                                          | 修正前           | 修正後                     |
| --------------------------------------------- | ---------------- | -------------------------- |
| ログイン済みユーザーのデータ読み書き          | 可能             | **可能（変化なし）**       |
| 未ログイン（anon key のみ）でのデータ読み取り | **可能（脆弱）** | **ブロック（空配列返却）** |
| 未ログイン（anon key のみ）でのデータ書き込み | **可能（脆弱）** | **ブロック（エラー返却）** |
| Supabase Realtime（triage_tags）              | 動作             | **動作（変化なし）**※      |

※ Realtime publicationに登録されているのは `triage_tags` のみ。RLS有効化後もRealtimeはRLSを尊重し、認証済みセッションであれば通知を受信できる。

### 修正B: CLAUDE.md 技術スタック記述の修正

**何を変えるか:**

コードベースの実態に合わせてCLAUDE.mdの記述を修正する。

| 箇所                      | 修正前                                                 | 修正後                                                     |
| ------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| 9行目 技術スタック        | `Prisma(SQLite) + Supabase Auth`                       | `Supabase (Auth + PostgreSQL)`                             |
| 19行目 アーキテクチャ方針 | `DB: 現行SQLite + Prisma。マネージドDB移行はADR決定後` | `DB: Supabase PostgreSQL。データ取得はSupabase Client経由` |

**なぜ変えるか:**

- package.jsonにPrisma ORMの依存は存在しない（`@prisma/instrumentation` はSentryの内部依存であり、Prisma ORM本体ではない）
- SQLiteファイルも存在しない
- 全データアクセスは `lib/supabase/client.ts` / `lib/supabase/server.ts` 経由でSupabase PostgreSQLに対して行われている
- CLAUDE.mdは Single Source of Truth であるため、実態との乖離は早急に解消すべき

### 修正C: supabase/rls-policies.sql の更新

**何を変えるか:**

`supabase/rls-policies.sql` の内容を、今回実際に適用するデモ用シンプルポリシーに書き換える。将来のロールベースポリシーはコメントとして残す。

**なぜ変えるか:**

- 現在の `rls-policies.sql` はロールベースのポリシーが書かれているが、適用されたことがない
- 実際にDBに適用されているポリシーとファイル内容が一致しない状態は混乱の元
- 「SQLファイルの内容 = DB上の設定」を維持する

---

## 2. 実現手段

### 修正対象ファイル一覧

| #   | ファイル                    | 変更内容                                               |
| --- | --------------------------- | ------------------------------------------------------ |
| 1   | Supabase DB（SQL実行）      | 6テーブルRLS有効化 + ポリシー適用                      |
| 2   | `supabase/rls-policies.sql` | デモ用ポリシーに書き換え（ロールベースはコメント保持） |
| 3   | `CLAUDE.md` 9行目           | 技術スタック記述修正                                   |
| 4   | `CLAUDE.md` 19行目          | アーキテクチャ方針DB記述修正                           |

新規ファイルの作成: なし

### 各ファイルの変更方針

**1. Supabase DB（SQL実行）**

Supabase MCP の `execute_sql` または `apply_migration` でSQLを実行する。1つのSQLで全テーブルを一括処理。実行順序:

1. `events` テーブルの既存不整合ポリシー2件を削除
2. 6テーブルに `ENABLE ROW LEVEL SECURITY` を実行
3. 6テーブルに `authenticated_full_access` ポリシーを作成

**2. `supabase/rls-policies.sql`**

ファイル全体を書き換え。構成:

- ヘッダーコメント（デモフェーズ用RLS、適用日）
- 6テーブルのRLS有効化 + シンプルポリシー
- 将来のロールベースポリシーをコメントブロックで残す

**3-4. `CLAUDE.md`**

2箇所のテキスト置換のみ。

---

## 3. 影響範囲の分析

### 既存機能への影響

| 機能                                       | 影響     | 理由                                                                                                   |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------ |
| トリアージスキャン（triage/scan）          | **なし** | Client Componentで認証済みセッション使用（auth.getUser()確認済み）                                     |
| 指揮所ダッシュボード（command）            | **なし** | Server Component + Client Component共に認証済みセッション使用                                          |
| 搬送ダッシュボード（transport）            | **なし** | 同上                                                                                                   |
| 搬送チームダッシュボード（transport-team） | **なし** | 同上                                                                                                   |
| 病院ダッシュボード（hospital）             | **なし** | 同上                                                                                                   |
| 現場図機能（scene-maps）                   | **なし** | 既にRLS有効済み、今回変更なし                                                                          |
| 接触地点管理（ContactPointManager）        | **なし** | 認証済みセッションでeventsテーブルを操作                                                               |
| 画像アップロード（ImageUploader）          | **なし** | Supabase Storageへのアクセス、DBのRLSとは無関係                                                        |
| リアルタイム同期（Realtime）               | **なし** | triage_tagsのみpublication登録済み。RLS有効化後もRLSポリシーに合致する認証済みユーザーは通知を受信可能 |

### 認証フローの確認結果

| レイヤー                                 | 認証方式                                             | RLS有効化後の動作                                      |
| ---------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| middleware（ルートガード）               | `supabase.auth.getUser()` でCookieからJWT検証        | **影響なし**（Auth APIのみ使用、DBアクセスなし）       |
| Server Component（初期データ取得）       | `createServerClient()` + CookieアダプターでJWT付与   | **正常動作**（`auth.role() = 'authenticated'` を通過） |
| Client Component（リアルタイム・書込み） | `createBrowserClient()` でブラウザセッション自動付与 | **正常動作**（`auth.role() = 'authenticated'` を通過） |

### DB・外部連携への影響

| 対象                            | 影響                                                                                                                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase Auth                   | なし（RLSはPostgRESTのみに影響）                                                                                                                                                 |
| Supabase Storage                | なし（StorageのRLSは別設定）                                                                                                                                                     |
| Supabase Realtime               | なし（認証セッションがあれば通知受信可能）                                                                                                                                       |
| RPC関数（update_contact_point） | **要確認→確認済み: 問題なし**。RPC関数はSECURITY DEFINERで実行される場合RLSをバイパスする。SECURITY INVOKERの場合は呼び出しユーザーのRLSが適用されるが、認証済みであれば通過する |

### 非機能への影響

| 観点           | 影響                                                                             |
| -------------- | -------------------------------------------------------------------------------- |
| パフォーマンス | 微小（RLSはクエリにWHERE条件を追加するのみ。`auth.role()` チェックは極めて軽量） |
| セキュリティ   | **改善**（未認証アクセスをブロック）                                             |
| ログ・監視     | なし                                                                             |
| メモリ         | なし                                                                             |

### テスト観点・確認事項

| #   | テスト項目                                                  | 確認方法          |
| --- | ----------------------------------------------------------- | ----------------- |
| 1   | ログイン → 指揮所ダッシュボードにデータが表示される         | ブラウザで確認    |
| 2   | ログイン → トリアージスキャンで新規タグ登録できる           | ブラウザで確認    |
| 3   | ログイン → 搬送ダッシュボードにデータが表示される           | ブラウザで確認    |
| 4   | ログイン → 病院ダッシュボードにデータが表示される           | ブラウザで確認    |
| 5   | リアルタイム同期が動作する（2ブラウザでタグ更新→即時反映）  | ブラウザ2台で確認 |
| 6   | 接触地点の追加・編集・削除ができる                          | ブラウザで確認    |
| 7   | 未ログイン状態でPostgREST APIを直接叩いてもデータが返らない | curlで確認        |
| 8   | `npm run build` が成功する                                  | ローカルで実行    |
| 9   | `npx tsc --noEmit` が成功する                               | ローカルで実行    |

---

## 4. 類似箇所の横展開

### Supabase Storage のRLS

Supabase StorageにもRLS（バケットポリシー）が存在する。`triage-images` バケットのポリシーは今回のスコープ外だが、同様の問題がある可能性がある。

→ **今回のスコープ外**。ただし将来的に確認が必要。

### Supabase RPC関数のセキュリティ

`contact-point-functions.sql` で定義されたRPC関数（`update_contact_point` 等）のSECURITY設定は今回のRLS変更とは独立して動作する。

→ **対応不要**。認証済みユーザーからの呼び出しであれば問題なし。

### docs/database/rls-policies.sql（docs配下の重複ファイル）

`supabase/rls-policies.sql` と `docs/database/rls-policies.sql` が同一内容で重複している。

→ **`supabase/rls-policies.sql` を正とし、`docs/database/rls-policies.sql` も同期更新する**。

### MEMORY.md（Claude Code自動メモリ）

`C:\Users\tbnki\.claude\projects\c--Users-tbnki-Desktop-tts-v1\memory\MEMORY.md` にも「現行: Netlify(デプロイ) + Supabase(Auth) + SQLite(ローカルDB)」と記載がある。

→ **CLAUDE.md修正と同時に更新する**。

### 同種の問題が他にないか

- `prisma` / `sqlite` / `.db` のコードベース検索結果: package-lock.jsonの `@prisma/instrumentation` のみ（Sentry内部依存、Prisma ORM本体ではない）
- アプリコードにPrisma/SQLiteの参照は一切なし

→ **該当なし。CLAUDE.md以外にコード修正は不要。**
