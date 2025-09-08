# ⚠️ テスト/デモ用ステータス遷移機能

**警告: この機能はテスト・デモ専用です。本番環境では必ず削除してください。**

## 概要

この機能は、実際のeBay購入なしで商品ステータスを「出品中」から「購入者決定」に手動で遷移させることを可能にするテスト・デモ専用機能です。

## 実装内容

### 1. APIエンドポイント
- **ファイル**: `app/api/test/status-transition/route.ts`
- **機能**: 
  - POST: ステータス遷移実行（listing ↔ sold）
  - DELETE: テスト用データリセット

### 2. UIコンポーネント
- **ファイル**: `app/sales/page.tsx`
- **機能**: 
  - 警告バナー表示
  - テスト機能の開閉UI
  - 商品別ステータス遷移ボタン
  - リセット機能

### 3. E2Eテスト
- **ファイル**: `e2e/test-status-transition.spec.ts`
- **機能**: テスト機能の動作確認

## 使用方法

1. **販売管理画面にアクセス**: `/sales`
2. **警告バナーの確認**: 画面上部にテスト機能の警告が表示される
3. **テスト機能を開く**: 「テスト機能を開く」ボタンをクリック
4. **ステータス遷移**: 
   - 出品中商品 → 「→ 購入者決定」ボタンでsoldに変更
   - 購入者決定商品 → 「→ 出品中」ボタンでlistingに戻す
   - テスト用データ削除 → 「リセット」ボタンで初期状態に戻す

## 機能詳細

### ステータス遷移
```typescript
// 許可された遷移
listing → sold   // 出品中 → 購入者決定
sold → listing   // 購入者決定 → 出品中（テスト用）
```

### モック注文作成
`sold`への遷移時、以下のテスト用データが自動生成されます：
- モック顧客（test@example.com）
- モック注文（TEST-xxxxxxxxx-xxxx形式）
- 注文アイテム

### アクティビティログ
全てのテスト操作はアクティビティログに記録され、`isTestFeature: true`フラグで識別可能です。

## 本番環境での削除手順

### 1. ファイル削除
```bash
# APIエンドポイント
rm app/api/test/status-transition/route.ts

# E2Eテスト
rm e2e/test-status-transition.spec.ts

# ドキュメント
rm docs/TEST_FEATURE_STATUS_TRANSITION.md
```

### 2. コード修正

**app/sales/page.tsx の修正箇所**:

#### 削除するstate定義
```typescript
// ⚠️ TEST/DEMO FEATURE - DELETE BEFORE PRODUCTION ⚠️
// テスト用ステータス遷移機能
const [isTestFeatureOpen, setIsTestFeatureOpen] = useState(false);
const [testTransitionLoading, setTestTransitionLoading] = useState(false);
```

#### 削除する関数
```typescript
const handleTestStatusTransition = async (...) => { ... };
const handleTestStatusReset = async (...) => { ... };  
const getStatusDisplayName = (status: string): string => { ... };
```

#### 削除するJSX（UIコンポーネント）
```jsx
{/* ⚠️ TEST/DEMO FEATURE - DELETE BEFORE PRODUCTION ⚠️ */}
<div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white shadow-lg">
  {/* テスト機能の全UI */}
</div>
```

### 3. データベースクリーンアップ
```sql
-- テスト用注文削除
DELETE FROM order_items WHERE order_id IN (
  SELECT id FROM orders WHERE order_number LIKE 'TEST-%'
);
DELETE FROM orders WHERE order_number LIKE 'TEST-%';

-- テスト用アクティビティログ削除  
DELETE FROM activities WHERE type IN ('test_status_transition', 'test_status_reset');

-- テスト用顧客削除（必要に応じて）
DELETE FROM users WHERE email = 'test@example.com' AND role = 'customer';
```

### 4. 検索・確認
削除後、以下のキーワードで残存コードがないか確認：
```bash
grep -r "TEST.*DEMO.*FEATURE" --include="*.ts" --include="*.tsx" .
grep -r "test.*status.*transition" --include="*.ts" --include="*.tsx" .
grep -r "handleTestStatus" --include="*.ts" --include="*.tsx" .
grep -r "/api/test" --include="*.ts" --include="*.tsx" .
```

## セキュリティ上の注意

- この機能はスタッフ・管理者ロールのみアクセス可能
- 本番データベースを直接操作するため、本番環境では絶対に残さない
- テスト環境でのみ使用し、定期的にテストデータを削除する

## トラブルシューティング

### よくある問題

1. **商品IDが見つからない**
   - `productId`または`order.id`を正しく渡しているか確認
   - データベースに該当商品が存在するか確認

2. **権限エラー**
   - ログインユーザーがスタッフ・管理者ロールかチェック
   - AuthServiceの設定確認

3. **モック注文作成失敗** 
   - Prismaスキーマの必須フィールド確認
   - 外部キー制約の確認

### ログ確認
```bash
# APIログ
grep "TEST.*ステータス遷移" logs/app.log

# E2Eテストログ  
npm run test:e2e -- --grep "テスト用ステータス遷移"
```

---

**⚠️ 重要: この機能は一時的なテスト・デモ専用です。本番環境に展開する前に必ず削除してください。**

