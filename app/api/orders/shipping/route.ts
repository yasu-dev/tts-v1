import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🚚 出荷管理データ取得開始');
    console.log('📍 リクエストURL:', request.url);

    // ページネーションパラメータ
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // デフォルト50件（ページネーション表示のため）
    const offset = (page - 1) * limit;
    
    // ステータスフィルタリングパラメータ
    const statusFilter = searchParams.get('status') || 'all';

    console.log(`📄 ページネーションパラメータ: page=${page}, limit=${limit}, offset=${offset}, statusFilter=${statusFilter}`);

    // ステータスフィルタリング条件を構築
    const getStatusFilter = (filter: string) => {
      switch (filter) {
        case 'workstation':
          return { status: { in: ['pending', 'picked'] } }; // pending→workstation, picked→picked
        case 'packed':
          return { status: 'packed' };
        case 'ready_for_pickup':
          return { status: 'delivered' }; // delivered→ready_for_pickup
        case 'all':
        default:
          return { status: { in: ['pending', 'picked', 'packed', 'shipped', 'delivered'] } };
      }
    };

    const whereClause = getStatusFilter(statusFilter);

    // 全タブの統計情報を並行取得
    const [shipments, totalCount, allCount, workstationCount, packedCount, readyForPickupCount] = await Promise.all([
      prisma.shipment.findMany({
        where: whereClause,
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.shipment.count({
        where: whereClause,
      }),
      // 全ステータス
      prisma.shipment.count({
        where: { status: { in: ['pending', 'picked', 'packed', 'shipped', 'delivered'] } }
      }),
      // 梱包待ち (pending + picked)
      prisma.shipment.count({
        where: { status: { in: ['pending', 'picked'] } }
      }),
      // 梱包済み
      prisma.shipment.count({
        where: { status: 'packed' }
      }),
      // 集荷準備完了 (delivered)
      prisma.shipment.count({
        where: { status: 'delivered' }
      }),
    ]);

    console.log(`📦 Shipmentデータ取得: ${shipments.length}件 / 総数: ${totalCount}件`);

    // デバッグ：最初の数件のshipmentデータを確認
    if (shipments.length > 0) {
      console.log('🔍 最初のshipmentデータサンプル:');
      console.log('shipment[0]:', JSON.stringify(shipments[0], null, 2));
    } else {
      console.log('⚠️ WARNING: Shipmentデータが0件です！');
      
      // 代替として、Orderデータがあるか確認
      const orderCount = await prisma.order.count();
      console.log(`📋 Orderテーブルの件数: ${orderCount}件`);
      
      if (orderCount === 0) {
        console.log('❌ ERROR: OrderもShipmentも存在しません - seedスクリプトが実行されていない可能性');
      }
    }

    // Shipmentデータを適切な形式に変換
    const shippingItems = shipments.map((shipment) => {
      // 商品情報を取得（注文の最初の商品を使用）
      const firstProduct = shipment.order?.items?.[0]?.product;
      const productName = firstProduct?.name || `商品 #${shipment.productId?.slice(-6) || 'N/A'}`;
      const productSku = firstProduct?.sku || `SKU-${shipment.productId?.slice(-6) || 'UNKNOWN'}`;
      
      // ステータスをマッピング
      let displayStatus: 'storage' | 'ordered' | 'picked' | 'workstation' | 'packed' | 'shipped' | 'ready_for_pickup' = 'workstation';
      switch (shipment.status) {
        case 'pending':
          displayStatus = 'workstation';  // 梱包待ち状態
          break;
        case 'picked':
          displayStatus = 'workstation';  // ピッキング済み→梱包待ち
          break;
        case 'packed':
          displayStatus = 'packed';
          break;
        case 'shipped':
          displayStatus = 'shipped';
          break;
        case 'delivered':
          displayStatus = 'ready_for_pickup';
          break;
        default:
          displayStatus = 'workstation';
      }
      
      return {
        id: shipment.id,
        productName: productName,
        productSku: productSku,
        orderNumber: shipment.order?.orderNumber || `ORD-${shipment.orderId.slice(-6)}`,
        customer: shipment.customerName,
        shippingAddress: shipment.address,
        status: displayStatus,
        dueDate: shipment.deadline ? new Date(shipment.deadline).toISOString().split('T')[0] : 
                 new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        shippingMethod: `${shipment.carrier} - ${shipment.method}`,
        value: shipment.value,
        location: firstProduct?.currentLocationId ? `LOC-${firstProduct.currentLocationId.slice(-4)}` : 'A1-01',
        productImages: firstProduct?.imageUrl ? [firstProduct.imageUrl] : [],
        inspectionImages: [],
        inspectionNotes: shipment.notes || `優先度: ${shipment.priority}`,
        trackingNumber: shipment.trackingNumber || undefined,
      };
    });

    console.log(`✅ 出荷データ変換完了: ${shippingItems.length}件`);
    return NextResponse.json({ 
      items: shippingItems,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount: totalCount,
        limit: limit,
      },
      stats: {
        total: allCount,
        workstation: workstationCount,
        packed: packedCount,
        ready_for_pickup: readyForPickupCount,
      }
    });
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