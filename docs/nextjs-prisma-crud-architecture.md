# Next.js + Prisma + SQLite CRUD操作アーキテクチャ詳解

## 概要

本ドキュメントでは、このNext.jsアプリケーションにおけるCRUD（Create, Read, Update, Delete）操作の実装アーキテクチャについて詳細に解説します。

## アーキテクチャ概観

```
┌─────────────────────────────────────────────────────────────────┐
│                        フロントエンド層                           │
│                    React Components (Pages)                      │
│                  ┌─────────────────────────┐                    │
│                  │  ・inventory/page.tsx   │                    │
│                  │  ・products/page.tsx    │                    │
│                  │  ・orders/page.tsx      │                    │
│                  └─────────────────────────┘                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP Request (fetch API)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API Routes層                             │
│                    Next.js App Router API                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  /api/inventory/route.ts    - GET, POST, PUT, DELETE      │  │
│  │  /api/products/[id]/route.ts - GET, PUT                   │  │
│  │  /api/orders/route.ts       - GET, POST, PUT              │  │
│  │  /api/users/route.ts        - GET, POST, PUT, DELETE      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      ビジネスロジック層                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Service Layer                         │    │
│  │  ・InventoryService  - 在庫管理ロジック                 │    │
│  │  ・AuthService       - 認証・認可                       │    │
│  │  ・NotificationService - 通知管理                       │    │
│  │  ・ActivityService   - アクティビティログ              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      データアクセス層                            │
│                    Repository Pattern                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  BaseRepository (Abstract)                               │    │
│  │    ├─ PrismaRepository   - 本番環境用                   │    │
│  │    ├─ MockRepository     - 開発/テスト用                │    │
│  │    └─ ApiRepository      - 外部API連携用                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         ORM層                                    │
│                      Prisma Client                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ・スキーマ定義 (schema.prisma)                         │    │
│  │  ・型安全なクエリビルダー                               │    │
│  │  ・マイグレーション管理                                 │    │
│  │  ・リレーション自動解決                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      データベース層                              │
│                         SQLite                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  prisma/dev.db - 開発用データベース                     │    │
│  │  ・User Table                                           │    │
│  │  ・Product Table                                        │    │
│  │  ・Order Table                                          │    │
│  │  ・InventoryMovement Table                              │    │
│  │  ・Activity Table                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## 各層の詳細解説

### 1. フロントエンド層（React Components）

フロントエンドコンポーネントは、ユーザーインターフェースを提供し、API Routesと通信します。

```typescript
// app/inventory/page.tsx の例
const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  
  // データ取得
  const fetchData = async () => {
    const response = await fetch('/api/inventory');
    const data = await response.json();
    setInventory(data.data || []);
  };
  
  // データ作成
  const handleCreate = async (formData) => {
    const response = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  };
  
  // データ更新
  const handleUpdate = async (id, data) => {
    const response = await fetch('/api/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
  };
  
  // データ削除
  const handleDelete = async (id) => {
    const response = await fetch('/api/inventory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };
};
```

### 2. API Routes層

Next.js 13+ のApp Routerを使用してRESTful APIを実装しています。

```typescript
// app/api/inventory/route.ts の例

// GET: データ一覧取得
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const user = await AuthService.getUserFromRequest(request);
    if (!user) return new NextResponse('Unauthorized', { status: 401 });
    
    // クエリパラメータ解析
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sellerId = searchParams.get('sellerId') || '';
    
    // 検索条件構築
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (user.role === 'seller') where.sellerId = user.id;
    if (sellerId && user.role === 'staff') where.sellerId = sellerId;
    
    // Prismaでデータ取得
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          currentLocation: true,
          seller: true,
          images: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where })
    ]);
    
    // レスポンス整形
    return NextResponse.json({
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST: データ作成
export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request);
    if (!user) return new NextResponse('Unauthorized', { status: 401 });
    
    const body = await request.json();
    
    // サービス層でビジネスロジック処理
    const newProduct = await InventoryService.createInventory({
      ...body,
      sellerId: user.id,
    });
    
    // アクティビティログ記録
    await ActivityService.logActivity({
      userId: user.id,
      action: 'create',
      targetType: 'product',
      targetId: newProduct.id,
      metadata: { productName: newProduct.name },
    });
    
    return NextResponse.json({ data: newProduct });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PUT: データ更新
export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request);
    const body = await request.json();
    const { id, ...updateData } = body;
    
    // 権限チェック
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return new NextResponse('Not Found', { status: 404 });
    
    if (user.role === 'seller' && product.sellerId !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    // 更新処理
    const updatedProduct = await InventoryService.updateInventory(id, updateData);
    
    // アクティビティログ
    await ActivityService.logActivity({
      userId: user.id,
      action: 'update',
      targetType: 'product',
      targetId: id,
      metadata: { changes: updateData },
    });
    
    return NextResponse.json({ data: updatedProduct });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE: データ削除
export async function DELETE(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request);
    const { id } = await request.json();
    
    // 削除処理
    await InventoryService.deleteInventory(id, user);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

### 3. サービス層

ビジネスロジックを集約し、複数のリポジトリやサービスを協調させます。

```typescript
// lib/services/unified/inventory.service.ts
export class InventoryService {
  static async createInventory(data: CreateInventoryDto) {
    // SKU重複チェック
    const existing = await prisma.product.findUnique({
      where: { sku: data.sku }
    });
    if (existing) {
      throw new Error('SKU already exists');
    }
    
    // 価格検証
    if (data.price < 0) {
      throw new Error('Price must be positive');
    }
    
    // トランザクション処理
    const result = await prisma.$transaction(async (tx) => {
      // 商品作成
      const product = await tx.product.create({
        data: {
          ...data,
          status: 'inbound',
        },
        include: {
          seller: true,
          currentLocation: true,
        }
      });
      
      // 初期在庫移動記録
      if (data.currentLocationId) {
        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            toLocationId: data.currentLocationId,
            movedBy: data.sellerId,
            movedAt: new Date(),
          }
        });
      }
      
      return product;
    });
    
    // 通知送信
    await NotificationService.sendNotification({
      userId: data.sellerId,
      type: 'product_created',
      title: '商品が登録されました',
      message: `商品「${result.name}」が正常に登録されました。`,
    });
    
    return result;
  }
  
  static async updateInventory(id: string, data: UpdateInventoryDto) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { currentLocation: true }
    });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // SKU変更時の重複チェック
    if (data.sku && data.sku !== product.sku) {
      const existing = await prisma.product.findUnique({
        where: { sku: data.sku }
      });
      if (existing) {
        throw new Error('SKU already exists');
      }
    }
    
    // 更新処理
    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        seller: true,
        currentLocation: true,
        images: true,
      }
    });
    
    // ロケーション変更時の移動記録
    if (data.currentLocationId && data.currentLocationId !== product.currentLocationId) {
      await prisma.inventoryMovement.create({
        data: {
          productId: id,
          fromLocationId: product.currentLocationId,
          toLocationId: data.currentLocationId,
          movedBy: data.movedBy || 'system',
          movedAt: new Date(),
        }
      });
    }
    
    return updated;
  }
  
  static async deleteInventory(id: string, user: User) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { orders: true }
    });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // 権限チェック
    if (user.role === 'seller' && product.sellerId !== user.id) {
      throw new Error('Unauthorized to delete this product');
    }
    
    // 注文との関連チェック
    if (product.orders.length > 0) {
      throw new Error('Cannot delete product with existing orders');
    }
    
    // カスケード削除
    await prisma.$transaction(async (tx) => {
      // 関連データ削除
      await tx.inventoryMovement.deleteMany({ where: { productId: id } });
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.activity.deleteMany({ where: { targetId: id, targetType: 'product' } });
      
      // 商品削除
      await tx.product.delete({ where: { id } });
    });
    
    return true;
  }
}
```

### 4. リポジトリ層

データアクセスを抽象化し、環境に応じて実装を切り替えられるようにしています。

```typescript
// lib/repositories/base.repository.ts
export abstract class BaseRepository<T extends BaseEntity> {
  abstract findMany(options?: RepositoryOptions): Promise<T[]>;
  abstract findById(id: string, options?: RepositoryOptions): Promise<T | null>;
  abstract create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<boolean>;
  abstract count(options?: RepositoryOptions): Promise<number>;
  abstract findPaginated(
    page: number, 
    limit: number, 
    options?: RepositoryOptions
  ): Promise<PaginationResult<T>>;
}

// lib/repositories/inventory.repository.ts
export class PrismaInventoryRepository extends BaseRepository<InventoryItem> {
  async findMany(options?: RepositoryOptions): Promise<InventoryItem[]> {
    const { where, orderBy, include } = this.buildPrismaOptions(options);
    
    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        seller: include?.includes('seller'),
        currentLocation: include?.includes('location'),
        images: include?.includes('images'),
        movements: include?.includes('movements'),
      },
    });
    
    return products.map(this.mapToInventoryItem);
  }
  
  async create(data: CreateInventoryDto): Promise<InventoryItem> {
    const product = await prisma.product.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        seller: true,
        currentLocation: true,
        images: true,
      },
    });
    
    return this.mapToInventoryItem(product);
  }
  
  private mapToInventoryItem(product: any): InventoryItem {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      status: product.status,
      price: product.price,
      condition: product.condition,
      sellerId: product.sellerId,
      sellerName: product.seller?.username,
      location: product.currentLocation?.name || '未設定',
      locationId: product.currentLocationId,
      images: product.images?.map(img => img.url) || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

// Factory Pattern で環境に応じたリポジトリを返す
export const inventoryRepository = RepositoryFactory.create<InventoryItem>(
  'inventory',
  PrismaInventoryRepository,
  MockInventoryRepository,
  ApiInventoryRepository
);
```

### 5. Prisma層

スキーマ定義とマイグレーション管理を行います。

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id               String    @id @default(cuid())
  email            String    @unique
  username         String    @unique
  password         String
  role             String    @default("seller")
  isActive         Boolean   @default(true)
  notificationSettings String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  // Relations
  products         Product[]
  orders           Order[]   @relation("CustomerOrders")
  activities       Activity[]
  notifications    Notification[]
  movements        InventoryMovement[]
}

