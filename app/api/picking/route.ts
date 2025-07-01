import { NextRequest, NextResponse } from 'next/server';

// ピッキングタスク取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignee = searchParams.get('assignee');

    // モックデータ
    let pickingTasks = [
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
        orderId: 'ORD-2024-0846',
        customerName: 'EuroTech Solutions',
        priority: 'normal',
        status: 'in_progress',
        items: [
          {
            id: 'ITEM-003',
            productId: 'TWD-2024-003',
            productName: 'Nikon Z9 ボディ',
            sku: 'CAM-003',
            location: 'STD-A-01',
            quantity: 1,
            pickedQuantity: 1,
            status: 'picked',
            imageUrl: '/api/placeholder/60/60',
          },
        ],
        assignee: '佐藤花子',
        createdAt: '2024-01-20T09:00:00',
        dueDate: '2024-01-20T17:00:00',
        shippingMethod: 'DHL Express',
        totalItems: 1,
        pickedItems: 1,
      },
    ];

    // フィルタリング
    if (status && status !== 'all') {
      pickingTasks = pickingTasks.filter(task => task.status === status);
    }
    if (assignee) {
      pickingTasks = pickingTasks.filter(task => task.assignee === assignee);
    }

    // 統計情報
    const stats = {
      totalTasks: pickingTasks.length,
      pendingTasks: pickingTasks.filter(t => t.status === 'pending').length,
      inProgressTasks: pickingTasks.filter(t => t.status === 'in_progress').length,
      completedToday: pickingTasks.filter(t => t.status === 'completed').length,
      averageTime: '25分',
      accuracy: 99.5,
    };

    return NextResponse.json({
      tasks: pickingTasks,
      stats,
    });
  } catch (error) {
    console.error('[ERROR] GET /api/picking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch picking tasks' },
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