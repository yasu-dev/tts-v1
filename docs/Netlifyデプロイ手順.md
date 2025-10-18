# Netlify デプロイ手順

タブレットからトリアージ入力画面にアクセスできるよう、NetlifyでTTSをホスティングする手順です。

---

## ⚠️ 重要：環境変数の設定が必須です

Netlifyへのデプロイ前に、必ずSupabaseの環境変数を設定してください。

---

## 📋 事前準備

### 1. Supabase プロジェクト情報の確認

1. **Supabase Dashboardにアクセス**
   - https://supabase.com/dashboard

2. **プロジェクトを選択**

3. **API設定を開く**
   - 左メニュー → 「Settings」→「API」

4. **必要な情報をコピー**
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` （長い文字列）

---

## 🚀 Netlifyデプロイ手順

### ステップ1: Netlifyにプロジェクトをデプロイ

1. **Netlifyにログイン**
   - https://app.netlify.com/

2. **GitHubリポジトリと連携**
   - 「Add new site」→「Import an existing project」
   - GitHubを選択
   - `yasu-dev/tts-v1` リポジトリを選択

3. **ビルド設定**（自動で設定されているはず）
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Base directory**: （空欄）

4. **⚠️ まだデプロイしない**
   - 先に環境変数を設定します

---

### ステップ2: Netlify環境変数の設定（重要）

1. **Netlify Site Dashboardで設定**
   - デプロイしたサイトを選択
   - 「Site configuration」→「Environment variables」

2. **環境変数を追加**

   **追加する環境変数（2つ）:**

   | Key | Value | 例 |
   |-----|-------|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabaseプロジェクトのurl | `https://xxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseの anon public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

3. **環境変数を追加する手順**
   - 「Add a variable」ボタンをクリック
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Supabaseの Project URL を貼り付け
   - **Scopes**: すべてチェック（All scopes）
   - 「Create variable」をクリック

   - 同じ手順で `NEXT_PUBLIC_SUPABASE_ANON_KEY` も追加

4. **環境変数が正しく設定されたか確認**
   - 環境変数リストに2つの変数が表示されていることを確認

---

### ステップ3: デプロイの実行

#### 方法A: Netlify Dashboardから再デプロイ

1. **「Deploys」タブを開く**

2. **「Trigger deploy」→「Clear cache and deploy site」**
   - これにより、環境変数を使って再ビルドされます

3. **デプロイの進行状況を確認**
   - 「Building」→「Processing」→「Published」となれば成功

4. **デプロイログを確認**
   - 緑色のチェックマーク「Published」が表示されればOK
   - エラーがある場合は、ログを確認

#### 方法B: GitHubにプッシュして自動デプロイ

```bash
git add .
git commit -m "fix: Netlify deployment configuration"
git push origin main
```

Netlifyが自動的にビルド＆デプロイを開始します。

---

### ステップ4: デプロイ確認

1. **Netlify Site URLにアクセス**
   - 例: `https://your-site-name.netlify.app`

2. **ログイン画面が表示されることを確認**

3. **ログインテスト**
   ```
   Email: tri@demo.com
   Password: password
   ```

4. **トリアージ入力画面にアクセス**
   - URL: `https://your-site-name.netlify.app/triage/scan`

5. **タブレットからアクセステスト**
   - タブレットのブラウザでNetlify URLを開く
   - ログインできることを確認
   - トリアージ入力画面が正しく表示されることを確認

---

## 🔧 カスタムドメインの設定（オプション）

### 独自ドメインを使う場合

1. **Netlify Dashboard → Domain management**

2. **「Add domain」をクリック**
   - 自分のドメイン（例: `tts.example.com`）を入力

3. **DNS設定**
   - ドメインレジストラでCNAMEレコードを追加
   - `tts` → `your-site-name.netlify.app`

4. **HTTPS証明書**
   - Netlifyが自動的にLet's Encrypt証明書を発行

---

## 📱 タブレットでの使用方法

### トリアージ担当者用

1. **タブレットでNetlify URLにアクセス**
   ```
   https://your-site-name.netlify.app/triage/scan
   ```

2. **ログイン**
   ```
   Email: tri@demo.com
   Password: password
   ```

3. **トリアージ入力開始**
   - QRコードスキャンまたは手動入力
   - START法トリアージ実施
   - 患者情報登録

4. **リアルタイム同期**
   - 登録した患者情報が即座に指揮本部ダッシュボードに反映

---

## ⚠️ トラブルシューティング

### エラー: Supabase環境変数が設定されていない

**症状:**
```
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

**解決方法:**
1. Netlify Dashboard → Site configuration → Environment variables
2. `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されているか確認
3. 設定されていない場合は追加
4. 再デプロイ（Trigger deploy → Clear cache and deploy site）

