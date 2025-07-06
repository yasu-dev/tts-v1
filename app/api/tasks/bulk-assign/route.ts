import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskIds, assignee, priority, dueDate, notes } = body;
    
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: 'タスクIDが必要です' },
        { status: 400 }
      );
    }

    if (!assignee) {
      return NextResponse.json(
        { error: '担当者が必要です' },
        { status: 400 }
      );
    }

    // API処理をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 一括割り当て処理のシミュレート
    const bulkAssignResult = {
      assignedTaskIds: taskIds,
      assignee,
      priority,
      dueDate,
      notes,
      assignedAt: new Date().toISOString(),
      assignedCount: taskIds.length
    };

    return NextResponse.json({ 
      success: true, 
      message: `${taskIds.length}件のタスクを一括割り当てしました`,
      result: bulkAssignResult
    });
    
  } catch (error) {
    console.error('Bulk assign error:', error);
    return NextResponse.json(
      { error: '一括割り当て中にエラーが発生しました' },
      { status: 500 }
    );
  }
}