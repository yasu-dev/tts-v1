import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// プリズマ接続を初期化
prisma.$connect();

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] スタッフ通知デバッグ開始');
    
    // スタッフユーザーのIDを特定
    const staffUsers = await prisma.user.findMany({
      where: { role: 'staff' },
      select: { id: true, username: true, email: true }
    });
    
    console.log('[DEBUG] スタッフユーザー数:', staffUsers.length);

    // 各スタッフの通知を確認
    const staffNotifications = [];
    for (const staff of staffUsers) {
      const notifications = await prisma.notification.findMany({
        where: { userId: staff.id },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      staffNotifications.push({
        userId: staff.id,
        username: staff.username,
        email: staff.email,
        notificationCount: notifications.length,
        unreadCount: notifications.filter(n => !n.read).length,
        notifications: notifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          read: n.read,
          createdAt: n.createdAt,
          notificationType: n.notificationType
        }))
      });
    }

    // 最近の納品プラン作成も確認
    const recentDeliveryPlans = await prisma.deliveryPlan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        sellerId: true,
        sellerName: true,
        totalItems: true,
        createdAt: true
      }
    });

    // 最近のアクティビティも確認
    const recentActivities = await prisma.activity.findMany({
      where: {
        type: 'notification_sent',
        description: {
          contains: '納品プラン'
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return NextResponse.json({
      staffUsers: staffNotifications,
      recentDeliveryPlans,
      recentNotificationActivities: recentActivities,
      summary: {
        totalStaffUsers: staffUsers.length,
        totalNotifications: staffNotifications.reduce((sum, staff) => sum + staff.notificationCount, 0),
        totalUnreadNotifications: staffNotifications.reduce((sum, staff) => sum + staff.unreadCount, 0)
      }
    });

  } catch (error) {
    console.error('[ERROR] Debug staff notifications error:', error);
    console.error('[ERROR] Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json({ 
      error: 'Failed to fetch staff notifications debug data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}