import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

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
    const { orderId, productIds, reason, refundAmount, notes } = body;

    if (!orderId || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: '注文IDと返品商品IDが必要です' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: '注文が見つかりません' },
        { status: 404 }
      );
    }

    if (!['delivered', 'shipped'].includes(order.status)) {
      return NextResponse.json(
        { error: '出荷済みまたは配送完了の注文のみ返品処理できます' },
        { status: 400 }
      );
    }

    // Verify all productIds belong to this order
    const orderProductIds = order.items.map(item => item.productId);
    const invalidProductIds = productIds.filter((id: string) => !orderProductIds.includes(id));

    if (invalidProductIds.length > 0) {
      return NextResponse.json(
        { error: 'この注文に含まれていない商品があります' },
        { status: 400 }
      );
    }

    // Check if all products are being returned (full return) or partial return
    const isFullReturn = productIds.length === order.items.length;

    // Update order status
    const newOrderStatus = isFullReturn ? 'returned' : order.status;
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newOrderStatus,
        notes: notes ? `${order.notes || ''}\n返品情報: ${notes}` : order.notes,
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

    // Update product statuses to returned
    await prisma.product.updateMany({
      where: {
        id: { in: productIds },
      },
      data: {
        status: 'returned',
      },
    });

    // Log return activity for the order
    await prisma.activity.create({
      data: {
        type: 'return',
        description: `注文 ${order.orderNumber} の${isFullReturn ? '全商品' : '一部商品'}が返品されました`,
        userId: user.id,
        orderId,
        metadata: JSON.stringify({
          returnedProductIds: productIds,
          reason,
          refundAmount,
          notes,
          isFullReturn,
        }),
      },
    });

    // Log return activity for each returned product
    const returnedItems = order.items.filter(item => productIds.includes(item.productId));
    for (const item of returnedItems) {
      await prisma.activity.create({
        data: {
          type: 'return',
          description: `商品 ${item.product.name} が返品されました (注文: ${order.orderNumber})`,
          userId: user.id,
          productId: item.productId,
          orderId,
          metadata: JSON.stringify({
            reason,
            refundAmount: refundAmount ? Math.floor(refundAmount / productIds.length) : null,
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `${isFullReturn ? '全商品の' : '一部商品の'}返品処理が完了しました`,
      return: {
        productIds,
        reason,
        refundAmount,
        isFullReturn,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Return processing error:', error);
    return NextResponse.json(
      { error: '返品処理中にエラーが発生しました' },
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
    const { productIds, status, locationId, notes } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    const validStatuses = ['inspection', 'storage', 'listing'];
    const mappedStatus = status?.replace('検品', 'inspection')
                               .replace('保管', 'storage')
                               .replace('出品', 'listing');

    if (status && !validStatuses.includes(mappedStatus)) {
      return NextResponse.json(
        { error: '無効なステータスです' },
        { status: 400 }
      );
    }

    // Verify all products are in returned status
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'returned',
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: '返品ステータスでない商品が含まれています' },
        { status: 400 }
      );
    }

    // Update product statuses and location if provided
    const updateData: any = {};
    if (mappedStatus) {
      updateData.status = mappedStatus;
    }
    if (locationId) {
      updateData.currentLocationId = locationId;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.product.updateMany({
        where: {
          id: { in: productIds },
        },
        data: updateData,
      });
    }

    // Create inventory movements if location is specified
    if (locationId) {
      for (const productId of productIds) {
        const product = products.find(p => p.id === productId);
        if (product && product.currentLocationId !== locationId) {
          await prisma.inventoryMovement.create({
            data: {
              productId,
              fromLocationId: product.currentLocationId,
              toLocationId: locationId,
              movedBy: user.username,
              notes: notes || '返品商品の再配置',
            },
          });
        }
      }
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'return_processing',
        description: `${productIds.length}点の返品商品が処理されました`,
        userId: user.id,
        metadata: JSON.stringify({
          productIds,
          newStatus: mappedStatus,
          locationId,
          notes,
        }),
      },
    });

    const updatedProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        currentLocation: true,
      },
    });

    return NextResponse.json({
      success: true,
      products: updatedProducts,
      message: '返品商品の処理が完了しました',
    });
  } catch (error) {
    console.error('Return product processing error:', error);
    return NextResponse.json(
      { error: '返品商品処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}