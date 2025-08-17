# SQLite + Prisma から Firebase への移行計画

## 概要
The World Door システムを SQLite + Prisma から Firebase (Authentication + Firestore) へ移行する詳細計画書です。

## 1. 現在のアーキテクチャ

### 技術スタック
- **データベース**: SQLite (ローカルファイル: `prisma/dev.db`)
- **ORM**: Prisma Client
- **認証**: JWT + bcrypt (カスタム実装)
- **セッション管理**: Prismaのsessionsテーブル
- **API**: Next.js App Router

### データモデル（33テーブル）
```
├── ユーザー関連
│   ├── users (ユーザー情報)
│   ├── sessions (セッション管理)
│   └── two_factor_auth (2要素認証)
├── 商品関連
│   ├── products (商品)
│   ├── product_images (商品画像)
│   ├── locations (保管場所)
│   ├── inventory_movements (在庫移動履歴)
│   └── inspection_checklists (検品チェックリスト)
├── 注文関連
│   ├── orders (注文)
│   ├── order_items (注文明細)
│   ├── shipments (出荷)
│   └── returns (返品)
├── その他
│   ├── activities (活動ログ)
│   ├── video_records (動画記録)
│   └── マスターデータ各種
```

## 2. Firebase移行後のアーキテクチャ

### 技術スタック
- **認証**: Firebase Authentication
- **データベース**: Cloud Firestore
- **ファイルストレージ**: Cloud Storage
- **リアルタイム機能**: Firestore リアルタイムリスナー
- **API**: Next.js App Router + Firebase Admin SDK

### データ構造の変換方針

#### コレクション設計
```
firestore/
├── users/ (認証はFirebase Authで管理)
│   └── {userId}/
│       ├── profile (ユーザープロフィール)
│       └── settings (通知設定等)
├── products/
│   └── {productId}/
│       ├── データフィールド
│       ├── images/ (サブコレクション)
│       └── movements/ (サブコレクション)
├── orders/
│   └── {orderId}/
│       ├── データフィールド
│       └── items/ (サブコレクション)
├── activities/
│   └── {activityId}/ (タイムスタンプでソート)
└── locations/
    └── {locationId}/
```

## 3. 主要な変更点

### 3.1 認証システム

#### 現在の実装
```typescript
// lib/auth.ts
- bcrypt.hash() でパスワードハッシュ化
- jwt.sign() でトークン生成
- Prismaでsessionsテーブル管理
- Cookieベースのセッション管理
```

#### Firebase実装
```typescript
// lib/firebase-auth.ts (新規)
- Firebase Authentication でユーザー管理
- Firebase ID Token で認証
- Firebase Admin SDK でサーバーサイド検証
- Firebase Session Cookie (オプション)
```

### 3.2 データアクセス層

#### 現在のPrismaクエリ
```typescript
// 複雑なリレーションを含むクエリ
const products = await prisma.product.findMany({
  where: { status: 'inbound', sellerId: userId },
  include: {
    currentLocation: true,
    seller: true,
    images: { orderBy: { sortOrder: 'asc' } }
  },
  orderBy: { createdAt: 'desc' },
  skip: offset,
  take: limit
});
```

#### Firestoreクエリ
```typescript
// 非正規化とサブコレクションを活用
const productsRef = firestore.collection('products');
const snapshot = await productsRef
  .where('status', '==', 'inbound')
  .where('sellerId', '==', userId)
  .orderBy('createdAt', 'desc')
  .limit(limit)
  .offset(offset)
  .get();

// 関連データは別途取得または非正規化
```

### 3.3 トランザクション処理

#### Prismaトランザクション
```typescript
const result = await prisma.$transaction([
  prisma.product.update({ where: { id }, data: { status: 'ordered' } }),
  prisma.order.create({ data: orderData }),
  prisma.activity.create({ data: activityData })
]);
```

#### Firestoreトランザクション
```typescript
await firestore.runTransaction(async (transaction) => {
  const productRef = firestore.collection('products').doc(id);
  const orderRef = firestore.collection('orders').doc();
  const activityRef = firestore.collection('activities').doc();
  
  transaction.update(productRef, { status: 'ordered' });
  transaction.set(orderRef, orderData);
  transaction.set(activityRef, activityData);
});
```

## 4. 技術的制約と対策

### 4.1 Firestoreの制限事項

