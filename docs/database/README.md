# データベース設定ガイド

このディレクトリには、トリアージタッグシステムのデータベース構築・管理に必要なSQLスクリプトが含まれています。

## 📋 目次

1. [SQLファイル一覧](#sqlファイル一覧)
2. [新環境セットアップ手順](#新環境セットアップ手順)
3. [テーブル構造](#テーブル構造)
4. [セキュリティ設定](#セキュリティ設定)
5. [トラブルシューティング](#トラブルシューティング)

---

## SQLファイル一覧

### 必須スクリプト（本番環境）

#### 1. `add-triage-tag-fields.sql`
**用途**: triage_tagsテーブルのスキーマ拡張

**追加フィールド**:
- `conveyer`: 搬送機関
- `execution_places[]`: トリアージ実施場所（複数選択）
- `execution_place_other`: その他の実施場所
- `rescue_place`: 救出場所
- `enforcement_organization`: トリアージ実施機関
- `enforcement_organization_other`: その他の実施機関
- `conditions[]`: 症状・傷病名（複数選択）
- `condition_other`: その他の症状
- `vital_signs_records` (JSONB): バイタルサイン複数回記録

**インデックス**:
- 通常インデックス: conveyer, rescue_place, enforcement_organization
- GINインデックス: execution_places, conditions, vital_signs_records

**実行タイミング**: 初回セットアップ時

**再利用可能性**: ✅ 非常に高い

---

#### 2. `contact-point-functions.sql`
**用途**: 接触地点管理用データベース関数

**内容**:
- 接触地点の作成・更新・削除関数
- stored procedures定義

**実行タイミング**: テーブル作成後、初回セットアップ時

**再利用可能性**: ✅ 高い

---

#### 3. `rls-policies.sql`
**用途**: Row Level Security（RLS）ポリシー設定

**設定内容**:

##### eventsテーブル
- SELECT: 全ユーザー可能
- INSERT/UPDATE: IC, ADMのみ

##### triage_tagsテーブル
- SELECT: 全認証ユーザー可能
- INSERT: TRI, DMAT, IC, ADMのみ
- UPDATE: TRI, DMAT, IC, TRN, HSP, ADMのみ

##### hospitalsテーブル
- SELECT: 全認証ユーザー可能
- UPDATE: HSP, IC, ADMのみ

##### user_rolesテーブル
- SELECT: 全認証ユーザー可能
- INSERT/UPDATE/DELETE: ADMのみ

**実行タイミング**: テーブル作成後、必須

**再利用可能性**: ✅ 非常に高い

**重要度**: 🔴 セキュリティ上必須

---

### デモ・テスト用スクリプト

#### 4. `create-demo-users.sql`
**用途**: デモアカウント作成手順

**デモアカウント一覧**:

| メールアドレス | パスワード | ロール | 用途 |
|--------------|-----------|--------|------|
| ic@demo.com | password | IC | 指揮本部 |
| tri@demo.com | password | TRI | トリアージ部隊 |
| trn@demo.com | password | TRN | 搬送部隊 |
| hsp@demo.com | password | HSP | 病院 |

**実行方法**:
1. Supabase Dashboard推奨（SQLは参考用）
2. Authentication → Users → Add User
3. "Auto Confirm User"にチェック

**実行タイミング**: デモ環境構築時のみ

**⚠️ 注意**: 本番環境では実行しない

**再利用可能性**: ✅ 高い（デモ・テスト環境）

---

#### 5. `demo-data.sql`
**用途**: テスト用データ投入

**投入データ**:
- イベント: 1件（東京都内大規模地震）
- 病院: 3件（総合病院、市民病院、医療センター）
- トリアージタグ: 7件
  - 赤（重症）: 2件
  - 黄（中等症）: 2件
  - 緑（軽症）: 2件
  - 黒（死亡）: 1件
- チーム: 2件（搬送隊）

**実行タイミング**: デモ環境構築時のみ

**⚠️ 注意**: 本番環境では実行しない

**再利用可能性**: ✅ 中程度（デモ・テスト環境）

---

### メンテナンス用スクリプト

#### 6. `check-schema.sql`
**用途**: データベーススキーマ検証

**確認内容**:
- テーブル一覧
- カラム構造
- インデックス
- RLSポリシー状態

**実行タイミング**:
- メンテナンス時
- トラブルシューティング時
- スキーマ確認が必要な時

**再利用可能性**: ✅ 中程度

---

### マイグレーションスクリプト

#### 7. `migration_remove_height_weight.sql`
**用途**: 身長・体重フィールドの削除

**作成日**: 2025-10-23

**目的**: 紙のトリアージタッグとの整合性を保つため、patient_infoから身長・体重フィールドを削除

**内容**:
1. 影響レコード数の確認
2. 削除対象データの確認
3. height/weightフィールドの削除（UPDATE）
4. 削除後の確認

**⚠️ 重要**:
- **不可逆な操作**: 実行前に必ずバックアップ取得
- **既存環境では実行済みの可能性**: 確認してから実行
- **新環境では実行不要**: 既に仕様から除外されている

**実行タイミング**:
- 既存環境で身長・体重データが残っている場合のみ

**ロールバック**: バックアップからの復元のみ

**再利用可能性**: ⚠️ 低い（既に実行済みの環境では不要）

---

## 新環境セットアップ手順

### ステップ1: Supabaseプロジェクト作成

1. https://supabase.com/ にアクセス
2. "New Project"をクリック
3. プロジェクト情報を入力:
   - Name: triage-tag-system（任意）
   - Database Password: 強力なパスワードを設定
   - Region: Northeast Asia (Tokyo) 推奨
4. "Create new project"をクリック

### ステップ2: 基本テーブル作成

Supabase Dashboard → SQL Editor で基本テーブルを作成
（既存のスキーマを参照、またはバックアップから復元）

### ステップ3: SQLスクリプト実行

**重要**: 以下の順序で実行してください

```sql
-- 1. テーブルスキーマの拡張
-- ファイル: add-triage-tag-fields.sql
-- 所要時間: 約30秒

-- 2. データベース関数の定義
-- ファイル: contact-point-functions.sql
-- 所要時間: 約10秒

-- 3. セキュリティポリシーの設定（必須）
-- ファイル: rls-policies.sql
-- 所要時間: 約1分

-- === ここまでが本番環境で必須 ===

-- 4. デモユーザーの作成（開発/デモ環境のみ）
-- ファイル: create-demo-users.sql
-- 所要時間: 約30秒
-- 注意: Supabase Dashboard UIからの作成を推奨

-- 5. デモデータの投入（開発/デモ環境のみ）
-- ファイル: demo-data.sql
-- 所要時間: 約30秒
```

### ステップ4: Realtime有効化

Database → Replication:
1. `triage_tags`テーブルを選択
2. "Enable Replication"をクリック
3. `hospitals`テーブルも同様に有効化

### ステップ5: Storage設定

Storage → "Create a new bucket":
1. Bucket name: `triage-images`
2. Public: ✅ 有効
3. File size limit: 10MB
4. "Create bucket"をクリック

### ステップ6: 認証設定

#### 開発環境
Authentication → Settings → Email Auth:
- ❌ Enable email confirmations（無効化）

#### 本番環境
Authentication → Settings → Email Auth:
- ✅ Enable email confirmations（必ず有効化）
- ✅ Enable email change confirmations

### ステップ7: スキーマ検証

```sql
-- check-schema.sqlを実行して確認
```

期待される結果:
- 全テーブルが存在
- 全カラムが存在
- インデックスが作成されている
- RLSが有効になっている

---

## テーブル構造

### 主要テーブル

#### triage_tags
トリアージタッグ情報を格納

**主要カラム**:
- `id` (UUID): 主キー
- `tag_number` (TEXT): タグ番号
- `anonymous_id` (TEXT): 匿名ID
- `triage_category` (JSONB): トリアージ判定情報
- `patient_info` (JSONB): 患者基本情報
- `vital_signs` (JSONB): バイタルサイン（現在値）
- `vital_signs_records` (JSONB): バイタルサイン履歴（1st/2nd/3rd）
- `chief_complaint` (JSONB): 主訴・症状
- `location` (JSONB): 位置情報
- `transport` (JSONB): 搬送情報
- `conveyer` (TEXT): 搬送機関
- `execution_places` (TEXT[]): 実施場所（配列）
- `rescue_place` (TEXT): 救出場所
- `conditions` (TEXT[]): 症状・傷病名（配列）
- `attachments` (JSONB): 画像・音声
- `audit` (JSONB): 監査情報

#### hospitals
病院情報を格納

**主要カラム**:
- `id` (UUID): 主キー
- `name` (TEXT): 病院名
- `location` (JSONB): 位置情報
- `contact` (JSONB): 連絡先
- `capabilities` (JSONB): 診療科・能力
- `current_load` (JSONB): 現在の受入状況

#### events
イベント情報を格納

**主要カラム**:
- `id` (UUID): 主キー
- `name` (TEXT): イベント名
- `event_type` (TEXT): イベントタイプ
- `location` (JSONB): 発生場所
- `start_time` (TIMESTAMPTZ): 開始時刻
- `status` (TEXT): ステータス

#### user_roles
ユーザーロール管理

**主要カラム**:
- `user_id` (UUID): ユーザーID（auth.usersと連携）
- `role` (TEXT): ロール（IC, TRI, TRN, HSP, ADM）

---

## セキュリティ設定

### RLSポリシーの重要性

Row Level Security（RLS）は、データベースレベルでのアクセス制御を実現します。

**必ず有効化すること**:
- 本番環境では全テーブルでRLS有効
- ロール別のアクセス権限を適切に設定

### ロール一覧

| ロール | 名称 | 権限 |
|--------|------|------|
| IC | 指揮本部 | 全データ閲覧・搬送指示 |
| TRI | トリアージ部隊 | タグ登録・更新 |
| TRN | 搬送部隊 | 搬送情報更新 |
| HSP | 病院 | 受入患者の更新 |
| ADM | 管理者 | 全権限 |

### セキュリティチェックリスト

開発環境:
- [ ] RLSポリシー設定済み
- [ ] デモアカウントのみ存在

本番環境:
- [ ] RLSポリシー設定済み
- [ ] デモアカウント削除済み
- [ ] Email確認有効化
- [ ] 強力なパスワード設定
- [ ] APIキー管理適切

---

## トラブルシューティング

### スクリプト実行エラー

#### エラー: "column already exists"
**原因**: すでに同じカラムが存在

**対策**:
```sql
-- IF NOT EXISTS句を確認
-- スクリプトは冪等性があるため、再実行可能
```

#### エラー: "permission denied"
**原因**: 実行ユーザーに権限がない

**対策**:
- Supabase Dashboard → SQL Editorで実行（推奨）
- または、service_roleキーを使用

#### エラー: "relation does not exist"
**原因**: 基本テーブルが作成されていない

**対策**:
- 基本テーブルを先に作成
- 実行順序を確認

### RLS関連のエラー

#### データが見えない
**原因**: RLSポリシーが厳しすぎる

**対策**:
```sql
-- 一時的に無効化してテスト
ALTER TABLE triage_tags DISABLE ROW LEVEL SECURITY;

-- データ確認後、必ず再有効化
ALTER TABLE triage_tags ENABLE ROW LEVEL SECURITY;
```

#### ポリシー確認方法
```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public';
```

### パフォーマンス問題

#### クエリが遅い
**対策**:
1. インデックスの確認
2. EXPLAINで実行計画を確認
3. 必要に応じて追加インデックス作成

```sql
-- インデックス一覧
SELECT * FROM pg_indexes WHERE tablename = 'triage_tags';

-- 実行計画確認
EXPLAIN ANALYZE SELECT * FROM triage_tags WHERE tag_number = '001';
```

---

## バックアップとリストア

### バックアップ

Supabase Dashboard → Settings → Backups:
- 自動バックアップ: 毎日
- 手動バックアップ: 重要な変更前に実施

### SQLダンプ

```bash
# pg_dumpを使用（ローカル環境）
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

### リストア

```bash
# psqlを使用
psql -h db.xxxxx.supabase.co -U postgres -d postgres < backup.sql
```

---

## 変更履歴

| 日付 | 変更内容 | 担当者 |
|------|---------|--------|
| 2025-10-22 | add-triage-tag-fields.sql作成 | 開発チーム |
| 2025-10-23 | migration_remove_height_weight.sql作成・実行 | 開発チーム |
| 2025-11-02 | ドキュメント整備、SQLファイル整理 | 開発チーム |

---

## 参考リンク

- [Supabase RLS ガイド](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
- [Supabase Database](https://supabase.com/docs/guides/database)

---

**最終更新**: 2025-11-02
