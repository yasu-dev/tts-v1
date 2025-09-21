import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 最近の通知データを確認
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // 最近の商品データを確認
    const products = await prisma.product.findMany({
      where: {
        status: 'inbound'
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // 最近の納品プランを確認
    const deliveryPlans = await prisma.deliveryPlan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        userId: n.userId,
        read: n.read,
        createdAt: n.createdAt
      })),
      inboundProducts: products.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        sellerId: p.sellerId,
        createdAt: p.createdAt
      })),
      deliveryPlans: deliveryPlans.map(dp => ({
        id: dp.id,
        sellerId: dp.sellerId,
        status: dp.status,
        totalItems: dp.totalItems,
        createdAt: dp.createdAt
      })),
      summary: {
        totalNotifications: notifications.length,
        unreadNotifications: notifications.filter(n => !n.read).length,
        inboundProductsCount: products.length,
        recentDeliveryPlansCount: deliveryPlans.length
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Failed to fetch debug data' }, { status: 500 });
  }
}