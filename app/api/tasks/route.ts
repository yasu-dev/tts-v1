import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MockFallback } from '@/lib/mock-fallback';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Prismaを使用してタスクデータを取得
    // TODO: 実際のPrismaクエリを実装する際は、以下のような構造になる
    // const tasks = await prisma.task.findMany({ orderBy: { priority: 'desc' } });
    
    // 現在はJSONファイルからデータを読み込む（Prismaスキーマが整備されるまで）
    const filePath = path.join(process.cwd(), 'data', 'tasks.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const tasksData = JSON.parse(fileContents);

    return NextResponse.json(tasksData);
  } catch (error) {
    console.error('Tasks API error:', error);
    
    // Prismaエラーやファイル読み込みエラーの場合はフォールバックデータを使用
    if (MockFallback.isPrismaError(error)) {
      console.log('Using fallback data for tasks due to Prisma error');
      try {
        const fallbackData = {
          urgentTasks: [],
          normalTasks: [],
          progress: {
            completed: 0,
            inProgress: 0,
            pending: 0,
            total: 0,
            percentage: 0
          },
          quickActions: [],
          recentActivity: []
        };
        return NextResponse.json(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback data error:', fallbackError);
      }
    }
    
    return NextResponse.json(
      { error: 'タスクデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // デモ用の新規タスク作成レスポンス
  const newTask = {
    id: Date.now().toString(),
    ...body,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ success: true, task: newTask }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status } = body;
  
  if (!id || !status) {
    return NextResponse.json(
      { error: 'タスクIDとステータスが必要です' },
      { status: 400 }
    );
  }

  try {
    // API処理をシミュレート
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // デモ用のタスク状態更新レスポンス
    const updatedTask = {
      id,
      status,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    return NextResponse.json(
      { error: 'タスク更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const body = await request.json();
  
  if (!body.id) {
    return NextResponse.json(
      { error: 'タスクIDが必要です' },
      { status: 400 }
    );
  }

  try {
    // API処理をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedTask = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    return NextResponse.json(
      { error: 'タスク更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'タスクIDが必要です' },
      { status: 400 }
    );
  }

  try {
    // API処理をシミュレート
    await new Promise(resolve => setTimeout(resolve, 600));

    return NextResponse.json({ 
      success: true, 
      message: 'タスクを削除しました',
      deletedTaskId: id 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'タスク削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}