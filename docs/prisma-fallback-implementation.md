# Prismaエラー時のモックデータフォールバック機能実装

## 概要

THE WORLD DOORシステムにPrismaエラー時のモックデータフォールバック機能を実装しました。この機能により、データベース接続エラーやPrismaエラーが発生した場合でも、システムがモックデータを使用して正常に動作し続けることができます。

## 実装されたAPI

### 主要APIエンドポイント

1. **在庫管理API** (`/app/api/inventory/route.ts`)
   - GET: 在庫データの取得
   - POST: 新規商品登録
   - PUT: 商品情報更新
   - DELETE: 商品削除

2. **注文管理API** (`/app/api/orders/route.ts`)
   - GET: 注文データの取得
   - POST: 新規注文作成
   - PUT: 注文情報更新

3. **スタッフダッシュボードAPI** (`/app/api/staff/dashboard/route.ts`)
   - GET: スタッフダッシュボードデータの取得

4. **ダッシュボードAPI** (`/app/api/dashboard/route.ts`)
   - GET: メインダッシュボードデータの取得

5. **ロケーション管理API** (`/app/api/locations/route.ts`)
   - GET: ロケーションデータの取得
   - POST: 新規ロケーション作成
   - PUT: ロケーション情報更新

6. **eBay出品API** (`/app/api/ebay/listing/route.ts`)
   - GET: eBayテンプレート取得
   - POST: eBay出品作成

7. **在庫統計API** (`/app/api/inventory/stats/route.ts`)
   - GET: 在庫統計データの取得

## 機能の特徴

### 1. レベルダウン回避
- 既存の機能は一切変更せず、エラー時のみフォールバック機能が動作
- 正常時は既存のPrismaクエリロジックをそのまま実行
- 機能の劣化や性能低下を防止

### 2. インテリジェントエラー検出
`MockFallback.isPrismaError()` メソッドにより、以下のエラーを検出：
- PrismaClientKnownRequestError
- PrismaClientUnknownRequestError
- PrismaClientRustPanicError
- PrismaClientInitializationError
- PrismaClientValidationError
- Prismaエラーコード（P で始まる）
- データベース接続エラー

### 3. 適切なモックデータ
- 既存の `data/` ディレクトリのJSONファイルを活用
- UIの期待するデータ形式に完全対応
- 日本語/英語のマッピング処理を保持

### 4. 一貫したレスポンス形式
- 既存APIと同じレスポンス構造
- エラー時でもフロントエンドは正常動作
- モックデータであることをログで確認可能

## 利用可能なモックデータファイル

- `data/inventory.json` - 在庫データ
- `data/staff-mock.json` - スタッフデータ
- `data/dashboard.json` - ダッシュボードデータ
- `data/analytics-mock.json` - 分析データ
- `data/tasks.json` - タスクデータ

## 実装の詳細

### MockFallbackクラス
`/lib/mock-fallback.ts` に実装された中央集権的なフォールバック管理クラス：

```typescript
// Prismaエラー判定
MockFallback.isPrismaError(error)

// 在庫データフォールバック
MockFallback.getInventoryFallback(params)

// 注文データフォールバック  
MockFallback.getOrdersFallback(params)

// スタッフダッシュボードフォールバック
MockFallback.getStaffDashboardFallback()

// ダッシュボードフォールバック
MockFallback.getDashboardFallback()
```

### エラーハンドリングパターン
各APIエンドポイントで統一されたパターン：

```typescript
try {
  // 既存のPrismaクエリロジック
  const data = await prisma.model.findMany();
  return NextResponse.json(data);
} catch (error) {
  console.error('Error:', error);
  
  // Prismaエラーの場合のみフォールバック
  if (MockFallback.isPrismaError(error)) {
    console.log('Using fallback data due to Prisma error');
    const fallbackData = await MockFallback.getFallbackData();
    return NextResponse.json(fallbackData);
  }
  
  // その他のエラーは通常通り処理
  return NextResponse.json({ error: 'エラー' }, { status: 500 });
}
```

## テスト方法

### 1. 正常動作確認
```bash
# 通常のシステム動作を確認
npm run dev
```

### 2. Prismaエラーシミュレーション
データベースファイルを一時的に移動してエラーを発生させる：

```bash
# SQLiteファイルを一時移動
mv prisma/dev.db prisma/dev.db.bak

# システムにアクセスしてフォールバックを確認
# ブラウザで各種APIをテスト

# 元に戻す
mv prisma/dev.db.bak prisma/dev.db
```

### 3. ログ確認
フォールバック動作時には以下のログが出力：
```
Using fallback data for [API名] due to Prisma error
```

## メリット

1. **高可用性**: データベースエラー時でもシステム継続
2. **ユーザー体験維持**: エラー画面を見せずに済む
3. **開発効率**: Prisma設定不要でフロントエンド開発可能
4. **本番安定性**: DB障害時の緊急フォールバック
5. **保守性**: 既存コードの変更最小限

## 今後の拡張可能性

1. **Redis連携**: キャッシュサーバーとの連携
2. **設定可能**: 環境変数でフォールバック有効/無効切り替え
3. **メトリクス**: フォールバック使用頻度の監視
4. **アラート**: エラー発生時の通知機能
5. **データ同期**: フォールバック後の自動データ復旧

## 注意事項

- フォールバックデータは読み取り専用（更新は反映されない）
- 本番環境では適切なモニタリングとアラートが必要
- 定期的なモックデータの更新が推奨
- Prismaエラー以外（認証エラーなど）は通常通り処理される

この実装により、THE WORLD DOORシステムは堅牢性が大幅に向上し、様々なエラー状況でも安定したユーザー体験を提供できるようになりました。