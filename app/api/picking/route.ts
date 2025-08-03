import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MockFallback } from '@/lib/mock-fallback';

const prisma = new PrismaClient();

// eBay商品のピッキングデータ取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const buyerId = searchParams.get('buyerId');

    // eBay購入に基づく商品データ
    const ebayProducts = [
      {
        id: 'P001',
        productName: 'Canon EOS R5 ボディ',
        sku: 'CAM-R5-001',
        location: 'A-01',
        quantity: 1,
        pickedQuantity: 0,
        status: 'pending',
        // eBay購入情報
        ebayOrderId: 'ORD-EB-2024-001',
        ebayItemId: '394756234567',
        buyerName: '田中太郎',
        buyerUserId: 'tanaka_photo_2024',
        purchaseDate: '2024-01-20T14:30:00Z',
        purchaseAmount: 450000,
        // 配送情報
        shippingAddress: {
          name: '田中太郎',
          address: '東京都渋谷区恵比寿1-1-1 マンション恵比寿101',
          city: '東京都',
          postalCode: '150-0013',
          country: '日本',
          phone: '03-1234-5678'
        },
        // 同梱可能情報
        canCombineWith: ['P002'],
        combineGroup: 'tanaka_photo_2024_2024-01-20'
      },
      {
        id: 'P002',
        productName: 'Canon RF 24-70mm F2.8L USM レンズ',
        sku: 'LENS-RF2470-001',
        location: 'B-15',
        quantity: 1,
        pickedQuantity: 0,
        status: 'pending',
        ebayOrderId: 'ORD-EB-2024-002',
        ebayItemId: '394756234568',
        buyerName: '田中太郎',
        buyerUserId: 'tanaka_photo_2024',
        purchaseDate: '2024-01-20T14:32:00Z',
        purchaseAmount: 280000,
        shippingAddress: {
          name: '田中太郎',
          address: '東京都渋谷区恵比寿1-1-1 マンション恵比寿101',
          city: '東京都',
          postalCode: '150-0013',
          country: '日本',
          phone: '03-1234-5678'
        },
        canCombineWith: ['P001'],
        combineGroup: 'tanaka_photo_2024_2024-01-20'
      },
      {
        id: 'P003',
        productName: 'Rolex GMT Master II 116710BLNR',
        sku: 'WATCH-GMT-001',
        location: 'V-03',
        quantity: 1,
        pickedQuantity: 0,
        status: 'pending',
        ebayOrderId: 'ORD-EB-2024-003',
        ebayItemId: '394756234569',
        buyerName: '佐藤花子',
        buyerUserId: 'sato_luxury_watch',
        purchaseDate: '2024-01-21T10:15:00Z',
        purchaseAmount: 1200000,
        shippingAddress: {
          name: '佐藤花子',
          address: '大阪府大阪市北区梅田2-2-2 梅田タワー2203',
          city: '大阪府',
          postalCode: '530-0001',
          country: '日本',
          phone: '06-9876-5432'
        },
        combineGroup: 'sato_luxury_watch_2024-01-21'
      },
      {
        id: 'P004',
        productName: 'Sony α7R V ボディ CFexpress付き',
        sku: 'CAM-A7RV-001',
        location: 'A-08',
        quantity: 1,
        pickedQuantity: 0,
        status: 'pending',
        ebayOrderId: 'ORD-EB-2024-004',
        ebayItemId: '394756234570',
        buyerName: '鈴木次郎',
        buyerUserId: 'suzuki_photographer',
        purchaseDate: '2024-01-21T16:45:00Z',
        purchaseAmount: 520000,
        shippingAddress: {
          name: '鈴木次郎',
          address: '神奈川県横浜市西区みなとみらい3-3-3 みなとみらいタワー1501',
          city: '神奈川県',
          postalCode: '220-0012',
          country: '日本',
          phone: '045-2345-6789'
        },
        combineGroup: 'suzuki_photographer_2024-01-21'
      },
      {
        id: 'P005',
        productName: 'Nikon Z9 ボディ + バッテリーグリップ',
        sku: 'CAM-Z9-001',
        location: 'A-12',
        quantity: 1,
        pickedQuantity: 1,
        status: 'completed',
        ebayOrderId: 'ORD-EB-2024-005',
        ebayItemId: '394756234571',
        buyerName: '山田一郎',
        buyerUserId: 'yamada_camera_pro',
        purchaseDate: '2024-01-19T11:20:00Z',
        purchaseAmount: 680000,
        shippingAddress: {
          name: '山田一郎',
          address: '愛知県名古屋市中区栄4-4-4 栄ビルディング801',
          city: '愛知県',
          postalCode: '460-0008',
          country: '日本',
          phone: '052-3456-7890'
        },
        combineGroup: 'yamada_camera_pro_2024-01-19',
        completedAt: '2024-01-20T09:15:00Z',
        completedBy: 'スタッフA'
      },
      {
        id: 'P006',
        productName: 'Omega Speedmaster Professional Moonwatch',
        sku: 'WATCH-SPEED-001',
        location: 'V-07',
        quantity: 1,
        pickedQuantity: 0,
        status: 'pending',
        ebayOrderId: 'ORD-EB-2024-006',
        ebayItemId: '394756234572',
        buyerName: '高橋美咲',
        buyerUserId: 'takahashi_timepiece',
        purchaseDate: '2024-01-22T13:10:00Z',
        purchaseAmount: 850000,
        shippingAddress: {
          name: '高橋美咲',
          address: '福岡県福岡市博多区博多駅前5-5-5 博多センタービル1205',
          city: '福岡県',
          postalCode: '812-0011',
          country: '日本',
          phone: '092-4567-8901'
        },
        combineGroup: 'takahashi_timepiece_2024-01-22'
      },
             {
         id: 'P007',
         productName: 'Fujifilm X-T5 ボディ シルバー',
         sku: 'CAM-XT5-001',
         location: 'A-20',
         quantity: 1,
         pickedQuantity: 0,
         status: 'ready_for_packing', // 梱包待ち
         ebayOrderId: 'ORD-EB-2024-007',
         ebayItemId: '394756234573',
         buyerName: '伊藤健太',
         buyerUserId: 'ito_street_photo',
         purchaseDate: '2024-01-22T15:25:00Z',
         purchaseAmount: 220000,
         shippingAddress: {
           name: '伊藤健太',
           address: '北海道札幌市中央区すすきの6-6-6 すすきのプラザ902',
           city: '北海道',
           postalCode: '064-0804',
           country: '日本',
           phone: '011-5678-9012'
         },
         combineGroup: 'ito_street_photo_2024-01-22',
         startedAt: '2024-01-23T08:30:00Z',
         assignedTo: 'スタッフB'
       },
      {
        id: 'P008',
        productName: 'Sony FE 85mm F1.4 GM レンズ',
        sku: 'LENS-FE85-001',
        location: 'B-35',
        quantity: 1,
        pickedQuantity: 0,
        status: 'pending',
        ebayOrderId: 'ORD-EB-2024-008',
        ebayItemId: '394756234574',
        buyerName: '渡辺真理',
        buyerUserId: 'watanabe_portrait',
        purchaseDate: '2024-01-23T09:40:00Z',
        purchaseAmount: 200000,
        shippingAddress: {
          name: '渡辺真理',
          address: '広島県広島市中区八丁堀7-7-7 八丁堀ビル503',
          city: '広島県',
          postalCode: '730-0013',
          country: '日本',
          phone: '082-6789-0123'
        },
        combineGroup: 'watanabe_portrait_2024-01-23'
      },
      {
        id: 'P009',
        productName: 'Leica Q2 Reporter 限定モデル',
        sku: 'CAM-Q2-001',
        location: 'A-25',
        quantity: 1,
        pickedQuantity: 0,
        status: 'pending',
        ebayOrderId: 'ORD-EB-2024-009',
        ebayItemId: '394756234575',
        buyerName: '中村雄介',
        buyerUserId: 'nakamura_leica_fan',
        purchaseDate: '2024-01-23T12:55:00Z',
        purchaseAmount: 780000,
        shippingAddress: {
          name: '中村雄介',
          address: '京都府京都市中京区河原町通三条上る大黒町71',
          city: '京都府',
          postalCode: '604-8005',
          country: '日本',
          phone: '075-7890-1234'
        },
        combineGroup: 'nakamura_leica_fan_2024-01-23'
      },
      {
        id: 'P010',
        productName: 'Canon EF 70-200mm f/2.8L IS III USM',
        sku: 'LENS-EF70200-001',
        location: 'B-45',
        quantity: 1,
        pickedQuantity: 0,
        status: 'pending',
        ebayOrderId: 'ORD-EB-2024-010',
        ebayItemId: '394756234576',
        buyerName: '松本彩香',
        buyerUserId: 'matsumoto_sports_photo',
        purchaseDate: '2024-01-23T14:20:00Z',
        purchaseAmount: 260000,
        shippingAddress: {
          name: '松本彩香',
          address: '静岡県静岡市葵区呉服町1-1-1 呉服町ビル702',
          city: '静岡県',
          postalCode: '420-0031',
          country: '日本',
          phone: '054-8901-2345'
        },
        combineGroup: 'matsumoto_sports_photo_2024-01-23'
      },
      {
        id: 'P011',
        productName: 'Tag Heuer Carrera Chronograph',
        sku: 'WATCH-TAG-001',
        location: 'V-15',
        quantity: 1,
        pickedQuantity: 0,
        status: 'pending',
        ebayOrderId: 'ORD-EB-2024-011',
        ebayItemId: '394756234577',
        buyerName: '岡田正人',
        buyerUserId: 'okada_watch_collector',
        purchaseDate: '2024-01-24T08:15:00Z',
        purchaseAmount: 420000,
        shippingAddress: {
          name: '岡田正人',
          address: '宮城県仙台市青葉区一番町2-2-2 一番町プラザ1003',
          city: '宮城県',
          postalCode: '980-0811',
          country: '日本',
          phone: '022-9012-3456'
        },
        combineGroup: 'okada_watch_collector_2024-01-24'
      },
      {
        id: 'P012',
        productName: 'Panasonic LUMIX GH6 ボディ',
        sku: 'CAM-GH6-001',
        location: 'A-30',
        quantity: 1,
        pickedQuantity: 0,
        status: 'pending',
        ebayOrderId: 'ORD-EB-2024-012',
        ebayItemId: '394756234578',
        buyerName: '森田千佳',
        buyerUserId: 'morita_video_creator',
        purchaseDate: '2024-01-24T11:45:00Z',
        purchaseAmount: 280000,
        shippingAddress: {
          name: '森田千佳',
          address: '沖縄県那覇市久茂地3-3-3 久茂地ビル605',
          city: '沖縄県',
          postalCode: '900-0015',
          country: '日本',
          phone: '098-0123-4567'
        },
        combineGroup: 'morita_video_creator_2024-01-24'
      }
    ];

    // Filter by status if provided
    let filteredProducts = ebayProducts;
    if (status && status !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.status === status);
    }

    // Filter by buyer ID if provided
    if (buyerId) {
      filteredProducts = filteredProducts.filter(product => product.buyerUserId === buyerId);
    }

    // 同梱可能グループの生成
    const combineGroups = generateCombineGroups(filteredProducts);

    return NextResponse.json({
      success: true,
      data: filteredProducts,
      combineGroups: combineGroups,
      count: filteredProducts.length,
             stats: {
         totalProducts: ebayProducts.length,
         pendingProducts: ebayProducts.filter(p => p.status === 'pending').length,
         readyForPackingProducts: ebayProducts.filter(p => p.status === 'ready_for_packing').length,
         completedProducts: ebayProducts.filter(p => p.status === 'completed').length,
         combinableGroups: combineGroups.length
       }
    });

  } catch (error) {
    console.error('eBay Picking API error:', error);
    
    // Prismaエラーの場合はフォールバックデータを使用
    if (MockFallback.isPrismaError(error)) {
      console.log('Using fallback data for eBay picking due to Prisma error');
      try {
        const fallbackData = {
          success: true,
          data: [],
          combineGroups: [],
          count: 0,
                     stats: {
             totalProducts: 0,
             pendingProducts: 0,
             readyForPackingProducts: 0,
             completedProducts: 0,
             combinableGroups: 0
           }
        };
        return NextResponse.json(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback data error:', fallbackError);
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'eBayピッキングデータの取得に失敗しました',
        data: [],
        combineGroups: [],
        count: 0
      },
      { status: 500 }
    );
  }
}