model Product {
  id                String   @id @default(cuid())
  name              String
  sku               String   @unique
  category          String
  subCategory       String?
  status            String   @default("inbound")
  price             Int
  cost              Int      @default(0)
  condition         String
  description       String?
  barcode           String?
  sellerId          String
  currentLocationId String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  seller            User     @relation(fields: [sellerId], references: [id])
  currentLocation   Location? @relation(fields: [currentLocationId], references: [id])
  images            ProductImage[]
  movements         InventoryMovement[]
  orders            OrderItem[]
  
  @@index([sku])
  @@index([status])
  @@index([sellerId])
  @@index([currentLocationId])
}

model Order {
  id              String    @id @default(cuid())
  orderNumber     String    @unique
  customerId      String
  status          String    @default("pending")
  totalAmount     Int
  shippingAddress String
  paymentMethod   String
  paymentStatus   String    @default("pending")
  shippedAt       DateTime?
  deliveredAt     DateTime?
  trackingNumber  String?
  carrier         String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  customer        User      @relation("CustomerOrders", fields: [customerId], references: [id])
  items           OrderItem[]
  
  @@index([orderNumber])
  @@index([customerId])
  @@index([status])
}

model InventoryMovement {
  id             String    @id @default(cuid())
  productId      String
  fromLocationId String?
  toLocationId   String?
  movedBy        String
  reason         String?
  movedAt        DateTime  @default(now())
  
  // Relations
  product        Product   @relation(fields: [productId], references: [id])
  fromLocation   Location? @relation("FromMovements", fields: [fromLocationId], references: [id])
  toLocation     Location? @relation("ToMovements", fields: [toLocationId], references: [id])
  movedByUser    User      @relation(fields: [movedBy], references: [id])
  
  @@index([productId])
  @@index([movedBy])
}
```

## CRUD操作の実装パターン

### 1. Create（作成）パターン

```
[フロントエンド]
    ↓ POST /api/inventory
