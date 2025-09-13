# ロケーション管理機能実装計画書

## 🎯 概要
ロケーション管理の棚の追加・削除・編集機能実装について、レベルダウンリスクを最小化した安全な実装方針をまとめた技術仕様書。

**⚠️ 重要**: この機能はレベルダウンリスクが100％確実でないと取り返しが付かないため、必ず段階的に実装すること。

## 📋 調査済み現状

### 主要ファイル構成
```
app/staff/location/page.tsx                        - メイン画面
app/components/features/location/LocationList.tsx  - 一覧表示・削除UI
app/components/features/location/LocationRegistration.tsx - 登録機能
app/api/locations/route.ts                        - GET/POST/PUT（削除未実装）
app/api/locations/[id]/route.ts                   - 個別取得のみ
prisma/schema.prisma                               - DB設計
```

### データベース構造（重要な関係性）
```sql
model Location {
  id              String              @id @default(cuid())
  code            String              @unique  -- 削除時要注意
  name            String
  zone            String              -- 変更時要注意
  capacity        Int?                -- 減少時要注意
  isActive        Boolean             @default(true)
  products        Product[]           -- 💥 外部キー制約
  movementsTo     InventoryMovement[] -- 💥 履歴破綻リスク
  movementsFrom   InventoryMovement[] -- 💥 履歴破綻リスク
}

model Product {
  currentLocationId  String?          -- 💥 孤立化リスク
  currentLocation    Location?        @relation(fields: [currentLocationId], references: [id])
}

model InventoryMovement {
  fromLocationId String?             -- 💥 履歴破綻リスク
  toLocationId   String?             -- 💥 履歴破綻リスク
}
```

## 🚨 特定済みレベルダウンリスク

### 1. 削除時のリスク（最高危険度）
- **外部キー制約違反**: Product.currentLocationId孤立化
- **履歴破綻**: InventoryMovement参照エラー
- **ピッキング停止**: 作業現場完全停止
- **商品紛失**: 物理的な商品所在不明

### 2. 編集時のリスク（高危険度）
- **容量減少**: 現在商品数を下回る容量設定
- **zone変更**: 商品存在下でのzone変更
- **code変更**: 既存参照の破綻

### 3. UI操作のリスク（中危険度）
- **誤操作**: 確認不十分での削除
- **競合状態**: 同時編集による不整合

## ✅ 必須実装事項（実装順序厳守）

### Phase 1: 基盤整備（削除前必須）

#### 1.1 削除前検証システム
```typescript
// app/api/locations/validation.ts (新規作成)
export async function validateLocationDeletion(locationId: string) {
  // 必須チェック項目
  const checks = {
    productCount: await prisma.product.count({ where: { currentLocationId: locationId } }),
    movementHistory: await prisma.inventoryMovement.count({
      where: { OR: [{ fromLocationId: locationId }, { toLocationId: locationId }] }
    }),
    activePickingTasks: await checkActivePickingTasks(locationId),
    activeInspections: await checkActiveInspections(locationId)
  };

  return {
    canDelete: checks.productCount === 0 && checks.activePickingTasks === 0,
    risks: generateRiskReport(checks)
  };
}
```

#### 1.2 安全削除API実装
```typescript
// app/api/locations/route.ts に追加
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  // 1. 事前検証（必須）
  const validation = await validateLocationDeletion(locationId);
  if (!validation.canDelete) {
    return NextResponse.json({ error: validation.risks }, { status: 400 });
  }

  // 2. 論理削除（物理削除禁止）
  const result = await prisma.location.update({
    where: { code },
    data: { isActive: false }
  });

  // 3. Activity記録（必須）
  await prisma.activity.create({
    data: {
      type: 'location_delete',
      description: `ロケーション ${code} が削除されました`,
      userId: user.id,
      metadata: JSON.stringify(validation)
    }
  });

  return NextResponse.json({ success: true });
}
```

#### 1.3 編集制限システム
```typescript
// app/api/locations/route.ts PUTメソッド修正
export async function PUT(request: NextRequest) {
  const { capacity, zone, code } = body;
  const existing = await prisma.location.findUnique({ where: { id } });

  // 容量削減制限
  if (capacity < existing.capacity) {
    const currentProductCount = await prisma.product.count({
      where: { currentLocationId: id }
    });
    if (capacity < currentProductCount) {
      return NextResponse.json({
        error: `容量を${currentProductCount}未満に設定できません（現在商品数: ${currentProductCount}）`
      }, { status: 400 });
    }
  }

  // zone変更制限
  if (zone !== existing.zone) {
    const hasProducts = await prisma.product.count({
      where: { currentLocationId: id }
    }) > 0;
    if (hasProducts) {
      return NextResponse.json({
        error: '商品が存在する間はzoneを変更できません'
      }, { status: 400 });
    }
  }

  // code変更禁止
  if (code !== existing.code) {
    return NextResponse.json({
      error: 'ロケーションコードは変更できません'
    }, { status: 400 });
  }

  // 更新処理
}
```