// 同梱可能グループの生成
function generateCombineGroups(products: any[]) {
  const groupMap = new Map();

  products.forEach(product => {
    if (product.combineGroup) {
      if (!groupMap.has(product.combineGroup)) {
        groupMap.set(product.combineGroup, {
          id: product.combineGroup,
          buyerName: product.buyerName,
          buyerUserId: product.buyerUserId,
          purchaseDate: product.purchaseDate.split('T')[0], // 日付部分のみ
          productIds: [],
          products: [],
          combinedPackage: false
        });
      }
      const group = groupMap.get(product.combineGroup);
      group.productIds.push(product.id);
      group.products.push({
        id: product.id,
        productName: product.productName,
        location: product.location,
        status: product.status
      });
    }
  });

  // 2個以上の商品があるグループのみ返す
  return Array.from(groupMap.values()).filter(group => group.productIds.length > 1);
}

// ピッキング開始/更新
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds, action, combineGroupId } = body;

    switch (action) {
      case 'create_picking_list':
        // ピッキングリスト作成（ロケーション一覧から）
        return NextResponse.json({
          success: true,
          message: 'ピッキングリストを作成しました',
          pickingListId: `PICK-${Date.now()}`,
          productIds: productIds,
          locationCode: body.locationCode,
          locationName: body.locationName,
          createdAt: new Date().toISOString()
        });

      case 'start_picking':
        // 商品のピッキング開始処理 - 直接梱包待ちステータスに
        return NextResponse.json({
          success: true,
          message: '選択した商品をピッキングして、そのまま梱包作業にお進みください',
          productIds: productIds,
          status: 'ready_for_packing',
          startedAt: new Date().toISOString()
        });

      case 'combine_products':
        // 同梱パッケージ設定
        return NextResponse.json({
          success: true,
          message: `${productIds.length}個の商品を同梱パッケージに設定しました`,
          combineGroupId: combineGroupId,
          productIds: productIds,
          combinedPackage: true,
          combinedAt: new Date().toISOString()
        });

      case 'cancel_picking':
        // ピッキングキャンセル処理
        return NextResponse.json({
          success: true,
          message: 'ピッキングをキャンセルしました',
          productIds: productIds,
          status: 'pending',
          cancelledAt: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[ERROR] POST /api/picking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update picking status' },
      { status: 500 }
    );
  }
}

