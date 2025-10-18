# ログアウト方法

## 各画面からのログアウト

全てのダッシュボード画面の**右上にログアウトボタン**があります。

### 📍 ログアウトボタンの場所

#### 1. 指揮本部ダッシュボード (`/command`)
- ヘッダー右上の**赤いログアウトボタン**をクリック

#### 2. トリアージ入力画面 (`/triage/scan`)
- ヘッダー右上の**赤いログアウトボタン**をクリック

#### 3. 搬送管理画面 (`/transport`)
- ヘッダー右上の**赤いログアウトボタン**をクリック

#### 4. 医療機関ダッシュボード (`/hospital`)
- ヘッダー右上の**赤いログアウトボタン**をクリック

---

## ログアウトの動作

1. **ログアウトボタン**をクリック
2. 確認ダイアログが表示: 「ログアウトしますか？」
3. **OK**をクリック
4. Supabaseからログアウト処理
5. 自動的に**ログイン画面 (`/login`)** にリダイレクト

---

## ログアウトできない場合

### 確認事項

1. **JavaScriptが有効か確認**
   - ブラウザの設定でJavaScriptが無効になっていないか

2. **ネットワーク接続を確認**
   - Supabaseへの接続が必要

3. **ブラウザコンソールでエラー確認**
   - F12 → Console タブでエラーメッセージを確認

### 強制ログアウト方法

上記の方法でログアウトできない場合：

#### 方法A: ブラウザのローカルストレージをクリア
1. F12でDevToolsを開く
2. **Application** タブを選択
3. **Local Storage** → `http://localhost:3000` を選択
4. すべてのキーを削除
5. ページをリロード（F5）

#### 方法B: シークレットモードで開く
- Ctrl+Shift+N（Chrome）または Ctrl+Shift+P（Firefox）
- シークレットウィンドウで http://localhost:3000/login にアクセス

#### 方法C: ブラウザのキャッシュをクリア
- Ctrl+Shift+Delete
- 「Cookieとサイトデータ」を選択
- クリア実行

---

## セキュリティに関する注意

### 自動ログアウト

現在のバージョンでは**自動ログアウト機能はありません**。
セッションはSupabaseのデフォルト設定（通常24時間）で維持されます。

### セッション有効期限

- Supabase Authのデフォルト: **24時間**
- 期限切れ後は自動的にログイン画面にリダイレクト

### セキュリティ推奨事項

1. **共有PCでの使用後は必ずログアウト**
2. **ブラウザを閉じる前にログアウト**
3. **長時間離席する場合はログアウト**

---

## 開発者向け情報

### ログアウト処理の実装

**ファイル**: `lib/auth/logout.ts`

```typescript
import { createClient } from '@/lib/supabase/client'

export async function logout() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Logout error:', error)
    throw error
  }

  // ログインページにリダイレクト
  window.location.href = '/login'
}
```

**コンポーネント**: `components/LogoutButton.tsx`

- 確認ダイアログ表示
- ローディング状態管理
- エラーハンドリング

### カスタマイズ

自動ログアウト機能を追加する場合：

```typescript
// useIdleTimer フックの例
import { useEffect } from 'react'

export function useIdleTimer(timeout: number, onIdle: () => void) {
  useEffect(() => {
    let timer: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(onIdle, timeout)
    }

    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)

    resetTimer()

    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
    }
  }, [timeout, onIdle])
}

// 使用例: 30分後に自動ログアウト
useIdleTimer(30 * 60 * 1000, logout)
```

---

## トラブルシューティング

### 問題: ログアウト後もダッシュボードが表示される

**原因**: ミドルウェアの認証チェックが動作していない

**解決方法**:
1. `.env.local` の設定を確認
2. 開発サーバーを再起動
3. ブラウザのキャッシュをクリア

### 問題: 「ログアウトに失敗しました」エラー

**原因**: Supabase接続エラー

**解決方法**:
1. ネットワーク接続を確認
2. Supabaseダッシュボードでプロジェクトが稼働中か確認
3. 環境変数が正しいか確認

### 問題: ログアウト後に再ログインできない

**原因**: セッションの残骸

**解決方法**:
1. ブラウザを完全に閉じる
2. 再度開いてログイン
3. それでもダメならローカルストレージをクリア

---

## 関連ドキュメント

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 一般的なトラブルシューティング
- [supabase/README.md](./supabase/README.md) - Supabaseセットアップガイド
- [Supabase Auth公式ドキュメント](https://supabase.com/docs/guides/auth)
