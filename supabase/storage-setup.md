# Supabase Storage 設定手順

画像アップロード機能で使用するSupabase Storageの設定手順です。

---

## 1. Storageバケットの作成

Supabaseダッシュボードで以下の操作を行ってください：

### 手順

1. Supabaseダッシュボード（https://app.supabase.com）にログイン
2. プロジェクトを選択
3. 左メニューから **Storage** をクリック
4. **New bucket** ボタンをクリック
5. 以下の設定でバケットを作成：

```
Name: triage-images
Public bucket: ON （チェックを入れる）
```

6. **Create bucket** をクリック

---

## 2. Storageポリシーの設定

作成したバケットにアクセス権限を設定します。

### アップロード権限（INSERT）

```sql
-- 認証済みユーザーが画像をアップロードできるようにする
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'triage-images'
);
```

### 読み取り権限（SELECT）

```sql
-- 誰でも画像を閲覧できるようにする（公開バケット）
CREATE POLICY "Allow public to read images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'triage-images'
);
```

### 削除権限（DELETE）

```sql
-- 認証済みユーザーが自分のアップロードした画像を削除できるようにする
CREATE POLICY "Allow authenticated users to delete their images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'triage-images'
);
```

---

## 3. SQL Editorで実行

Supabaseダッシュボードで以下の操作を行ってください：

1. 左メニューから **SQL Editor** をクリック
2. **New query** をクリック
3. 上記の3つのポリシーをコピー&ペーストして実行

---

## 4. 設定の確認

### バケットの確認

1. **Storage** → **triage-images** をクリック
2. バケットが作成されていることを確認

### ポリシーの確認

1. **Storage** → **Policies** タブをクリック
2. 以下の3つのポリシーが表示されていることを確認：
   - Allow authenticated users to upload images
   - Allow public to read images
   - Allow authenticated users to delete their images

---

## 5. テストアップロード

### ブラウザでテスト

1. トリアージ入力画面（/triage/scan）にアクセス
2. ステップ4（患者情報入力）まで進む
3. 「📷 画像アップロード」セクションで画像を選択
4. アップロードが成功することを確認

### エラーが出る場合

**エラー: "new row violates row-level security policy"**
→ ポリシーが正しく設定されていません。上記のSQLを再度実行してください。

**エラー: "Bucket not found"**
→ バケット名が間違っています。バケット名が `triage-images` であることを確認してください。

**エラー: "Permission denied"**
→ 認証されていません。ログイン状態を確認してください。

---

## 6. ストレージ容量の確認

Supabaseの無料プランでは以下の制限があります：

- **ストレージ容量**: 1 GB
- **転送量**: 2 GB/月

### 容量の確認方法

1. Supabaseダッシュボード → **Settings** → **Usage**
2. Storage使用量を確認

---

## 完了

これでSupabase Storageの設定は完了です。
画像アップロード機能が正常に動作することを確認してください。
