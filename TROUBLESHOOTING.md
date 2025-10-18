# トラブルシューティングガイド

## エラー解決手順

### 🔴 Supabase認証エラー（400 Bad Request）

**エラーメッセージ**:
```
knjrlbrdevrfjlbhpjsk.supabase.co/auth/v1/token?grant_type=password:1
Failed to load resource: the server responded with a status of 400 ()
```

**原因**:
1. Supabaseにデモユーザーが作成されていない
2. Email確認が有効になっている
3. 環境変数が間違っている

**解決方法**:

#### ステップ1: 環境変数の確認

`.env.local` ファイルが存在し、正しく設定されているか確認：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

- Supabaseダッシュボード → Settings → API から取得
- ファイルが `.env.local` という名前か確認（`.env` ではない）
- 値にスペースや引用符がないか確認

#### ステップ2: Supabaseでユーザーを作成

**方法A: Dashboard UIで作成（推奨）**

1. Supabaseダッシュボードを開く
2. **Authentication** → **Users** をクリック
3. **Add User** ボタンをクリック
4. 以下の情報で4つのユーザーを作成：

| Email | Password | 設定 |
|-------|----------|------|
| `ic@demo.com` | `password` | ✅ Auto Confirm User |
| `tri@demo.com` | `password` | ✅ Auto Confirm User |
| `trn@demo.com` | `password` | ✅ Auto Confirm User |
| `hsp@demo.com` | `password` | ✅ Auto Confirm User |

**重要**: "Auto Confirm User" に必ずチェックを入れる

**方法B: SQLで作成**

1. Supabaseダッシュボード → **SQL Editor**
2. `supabase/create-demo-users.sql` の内容を実行
3. 成功したか確認クエリを実行：
```sql
SELECT email, email_confirmed_at
FROM auth.users
WHERE email LIKE '%@demo.com';
```

#### ステップ3: Email確認を無効化（開発環境のみ）

1. **Authentication** → **Settings**
2. **Email Auth** セクション
3. 以下を無効化：
   - ☐ Enable email confirmations
   - ☐ Enable email change confirmations
4. **Save** をクリック

#### ステップ4: 開発サーバーを再起動

```bash
# サーバーを停止（Ctrl+C）
# 再起動
npm run dev
```

#### ステップ5: ログインテスト

1. http://localhost:3000/login にアクセス
2. `ic@demo.com` / `password` でログイン
3. `/command` にリダイレクトされるか確認

---

### ⚠️ manifest.json 404エラー

**エラーメッセージ**:
```
manifest.json:1 Failed to load resource: the server responded with a status of 404
```

**原因**: PWAマニフェストファイルが存在しない

**解決方法**:
- ✅ 既に `public/manifest.json` を作成済み
- 開発サーバーを再起動すると解消されます

---

### 🟡 Chrome拡張機能の警告

**エラーメッセージ**:
```
Unchecked runtime.lastError: No tab with id: 1204101436
Mapify:warn Element not found for selector: 'mapify-window'
```

**原因**: ブラウザ拡張機能（Mapifyなど）の内部エラー

**解決方法**:
- ✅ 無視して問題ありません
- アプリの動作には影響しません
- 気になる場合は拡張機能を無効化

---

## その他の一般的な問題

### データが表示されない

**確認事項**:
1. デモデータが投入されているか
   ```sql
   SELECT COUNT(*) FROM triage_tags;
   SELECT COUNT(*) FROM hospitals;
   ```
2. RLSポリシーが正しく設定されているか
3. 一時的にRLSを無効化してテスト：
   ```sql
   ALTER TABLE triage_tags DISABLE ROW LEVEL SECURITY;
   ```

### 地図が表示されない

**確認事項**:
1. Leaflet CSSが読み込まれているか（ブラウザDevTools → Network）
2. 位置情報データが存在するか
   ```sql
   SELECT tag_number, location
   FROM triage_tags
   WHERE location IS NOT NULL;
   ```
3. ブラウザコンソールでJavaScriptエラーを確認

### Realtimeが動作しない

**確認事項**:
1. Supabase Replicationが有効か
   - Database → Replication → triage_tags を確認
2. WebSocket接続を確認
   - ブラウザDevTools → Network → WS タブ
   - `wss://` で始まる接続があるか確認
3. RLSポリシーでSELECT権限があるか確認

### ログインできない

**確認事項**:
1. ユーザーが存在するか
   ```sql
   SELECT email, email_confirmed_at
   FROM auth.users
   WHERE email = 'ic@demo.com';
   ```
2. Email確認が完了しているか（`email_confirmed_at` が NULL でない）
3. パスワードが正しいか（デモは全て `password`）

---

## デバッグ方法

### 1. ブラウザDevToolsでネットワークを確認

1. F12 でDevToolsを開く
2. **Network** タブを選択
3. ログインボタンをクリック
4. 失敗したリクエストを確認：
   - Status Code（200 = 成功、400/401 = 認証エラー）
   - Response（エラーメッセージ）

### 2. Supabase Logsを確認

1. Supabaseダッシュボード
2. **Logs** → **Auth Logs**
3. 最近のログイン試行を確認

### 3. コンソールログを確認

ブラウザのコンソール（F12 → Console）でエラーメッセージを確認

---

## よくある質問

**Q: パスワードを変更したい**
A: Supabaseダッシュボード → Authentication → Users → 該当ユーザー → Reset Password

**Q: 本番環境にデプロイしたい**
A:
1. Vercel/Netlifyにデプロイ
2. 環境変数を設定
3. Email確認を有効化
4. 強固なパスワードに変更

**Q: RLSポリシーを無効化したい（テスト用）**
A:
```sql
ALTER TABLE triage_tags DISABLE ROW LEVEL SECURITY;
```
**⚠️ 本番環境では絶対に実行しないでください**

---

## サポート

問題が解決しない場合：
1. Supabaseの公式ドキュメントを確認
2. GitHub Issuesで報告
3. Supabase Discordコミュニティで質問