### Phase 2: UI安全化

#### 2.1 削除確認強化
```typescript
// app/components/features/location/LocationList.tsx 修正
const handleDeleteLocation = async (locationCode: string) => {
  // 1. 事前検証取得
  const validation = await fetch(`/api/locations/validate?code=${locationCode}`);
  const result = await validation.json();

  if (!result.canDelete) {
    showToast({
      type: 'error',
      title: '削除できません',
      message: result.risks.join('\n')
    });
    return;
  }

  // 2. 3段階確認
  const confirmed = await showTripleConfirmation({
    title: '⚠️ ロケーション削除の確認',
    message: `ロケーション ${locationCode} を削除します`,
    risks: result.risks,
    requireTypeConfirmation: 'REMOVE'
  });

  if (confirmed) {
    // 削除実行
  }
};
```

#### 2.2 編集時安全ガード
```typescript
// リアルタイム検証機能
const [editValidation, setEditValidation] = useState(null);

useEffect(() => {
  if (editingLocation) {
    validateLocationEdit(editingLocation).then(setEditValidation);
  }
}, [editingLocation]);

// 警告表示
{editValidation?.warnings.map(warning => (
  <div key={warning.type} className="alert-warning">
    {warning.message}
  </div>
))}
```

### Phase 3: 運用安全策

#### 3.1 バックアップシステム
```typescript
// 削除・編集前自動バックアップ
const createLocationBackup = async (locationId: string) => {
  const backup = await prisma.location.findUnique({
    where: { id: locationId },
    include: { products: true, movementsTo: true, movementsFrom: true }
  });

  // バックアップファイル作成
  await fs.writeFile(
    `backups/location_${locationId}_${Date.now()}.json`,
    JSON.stringify(backup, null, 2)
  );
};
```

#### 3.2 権限管理強化
```typescript
// 削除権限をadminに制限
export async function DELETE(request: NextRequest) {
  const user = await AuthService.requireRole(request, ['admin']); // staffを除外
  if (!user) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }
  // 削除処理
}
```

## 🗂️ 実装必須ファイル

### 新規作成が必要
```
app/api/locations/validate/route.ts        - 削除前検証API
app/api/locations/backup/route.ts          - バックアップAPI
app/components/ui/TripleConfirmModal.tsx   - 3段階確認モーダル
lib/utils/location-validation.ts           - 検証ロジック
lib/utils/location-backup.ts               - バックアップロジック
```

### 修正が必要
```
app/api/locations/route.ts                 - DELETE/PUT メソッド追加・修正
app/components/features/location/LocationList.tsx - 削除確認強化
prisma/schema.prisma                       - 必要に応じて制約追加
```

## 🎯 実装順序（厳守）

1. **Phase 1.1**: 削除前検証システム
2. **Phase 1.2**: 論理削除API（物理削除禁止）
3. **Phase 1.3**: 編集制限システム
4. **Phase 2.1**: UI安全化
5. **Phase 2.2**: リアルタイム検証
6. **Phase 3.1**: バックアップシステム
7. **Phase 3.2**: 権限管理
8. **最終**: 十分なテスト後に物理削除（オプション）

## ❌ 絶対禁止事項

- いきなり物理削除機能の実装
- 検証なしでの削除API実装
- UI側での削除確認のみに依存
- 商品が存在するロケーションの削除
- 履歴が存在するロケーションの物理削除

## 🧪 テスト要件

### 必須テストケース
1. 商品が存在するロケーションの削除試行
2. 履歴が存在するロケーションの削除試行
3. 容量を現在商品数未満に変更試行
4. 商品存在下でのzone変更試行
5. 同時編集での競合状態
6. 権限なしユーザーでの削除試行

### テスト環境での検証項目
- データベース整合性の確認
- 外部キー制約の動作確認
- ピッキング作業への影響確認
- バックアップ・復旧の動作確認

## 📞 緊急時対応

### 削除失敗時の対応
1. バックアップからの復旧
2. 手動でのisActive=trueに戻す
3. 影響範囲の調査と修復

### システム停止時の対応
1. 即座にロールバック
2. バックアップDBへの切り替え
3. 手動でのデータ修復

---
**作成日**: 2025-09-14
**最終更新**: 2025-09-14
**重要度**: 🔴 最高
**実装予定**: Phase分けして段階実装