import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'all';
    
    // ピッキングタスクデータをPrismaから取得
    const whereCondition: any = {};
    
    if (status !== 'all') {
      whereCondition.status = status;
    }

    const [
      pickingTasks,
      taskStats
    ] = await Promise.all([
      // ピッキングタスク
      prisma.pickingTask.findMany({
        where: whereCondition,
        orderBy: { dueDate: 'asc' },
        include: {
          items: true
        }
      }),
      
      // タスク統計
      prisma.pickingTask.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    // レスポンスデータ構築
    const pickingData = {
      tasks: pickingTasks.map(task => ({
        id: task.id,
        orderId: task.orderId,
        customer: task.customerName,
        status: task.status,
        priority: task.priority,
        totalItems: task.totalItems,
        pickedItems: task.pickedItems,
        progress: Math.round((task.pickedItems / task.totalItems) * 100),
        dueDate: task.dueDate.toISOString(),
        items: task.items.map(item => ({
          id: item.id,
          productName: item.productName,
          location: item.location,
          quantity: item.quantity,
          pickedQuantity: item.pickedQuantity,
          status: item.status
        }))
      })),
      statistics: {
        total: pickingTasks.length,
        pending: taskStats.find(s => s.status === 'pending')?._count.status || 0,
        inProgress: taskStats.find(s => s.status === 'in_progress')?._count.status || 0,
        completed: taskStats.find(s => s.status === 'completed')?._count.status || 0
      }
    };

    return NextResponse.json(pickingData);
  } catch (error) {
    console.error('[ERROR] Picking API:', error);
    
    return NextResponse.json(
      { error: 'ピッキングデータの取得に失敗しました' },
      { status: 500 }
    );
  }
} 
