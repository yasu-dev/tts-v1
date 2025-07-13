import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MockFallback } from '@/lib/mock-fallback';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Prismaを使用してスタッフタスクデータを取得
    // TODO: 実際のPrismaクエリを実装する際は、以下のような構造になる
    // const tasks = await prisma.staffTask.findMany({ where: { assignedTo: staffId } });
    
    // 現在はJSONファイルからデータを読み込む（Prismaスキーマが整備されるまで）
    const filePath = path.join(process.cwd(), 'data', 'staff-mock.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const staffData = JSON.parse(fileContents);
    
    // タスクデータを抽出
    const tasks = staffData.staffTasks.urgentTasks.concat(staffData.staffTasks.normalTasks);

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Staff tasks API error:', error);
    
    // Prismaエラーやファイル読み込みエラーの場合はフォールバックデータを使用
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