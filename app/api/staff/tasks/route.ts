import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MockFallback } from '@/lib/mock-fallback';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // SQLiteからタスクデータを生成（商品データベースから）
    const products = await prisma.product.findMany({
      where: {
        status: {
          in: ['inbound', 'inspection', 'storage']
        }
      },
      include: {
        seller: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // 商品データからタスクを生成
    const tasks = products.map((product, index) => {
      const taskType = product.status === 'inbound' ? 'inspection' : 
                      product.status === 'inspection' ? 'photography' : 'listing';
      
      const priority = index < 3 ? 'high' : index < 8 ? 'medium' : 'low';
      const status = index < 2 ? 'in_progress' : index < 10 ? 'pending' : 'completed';

      return {
        id: `task-${product.id}`,
        title: `${product.name} ${taskType === 'inspection' ? '検品作業' : 
                                 taskType === 'photography' ? '商品撮影' : 'eBay出品作業'}`,
        description: taskType === 'inspection' ? 
          `${product.name}の動作確認、外観チェック、付属品確認` :
          taskType === 'photography' ?
          `${product.name}の全角度撮影、状態詳細記録` :
          `${product.name}の商品説明文作成、価格設定`,
        priority,
        status,
        assignedTo: '山本達也',
        dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: taskType,
        productSku: product.sku,
        productName: product.name,
        estimatedTime: taskType === 'inspection' ? 90 : 
                      taskType === 'photography' ? 120 : 75,
        notes: `セラー: ${product.seller.username} | 登録日: ${product.createdAt.toLocaleDateString('ja-JP')}`
      };
    });

    console.log(`✅ タスクデータ生成完了: ${tasks.length}件 (SQLite商品データベース基準)`);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Staff tasks API error:', error);
    
    // Prismaエラーの場合はフォールバックデータを使用
    if (MockFallback.isPrismaError(error)) {
      console.log('Using fallback data for staff tasks due to Prisma error');
      try {
        const fallbackData = { tasks: [] };
        return NextResponse.json(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback data error:', fallbackError);
      }
    }
    
    return NextResponse.json(
      { error: 'スタッフタスクデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const taskData = await request.json();
    
    // 新しいタスクを作成
    const newTask = {
      id: `task-${Date.now()}`,
      ...taskData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      assignedToName: getStaffName(taskData.assignedTo)
    };

    // 実際のアプリケーションでは、ここでデータベースに保存
    console.log('新規タスク作成:', newTask);

    return NextResponse.json({
      success: true,
      message: 'タスクが正常に作成されました',
      task: newTask
    });
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json(
      { error: 'タスクの作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { taskId, ...updateData } = await request.json();
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'タスクIDが必要です' },
        { status: 400 }
      );
    }

    // タスクステータスの更新
    const updatedTask = {
      id: taskId,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'タスクが正常に更新されました',
      task: updatedTask
    });
  } catch (error) {
    console.error('Task update error:', error);
    return NextResponse.json(
      { error: 'タスクの更新に失敗しました' },
      { status: 500 }
    );
  }
}

function getStaffName(staffId: string): string {
  const staffMap: { [key: string]: string } = {
    'staff001': '田中太郎',
    'staff002': '佐藤花子',
    'staff003': '山田次郎',
    'staff004': '鈴木美香'
  };
  return staffMap[staffId] || '未割り当て';
} 