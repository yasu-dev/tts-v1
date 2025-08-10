import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // デモモード：ピッキングAPI連携用のモック出荷データを生成
    console.log('🎯 デモモード: 出荷管理データ生成開始');
    
    // ピッキング済み（workstation）商品のモックデータ
    const mockShippingItems = [
      {
        id: 'DEMO-SHIP-001',
        productName: 'Canon EOS 5D Mark IV ボディ',
        productSku: 'SKU-CAN-5D4-001',
        orderNumber: 'ORD-20240101-001',
        customer: '田中太郎',
        shippingAddress: '東京都渋谷区代官山1-2-3',
        status: 'workstation' as const, // ピッキング済み→梱包待ち
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        shippingMethod: 'FedEx International',
        value: 350000,
        location: 'STD-A-01',
        productImages: ['/images/products/canon-5d4.jpg'],
        inspectionImages: [],
        inspectionNotes: 'ピッキング完了：外観良好、付属品確認済み'
      },
      {
        id: 'DEMO-SHIP-002', 
        productName: 'Nikon D850 ボディ',
        productSku: 'SKU-NIK-D850-002',
        orderNumber: 'ORD-20240101-002',
        customer: '佐藤花子',
        shippingAddress: '大阪府大阪市北区梅田2-4-5',
        status: 'workstation' as const,
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
        shippingMethod: 'DHL Express',
        value: 320000,
        location: 'STD-A-02',
        productImages: ['/images/products/nikon-d850.jpg'],
        inspectionImages: [],
        inspectionNotes: 'ピッキング完了：動作確認済み'
      },
      {
        id: 'DEMO-SHIP-003',
        productName: 'Rolex Submariner Date 116610LN',
        productSku: 'SKU-ROL-SUB-003',
        orderNumber: 'ORD-20240102-001',
        customer: '山田次郎',
        shippingAddress: '神奈川県横浜市中区元町3-6-7',
        status: 'packed' as const, // 梱包済み
        dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString().split('T')[0],
        shippingMethod: 'ヤマト宅急便',
        value: 1200000,
        location: 'VAULT-01',
        productImages: ['/images/products/rolex-submariner.jpg'],
        inspectionImages: [],
        inspectionNotes: '梱包完了：高級梱包材使用、保険付き'
      },
      {
        id: 'DEMO-SHIP-004',
        productName: 'Sony α7R V ボディ',
        productSku: 'SKU-SON-A7R5-004',
        orderNumber: 'ORD-20240102-002',
        customer: '鈴木一郎',
        shippingAddress: '愛知県名古屋市中区錦1-8-9',
        status: 'ready_for_pickup' as const, // 集荷準備完了
        dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().split('T')[0],
        shippingMethod: 'FedX Priority',
        value: 450000,
        location: 'PACK',
        productImages: ['/images/products/sony-a7r5.jpg'],
        inspectionImages: [],
        inspectionNotes: '出荷準備完了：追跡番号 FX123456789JP'
      }
    ];

    console.log(`✅ デモ出荷データ生成完了: ${mockShippingItems.length}件`);
    return NextResponse.json({ items: mockShippingItems });
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