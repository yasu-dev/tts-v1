import { promises as fs } from 'fs';
import path from 'path';

/**
 * Netlify本番環境でのPrismaエラー時のモックデータフォールバック機能
 */

export class MockFallback {
  /**
   * Prismaエラーかどうかを判定
   */
  static isPrismaError(error: any): boolean {
    if (!error) return false;
    
    // Prisma関連のエラーパターン
    const prismaErrorPatterns = [
      'PrismaClientKnownRequestError',
      'PrismaClientUnknownRequestError',
      'PrismaClientRustPanicError',
      'PrismaClientInitializationError',
      'PrismaClientValidationError',
      'Environment variable not found',
      'Can\'t reach database server',
      'Connection refused',
      'Connection timeout',
      'Database does not exist',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'Prisma Client could not locate the Query Engine',
      'Schema engine not found',
      'Query engine library not found',
      'Cannot connect to database',
      'Database connection failed',
      'Prisma schema not found',
      'Migration engine not found',
      'Introspection engine not found',
      'Binary target not found',
      'Prisma Client initialization failed',
      'Prisma Client validation failed',
      'Prisma Client query failed',
      'Prisma Client transaction failed',
      'Prisma Client connection failed',
      'Prisma Client timeout',
      'Prisma Client interrupted',
      'Prisma Client panic',
      'Prisma Client internal error',
      'Prisma Client unknown error',
      'prisma',
      'PRISMA',
      'DATABASE_URL',
      'sqlite',
      'postgresql',
      'mysql',
      'mongodb',
      'cockroachdb',
      'sqlserver',
      'Query engine',
      'Migration engine',
      'Introspection engine',
      'Schema engine',
      'Binary target',
      'Prisma schema',
      'Prisma Client',
      'Prisma generate',
      'Prisma migrate',
      'Prisma introspect',
      'Prisma studio',
      'Prisma format',
      'Prisma validate',
      'Prisma version',
      'Prisma init',
      'Prisma db',
      'Prisma deploy',
      'Prisma reset',
      'Prisma seed',
      'Prisma pull',
      'Prisma push',
      'Prisma dev',
      'Prisma studio',
      'Prisma format',
      'Prisma validate'
    ];
    
    const errorMessage = error.message || error.toString() || '';
    const errorName = error.name || '';
    const errorCode = error.code || '';
    const errorStack = error.stack || '';
    
    // エラーメッセージ、名前、コード、スタックトレースのいずれかにPrisma関連のキーワードが含まれているかチェック
    return prismaErrorPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase()) ||
      errorName.toLowerCase().includes(pattern.toLowerCase()) ||
      errorCode.toLowerCase().includes(pattern.toLowerCase()) ||
      errorStack.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Netlify環境かどうかを判定
   */
  static isNetlifyEnvironment(): boolean {
    return process.env.NETLIFY === 'true' || 
           process.env.CONTEXT === 'production' ||
           process.env.CONTEXT === 'deploy-preview' ||
           process.env.CONTEXT === 'branch-deploy' ||
           process.env.NODE_ENV === 'production';
  }

  /**
   * 開発環境かどうかを判定
   */
  static isDevelopmentEnvironment(): boolean {
    return process.env.NODE_ENV === 'development' || 
           process.env.NODE_ENV === 'test' ||
           !process.env.NODE_ENV;
  }

  /**
   * モックサービスを使用するかどうかを判定
   */
  static shouldUseMockServices(): boolean {
    return process.env.USE_MOCK_SERVICES === 'true' || 
           this.isDevelopmentEnvironment() ||
           this.isNetlifyEnvironment();
  }

  /**
   * 在庫データのモックレスポンス
   */
  static getInventoryMockData() {
    return {
      products: [
        {
          id: 'mock-product-001',
          name: 'Canon EOS R5 ボディ',
          sku: 'TWD-CAM-001',
          category: 'camera_body',
          status: 'storage',
          price: 2800000,
          condition: 'excellent',
          description: 'プロ仕様のミラーレスカメラ',
          imageUrl: '/api/placeholder/200/200',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          location: 'A-01',
          quantity: 1,
          value: 2800000
        },
        {
          id: 'mock-product-002',
          name: 'Sony FE 24-70mm F2.8 GM',
          sku: 'TWD-LEN-001',
          category: 'lens',
          status: 'listing',
          price: 1980000,
          condition: 'very_good',
          description: 'プロ仕様の標準ズームレンズ',
          imageUrl: '/api/placeholder/200/200',
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date('2024-01-21'),
          location: 'A-02',
          quantity: 1,
          value: 1980000
        }
      ],
      totalCount: 2,
      totalValue: 4780000,
      statusStats: {
        inbound: 5,
        inspection: 3,
        storage: 12,
        listing: 8,
        sold: 25
      }
    };
  }

