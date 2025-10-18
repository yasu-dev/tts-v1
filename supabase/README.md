# Supabase セットアップガイド

このドキュメントでは、トリアージタッグシステムのSupabaseセットアップ手順を説明します。

## 前提条件

- Supabaseアカウント（https://supabase.com/）
- プロジェクトの作成済み

## セットアップ手順

### 1. プロジェクト情報の取得

Supabaseダッシュボードから以下の情報を取得します：

1. Project Settings → API から取得
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. `.env.local` ファイルを作成
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. データベーススキーマの作成

Supabaseダッシュボードの SQL Editor で以下を順番に実行：

#### 2.1 テーブル作成（schema.sql）
```sql
-- events, hospitals, triage_tags, teams, geographic_areas, user_roles テーブルを作成
-- ファイル: supabase/schema.sql（別途作成が必要）
```

#### 2.2 RLSポリシー設定
```bash
supabase/rls-policies.sql
```

SQL Editorで実行：
```sql
-- Row Level Security を有効化し、各テーブルのアクセス制御を設定
```

#### 2.3 デモデータ投入
```bash
supabase/demo-data.sql
```

SQL Editorで実行して、以下のデータを投入：
- イベント: 1件（東京都内大規模地震）
- 病院: 3件（総合病院、市民病院、医療センター）
- トリアージタグ: 7件
  - 赤（重症）: 2件
  - 黄（中等症）: 2件
  - 緑（軽症）: 2件
  - 黒（死亡）: 1件
- チーム: 2件（搬送隊）

### 3. Supabase Authの設定

#### 3.1 デモユーザーの作成

Authentication → Users → Add User から以下のユーザーを作成：

| メールアドレス | パスワード | 役割 | 説明 |
|--------------|-----------|------|------|
| ic@demo.com | password | IC | 指揮本部 |
| tri@demo.com | password | TRI | タッグ付け部隊 |
| trn@demo.com | password | TRN | 搬送部隊 |
| hsp@demo.com | password | HSP | 医療機関 |

#### 3.2 Email確認の無効化（開発環境のみ）

Authentication → Settings → Email Auth から：
- "Enable email confirmations" を **無効化**
- "Enable email change confirmations" を **無効化**

**⚠️ 本番環境では必ず有効化してください**

### 4. Supabase Realtimeの有効化

Database → Replication から：
- `triage_tags` テーブルの Realtime を **有効化**
- `hospitals` テーブルの Realtime を **有効化**

### 5. 動作確認

#### 5.1 ローカル開発サーバー起動
```bash
npm run dev
```

#### 5.2 ログインテスト
1. http://localhost:3000/login にアクセス
2. `ic@demo.com` / `password` でログイン
3. 指揮本部ダッシュボードが表示される

#### 5.3 データ表示確認
- 統計カード: 総数7件
  - 赤: 2件
  - 黄: 2件
  - 緑: 2件
  - 黒: 1件
- 地図: 患者位置マーカー表示
- リスト: 患者詳細表示

#### 5.4 Realtime確認
1. 別のブラウザタブでSupabaseダッシュボードを開く
2. Table Editor → triage_tags でデータを編集
3. ダッシュボードにリアルタイムで反映される（「データ更新」インジケーター表示）

### 6. E2Eテストの実行

```bash
# Playwrightのインストール
npx playwright install

# テスト実行
npm run test:e2e

# レポート表示
npx playwright show-report
```

## トラブルシューティング

### データが表示されない
1. `.env.local` の設定確認
2. Supabase API キーの確認
3. RLSポリシーの確認（一時的に無効化してテスト）

### 認証エラー
1. Supabase Auth 設定確認
2. ユーザーが正しく作成されているか確認
3. Email確認が無効化されているか確認

### Realtimeが動作しない
1. Replicationが有効か確認
2. WebSocket接続の確認（ブラウザDevTools → Network → WS）
3. RLSポリシーが正しく設定されているか確認

### 地図が表示されない
1. Leaflet CSSがインポートされているか確認
2. ブラウザコンソールでエラー確認
3. 位置情報データが存在するか確認

## セキュリティ注意事項

### 本番環境での設定

1. **Email確認を有効化**
   - Authentication → Email Auth → Enable confirmations

2. **RLSポリシーの見直し**
   - 全てのテーブルでRLSを有効化
   - 適切なポリシーを設定

3. **環境変数の保護**
   - `.env.local` をGitにコミットしない
   - `.env.production` で本番用の値を設定

4. **APIキーの管理**
   - `anon key` のみをクライアントで使用
   - `service_role key` は絶対にクライアントに公開しない

## 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase RLS ガイド](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