[API Route]
    ↓ 認証チェック
    ↓ バリデーション
[Service Layer]
    ↓ ビジネスロジック（重複チェック等）
[Repository]
    ↓ prisma.create()
[Database]
    ↓ INSERT文実行
[Activity Log]
    ↓ 操作履歴記録
[Notification]
    ↓ 通知送信
[Response]
```

### 2. Read（読取）パターン

```
[フロントエンド]
    ↓ GET /api/inventory?page=1&limit=10&search=xxx
[API Route]
    ↓ 認証チェック
    ↓ クエリパラメータ解析
[Repository]
    ↓ prisma.findMany() + prisma.count()
    ↓ リレーション自動解決（include）
[Database]
    ↓ SELECT文実行（JOIN含む）
[Response Formatting]
    ↓ ページネーション情報付加
[Response]
```

### 3. Update（更新）パターン

```
[フロントエンド]
    ↓ PUT /api/inventory
[API Route]
    ↓ 認証・権限チェック
[Service Layer]
    ↓ 存在確認
    ↓ 変更可能性チェック
[Repository]
    ↓ prisma.update()
[Database]
    ↓ UPDATE文実行
[Side Effects]
    ↓ 在庫移動記録（ロケーション変更時）
    ↓ アクティビティログ
[Response]
```

### 4. Delete（削除）パターン

```
[フロントエンド]
    ↓ DELETE /api/inventory
