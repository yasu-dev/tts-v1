import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    // Get product with all related activities
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        activities: {
          include: {
            user: {
              select: { id: true, username: true, email: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        movements: {
          include: {
            fromLocation: true,
            toLocation: true
          },
          orderBy: { createdAt: 'asc' }
        },
        orderItems: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                status: true,
                orderDate: true,
                shippedAt: true,
                deliveredAt: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // Build timeline events
    const timelineEvents = [];

    // Add activity events
    product.activities.forEach(activity => {
      timelineEvents.push({
        id: `activity-${activity.id}`,
        type: 'activity',
        timestamp: activity.createdAt,
        title: activity.description,
        status: activity.type,
        user: activity.user?.username || 'システム',
        metadata: activity.metadata
      });
    });

    // Add movement events
    product.movements.forEach(movement => {
      timelineEvents.push({
        id: `movement-${movement.id}`,
        type: 'movement',
        timestamp: movement.createdAt,
        title: `ロケーション移動: ${movement.fromLocation?.code || '未設定'} → ${movement.toLocation?.code || '未設定'}`,
        status: 'movement',
        user: movement.movedBy,
        notes: movement.notes
      });
    });

    // Add order events
    product.orderItems.forEach(orderItem => {
      const order = orderItem.order;
      
      timelineEvents.push({
        id: `order-${order.id}`,
        type: 'order',
        timestamp: order.orderDate,
        title: `注文受付: ${order.orderNumber}`,
        status: 'ordered',
        metadata: {
          orderNumber: order.orderNumber,
          status: order.status
        }
      });

      if (order.shippedAt) {
        timelineEvents.push({
          id: `shipped-${order.id}`,
          type: 'shipping',
          timestamp: order.shippedAt,
          title: `出荷完了: ${order.orderNumber}`,
          status: 'shipped',
          metadata: {
            orderNumber: order.orderNumber
          }
        });
      }

      if (order.deliveredAt) {
        timelineEvents.push({
          id: `delivered-${order.id}`,
          type: 'delivery',
          timestamp: order.deliveredAt,
          title: `配送完了: ${order.orderNumber}`,
          status: 'delivered',
          metadata: {
            orderNumber: order.orderNumber
          }
        });
      }
    });

    // Sort events by timestamp
    timelineEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category.replace('camera_body', 'カメラ本体')
                                 .replace('lens', 'レンズ')
                                 .replace('watch', '腕時計')
                                 .replace('accessory', 'アクセサリ'),
        status: product.status.replace('inbound', '入庫')
                             .replace('inspection', '検品')
                             .replace('storage', '保管')
                             .replace('listing', '出品')
                             .replace('ordered', '受注')
                             .replace('shipping', '出荷')
                             .replace('delivery', '配送')
                             .replace('sold', '売約済み')
                             .replace('returned', '返品'),
        condition: product.condition.replace('new', '新品')
                                   .replace('like_new', '新品同様')
                                   .replace('excellent', '極美品')
                                   .replace('very_good', '美品')
                                   .replace('good', '良品')
                                   .replace('fair', '中古美品')
                                   .replace('poor', '中古'),
        price: product.price,
        imageUrl: product.imageUrl
      },
      timeline: timelineEvents
    });
  } catch (error) {
    console.error('Product history error:', error);
    return NextResponse.json(
      { error: '商品履歴の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}