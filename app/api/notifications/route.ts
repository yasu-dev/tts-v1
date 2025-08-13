import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: string;
  priority?: 'high' | 'medium' | 'low';
  notificationType?: string; // 通知設定でのフィルタリング用
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
    priority: 'high',
    notificationType: 'product_sold'
  },
  {
    id: '2',
    type: 'warning',
    title: '在庫滞留アラート',
    message: 'Nikon D850が30日以上在庫にあります',
    timestamp: '2025-01-26T09:15:00Z',
    read: false,
    action: 'inventory',
    priority: 'medium',
    notificationType: 'inventory_alert'
  },
  {
    id: '3',
    type: 'info',
    title: '検品完了',
    message: 'Rolex Submariner Dateの検品が完了しました（倉庫保管中）',
    timestamp: '2025-01-26T08:45:00Z',
    read: true,
    action: 'inventory',
    notificationType: 'inspection_complete'
  },
  {
    id: '4',
    type: 'info',
    title: '月次レポート準備完了',
    message: '2025年1月の販売レポートが確認できます',
    timestamp: '2025-01-26T00:00:00Z',
    read: false,
    action: 'reports',
    notificationType: 'report_ready'
  },
  {
    id: '5',
    type: 'success',
    title: '入金確認',
    message: '売上金¥1,234,567が振り込まれました',
    timestamp: '2025-01-25T15:00:00Z',
    read: true,
    action: 'billing',
    priority: 'high',
    notificationType: 'payment_received'
  },
  {
    id: '6',
    type: 'error',
    title: '返品要求',
    message: 'Rolex GMT Master IIの返品要求が届いています',
    timestamp: '2025-01-25T14:00:00Z',
    read: false,
    action: 'returns',
    priority: 'high',
    notificationType: 'return_request'
  },
  {
    id: '7',
    type: 'warning',
    title: '支払いエラー',
    message: 'クレジットカード処理でエラーが発生しました',
    timestamp: '2025-01-25T12:00:00Z',
    read: false,
    action: 'billing',
    priority: 'high',
    notificationType: 'payment_issue'
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
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    
    // ユーザー認証（オプション、ゲスト表示も考慮）
    let userSettings = null;
    let userId = null;
    
    try {
      const user = await AuthService.requireRole(request, ['seller', 'staff', 'admin']);
      if (user) {
        userId = user.id;
        // ユーザーの通知設定を取得
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: { notificationSettings: true }
        });

        if (userData?.notificationSettings) {
          userSettings = JSON.parse(userData.notificationSettings);
        }
      }
    } catch (error) {
      // 認証エラーは無視してデフォルト通知を表示
      console.log('通知取得時の認証エラー（ゲストモード）:', error);
    }
    
    // 1. 静的通知を取得
    let staticNotifications = role === 'staff' ? staffNotifications : sellerNotifications;
    
    // 2. 動的通知を取得（認証済みユーザーのみ）
    let dynamicNotifications = [];
    if (userId) {
      try {
        const dynamicResponse = await fetch(`${request.nextUrl.origin}/api/notifications/dynamic?role=${role}`, {
          headers: {
            'Authorization': request.headers.get('Authorization') || '',
            'Cookie': request.headers.get('Cookie') || ''
          }
        });
        
        if (dynamicResponse.ok) {
          dynamicNotifications = await dynamicResponse.json();
        }
      } catch (error) {
        console.error('動的通知取得エラー:', error);
      }
    }
    
    // 3. 静的通知と動的通知を統合
    const allNotifications = [
      ...dynamicNotifications, // 動的通知を優先（新しいイベント）
      ...staticNotifications   // 静的通知（デモ用）
    ];
    
    // 4. セラーの場合、通知設定でフィルタリング
    let notifications = allNotifications;
    if (role === 'seller' && userSettings) {
      notifications = allNotifications.filter(notification => {
        // notificationTypeがない通知は常に表示
        if (!notification.notificationType) return true;
        
        // 設定に応じてフィルタリング
        return userSettings[notification.notificationType] === true;
      });
      
      console.log(`通知フィルタリング: ${notifications.length}/${allNotifications.length}件表示（動的: ${dynamicNotifications.length}件、静的: ${staticNotifications.length}件）`);
    }
    
    // 5. タイムスタンプでソート（新しい順）
    const sortedNotifications = [...notifications].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // 最新20件に制限
    const limitedNotifications = sortedNotifications.slice(0, 20);
    
    return NextResponse.json(limitedNotifications);

  } catch (error) {
    console.error('通知取得エラー:', error);
    // エラー時はデフォルト通知を返す
    const role = request.nextUrl.searchParams.get('role');
    const notifications = role === 'staff' ? staffNotifications : sellerNotifications;
    
    const sortedNotifications = [...notifications].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return NextResponse.json(sortedNotifications);
  }
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
  const { action, role, userId, notification, notificationId } = await request.json();
  
  if (action === 'mark-read' && notificationId) {
    // 単一の通知を既読にマーク
    console.log(`📧 通知を既読にマーク: ${notificationId}`);
    
    // 実際の実装ではデータベースで通知の既読状況を更新
    // await prisma.notification.update({
    //   where: { id: notificationId },
    //   data: { read: true, readAt: new Date() }
    // });
    
    return NextResponse.json({ success: true });
  }
  
  if (action === 'mark-all-read') {
    // 全ての通知を既読にマーク
    console.log(`📧 全通知を既読にマーク for ${role}`);
    return NextResponse.json({ success: true });
  }
  
  // 新しい通知を作成
  if (action === 'create') {
    const newNotification = {
      id: Date.now().toString(),
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      timestamp: new Date().toISOString(),
      read: false,
      action: notification.action,
      priority: notification.priority || 'medium'
    };
    
    // SSEでリアルタイム配信（一時的に無効化）
    // if (userId) {
    //   sendNotification(userId, {
    //     type: 'new_notification',
    //     notification: newNotification
    //   });
    // }
    
    // データベースに保存（実際の実装では）
    console.log('Creating new notification:', newNotification);
    
    return NextResponse.json({ success: true, notification: newNotification });
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
} 