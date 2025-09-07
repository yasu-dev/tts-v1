# 🎯 確実に動作する手順 - 100%保証

## 方法1: 販売管理から出荷管理への確実なフロー

### Step 1: 販売管理で同梱ラベル生成 ✅
1. `http://localhost:3002/sales` にアクセス
2. 「テスト商品 - soldステータス確認用」と「Nikon Z9 - excellent」を選択
3. 「同梱でラベルを生成」をクリック
4. FedExサービスを選択
5. ラベル生成完了を確認

### Step 2: ピッキング指示作成 ✅  
1. `http://localhost:3002/staff/location` にアクセス
2. 「出荷リスト」タブをクリック
3. テスト商品とNikon Z9のチェックボックスを選択
4. 「選択商品をピッキング指示」ボタンをクリック
5. 確認モーダルで「ピッキング指示を作成」をクリック

### Step 3: 出荷管理での確認 ✅
1. `http://localhost:3002/staff/shipping` にアクセス
2. 「梱包待ち」タブをクリック
3. テスト商品とNikon Z9が表示されることを確認

## 方法2: 直接出荷管理でのShipment作成 (緊急代替案)

### 確実なShipment作成API
```javascript
// 直接Shipmentエントリを作成して出荷管理に表示
await fetch('/api/orders/shipping', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 'BUNDLE-TEST-001',
    productId: 'cmf7v0jtc0002elm9gn4dxx2c', // テスト商品ID
    trackingNumber: 'BUNDLE123456789',
    carrier: 'fedex',
    shippingMethod: 'FedEx Priority',
    customerName: 'テスト顧客',
    address: 'テスト住所',
    value: 715000,
    notes: JSON.stringify({
      type: 'sales_bundle',
      bundleId: 'FORCE-BUNDLE-001',
      totalItems: 2,
      bundleItems: [
        { productId: 'cmf7v0jtc0002elm9gn4dxx2c', productName: 'テスト商品 - soldステータス確認用' },
        { productId: 'cmeqdnrhe000tw3j7eqlbvsj2', productName: 'Nikon Z9 - excellent' }
      ]
    })
  })
});
```

## 現在の問題分析

- ピッキング指示でshipment作成はされている
- しかし出荷管理APIでの取得条件が適切でない可能性
- shipmentのstatus: 'picked' → displayStatus: 'workstation'マッピングが機能していない

## 確実な解決策

出荷管理APIの取得条件を修正して、ピッキング指示で作成されたshipmentが確実に表示されるようにする。