---

### エラー: ページが404になる

**症状:**
- `/triage/scan` にアクセスすると404

**解決方法:**
1. Netlifyのビルドログを確認
2. Next.js のビルドが成功しているか確認
3. `_redirects` ファイルまたは `netlify.toml` の設定を確認

---

### エラー: Metadata警告が多数表示

**症状:**
```
Unsupported metadata themeColor is configured in metadata export
Unsupported metadata viewport is configured in metadata export
```

**解決方法:**
- これは警告であり、デプロイには影響しません
- ビルドが成功すれば問題ありません
- （オプション）Next.js 14の推奨に従い、metadata を viewport export に移行

---

### タブレットで画面が崩れる

**症状:**
- レイアウトが乱れる
- ボタンが押せない

**解決方法:**
1. ブラウザのキャッシュをクリア
2. ページをリロード
3. 別のブラウザで試す（Chrome、Safari、Edgeなど）

---

### 位置情報が取得できない

**症状:**
- GPS位置情報が取得できない

**解決方法:**
1. **HTTPSが必須**
   - Netlifyは自動的にHTTPSを有効化
   - カスタムドメインを使う場合も証明書が自動発行される

2. **ブラウザの位置情報許可**
   - タブレットのブラウザ設定で位置情報を許可

3. **タブレットの位置情報サービス**
   - デバイスの設定で位置情報サービスが有効になっているか確認

---

## 📊 デプロイ後の確認項目

### ✅ チェックリスト

- [ ] Netlifyでサイトが正常にデプロイされた
- [ ] 環境変数が正しく設定されている
- [ ] ログイン画面が表示される
- [ ] ログインできる（tri@demo.com / password）
- [ ] トリアージ入力画面が表示される
- [ ] タブレットからアクセスできる
- [ ] 位置情報が取得できる
- [ ] QRスキャンが機能する（カメラ許可が必要）
- [ ] 患者登録ができる
- [ ] 指揮本部ダッシュボードにリアルタイム反映される

---

## 🔐 セキュリティ設定（推奨）

### 1. Basic認証の追加（オプション）

デモ環境で不特定多数のアクセスを防ぐ場合：

1. **Netlify Dashboard → Site configuration → Visitor access**
2. **「Enable password protection」**
3. パスワードを設定
4. タブレットユーザーに共有

### 2. IP制限（オプション）

特定のIPアドレスからのみアクセス可能にする場合：
- Netlify Enterpriseプランが必要

---

## 📈 パフォーマンス最適化

### 1. CDN活用

Netlifyは自動的にCDNでホスティングされます。
- 世界中から高速アクセス可能
- 自動キャッシング

### 2. Edge Functionsの活用（将来）

- Supabaseとの通信をEdge Functionで最適化
- レスポンス時間の短縮

---

## 💰 Netlifyの料金プラン

### Free プラン（現在使用中）
- **ビルド時間**: 300分/月
- **帯域幅**: 100GB/月
- **同時ビルド**: 1
- **チームメンバー**: 1人

このプロジェクトの想定では、Freeプランで十分です。

### 使用量の確認

1. **Netlify Dashboard → Usage**
2. ビルド時間と帯域幅を確認
3. 上限に近づいたら通知が来る

---

## 🔄 継続的デプロイ（CI/CD）

GitHubにプッシュすると自動的にデプロイされます。

### デプロイフロー

```
コード変更
   ↓
git push origin main
   ↓
Netlifyが自動検知
   ↓
ビルド開始
   ↓
テスト実行（設定した場合）
   ↓
デプロイ完了
   ↓
本番環境に反映
```

### ブランチデプロイ

開発ブランチも自動でプレビュー環境が作成されます：
- `feature/xxx` ブランチ → `feature-xxx--your-site.netlify.app`
- テスト環境として活用可能

---

## 📚 関連ドキュメント

- [Netlify公式ドキュメント](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/overview/)
- [Supabase環境変数](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

---

## 🆘 サポート

### 問題が解決しない場合

1. **Netlifyビルドログを確認**
   - Deploys → 最新のデプロイ → View logs

2. **Supabase接続を確認**
   - Supabase Dashboard → Project → API settings

3. **GitHubにIssueを作成**
   - https://github.com/yasu-dev/tts-v1/issues

---

## 📝 次のステップ

1. ✅ Netlifyデプロイ完了
2. ✅ タブレットからアクセス確認
3. Supabaseにデモデータを投入
4. 実際のトリアージフローをテスト
5. ユーザーフィードバック収集
6. 必要に応じて機能改善

---

作成日: 2025-10-18
更新日: 2025-10-18
