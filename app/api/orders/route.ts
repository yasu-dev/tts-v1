import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.requireAuth(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }
    if (customerId) {
      whereClause.customerId = customerId;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
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
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: '注文取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireAuth(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { customerId, items, shippingAddress, paymentMethod, notes } = body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '顧客ID、商品情報が必要です' },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: '顧客が見つかりません' },
        { status: 404 }
      );
    }

    // Verify all products exist and are available
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: { in: ['storage', 'listing'] },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: '一部の商品が見つからないか、利用できません' },
        { status: 400 }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      const itemPrice = item.price || product.price;
      totalAmount += itemPrice * (item.quantity || 1);
      return {
        productId: item.productId,
        quantity: item.quantity || 1,
        price: itemPrice,
      };
    });

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        totalAmount,
        shippingAddress,
        paymentMethod,
        notes,
        items: {
          create: orderItems,
        },
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

    // Update product statuses to 'ordered'
    await prisma.product.updateMany({
      where: {
        id: { in: productIds },
      },
      data: {
        status: 'ordered',
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'order_created',
        description: `新しい注文 ${orderNumber} が作成されました`,
        userId: user.id,
        orderId: order.id,
        metadata: {
          orderNumber,
          totalAmount,
          itemCount: items.length,
        },
      },
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: '注文作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.requireAuth(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, status, shippingAddress, paymentMethod, notes } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: '注文IDが必要です' },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: '注文が見つかりません' },
        { status: 404 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    
    let mappedStatus = status;
    if (status) {
      mappedStatus = status.replace('保留中', 'pending')
                           .replace('確認済み', 'confirmed')
                           .replace('処理中', 'processing')
                           .replace('出荷済み', 'shipped')
                           .replace('配送完了', 'delivered')
                           .replace('キャンセル', 'cancelled')
                           .replace('返品', 'returned');

      if (!validStatuses.includes(mappedStatus)) {
        return NextResponse.json(
          { error: '無効なステータスです' },
          { status: 400 }
        );
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(mappedStatus && { status: mappedStatus }),
        ...(shippingAddress !== undefined && { shippingAddress }),
        ...(paymentMethod !== undefined && { paymentMethod }),
        ...(notes !== undefined && { notes }),
        ...(mappedStatus === 'shipped' && { shippedAt: new Date() }),
        ...(mappedStatus === 'delivered' && { deliveredAt: new Date() }),
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

    // Update product statuses based on order status
    if (mappedStatus) {
      const productIds = existingOrder.items.map(item => item.productId);
      let productStatus;

      switch (mappedStatus) {
        case 'confirmed':
        case 'processing':
          productStatus = 'ordered';
          break;
        case 'shipped':
          productStatus = 'shipping';
          break;
        case 'delivered':
          productStatus = 'sold';
          break;
        case 'cancelled':
          productStatus = 'storage';
          break;
        case 'returned':
          productStatus = 'returned';
          break;
        default:
          productStatus = null;
      }

      if (productStatus) {
        await prisma.product.updateMany({
          where: {
            id: { in: productIds },
          },
          data: {
            status: productStatus,
          },
        });
      }
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'order_updated',
        description: `注文 ${existingOrder.orderNumber} が更新されました`,
        userId: user.id,
        orderId,
        metadata: {
          fromStatus: existingOrder.status,
          toStatus: mappedStatus,
          changes: { status, shippingAddress, paymentMethod, notes },
        },
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: '注文更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}