[API Route]
    ↓ 認証・権限チェック
[Service Layer]
    ↓ 削除可能性チェック（関連データ確認）
[Repository]
    ↓ トランザクション開始
    ↓ 関連データ削除
    ↓ prisma.delete()
[Database]
    ↓ DELETE文実行（カスケード）
[Response]
```

## 特徴的な実装

### 1. 環境対応リポジトリパターン

```typescript
// 環境変数に応じて実装を切り替え
const getRepositoryType = (): 'prisma' | 'mock' | 'api' => {
  if (process.env.USE_MOCK_DATA === 'true') return 'mock';
  if (process.env.USE_EXTERNAL_API === 'true') return 'api';
  return 'prisma';
};
```

### 2. ロールベースアクセス制御（RBAC）

```typescript
// セラーは自分の商品のみ、スタッフは全商品アクセス可能
if (user.role === 'seller') {
  where.sellerId = user.id;
}
```

### 3. リアルタイム通知統合

```typescript
// 商品購入時に自動でセラーへ通知
await NotificationService.sendNotification({
  userId: product.sellerId,
  type: 'product_sold',
  title: '商品が売れました！',
  message: `${product.name}が購入されました`,
});
```

### 4. アクティビティトラッキング

```typescript
// 全てのCRUD操作を自動記録
await ActivityService.logActivity({
  userId: user.id,
  action: 'update',
  targetType: 'product',
  targetId: productId,
  metadata: { changes: updateData },
});
```

### 5. トランザクション処理

```typescript
// 複数テーブルの整合性を保証
await prisma.$transaction(async (tx) => {
  const product = await tx.product.create({ data });
  await tx.inventoryMovement.create({ data: movementData });
  await tx.activity.create({ data: activityData });
  return product;
});
```

## パフォーマンス最適化

### 1. クエリ最適化

- インデックスの適切な配置
- N+1問題の回避（include使用）
- 必要なフィールドのみ選択（select）

### 2. ページネーション

- カーソルベースページネーション対応
- 総件数の効率的な取得

### 3. キャッシング戦略

- 静的データのメモリキャッシュ
- レスポンスヘッダーでのキャッシュ制御

## セキュリティ対策

### 1. 認証・認可

- JWTトークンベース認証
- ロールベースアクセス制御
- APIキー管理

### 2. 入力検証

- スキーマベースバリデーション
- SQLインジェクション対策（Prisma使用）
- XSS対策

### 3. エラーハンドリング

- 詳細なエラー情報の隠蔽
- 適切なHTTPステータスコード
- ロギングとモニタリング

## まとめ

このアーキテクチャは以下の利点を提供します：

1. **層の分離**: 各層が明確な責任を持ち、保守性が高い
2. **型安全性**: TypeScriptとPrismaによる完全な型サポート
3. **柔軟性**: リポジトリパターンにより異なる環境に対応
4. **拡張性**: 新しい機能の追加が容易
5. **セキュリティ**: 多層防御によるセキュアな実装
6. **パフォーマンス**: 最適化されたクエリとキャッシング

このアーキテクチャにより、スケーラブルで保守性の高いCRUD操作の実装が実現されています。