// バッチピッキング作成（複数商品の一括処理）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds, assignee, combineGroups } = body;

    // 実際の実装では:
    // 1. 複数の商品を統合
    // 2. 最適なピッキングルートを計算
    // 3. 同梱可能商品をグループ化

    const batchPickingTask = {
      id: `BATCH-${Date.now()}`,
      type: 'batch_picking',
      productIds,
      assignee,
      combineGroups,
      totalProducts: productIds.length,
      optimizedRoute: calculateOptimalRoute(productIds),
      estimatedTime: calculateEstimatedTime(productIds.length),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: batchPickingTask,
      message: 'バッチピッキングタスクを作成しました'
    });
  } catch (error) {
    console.error('[ERROR] PUT /api/picking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create batch picking' },
      { status: 500 }
    );
  }
}

// 最適ルート計算（簡易版）
function calculateOptimalRoute(productIds: string[]) {
  // 実際の実装では倉庫レイアウトに基づいて最適ルートを計算
  const sampleRoutes = [
    ['A-01', 'A-08', 'A-12', 'A-20', 'A-25', 'A-30'],
    ['B-15', 'B-35', 'B-45'],
    ['V-03', 'V-07', 'V-15']
  ];
  
  return sampleRoutes.flat().slice(0, productIds.length);
}

