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

// ハードコードされたデモデータを削除（実際の通知のみ使用）

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
    
    // データベースから実際の通知を取得
    let notifications = [];
    if (userId) {
      try {
        const dynamicResponse = await fetch(`${request.nextUrl.origin}/api/notifications/dynamic?role=${role}`, {
          headers: {
            'Authorization': request.headers.get('Authorization') || '',
            'Cookie': request.headers.get('Cookie') || ''
          }
        });
        
        if (dynamicResponse.ok) {
          notifications = await dynamicResponse.json();
        }
      } catch (error) {
        console.error('通知取得エラー:', error);
      }
    }
    
    // セラーの場合、通知設定でフィルタリング
    if (role === 'seller' && userSettings) {
      notifications = notifications.filter(notification => {
        // notificationTypeがない通知は常に表示
        if (!notification.notificationType) return true;
        
        // 設定に応じてフィルタリング
        return userSettings[notification.notificationType] === true;
      });
      
      console.log(`通知フィルタリング: ${notifications.length}件表示（設定適用済み）`);
    }
    
    // タイムスタンプでソート（新しい順）
    const sortedNotifications = [...notifications].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // 最新20件に制限
    const limitedNotifications = sortedNotifications.slice(0, 20);
    
    return NextResponse.json(limitedNotifications);

  } catch (error) {
    console.error('通知取得エラー:', error);
    // エラー時は空配列を返す
    return NextResponse.json([]);
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