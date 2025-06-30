import { NextRequest, NextResponse } from 'next/server';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: string;
  priority?: 'high' | 'medium' | 'low';
}

// セラー向け通知
const sellerNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: '商品が売れました！',
    message: 'Canon EOS R5が¥450,000で売却されました',
    timestamp: '2025-01-26T10:30:00Z',
    read: false,
    action: 'sales',
    priority: 'high'
  },
  {
    id: '2',
    type: 'warning',
    title: '在庫滞留アラート',
    message: 'Nikon D850が30日以上在庫にあります',
    timestamp: '2025-01-26T09:15:00Z',
    read: false,
    action: 'inventory',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'info',
    title: '検品完了',
    message: 'Rolex Submariner Dateの検品が完了しました',
    timestamp: '2025-01-26T08:45:00Z',
    read: true,
    action: 'inventory'
  },
  {
    id: '4',
    type: 'info',
    title: '月次レポート準備完了',
    message: '2025年1月の販売レポートが確認できます',
    timestamp: '2025-01-26T00:00:00Z',
    read: false,
    action: 'reports'
  },
  {
    id: '5',
    type: 'success',
    title: '入金確認',
    message: '売上金¥1,234,567が振り込まれました',
    timestamp: '2025-01-25T15:00:00Z',
    read: true,
    action: 'billing',
    priority: 'high'
  }
];

// スタッフ向け通知
const staffNotifications: Notification[] = [
  {
    id: '1',
    type: 'error',
    title: '緊急検品タスク',
    message: 'Rolex GMT Master IIの高額商品検品が必要です',
    timestamp: '2025-01-26T10:45:00Z',
    read: false,
    action: 'tasks',
    priority: 'high'
  },
  {
    id: '2',
    type: 'warning',
    title: '返品処理待ち',
    message: 'Canon R5の返品再検品が3件待機中です',
    timestamp: '2025-01-26T10:00:00Z',
    read: false,
    action: 'returns',
    priority: 'high'
  },
  {
    id: '3',
    type: 'info',
    title: '新規入庫',
    message: '本日8件の商品が入庫予定です',
    timestamp: '2025-01-26T08:00:00Z',
    read: false,
    action: 'tasks'
  },
  {
    id: '4',
    type: 'success',
    title: '出荷完了',
    message: '本日の出荷タスク12件が完了しました',
    timestamp: '2025-01-25T18:00:00Z',
    read: true,
    action: 'shipping'
  },
  {
    id: '5',
    type: 'info',
    title: 'シフト変更のお知らせ',
    message: '来週のシフトが更新されました',
    timestamp: '2025-01-25T17:00:00Z',
    read: true,
    action: 'system'
  }
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const role = searchParams.get('role');
  
  // ロールに基づいて適切な通知を返す
  const notifications = role === 'staff' ? staffNotifications : sellerNotifications;
  
  // タイムスタンプでソート（新しい順）
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return NextResponse.json(sortedNotifications);
}

// 通知を既読にする
export async function PUT(request: NextRequest) {
  const { notificationId } = await request.json();
  
  // 実際の実装では、データベースで通知のステータスを更新
  console.log(`Marking notification ${notificationId} as read`);
  
  return NextResponse.json({ success: true });
}

// 全ての通知を既読にする
export async function POST(request: NextRequest) {
  const { action, role } = await request.json();
  
  if (action === 'mark-all-read') {
    // 実際の実装では、データベースで全通知を既読に更新
    console.log(`Marking all notifications as read for ${role}`);
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
} 