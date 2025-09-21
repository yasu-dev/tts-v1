import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔍 Activityテーブルの詳細分析開始');
    
    // 1. Activityテーブルのレコード数
    const activityCount = await prisma.activity.count();
    console.log(`📊 Activity総レコード数: ${activityCount}`);

    // 2. Activityのタイプ別集計
    const activityByType = await prisma.activity.groupBy({
      by: ['type'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });
    console.log('📋 Activityタイプ別:', activityByType);

    // 3. 最新のActivityレコード（詳細）
    const recentActivities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { username: true } },
        product: { select: { name: true, sku: true } },
        order: { select: { orderNumber: true } }
      }
    });
    console.log(`🕐 最新Activity: ${recentActivities.length}件`);

    // 4. 商品別Activity数
    const activitiesByProduct = await prisma.activity.groupBy({
      by: ['productId'],
      _count: { id: true },
      where: { productId: { not: null } },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });
    console.log(`📦 商品別Activity: ${activitiesByProduct.length}商品`);

    // 5. InventoryMovementテーブルの確認
    const movementCount = await prisma.inventoryMovement.count();
    const recentMovements = await prisma.inventoryMovement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        product: { select: { name: true, sku: true } },
        fromLocation: { select: { code: true, name: true } },
        toLocation: { select: { code: true, name: true } }
      }
    });
    console.log(`📍 InventoryMovement総レコード数: ${movementCount}`);

    // 6. OrderItemテーブルの確認
    const orderItemCount = await prisma.orderItem.count();
    const recentOrderItems = await prisma.orderItem.findMany({
      orderBy: { order: { orderDate: 'desc' } },
      take: 5,
      include: {
        product: { select: { name: true, sku: true } },
        order: { 
          select: { 
            orderNumber: true, 
            orderDate: true, 
            status: true,
            shippedAt: true,
            deliveredAt: true
          } 
        }
      }
    });
    console.log(`🛒 OrderItem総レコード数: ${orderItemCount}`);

    // 7. 特定商品のActivity履歴（例：最初の商品）
    let specificProductActivities = null;
    if (recentActivities.length > 0 && recentActivities[0].productId) {
      specificProductActivities = await prisma.activity.findMany({
        where: { productId: recentActivities[0].productId },
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { username: true } }
        }
      });
    }

    const debugInfo = {
      status: 'success',
      summary: {
        activityCount,
        movementCount,
        orderItemCount,
        activityTypes: activityByType.length
      },
      activityAnalysis: {
        totalCount: activityCount,
        byType: activityByType,
        recentActivities: recentActivities.map(a => ({
          id: a.id,
          type: a.type,
          description: a.description,
          productName: a.product?.name,
          productSku: a.product?.sku,
          userName: a.user?.username,
          createdAt: a.createdAt,
          metadata: a.metadata ? JSON.parse(a.metadata) : null
        })),
        activitiesByProduct: activitiesByProduct
      },
      movementAnalysis: {
        totalCount: movementCount,
        recentMovements: recentMovements.map(m => ({
          id: m.id,
          productName: m.product.name,
          productSku: m.product.sku,
          fromLocation: m.fromLocation?.code,
          toLocation: m.toLocation?.code,
          movedBy: m.movedBy,
          createdAt: m.createdAt,
          notes: m.notes
        }))
      },
      orderItemAnalysis: {
        totalCount: orderItemCount,
        recentOrderItems: recentOrderItems.map(oi => ({
          id: oi.id,
          productName: oi.product.name,
          productSku: oi.product.sku,
          orderNumber: oi.order.orderNumber,
          orderDate: oi.order.orderDate,
          orderStatus: oi.order.status,
          shippedAt: oi.order.shippedAt,
          deliveredAt: oi.order.deliveredAt,
          quantity: oi.quantity,
          price: oi.price
        }))
      },
      specificProductExample: specificProductActivities ? {
        productId: recentActivities[0].productId,
        productName: recentActivities[0].product?.name,
        activities: specificProductActivities.map(a => ({
          type: a.type,
          description: a.description,
          createdAt: a.createdAt,
          userName: a.user?.username,
          metadata: a.metadata ? JSON.parse(a.metadata) : null
        }))
      } : null
    };

    return NextResponse.json(debugInfo);
    
  } catch (error) {
    console.error('💥 Activity分析エラー:', error);
    
    const errorInfo = {
      status: 'error',
      message: 'Activity分析でエラーが発生しました',
      error: error instanceof Error ? error.message : String(error)
    };

    return NextResponse.json(errorInfo, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}