// 予想作業時間計算
function calculateEstimatedTime(productCount: number) {
  const baseTime = 5; // 基本時間（分）
  const perProductTime = 3; // 商品あたりの時間（分）
  const totalMinutes = baseTime + (productCount * perProductTime);
  
  return `${totalMinutes}分`;
}

// ピッキング履歴とレポート取得
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // ピッキング履歴とパフォーマンス統計
    const pickingHistory = {
      summary: {
        totalCompleted: 156,
        averagePickingTime: '18分',
        accuracy: 99.8,
        topPerformer: 'スタッフA',
        mostPickedProduct: 'Canon EOS R5',
        combinePackageRate: 15.2 // 同梱率
      },
      dailyStats: [
        { 
          date: '2024-01-24', 
          completed: 28, 
          avgTime: '17分',
          combinePackages: 4,
          totalValue: 8640000
        },
        { 
          date: '2024-01-23', 
          completed: 35, 
          avgTime: '19分',
          combinePackages: 6,
          totalValue: 10250000
        },
        { 
          date: '2024-01-22', 
          completed: 31, 
          avgTime: '18分',
          combinePackages: 3,
          totalValue: 7850000
        },
      ],
      categoryBreakdown: {
        cameras: { count: 89, percentage: 57.1 },
        watches: { count: 45, percentage: 28.8 },
        lenses: { count: 22, percentage: 14.1 }
      },
      buyerStatistics: {
        totalUniqueBuyers: 142,
        repeatCustomers: 28,
        averageOrderValue: 445000,
        topBuyers: [
          { buyerUserId: 'tanaka_photo_2024', orderCount: 8, totalValue: 3200000 },
          { buyerUserId: 'sato_luxury_watch', orderCount: 5, totalValue: 4500000 },
          { buyerUserId: 'yamada_camera_pro', orderCount: 6, totalValue: 2800000 }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      data: pickingHistory,
      period: `過去${days}日間`
    });
  } catch (error) {
    console.error('[ERROR] DELETE /api/picking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch picking history' },
      { status: 500 }
    );
  }
} 