import { promises as fs } from 'fs';
import path from 'path';

/**
 * Prismaエラー時のモックデータフォールバック機能
 */
export class MockFallback {
  private static dataCache = new Map<string, any>();

  /**
   * モックデータファイルを読み込む
   */
  private static async loadMockData(filename: string): Promise<any> {
    if (this.dataCache.has(filename)) {
      return this.dataCache.get(filename);
    }

    try {
      const filePath = path.join(process.cwd(), 'data', filename);
      const fileContents = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContents);
      this.dataCache.set(filename, data);
      return data;
    } catch (error) {
      console.error(`Mock data file ${filename} not found, using default data`);
      return null;
    }
  }

  /**
   * 在庫データのフォールバック
   */
  static async getInventoryFallback(params: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }) {
    const mockData = await this.loadMockData('inventory.json');
    
    if (!mockData) {
      return {
        data: [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: 0,
          pages: 0
        }
      };
    }

    let products = mockData.products || [];

    // フィルタリング
    if (params.status) {
      const statusMap: { [key: string]: string } = {
        '入庫': 'inbound',
        '検品': 'inspection',
        '保管': 'storage',
        '出品': 'listing',
        '受注': 'ordered',
        '出荷': 'shipping',
        '配送': 'delivery',
        '売約済み': 'sold',
        '返品': 'returned'
      };
      const mappedStatus = statusMap[params.status] || params.status;
      products = products.filter((p: any) => p.status === mappedStatus);
    }

    if (params.category) {
      const categoryMap: { [key: string]: string } = {
        'カメラ本体': 'camera_body',
        'レンズ': 'lens',
        '腕時計': 'watch',
        'アクセサリ': 'accessory'
      };
      const mappedCategory = categoryMap[params.category] || params.category;
      products = products.filter((p: any) => p.category === mappedCategory);
    }

    if (params.search) {
      products = products.filter((p: any) => 
        p.name.toLowerCase().includes(params.search!.toLowerCase()) ||
        p.sku.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    // ページネーション
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;
    const paginatedProducts = products.slice(offset, offset + limit);

    // データ変換
    const inventoryData = paginatedProducts.map((product: any) => ({
      id: product.id || product.sku,
      name: product.name,
      sku: product.sku,
      category: product.categoryLabel || this.mapCategoryToJapanese(product.category),
      status: product.statusLabel || this.mapStatusToJapanese(product.status),
      location: product.location || '未設定',
      price: product.price,
      condition: this.mapConditionToJapanese(product.condition || 'good'),
      entryDate: product.inboundDate || new Date().toISOString().split('T')[0],
      imageUrl: this.getImageUrl(product.image),
      seller: { id: '1', username: 'システム', email: 'system@example.com' },
    }));

    return {
      data: inventoryData,
      pagination: {
        page,
        limit,
        total: products.length,
        pages: Math.ceil(products.length / limit)
      }
    };
  }

  /**
   * 注文データのフォールバック
   */
  static async getOrdersFallback(params: {
    status?: string;
    customerId?: string;
    limit?: number;
  }) {
    // モックの注文データを生成
    const mockOrders = [
      {
        id: 'mock-order-001',
        orderNumber: 'ORD-MOCK-001',
        customerId: 'mock-customer-001',
        totalAmount: 450000,
        status: 'pending',
        shippingAddress: '東京都渋谷区...',
        paymentMethod: 'クレジットカード',
        notes: 'モックデータ（Prismaエラー時のフォールバック）',
        createdAt: new Date(),
        customer: {
          id: 'mock-customer-001',
          username: 'テストユーザー',
          email: 'test@example.com'
        },
        items: [
          {
            id: 'mock-item-001',
            productId: 'TWD-CAM-001',
            quantity: 1,
            price: 450000,
            product: {
              id: 'TWD-CAM-001',
              name: 'Canon EOS R5 ボディ',
              sku: 'TWD-CAM-001',
              imageUrl: this.getImageUrl('camera')
            }
          }
        ]
      }
    ];

    let filteredOrders = mockOrders;

    if (params.status) {
      filteredOrders = mockOrders.filter(order => order.status === params.status);
    }

    if (params.customerId) {
      filteredOrders = mockOrders.filter(order => order.customerId === params.customerId);
    }

    const limit = params.limit || 50;
    return filteredOrders.slice(0, limit);
  }

  /**
   * スタッフダッシュボードデータのフォールバック
   */
  static async getStaffDashboardFallback() {
    const mockData = await this.loadMockData('staff-mock.json');
    
    if (mockData) {
      return mockData;
    }

    // デフォルトのスタッフダッシュボードデータ
    return {
      staffTasks: {
        urgentTasks: [],
        normalTasks: []
      },
      staffStats: {
        daily: {
          tasksCompleted: 0,
          inspectionsCompleted: 0,
          shipmentsProcessed: 0,
          returnsProcessed: 0,
          totalRevenue: '¥0'
        },
        weekly: {
          efficiency: 0,
          qualityScore: 0,
          customerSatisfaction: 0
        }
      }
    };
  }

  /**
   * ダッシュボードデータのフォールバック
   */
  static async getDashboardFallback() {
    const mockData = await this.loadMockData('dashboard.json');
    
    if (mockData) {
      return {
        ...mockData,
        // 追加のダッシュボードデータ
        globalRevenue: 45600000,
        activeExports: 156,
        inventoryEfficiency: 92,
        marketExpansionRate: 15.8,
        orders: [
          {
            id: 'ORD-MOCK-001',
            customer: 'テスト顧客',
            seller: 'モックセラー',
            certification: 'STANDARD',
            items: 1,
            value: '¥450,000',
            status: 'monitoring',
            region: 'アジア太平洋'
          }
        ]
      };
    }

    // デフォルトのダッシュボードデータ
    return {
      summary: {
        totalAssetValue: 0,
        inventoryCount: 0,
        todaySales: 0,
        orderCount: 0,
        changeFromLastMonth: 0,
        changeFromYesterday: 0
      },
      statusSummary: {
        inbound: 0,
        inspection: 0,
        storage: 0,
        listing: 0,
        shipping: 0,
        returned: 0
      },
      alerts: [
        {
          id: 'mock-alert-001',
          type: 'warning',
          icon: '🟡',
          title: 'データベース接続エラー',
          description: 'モックデータを使用しています',
          priority: 'medium',
          createdAt: new Date().toISOString()
        }
      ],
      recentActivities: [
        {
          id: 'mock-activity-001',
          type: 'system',
          title: 'フォールバックモード',
          description: 'モックデータを使用中',
          timestamp: new Date().toISOString(),
          color: '#FF9800'
        }
      ]
    };
  }

  /**
   * カテゴリを日本語にマッピング
   */
  private static mapCategoryToJapanese(category: string): string {
    const mapping: { [key: string]: string } = {
      'camera_body': 'カメラ本体',
      'camera': 'カメラ本体',
      'lens': 'レンズ',
      'watch': '腕時計',
      'accessory': 'アクセサリ'
    };
    return mapping[category] || category;
  }

  /**
   * ステータスを日本語にマッピング
   */
  private static mapStatusToJapanese(status: string): string {
    const mapping: { [key: string]: string } = {
      'inbound': '入庫',
      'inspection': '検品',
      'storage': '保管',
      'listing': '出品',
      'ordered': '受注',
      'shipping': '出荷',
      'delivery': '配送',
      'sold': '売約済み',
      'returned': '返品'
    };
    return mapping[status] || status;
  }

  /**
   * コンディションを日本語にマッピング
   */
  private static mapConditionToJapanese(condition: string): string {
    const mapping: { [key: string]: string } = {
      'new': '新品',
      'like_new': '新品同様',
      'excellent': '極美品',
      'very_good': '美品',
      'good': '良品',
      'fair': '中古美品',
      'poor': '中古'
    };
    return mapping[condition] || '良品';
  }

  /**
   * 画像URLを取得
   */
  private static getImageUrl(imageType?: string): string {
    const defaultImages: { [key: string]: string } = {
      'camera': '/api/placeholder/200/200',
      'lens': '/api/placeholder/200/200',
      'watch': '/api/placeholder/200/200',
      'accessory': '/api/placeholder/200/200'
    };
    return defaultImages[imageType || 'camera'] || '/api/placeholder/200/200';
  }

  /**
   * Prismaエラーかどうかを判定
   */
  static isPrismaError(error: any): boolean {
    return error?.name === 'PrismaClientKnownRequestError' ||
           error?.name === 'PrismaClientUnknownRequestError' ||
           error?.name === 'PrismaClientRustPanicError' ||
           error?.name === 'PrismaClientInitializationError' ||
           error?.name === 'PrismaClientValidationError' ||
           error?.code?.startsWith('P') || // Prismaエラーコード
           error?.message?.includes('Prisma') ||
           error?.message?.includes('database') ||
           error?.message?.includes('connection');
  }
}