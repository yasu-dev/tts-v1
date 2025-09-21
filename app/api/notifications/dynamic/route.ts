import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DynamicNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  notificationType?: string;
  metadata?: any;
  userId: string;
}

/**
 * 動的通知（実際のビジネスイベントによる通知）を管理
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    
    // ユーザー認証
    let userSettings = null;
    let userId = null;
    
    try {
      const user = await AuthService.requireRole(request, ['seller', 'staff', 'admin']);
      userId = user.id;
      
      // ユーザーの通知設定を取得
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: { notificationSettings: true }
      });

      if (userData?.notificationSettings) {
        userSettings = JSON.parse(userData.notificationSettings);
      }
    } catch (error) {
      console.log('動的通知取得時の認証エラー:', error);
      return NextResponse.json([]);
    }
    
    if (!userId) {
      return NextResponse.json([]);
    }
    
    // アクティビティログから動的通知を生成
    const activities = await prisma.activity.findMany({
      where: {
        OR: [
          // 自分がセラーの商品に関する活動
          {
            order: {
              items: {
                some: {
                  product: {
                    sellerId: userId
                  }
                }
              }
            }
          },
          // 自分の商品に関する活動
          {
            product: {
              sellerId: userId
            }
          },
          // 自分に直接関連する活動
          {
            userId: userId,
            type: {
              in: ['inventory_alert', 'inspection_complete', 'payment_received']
            }
          }
        ]
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        },
        product: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // 既存のNotificationテーブルから未読通知も取得
    const unreadNotifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        read: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24時間以内
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // アクティビティを通知に変換
    const dynamicNotifications: DynamicNotification[] = [];
    
    // Notificationテーブルからの通知を追加
    for (const notification of unreadNotifications) {
      dynamicNotifications.push({
        id: notification.id,
        type: notification.type as 'success' | 'warning' | 'error' | 'info',
        title: notification.title,
        message: notification.message,
        timestamp: notification.createdAt.toISOString(),
        read: notification.read,
        notificationType: notification.notificationType || undefined,
        metadata: notification.metadata,
        userId
      });
    }
    
    for (const activity of activities) {
      let notification: DynamicNotification | null = null;
      
      switch (activity.type) {
        case 'order_created':
          if (activity.order) {
            const userItems = activity.order.items.filter(item => item.product.sellerId === userId);
            if (userItems.length > 0) {
              const itemNames = userItems.map(item => item.product.name).join(', ');
              const totalAmount = userItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              
              notification = {
                id: `activity-${activity.id}`,
                type: 'success',
                title: '🎉 商品が売れました！',
                message: `商品「${itemNames}」が売れました。合計金額: ¥${totalAmount.toLocaleString()}`,
                timestamp: activity.createdAt.toISOString(),
                read: false, // 実際の読み取り状況は別途管理が必要
                notificationType: 'product_sold',
                metadata: {
                  orderNumber: activity.order.orderNumber,
                  orderId: activity.order.id,
                  totalAmount,
                  items: userItems.map(item => ({
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: item.price
                  }))
                },
                userId
              };
            }
          }
          break;
          
        case 'inventory_check':
          if (activity.userId === userId || (activity.product && activity.product.sellerId === userId)) {
            notification = {
              id: `activity-${activity.id}`,
              type: 'warning',
              title: '⚠️ 在庫アラート',
              message: activity.description,
              timestamp: activity.createdAt.toISOString(),
              read: false,
              notificationType: 'inventory_alert',
              metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
              userId
            };
          }
          break;
          
        case 'return_created':
          if (activity.product && activity.product.sellerId === userId) {
            notification = {
              id: `activity-${activity.id}`,
              type: 'error',
              title: '🔄 返品要求',
              message: `商品「${activity.product.name}」の返品要求が届いています`,
              timestamp: activity.createdAt.toISOString(),
              read: false,
              notificationType: 'return_request',
              metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
              userId
            };
          }
          break;
          
        case 'inspection_complete':
          if (activity.product && activity.product.sellerId === userId) {
            notification = {
              id: `activity-${activity.id}`,
              type: 'success',
              title: '✅ 検品完了',
              message: `商品「${activity.product.name}」の検品が完了しました`,
              timestamp: activity.createdAt.toISOString(),
              read: false,
              notificationType: 'inspection_complete',
              metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
              userId
            };
          }
          break;
      }
      
      if (notification) {
        dynamicNotifications.push(notification);
      }
    }
    
    // 通知設定でフィルタリング
    let filteredNotifications = dynamicNotifications;
    
    if (role === 'seller' && userSettings) {
      filteredNotifications = dynamicNotifications.filter(notification => {
        // notificationTypeがない通知は常に表示
        if (!notification.notificationType) return true;
        
        // 設定に応じてフィルタリング
        return userSettings[notification.notificationType] === true;
      });
      
      console.log(`動的通知フィルタリング: ${filteredNotifications.length}/${dynamicNotifications.length}件表示（設定適用済み）`);
    }
    
    // タイムスタンプでソート（新しい順）
    const sortedNotifications = filteredNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return NextResponse.json(sortedNotifications);

  } catch (error) {
    console.error('動的通知取得エラー:', error);
    return NextResponse.json([]);
  }
}

/**
 * 通知を既読にマーク
 */
export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['seller', 'staff', 'admin']);
    const { notificationId, action } = await request.json();
    
    if (action === 'mark-read' && notificationId) {
      // Notificationテーブルの通知を既読にマーク
      try {
        await prisma.notification.updateMany({
          where: {
            id: notificationId,
            userId: user.id
          },
          data: {
            read: true
          }
        });
        
        console.log(`通知を既読にマーク: ${notificationId} (ユーザー: ${user.id})`);
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('通知の既読マークエラー:', error);
        return NextResponse.json({ success: true }); // エラーでも成功扱い
      }
    }
    
    if (action === 'mark-all-read') {
      // 全ての未読通知を既読にマーク
      try {
        await prisma.notification.updateMany({
          where: {
            userId: user.id,
            read: false
          },
          data: {
            read: true
          }
        });
        
        console.log(`全ての通知を既読にマーク (ユーザー: ${user.id})`);
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('全通知の既読マークエラー:', error);
        return NextResponse.json({ success: true }); // エラーでも成功扱い
      }
    }
    
    return NextResponse.json(
      { error: '無効なアクション' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('通知更新エラー:', error);
    return NextResponse.json(
      { error: '通知更新に失敗しました' },
      { status: 500 }
    );
  }
}
