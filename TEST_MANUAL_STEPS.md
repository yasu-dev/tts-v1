# ピッキング完了 → 出荷管理画面表示テスト手順

## テスト手順

1. **在庫管理画面を開く**
   - URL: http://localhost:3002/staff/inventory
   - 「棚保管」タブをクリック

2. **商品を選択してピッキング完了**
   - 任意の商品（例：TESTカメラN、TESTカメラL など）のチェックボックスをチェック
   - 「選択商品をピッキング完了」ボタンをクリック
   - 確認ダイアログで「確認」をクリック

3. **出荷管理画面で確認**
   - URL: http://localhost:3002/staff/shipping
   - 「梱包待ち」タブをクリック
   - ピッキング完了した商品が表示されることを確認

## 修正内容

1. **app/api/picking/route.ts:298**
   - ピッキング完了時のステータスを `shipping` から `workstation` に変更

2. **app/api/picking/route.ts:322-387**
   - Shipmentレコードの作成・更新処理を追加
   - ピッキング完了時に、既存のShipmentがあれば `workstation` ステータスに更新
   - Shipmentがない場合は新規作成（ステータス: `workstation`）

## 期待される結果

- ピッキング完了後、商品が出荷管理画面の「梱包待ち」タブに表示される
- ステータスが `workstation` として正しく記録される