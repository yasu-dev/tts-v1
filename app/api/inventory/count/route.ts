import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locations, scheduledDate } = body;

    // 棚卸しタスクの作成をシミュレート
    const countTask = {
      id: `COUNT-${Date.now()}`,
      type: 'inventory_count',
      locations: locations || ['all'],
      scheduledDate: scheduledDate || new Date().toISOString(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      estimatedItems: Math.floor(Math.random() * 100) + 50,
      assignedStaff: []
    };

    return NextResponse.json({
      success: true,
      task: countTask,
      message: '棚卸しタスクを作成しました'
    });
  } catch (error) {
    console.error('棚卸しタスク作成エラー:', error);
    return NextResponse.json(
      { error: '棚卸しタスクの作成に失敗しました' },
      { status: 500 }
    );
  }
} 