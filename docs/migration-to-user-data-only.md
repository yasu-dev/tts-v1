# 納品プラン登録データのみへの完全移行計画

## 🎯 最終ゴール
納品プランで登録されたユーザーデータのみでシステムを運用する

## 📊 現状分析

### 現在のデータ構成
- **デモデータ**: 116件の納品プラン（すべてデモユーザー作成）
- **実ユーザーデータ**: 0件の納品プラン
- **ハードコード依存**: ロケーション管理、出荷管理のフォールバック

### 問題点
1. 実ユーザーデータが存在しない
2. ハードコードされたモックデータへの依存
3. デモデータ削除後、システムが空になる

---

## 🚀 段階的移行計画

### Phase 0: 事前準備（1日目）
**目的**: 安全な移行環境の確立

#### ステップ
1. **完全バックアップの作成**
   ```bash
   cp prisma/dev.db prisma/dev.db.original-backup
   cp -r uploads/ uploads-backup/
   ```

2. **現状データのエクスポート**
   ```bash
   npx prisma db pull
   npx prisma generate
   ```

3. **テスト環境の構築**
   ```bash
   cp prisma/dev.db prisma/test.db
   ```

#### 確認項目
- [ ] バックアップファイルの作成確認
- [ ] 復旧手順のドキュメント化
- [ ] ロールバック計画の策定

---

### Phase 1: ハードコード依存の解消（2-3日目）

**目的**: モックデータへの依存を完全に除去

#### ステップ

##### 1-1. ロケーション管理の改修
```typescript
// app/components/features/location/LocationList.tsx
// Before: モックデータ使用
const mockShippingData = [...] // 削除

// After: 実データのみ使用
const response = await fetch('/api/orders/shipping');
if (!response.ok) {
  setShippingData([]); // 空配列を設定
  showToast('データがありません', 'info');
}
```

##### 1-2. 出荷管理フォールバックの改修
```typescript
// app/api/orders/shipping/route.ts
// Before: ハードコードIDとフォールバック
const guaranteedShipments = [...] // 削除
const fallbackShipments = [...] // 削除

// After: 実データのみ
if (shipments.length === 0) {
  return NextResponse.json({
    items: [],
    message: 'データがありません'
  });
}
```

##### 1-3. その他のモックデータ削除
- `/api/reports/analytics/route.ts`
- `/staff/reports/page.tsx`

#### 確認項目
- [ ] 全画面でエラーが発生しないこと
- [ ] 空データ時の適切なメッセージ表示
- [ ] E2Eテストの通過

---

### Phase 2: サンプルユーザーデータの作成（4-5日目）

**目的**: システム動作確認用の最小限の実データ作成

#### ステップ

##### 2-1. テストユーザーの作成
```typescript
// scripts/create-test-user.ts
const testUser = await prisma.user.create({
  data: {
    email: 'sample@user.com',
    username: 'サンプルユーザー',
    role: 'seller',
    password: hashPassword('password123')
  }
});
```

##### 2-2. サンプル納品プランの作成
```typescript
// scripts/create-sample-delivery-plan.ts
const samplePlan = await prisma.deliveryPlan.create({
  data: {
    planNumber: 'DP-2024-SAMPLE-001',
    sellerId: testUser.id,
    sellerName: testUser.username,
    status: 'pending',
    deliveryAddress: '東京都渋谷区...',
    contactEmail: testUser.email,
    // 商品3-5件を含む現実的なデータ
  }
});
```

##### 2-3. 納品プラン商品の登録
```typescript
// 実際の商品データを作成
const products = [
  { name: 'Canon EOS R5', category: 'カメラ', estimatedValue: 350000 },
  { name: 'Sony FE 24-70mm', category: 'レンズ', estimatedValue: 180000 }
];
```

#### 確認項目
- [ ] 納品プラン作成フローの動作確認
- [ ] 商品の検品→在庫→出品フローの確認
- [ ] 各画面でのデータ表示確認

---

### Phase 3: デモデータの段階的削除（6-7日目）

**目的**: 影響を確認しながらデモデータを削除

#### ステップ

##### 3-1. 未使用デモデータの削除
```sql
-- 未参照のデモユーザー削除
DELETE FROM User 
WHERE email LIKE '%demo%' 
AND id NOT IN (
  SELECT DISTINCT sellerId FROM Product
  UNION SELECT DISTINCT userId FROM DeliveryPlan
);
```

##### 3-2. 孤立データのクリーンアップ
```sql
-- 参照のない商品削除
DELETE FROM Product 
WHERE sellerId NOT IN (SELECT id FROM User);

-- 参照のない出品削除
DELETE FROM Listing 
WHERE productId NOT IN (SELECT id FROM Product);
```

