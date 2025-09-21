import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 商品履歴API - 実データ版
 * パフォーマンス測定用の実装
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    const productId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // 商品存在チェック
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, sku: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // 商品履歴データの取得（実データ版）
    // 複数のテーブルから履歴データを収集
    const [
      activities,
      inventoryMovements,
      orderHistory,
      listingHistory,
      shipmentHistory,
      totalActivities
    ] = await Promise.all([
      // 1. アクティビティログ
      prisma.activity.findMany({
        where: { productId },
        include: {
          user: {
            select: { id: true, username: true, fullName: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),

      // 2. 在庫移動履歴
      prisma.inventoryMovement.findMany({
        where: { productId },
        include: {
          fromLocation: {
            select: { code: true, name: true }
          },
          toLocation: {
            select: { code: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),

      // 3. 注文履歴
      prisma.orderItem.findMany({
        where: { productId },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              orderDate: true,
              customer: {
                select: { username: true, fullName: true }
              }
            }
          }
        },
        orderBy: { order: { createdAt: 'desc' } },
        skip: offset,
        take: limit
      }),

      // 4. 出品履歴
      prisma.listing.findMany({
        where: { productId },
        select: {
          id: true,
          platform: true,
          title: true,
          price: true,
          status: true,
          listedAt: true,
          soldAt: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),

      // 5. 配送履歴
      prisma.shipment.findMany({
        where: {
          order: {
            items: {
              some: { productId }
            }
          }
        },
        select: {
          id: true,
          trackingNumber: true,
          carrier: true,
          status: true,
          shippedAt: true,
          deliveredAt: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),

      // 総件数（ページネーション用）
      prisma.activity.count({
        where: { productId }
      })
    ]);

    // データ統合と整形
    const historyItems = [];

    // アクティビティを履歴アイテムに変換
    activities.forEach(activity => {
      let metadata: any = {};
      try {
        metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
      } catch (e) {
        console.warn('メタデータ解析エラー:', e);
      }

      historyItems.push({
        id: `activity-${activity.id}`,
        type: 'activity',
        action: getActionLabel(activity.type),
        description: activity.description,
        user: activity.user?.fullName || activity.user?.username || 'システム',
        timestamp: activity.createdAt.toISOString(),
        metadata: {
          activityType: activity.type,
          details: metadata
        }
      });
    });

    // 在庫移動を履歴アイテムに変換
    inventoryMovements.forEach(movement => {
      const fromLocation = movement.fromLocation?.name || '不明';
      const toLocation = movement.toLocation?.name || '不明';
      
      historyItems.push({
        id: `movement-${movement.id}`,
        type: 'inventory_movement',
        action: '在庫移動',
        description: `${fromLocation} → ${toLocation}`,
        user: movement.movedBy,
        timestamp: movement.createdAt.toISOString(),
        metadata: {
          fromLocationCode: movement.fromLocation?.code,
          toLocationCode: movement.toLocation?.code,
          notes: movement.notes
        }
      });
    });

    // 注文履歴を履歴アイテムに変換
    orderHistory.forEach(orderItem => {
      const order = orderItem.order;
      
      historyItems.push({
        id: `order-${order.id}`,
        type: 'order',
        action: '注文',
        description: `注文番号: ${order.orderNumber} (${getOrderStatusLabel(order.status)})`,
        user: order.customer?.fullName || order.customer?.username || '顧客',
        timestamp: order.orderDate.toISOString(),
        metadata: {
          orderNumber: order.orderNumber,
          quantity: orderItem.quantity,
          price: orderItem.price,
          status: order.status
        }
      });
    });

    // 出品履歴を履歴アイテムに変換
    listingHistory.forEach(listing => {
      historyItems.push({
        id: `listing-${listing.id}`,
        type: 'listing',
        action: '出品',
        description: `${listing.platform}: ${listing.title}`,
        user: 'システム',
        timestamp: listing.createdAt.toISOString(),
        metadata: {
          platform: listing.platform,
          price: listing.price,
          status: listing.status,
          listedAt: listing.listedAt,
          soldAt: listing.soldAt
        }
      });
    });

    // 配送履歴を履歴アイテムに変換
    shipmentHistory.forEach(shipment => {
      historyItems.push({
        id: `shipment-${shipment.id}`,
        type: 'shipment',
        action: '配送',
        description: `${shipment.carrier} - ${getShipmentStatusLabel(shipment.status)}`,
        user: 'システム',
        timestamp: shipment.createdAt.toISOString(),
        metadata: {
          trackingNumber: shipment.trackingNumber,
          carrier: shipment.carrier,
          status: shipment.status,
          shippedAt: shipment.shippedAt,
          deliveredAt: shipment.deliveredAt
        }
      });
    });

    // 時系列でソート
    historyItems.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // レスポンス生成
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    const response = {
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku
      },
      history: historyItems,
      pagination: {
        page,
        limit,
        total: totalActivities,
        totalPages: Math.ceil(totalActivities / limit),
        hasMore: page * limit < totalActivities
      },
      performance: {
        processingTime,
        itemCount: historyItems.length,
        queryCount: 6, // 実行したクエリ数
        cacheHit: false
      }
    };

    // パフォーマンスヘッダーを追加
    const headers = new Headers();
    headers.set('X-Processing-Time', processingTime.toString());
    headers.set('X-Item-Count', historyItems.length.toString());
    headers.set('X-Query-Count', '6');

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('商品履歴取得エラー:', error);
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    return NextResponse.json(
      { 
        error: '履歴データの取得に失敗しました',
        performance: { processingTime, error: true }
      },
      { status: 500 }
    );
  }
}

// ヘルパー関数
function getActionLabel(activityType: string): string {
  const labels: Record<string, string> = {
    'product_created': '商品登録',
    'product_updated': '情報更新',
    'inspection_started': '検品開始',
    'inspection_completed': '検品完了',
    'photography_completed': '撮影完了',
    'listing_created': '出品',
    'order_received': '注文受付',
    'payment_received': '入金確認',
    'shipping_started': '出荷準備',
    'shipped': '出荷完了',
    'delivered': '配送完了',
    'storage_started': '保管開始',
    'storage_complete': '保管完了',
    'shipment_complete': '発送完了'
  };
  
  return labels[activityType] || activityType;
}

function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'pending': '処理中',
    'confirmed': '確認済み',
    'shipped': '出荷済み',
    'delivered': '配送完了',
    'cancelled': 'キャンセル'
  };
  
  return labels[status] || status;
}

function getShipmentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'pending': '準備中',
    'picked': 'ピッキング完了',
    'packed': '梱包完了',
    'shipped': '出荷完了',
    'delivered': '配送完了'
  };
  
  return labels[status] || status;
}