import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MockFallback } from '@/lib/mock-fallback';

const prisma = new PrismaClient();

// ピッキングタスク取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignee = searchParams.get('assignee');

    // 大量のモックデータを生成
    const customers = [
      'NEXUS Global Trading', 'EuroTech Solutions', 'Asia Pacific Electronics',
      '株式会社東京カメラ', 'ヨーロッパ写真機材', 'アメリカンフォト', 
      'カメラワールド', '映像機器商事', 'プロフォト株式会社', 'デジタルイメージング',
      'フォトスタジオ エリート', 'カメラ専門店 レンズマスター', 'ビデオ機材センター',
      '撮影機材レンタル', 'プロカメラマン協会', 'フィルムアート', 'スタジオライト',
      'レンズテクノロジー', 'イメージングソリューション', 'カメラメンテナンス'
    ];

    const products = [
      { name: 'Canon EOS R5 ボディ', sku: 'CAM-001', location: 'STD-A-01' },
      { name: 'Sony α7R V ボディ', sku: 'CAM-002', location: 'STD-A-02' },
      { name: 'Nikon Z9 ボディ', sku: 'CAM-003', location: 'STD-A-03' },
      { name: 'Canon EOS R6 Mark II', sku: 'CAM-004', location: 'STD-A-04' },
      { name: 'Sony FE 24-70mm F2.8 GM', sku: 'LENS-001', location: 'HUM-01' },
      { name: 'Canon RF 24-70mm F2.8L', sku: 'LENS-002', location: 'HUM-02' },
      { name: 'Nikon Z 24-70mm f/2.8 S', sku: 'LENS-003', location: 'HUM-03' },
      { name: 'Sony FE 70-200mm F2.8 GM', sku: 'LENS-004', location: 'HUM-04' },
      { name: 'Canon RF 85mm F1.2L', sku: 'LENS-005', location: 'HUM-05' },
      { name: 'Sony FE 85mm F1.4 GM', sku: 'LENS-006', location: 'HUM-06' },
      { name: 'Manfrotto 三脚 MT055', sku: 'ACC-001', location: 'DRY-01' },
      { name: 'Godox ストロボ AD600', sku: 'ACC-002', location: 'DRY-02' },
      { name: 'SanDisk CFexpress 128GB', sku: 'ACC-003', location: 'TEMP-01' },
      { name: 'Lowepro カメラバッグ', sku: 'ACC-004', location: 'TEMP-02' },
      { name: 'Peak Design ストラップ', sku: 'ACC-005', location: 'TEMP-03' }
    ];

    const staff = ['田中太郎', '佐藤花子', '鈴木一郎', '高橋美咲', '山田健太', '中村由香'];
    const shippingMethods = ['ヤマト運輸', '佐川急便', '日本郵便', 'FedEx', 'DHL Express', 'UPS'];
    const priorities = ['urgent', 'high', 'normal', 'low'];
    const statuses = ['pending', 'in_progress', 'completed', 'on_hold'];

    // 50件のピッキングタスクを動的生成
    let pickingTasks = [];
    
    for (let i = 1; i <= 50; i++) {
      const orderNumber = `ORD-2024-${String(i + 1000).padStart(4, '0')}`;
      const taskId = `PICK-${String(i).padStart(3, '0')}`;
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const taskStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const assignee = taskStatus !== 'pending' ? staff[Math.floor(Math.random() * staff.length)] : null;
      const shippingMethod = shippingMethods[Math.floor(Math.random() * shippingMethods.length)];
      
      // アイテム数を1-5個でランダム生成
      const itemCount = Math.floor(Math.random() * 5) + 1;
      const selectedProducts = [];
      for (let j = 0; j < itemCount; j++) {
        selectedProducts.push(products[Math.floor(Math.random() * products.length)]);
      }

      // 進捗に応じてピッキング済み数を設定
      let pickedItems = 0;
      if (taskStatus === 'completed') {
        pickedItems = itemCount;
      } else if (taskStatus === 'in_progress') {
        pickedItems = Math.floor(Math.random() * itemCount);
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 7));

      const task = {
        id: taskId,
        orderId: orderNumber,
        customerName: customer,
        priority: priority,
        status: taskStatus,
        assignee: assignee,
        shippingMethod: shippingMethod,
        totalItems: itemCount,
        pickedItems: pickedItems,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        dueDate: dueDate.toISOString(),
        items: selectedProducts.map((product, index) => {
          const quantity = Math.floor(Math.random() * 3) + 1;
          let pickedQuantity = 0;
          let itemStatus = 'pending';
          
          if (taskStatus === 'completed') {
            pickedQuantity = quantity;
            itemStatus = 'verified';
          } else if (taskStatus === 'in_progress' && index < pickedItems) {
            pickedQuantity = quantity;
            itemStatus = 'picked';
          }

          return {
            id: `ITEM-${taskId}-${index + 1}`,
            productId: `PROD-${product.sku}`,
            productName: product.name,
            sku: product.sku,
            location: product.location,
            quantity: quantity,
            pickedQuantity: pickedQuantity,
            status: itemStatus,
            imageUrl: '/api/placeholder/60/60'
          };
        })
      };

      pickingTasks.push(task);
    }

    // 元の少ないモックデータ（互換性のため保持）
    const originalTasks = [
      {
        id: 'PICK-001',
        orderId: 'ORD-2024-0847',
        customerName: 'NEXUS Global Trading',
        priority: 'urgent',
        status: 'pending',
        items: [
          {
            id: 'ITEM-001',
            productId: 'TWD-2024-001',
            productName: 'Canon EOS R5 ボディ',
            sku: 'CAM-001',
            location: 'STD-A-01',
            quantity: 1,
            pickedQuantity: 0,
            status: 'pending',
            imageUrl: '/api/placeholder/60/60',
          },
          {
            id: 'ITEM-002',
            productId: 'TWD-2024-002',
            productName: 'Sony FE 24-70mm F2.8 GM',
            sku: 'LENS-001',
            location: 'HUM-01',
            quantity: 2,
            pickedQuantity: 0,
            status: 'pending',
            imageUrl: '/api/placeholder/60/60',
          },
        ],
        assignee: '田中太郎',
        createdAt: '2024-01-20T10:00:00',
        dueDate: '2024-01-20T15:00:00',
        shippingMethod: 'FedEx Priority',
        totalItems: 3,
        pickedItems: 0,
      },
      {
        id: 'PICK-002',
        orderId: 'ORD-2024-0848',
        customerName: 'Premium Camera Store',
        priority: 'normal',
        status: 'in_progress',
        items: [
          {
            id: 'ITEM-003',
            productId: 'TWD-2024-003',
            productName: 'Nikon Z9 ボディ',
            sku: 'CAM-002',
            location: 'HUM-02',
            quantity: 1,
            pickedQuantity: 1,
            status: 'picked',
            imageUrl: '/api/placeholder/60/60',
          },
        ],
        assignee: '佐藤花子',
        createdAt: '2024-01-20T11:00:00',
        dueDate: '2024-01-20T16:00:00',
        shippingMethod: 'DHL Express',
        totalItems: 1,
        pickedItems: 1,
      },
    ];

    // 新しい大量データと既存データを組み合わせ
    const allTasks = [...pickingTasks, ...originalTasks];

    // Filter by status if provided
    let filteredTasks = allTasks;
    if (status && status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }

    // Filter by assignee if provided
    if (assignee) {
      filteredTasks = filteredTasks.filter(task => task.assignee === assignee);
    }

    return NextResponse.json({
      success: true,
      data: filteredTasks,
      count: filteredTasks.length
    });

  } catch (error) {
    console.error('Picking API error:', error);
    
    // Prismaエラーの場合はフォールバックデータを使用
    if (MockFallback.isPrismaError(error)) {
      console.log('Using fallback data for picking due to Prisma error');
      try {
        const fallbackData = {
          success: true,
          data: [],
          count: 0
        };
        return NextResponse.json(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback data error:', fallbackError);
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'ピッキングデータの取得に失敗しました',
        data: [],
        count: 0
      },
      { status: 500 }
    );
  }
}

