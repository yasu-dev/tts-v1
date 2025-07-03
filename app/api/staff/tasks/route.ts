import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // モックタスクデータ
    const tasks = [
      {
        id: 'task-001',
        title: 'Canon EOS R5の検品作業',
        description: '新入荷のCanon EOS R5の動作確認と外観チェック',
        priority: 'high',
        category: 'inspection',
        status: 'pending',
        assignedTo: 'staff001',
        assignedToName: '田中太郎',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        estimatedTime: 45,
        notes: '高額商品のため慎重に検品'
      },
      {
        id: 'task-002',
        title: 'Rolex Submarinerの撮影',
        description: '商品画像の撮影とレタッチ',
        priority: 'medium',
        category: 'photography',
        status: 'in_progress',
        assignedTo: 'staff002',
        assignedToName: '佐藤花子',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        estimatedTime: 30,
        notes: '照明に注意'
      },
      {
        id: 'task-003',
        title: '在庫整理',
        description: 'A-1エリアの在庫整理と棚卸し',
        priority: 'low',
        category: 'inventory',
        status: 'completed',
        assignedTo: 'staff003',
        assignedToName: '山田次郎',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        estimatedTime: 120,
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        notes: '完了'
      }
    ];

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Tasks API error:', error);
    return NextResponse.json(
      { error: 'タスクデータの取得に失敗しました' },
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