import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // SQLiteから出荷準備中・出荷済みの注文データを取得
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['confirmed', 'processing', 'shipped']
        }
      },
      include: {
        customer: {
          select: { username: true }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // 配送アイテム形式に変換
    const shippingItems = orders.flatMap(order => 
      order.items.map(item => ({
        id: `SHIP-${order.id}-${item.id}`,
        productName: item.product.name,
        productSku: item.product.sku,
        orderNumber: order.orderNumber,
        customer: order.customer.username,
        shippingAddress: order.shippingAddress || '住所未設定',
        status: order.status === 'confirmed' ? 'workstation' :
                order.status === 'processing' ? 'packed' : 'shipped',
        priority: order.totalAmount > 500000 ? 'urgent' : 'normal',
        dueDate: new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        shippingMethod: 'ヤマト宅急便',
        value: item.product.price,
        location: 'A-01',
        productImages: item.product.imageUrl ? [item.product.imageUrl] : [],
        inspectionImages: [],
        inspectionNotes: '動作確認済み、外観良好'
      }))
    );

    console.log(`✅ 配送データ取得完了: ${shippingItems.length}件 (SQLite注文データベース基準)`);
    return NextResponse.json({ items: shippingItems });
  } catch (error) {
    console.error('Shipping items fetch error:', error);
    return NextResponse.json(
      { error: '配送データの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, trackingNumber, carrier, shippingMethod, notes } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: '注文IDが必要です' },
        { status: 400 }
      );
    }

    // orderIdまたはorderNumberで注文を検索
    let order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // IDで見つからない場合、orderNumberで検索を試行
    if (!order) {
      order = await prisma.order.findUnique({
        where: { orderNumber: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    if (!order) {
      return NextResponse.json(
        { error: '注文が見つかりません' },
        { status: 404 }
      );
    }

    if (!['confirmed', 'processing'].includes(order.status)) {
      return NextResponse.json(
        { error: '出荷できない注文ステータスです' },
        { status: 400 }
      );
    }

    // Update order status to shipped
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'shipped',
        shippedAt: new Date(),
        notes: notes ? `${order.notes || ''}\n出荷情報: ${notes}` : order.notes,
      },
      include: {
        customer: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update all products in the order to shipping status
    const productIds = order.items.map(item => item.productId);
    await prisma.product.updateMany({
      where: {
        id: { in: productIds },
      },
      data: {
        status: 'shipping',
      },
    });

    // Log shipping activity
    await prisma.activity.create({
      data: {
        type: 'shipping',
        description: `注文 ${order.orderNumber} が出荷されました`,
        userId: user.id,
        orderId: order.id,
        metadata: JSON.stringify({
          trackingNumber,
          carrier,
          shippingMethod,
          notes,
          productCount: productIds.length,
        }),
      },
    });

    // Log activity for each product
    for (const item of order.items) {
      await prisma.activity.create({
        data: {
          type: 'shipping',
          description: `商品 ${item.product.name} が出荷されました (注文: ${order.orderNumber})`,
          userId: user.id,
          productId: item.productId,
          orderId: order.id,
          metadata: JSON.stringify({
            trackingNumber,
            carrier,
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: '出荷処理が完了しました',
      shipping: {
        trackingNumber,
        carrier,
        shippingMethod,
        shippedAt: updatedOrder.shippedAt,
      },
    });
  } catch (error) {
    console.error('Shipping processing error:', error);
    return NextResponse.json(
      { error: '出荷処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: '注文IDとステータスが必要です' },
        { status: 400 }
      );
    }

    const validStatuses = ['delivered'];
    const mappedStatus = status.replace('配送完了', 'delivered');

    if (!validStatuses.includes(mappedStatus)) {
      return NextResponse.json(
        { error: '無効なステータスです' },
        { status: 400 }
      );
    }

    // orderIdまたはorderNumberで注文を検索
    let order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // IDで見つからない場合、orderNumberで検索を試行
    if (!order) {
      order = await prisma.order.findUnique({
        where: { orderNumber: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    if (!order) {
      return NextResponse.json(
        { error: '注文が見つかりません' },
        { status: 404 }
      );
    }

    if (order.status !== 'shipped') {
      return NextResponse.json(
        { error: '出荷済みの注文のみ配送完了にできます' },
        { status: 400 }
      );
    }

    // Update order to delivered
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'delivered',
        deliveredAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update all products to sold status
    const productIds = order.items.map(item => item.productId);
    await prisma.product.updateMany({
      where: {
        id: { in: productIds },
      },
      data: {
        status: 'sold',
      },
    });

    // Log delivery activity
    await prisma.activity.create({
      data: {
        type: 'delivery',
        description: `注文 ${order.orderNumber} の配送が完了しました`,
        userId: user.id,
        orderId: order.id,
        metadata: JSON.stringify({
          deliveredAt: updatedOrder.deliveredAt,
          productCount: productIds.length,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: '配送完了処理が完了しました',
    });
  } catch (error) {
    console.error('Delivery processing error:', error);
    return NextResponse.json(
      { error: '配送完了処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}