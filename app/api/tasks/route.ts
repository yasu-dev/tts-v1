import { NextResponse } from 'next/server';

export async function GET() {
  const tasksData = [
    {
      id: '1',
      title: 'Canon EOS R5 検品作業',
      description: 'カメラ本体の動作確認、外観チェック、付属品確認',
      priority: 'high',
      status: 'pending',
      assignedTo: '田中',
      dueDate: '2024-06-29',
      category: 'inspection',
      createdAt: '2024-06-28T08:00:00Z',
    },
    {
      id: '2',
      title: 'Hermès Birkin 出品作業',
      description: '商品写真撮影、商品説明文作成、価格設定',
      priority: 'high',
      status: 'in_progress',
      assignedTo: '佐藤',
      dueDate: '2024-06-28',
      category: 'listing',
      createdAt: '2024-06-27T14:00:00Z',
    },
    {
      id: '3',
      title: 'Rolex Submariner 出荷準備',
      description: '梱包作業、配送手配、追跡番号発行',
      priority: 'medium',
      status: 'pending',
      assignedTo: '鈴木',
      dueDate: '2024-06-30',
      category: 'shipping',
      createdAt: '2024-06-26T10:00:00Z',
    },
    {
      id: '4',
      title: 'Sony FE 24-70mm 返品処理',
      description: '返品商品の状態確認、再出品可否判定',
      priority: 'medium',
      status: 'completed',
      assignedTo: '山田',
      dueDate: '2024-06-27',
      category: 'returns',
      createdAt: '2024-06-25T16:00:00Z',
      completedAt: '2024-06-27T11:30:00Z',
    },
    {
      id: '5',
      title: 'Leica M11 検品作業',
      description: 'カメラ本体の動作確認、シャッター回数チェック',
      priority: 'low',
      status: 'pending',
      assignedTo: '田中',
      dueDate: '2024-07-01',
      category: 'inspection',
      createdAt: '2024-06-28T09:00:00Z',
    },
    {
      id: '6',
      title: 'Nikon Z9 出品準備',
      description: '商品写真撮影、商品説明文作成',
      priority: 'medium',
      status: 'pending',
      assignedTo: '佐藤',
      dueDate: '2024-07-02',
      category: 'listing',
      createdAt: '2024-06-28T11:00:00Z',
    },
  ];

  return NextResponse.json(tasksData);
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
  
  // デモ用のタスク状態更新レスポンス
  const updatedTask = {
    id,
    status,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ success: true, task: updatedTask });
}