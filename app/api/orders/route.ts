import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';
import { notificationService } from '@/lib/services/notification.service';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status') || 'all';
    
    const skip = (page - 1) * limit;
    
    // ステータス条件を構築
    const whereCondition = status === 'all' ? {} : { status };
    
    // 注文データを取得
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereCondition,
        include: {
          items: {
            include: {
              product: {
                select: { name: true, imageUrl: true }
              }
            }
          },
          customer: {
            select: { username: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: whereCondition })
    ]);

    // レスポンスデータ構築
    const ordersData = {
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: {
          name: order.customer.username,
          email: order.customer.email
        },
        status: order.status,
        totalAmount: order.totalAmount,
        items: order.items.map(item => ({
          id: item.id,
          productName: item.product.name,
          imageUrl: item.product.imageUrl,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        orderDate: order.orderDate.toISOString(),
        shippedAt: order.shippedAt?.toISOString(),
        deliveredAt: order.deliveredAt?.toISOString(),
        notes: order.notes,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    };

    return NextResponse.json(ordersData);
  } catch (error) {
    console.error('[ERROR] Orders API:', error);
    
    return NextResponse.json(
      { error: '注文データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    const body = await request.json();
    
    const { customerId, items, shippingAddress, paymentMethod, notes } = body;
    
    // 合計金額を計算
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    
    // 注文番号を生成
    const orderNumber = `ORD-${Date.now()}`;
    
    // 注文を作成
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        status: 'pending',
        totalAmount,
        shippingAddress,
        paymentMethod,
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true
      }
    });

    // 商品のステータスを更新
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { status: 'ordered' }
      });
    }

    // アクティビティログを作成
    await prisma.activity.create({
      data: {
        type: 'order_created',
        description: `新規注文 ${orderNumber} が作成されました`,
        userId: user.id,
        orderId: order.id,
        metadata: JSON.stringify({ totalAmount, itemCount: items.length })
      }
    });

    // セラーに商品購入通知を送信
    try {
      const uniqueSellerIds = [...new Set(order.items.map(item => item.product.sellerId))];
      
      for (const sellerId of uniqueSellerIds) {
        const sellerItems = order.items.filter(item => item.product.sellerId === sellerId);
        const sellerItemNames = sellerItems.map(item => item.product.name).join(', ');
        const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        await notificationService.sendNotification({
          type: 'product_sold',
          title: '🎉 商品が売れました！',
          message: `商品「${sellerItemNames}」が売れました。合計金額: ¥${sellerTotal.toLocaleString()}`,
          userId: sellerId,
          metadata: {
            orderNumber,
            orderId: order.id,
            totalAmount: sellerTotal,
            items: sellerItems.map(item => ({
              productName: item.product.name,
              quantity: item.quantity,
              price: item.price
            }))
          }
        });
      }
      
      console.log(`📧 商品購入通知送信完了: ${uniqueSellerIds.length}名のセラーに送信`);
    } catch (notificationError) {
      console.error('商品購入通知送信エラー:', notificationError);
      // 通知エラーは注文作成成功には影響させない
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('[ERROR] Order creation:', error);
    
    return NextResponse.json(
      { error: '注文の作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    const body = await request.json();
    
    const { orderId, status, notes } = body;
    
    // 注文ステータスを更新
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        notes,
        ...(status === 'shipped' && { shippedAt: new Date() }),
        ...(status === 'delivered' && { deliveredAt: new Date() })
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    // 商品ステータスを更新
    for (const item of updatedOrder.items) {
      let productStatus = 'ordered';
      
      switch (status) {
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
      }
      
      await prisma.product.update({
        where: { id: item.productId },
        data: { status: productStatus }
      });
    }

    // アクティビティログを作成
    await prisma.activity.create({
      data: {
        type: 'order_updated',
        description: `注文 ${updatedOrder.orderNumber} のステータスが ${status} に更新されました`,
        userId: user.id,
        orderId: updatedOrder.id,
        metadata: JSON.stringify({ newStatus: status })
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('[ERROR] Order update:', error);
    
    return NextResponse.json(
      { error: '注文の更新に失敗しました' },
      { status: 500 }
    );
  }
}