##### 3-3. テストデータの最終削除
```sql
-- すべてのテストユーザーとその関連データ削除
DELETE FROM User 
WHERE email LIKE '%test%' OR email LIKE '%example%';
```

#### 確認項目
- [ ] 削除前後のデータ件数確認
- [ ] 外部キー制約エラーの確認
- [ ] システム動作の継続確認

---

### Phase 4: 実運用データへの完全移行（8-10日目）

**目的**: 実際のユーザーデータのみでの運用開始

#### ステップ

##### 4-1. ユーザー向けデータ登録ガイド作成
```markdown
# 納品プラン作成ガイド
1. ログイン後、「納品管理」へ
2. 「新規納品プラン」をクリック
3. 商品情報を入力...
```

##### 4-2. 初期データ登録サポート
- ユーザーへの操作説明
- 最初の納品プラン作成支援
- トラブルシューティング

##### 4-3. モニタリング体制構築
```typescript
// scripts/monitor-data-health.ts
// データ整合性チェック
// 孤立データ検知
// パフォーマンス監視
```

#### 確認項目
- [ ] ユーザーが独力でデータ登録可能
- [ ] 全機能が実データで動作
- [ ] エラー監視システムの稼働

---

### Phase 5: 最適化と安定化（11-14日目）

**目的**: 実データのみでの安定運用確立

#### ステップ

##### 5-1. パフォーマンス最適化
```typescript
// インデックス追加
await prisma.$executeRaw`
CREATE INDEX idx_delivery_plan_seller 
ON DeliveryPlan(sellerId);
`;
```

##### 5-2. データ検証ツール作成
```typescript
// scripts/validate-data-integrity.ts
// 外部キー整合性チェック
// 必須フィールド検証
// ビジネスルール検証
```

##### 5-3. 自動バックアップ設定
```bash
# cron設定
0 2 * * * cp /path/to/prisma/dev.db /backup/dev.db.$(date +\%Y\%m\%d)
```

#### 確認項目
- [ ] レスポンス時間の改善
- [ ] データ整合性の維持
- [ ] 定期バックアップの動作

---

## 📋 チェックリスト

### 移行前チェック
- [ ] 全データのバックアップ完了
- [ ] ロールバック手順の文書化
- [ ] ステークホルダーへの通知

### 各Phase完了条件
- [ ] Phase 0: バックアップとテスト環境準備
- [ ] Phase 1: ハードコード依存ゼロ
- [ ] Phase 2: サンプルデータでの動作確認
- [ ] Phase 3: デモデータ完全削除
- [ ] Phase 4: 実データのみでの運用開始
- [ ] Phase 5: 安定運用の確立

### 移行後チェック
- [ ] 全画面の動作確認
- [ ] E2Eテスト全項目パス
- [ ] ユーザーからの問題報告なし

---

## ⚠️ リスクと対策

### リスク1: データ喪失
**対策**: 
- 段階的削除
- 複数バックアップ
- ロールバック手順

### リスク2: 機能停止
**対策**:
- 事前のハードコード除去
- 空データ時の適切な処理
- エラーハンドリング強化

### リスク3: ユーザー混乱
**対策**:
- 詳細なガイド作成
- サポート体制構築
- 段階的な移行

---

## 📅 推定スケジュール

| Phase | 期間 | 主要タスク |
|-------|------|-----------|
| Phase 0 | 1日 | バックアップ・準備 |
| Phase 1 | 2日 | ハードコード除去 |
| Phase 2 | 2日 | サンプルデータ作成 |
| Phase 3 | 2日 | デモデータ削除 |
| Phase 4 | 3日 | 実運用開始 |
| Phase 5 | 4日 | 最適化・安定化 |

**合計: 約2週間**

---

## 🎯 成功指標

1. **技術指標**
   - ハードコード依存: 0件
   - デモデータ: 0件
   - 実データのみでの稼働率: 100%

2. **運用指標**
   - エラー発生率: < 1%
   - レスポンス時間: < 500ms
   - データ整合性: 100%

3. **ビジネス指標**
   - ユーザー満足度: 維持または向上
   - システム稼働率: 99.9%以上
   - データ登録成功率: 95%以上

---

## 📝 注意事項

1. **必須作業**
   - 各Phase開始前のバックアップ
   - ステークホルダーへの進捗報告
   - 問題発生時の即座の対応

2. **推奨事項**
   - 週末やメンテナンス時間での作業
   - 段階的な確認と承認
   - ドキュメントの随時更新

3. **禁止事項**
   - バックアップなしでの削除
   - 一括削除の実行
   - 未確認での次Phaseへの移行