| 制限事項 | 影響 | 対策 |
|---------|------|------|
| 複合クエリ制限 | 複数条件での検索が制限される | インデックス設計、非正規化 |
| 集計関数なし | COUNT、SUM等が直接使えない | カウンタードキュメント、Cloud Functions |
| 1ドキュメント1MB | 大量の画像URLやログ保存不可 | サブコレクション化、Cloud Storage活用 |
| トランザクション500ドキュメント | 大量更新が制限される | バッチ処理、分割実行 |

### 4.2 リアルタイム機能の実装

```typescript
// 在庫更新のリアルタイム監視
const unsubscribe = firestore
  .collection('products')
  .where('sellerId', '==', userId)
  .onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'modified') {
        // UIを更新
      }
    });
  });
```

## 5. 移行に必要な作業

### 5.1 新規パッケージのインストール
```json
{
  "dependencies": {
    "firebase": "^10.x",
    "firebase-admin": "^12.x",
    "@firebase/firestore": "^4.x"
  }
}
```

### 5.2 環境変数の設定
```env
# 削除予定
DATABASE_URL="file:./dev.db"
JWT_SECRET="..."
SESSION_SECRET="..."

# 追加予定
FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="..."
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
```

### 5.3 データ移行スクリプト
```typescript
// scripts/migrate-to-firebase.ts
- Prismaからデータ読み込み
- データ構造の変換
- Firestoreへの書き込み
- リレーションの再構築
```

## 6. APIエンドポイントの変更

### 影響を受けるファイル一覧
- `/app/api/**/*.ts` (約50ファイル)
- `/lib/auth.ts` → `/lib/firebase-auth.ts`
- `/lib/database.ts` → `/lib/firebase-admin.ts`
- `/lib/repositories/*.ts` (全リポジトリファイル)
- `/lib/services/*.ts` (全サービスファイル)

### 変更例
```typescript
// Before (Prisma)
export async function GET(request: NextRequest) {
  const products = await prisma.product.findMany({
    where: { status: 'inbound' }
  });
  return NextResponse.json(products);
}

// After (Firestore)
export async function GET(request: NextRequest) {
  const snapshot = await firestore
    .collection('products')
    .where('status', '==', 'inbound')
    .get();
  
  const products = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  return NextResponse.json(products);
}
```

## 7. モノレポでのテスト環境の永続性

### Firebase Emulator Suite を使用した開発環境

#### メリット
1. **ローカル開発環境の完全性**
   - Firestore Emulator
   - Auth Emulator
   - Storage Emulator
   - 完全にローカルで動作

2. **データの永続化オプション**
   ```bash
   # エミュレータデータのエクスポート
   firebase emulators:export ./emulator-data
   
   # エミュレータデータのインポート
   firebase emulators:start --import=./emulator-data
   ```

3. **モノレポ対応**
   ```
   monorepo/
   ├── apps/
   │   ├── web/ (Next.js)
   │   └── admin/ (管理画面)
   ├── packages/
   │   ├── firebase-config/
   │   └── shared-types/
   └── firebase.json (エミュレータ設定)
   ```

#### テスト環境の構成
1. **開発環境**: Firebase Emulator (ローカル)
2. **ステージング環境**: Firebase プロジェクト (staging)
3. **本番環境**: Firebase プロジェクト (production)

### データの永続性保証
- **開発時**: エミュレータのエクスポート/インポート機能
- **CI/CD**: テストデータのシード機能
- **ステージング**: 実際のFirebaseプロジェクト使用

## 8. 移行スケジュール（推定）

| フェーズ | 作業内容 | 期間 |
|---------|---------|------|
| Phase 1 | Firebase環境構築、認証システム移行 | 3-5日 |
| Phase 2 | データモデル設計、移行スクリプト作成 | 5-7日 |
| Phase 3 | APIエンドポイントの書き換え | 10-15日 |
| Phase 4 | リアルタイム機能の実装 | 3-5日 |
| Phase 5 | テスト、デバッグ、最適化 | 5-7日 |
| **合計** | | **26-39日** |

## 9. リスクと対策

### リスク
1. **パフォーマンス低下**: 複雑なクエリの実行
2. **コスト増加**: Firestore の読み取り/書き込み課金
3. **移行中のダウンタイム**: データ移行時の停止

### 対策
1. **インデックス最適化**と**データ非正規化**
2. **キャッシュ戦略**の実装
3. **段階的移行**と**フィーチャーフラグ**の活用

## 10. まとめ

SQLite + Prisma から Firebase への移行により：
- ✅ スケーラブルなアーキテクチャ
- ✅ リアルタイム機能の標準サポート
- ✅ 認証システムの簡素化
- ⚠️ クエリの柔軟性低下
- ⚠️ 運用コストの増加

適切な設計と実装により、これらのトレードオフを最小化できます。