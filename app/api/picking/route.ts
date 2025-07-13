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

    // Prismaを使用してピッキングタスクデータを取得
    // TODO: 実際のPrismaクエリを実装する際は、以下のような構造になる
    // const pickingTasks = await prisma.pickingTask.findMany({
    //   where: { status, assignee },
    //   include: { items: { include: { product: true } } }
    // });

    // 現在はモックデータを返す（Prismaスキーマが整備されるまで）
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

    // Filter by status if provided
    if (status) {
      pickingTasks = pickingTasks.filter(task => task.status === status);
    }

    // Filter by assignee if provided
    if (assignee) {
      pickingTasks = pickingTasks.filter(task => task.assignee === assignee);
    }

    return NextResponse.json({
      success: true,
      data: pickingTasks,
      count: pickingTasks.length
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