// ピッキングタスク開始/更新
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, action, itemId, quantity } = body;

    // アクションに応じた処理
    switch (action) {
      case 'start':
        // タスク開始処理
        return NextResponse.json({
          taskId,
          status: 'in_progress',
          startedAt: new Date().toISOString(),
        });

      case 'pick_item':
        // アイテムピッキング処理
        return NextResponse.json({
          taskId,
          itemId,
          pickedQuantity: quantity,
          status: 'picked',
          pickedAt: new Date().toISOString(),
        });

      case 'complete':
        // タスク完了処理
        return NextResponse.json({
          taskId,
          status: 'completed',
          completedAt: new Date().toISOString(),
        });

      case 'hold':
        // タスク保留処理
        return NextResponse.json({
          taskId,
          status: 'on_hold',
          heldAt: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[ERROR] POST /api/picking:', error);
    return NextResponse.json(
      { error: 'Failed to update picking task' },
      { status: 500 }
    );
  }
}

// バッチピッキング作成
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderIds, assignee, priority } = body;

    // 実際の実装では:
    // 1. 複数の注文を統合
    // 2. 最適なピッキングルートを計算
    // 3. バッチタスクを作成

    const batchTask = {
      id: `BATCH-${Date.now()}`,
      type: 'batch',
      orderIds,
      assignee,
      priority,
      totalItems: orderIds.length * 3, // 仮の値
      optimizedRoute: ['STD-A-01', 'HUM-01', 'STD-B-02'],
      estimatedTime: '45分',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(batchTask);
  } catch (error) {
    console.error('[ERROR] PUT /api/picking:', error);
    return NextResponse.json(
      { error: 'Failed to create batch picking' },
      { status: 500 }
    );
  }
}

// ピッキング履歴取得
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // モックデータ（実際はDBから取得）
    const history = {
      summary: {
        totalCompleted: 245,
        averageTime: '23分',
        accuracy: 99.7,
        topPerformer: '田中太郎',
      },
      dailyStats: [
        { date: '2024-01-20', completed: 35, avgTime: '22分' },
        { date: '2024-01-19', completed: 42, avgTime: '24分' },
        { date: '2024-01-18', completed: 38, avgTime: '23分' },
      ],
    };

    return NextResponse.json(history);
  } catch (error) {
    console.error('[ERROR] DELETE /api/picking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch picking history' },
      { status: 500 }
    );
  }
} 