  /**
   * スタッフダッシュボードのモックデータ
   */
  static getStaffDashboardMockData() {
    return {
      staffTasks: {
        urgentTasks: [
          {
            id: 'task-001',
            title: 'Canon EOS R5 検品',
            description: '高優先度の検品タスク',
            priority: 'high',
            status: 'pending',
            assignee: 'スタッフ',
            dueDate: '2024-06-27',
            type: 'inspection',
            location: 'A-01',
            estimatedDuration: '2時間',
            category: 'カメラ',
            value: '¥2,800,000'
          },
          {
            id: 'task-002',
            title: 'Sony FE 24-70mm 撮影',
            description: '商品撮影タスク',
            priority: 'medium',
            status: 'in_progress',
            assignee: 'スタッフ',
            dueDate: '2024-06-28',
            type: 'photography',
            location: 'A-02',
            estimatedDuration: '1時間',
            category: 'レンズ',
            value: '¥1,980,000'
          }
        ],
        normalTasks: []
      },
      staffStats: {
        daily: {
          tasksCompleted: 5,
          inspectionsCompleted: 3,
          shipmentsProcessed: 8,
          returnsProcessed: 2,
          totalRevenue: '¥3,200,000'
        },
        weekly: {
          efficiency: 85,
          qualityScore: 92,
          customerSatisfaction: 88
        }
      },
      inspectionData: {
        pendingTasks: [
          {
            id: 'inspection-001',
            title: 'Canon EOS R5 検品',
            productId: 'TWD-CAM-001',
            productName: 'Canon EOS R5 ボディ',
            type: 'camera',
            priority: 'high',
            assignee: 'スタッフ',
            status: 'pending',
            dueDate: '2024-06-27',
            location: 'A-01',
            value: '¥2,800,000',
            category: 'camera_body'
          }
        ],
        checklistTemplates: {
          camera: {
            id: 'camera_checklist',
            name: 'カメラ検品チェックリスト',
            categories: [
              {
                name: '外観チェック',
                items: [
                  { id: 'exterior_1', label: '本体に傷や汚れがないか', type: 'boolean', required: true },
                  { id: 'exterior_2', label: 'レンズマウントの状態', type: 'boolean', required: true },
                  { id: 'exterior_3', label: 'ボタン・ダイヤルの動作', type: 'boolean', required: true }
                ]
              },
              {
                name: '機能チェック',
                items: [
                  { id: 'function_1', label: '電源の入り方', type: 'boolean', required: true },
                  { id: 'function_2', label: 'シャッターの動作', type: 'boolean', required: true },
                  { id: 'function_3', label: 'オートフォーカスの動作', type: 'boolean', required: true }
                ]
              }
            ]
          }
        }
      },
      returnsData: {
        pendingReturns: [
          {
            id: 'return-001',
            orderId: 'ORD-2024-0627-001',
            productId: 'TWD-CAM-001',
            productName: 'Canon EOS R5 ボディ',
            customer: '田中太郎',
            returnReason: '商品不良',
            returnDate: '2024-06-27',
            originalCondition: 'A',
            returnedCondition: 'B',
            customerNote: 'ファインダーに汚れがあります',
            refundAmount: '¥2,800,000'
          }
        ],
        returnCategories: [
          { id: 'defect', label: '商品不良', action: 'refund' },
          { id: 'damage', label: '配送時破損', action: 'replace' },
          { id: 'different', label: '商品説明相違', action: 'return' }
        ]
      }
    };
  }

  /**
   * ロケーションデータのモックレスポンス
   */
  static getLocationsMockData() {
    return [
      {
        id: 'mock-location-001',
        code: 'A-01',
        name: '標準棚 A-01',
        zone: 'A',
        capacity: 50,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        _count: { products: 15 }
      },
      {
        id: 'mock-location-002',
        code: 'H-01',
        name: '防湿庫 H-01',
        zone: 'H',
        capacity: 20,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        _count: { products: 8 }
      },
      {
        id: 'mock-location-003',
        code: 'V-01',
        name: '金庫室 V-01',
        zone: 'V',
        capacity: 10,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        _count: { products: 3 }
      }
    ];
  }

  /**
   * 在庫統計のモックデータ
   */
  static getInventoryStatsMockData() {
    return {
      statusStats: {
        inbound: 12,
        inspection: 8,
        storage: 145,
        listing: 58,
        ordered: 15,
        shipping: 6,
        delivery: 3,
        sold: 89,
        returned: 5
      },
      categoryStats: {
        camera_body: 45,
        lens: 32,
        watch: 28,
        accessory: 51
      },
      totalValue: 45600000,
      totalItems: 156
    };
  }

  /**
   * エラーログを出力（本番環境では外部ログサービスに送信）
   */
  static logError(error: any, context: string) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        message: error.message || 'Unknown error',
        name: error.name || 'Error',
        code: error.code || 'UNKNOWN',
        stack: error.stack || 'No stack trace'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        netlify: process.env.NETLIFY,
        context: process.env.CONTEXT,
        useMockServices: process.env.USE_MOCK_SERVICES
      }
    };
    
    console.error('[MockFallback Error]', JSON.stringify(errorInfo, null, 2));
    
    // 本番環境では外部ログサービス（Sentry、LogRocket等）に送信
    if (this.isNetlifyEnvironment()) {
      // TODO: 外部ログサービスへの送信実装
    }
  }
}