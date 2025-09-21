import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 商品履歴のイベントタイプ
type HistoryEventType = 
  | 'received'      // 入庫
  | 'inspected'     // 検品
  | 'listed'        // 出品
  | 'price_changed' // 価格変更
  | 'sold'          // 販売
  | 'shipped'       // 発送
  | 'returned'      // 返品
  | 'relisted';     // 再出品

interface HistoryEvent {
  id: string;
  timestamp: string;
  type: HistoryEventType;
  title: string;
  description: string;
  user: string;
  metadata?: {
    price?: number;
    previousPrice?: number;
    condition?: string;
    location?: string;
    marketplace?: string;
    trackingNumber?: string;
    reason?: string;
  };
}

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

    // Build timeline events from real data
    const timelineEvents: any[] = [];

    // Add activity events with proper mapping
    product.activities.forEach(activity => {
      const activityMetadata = activity.metadata ? JSON.parse(activity.metadata) : {};
      
      timelineEvents.push({
        id: `activity-${activity.id}`,
        type: 'activity',
        timestamp: activity.createdAt,
        title: getActivityTitle(activity.type, activity.description),
        status: activity.type,
        user: activity.user?.username || 'システム',
        description: activity.description,
        metadata: activityMetadata
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
        description: movement.notes || 'ロケーションが変更されました',
        metadata: {
          fromLocation: movement.fromLocation?.code,
          toLocation: movement.toLocation?.code,
          notes: movement.notes
        }
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
        description: `商品が注文されました`,
        user: 'システム',
        metadata: {
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount
        }
      });

      if (order.shippedAt) {
        timelineEvents.push({
          id: `shipped-${order.id}`,
          type: 'shipping',
          timestamp: order.shippedAt,
          title: `出荷完了: ${order.orderNumber}`,
          status: 'shipped',
          description: '商品が出荷されました',
          user: 'システム',
          metadata: {
            orderNumber: order.orderNumber,
            trackingNumber: order.trackingNumber,
            carrier: order.carrier
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
          description: '商品が配送完了しました',
          user: 'システム',
          metadata: {
            orderNumber: order.orderNumber
          }
        });
      }
    });

    // Sort events by timestamp
    timelineEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Convert real timeline events to the expected format
    const timelineData = timelineEvents.map(event => ({
      id: event.id,
      timestamp: event.timestamp,
      type: mapEventTypeToHistoryType(event.type, event.status),
      title: event.title,
      description: event.description,
      user: event.user,
      metadata: event.metadata,
      start: event.timestamp,
      content: event.title,
      className: `timeline-${mapEventTypeToHistoryType(event.type, event.status)}`,
      group: getGroupByEventType(event.type, event.status)
    }));

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
      timeline: timelineData,
      summary: {
        totalEvents: timelineData.length,
        currentStatus: getLatestStatusFromRealData(timelineData),
        daysInInventory: calculateDaysInInventoryFromRealData(timelineData)
      }
    });
  } catch (error) {
    console.error('Product history error:', error);
    return NextResponse.json(
      { error: '商品履歴の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ヘルパー関数
function getActivityTitle(activityType: string, description: string): string {
  const titleMap: { [key: string]: string } = {
    'product_registered': '商品登録',
    'product_received': '商品入庫',
    'inspection_started': '検品開始',
    'inspection_completed': '検品完了',
    'photography_started': '撮影開始',
    'photography_completed': '撮影完了',
    'listing_started': '出品開始',
    'listing_completed': '出品完了',
    'price_updated': '価格変更',
    'status_updated': 'ステータス更新',
    'location_moved': 'ロケーション移動',
    'order_received': '注文受付',
    'order_shipped': '発送完了',
    'order_delivered': '配送完了',
    'order_returned': '返品受付',
    'product_cancelled': '商品キャンセル'
  };
  
  return titleMap[activityType] || description || 'システム操作';
}

// Map event types to history event types for display consistency
function mapEventTypeToHistoryType(eventType: string, status?: string): HistoryEventType {
  if (eventType === 'activity') {
    const activityMap: { [key: string]: HistoryEventType } = {
      'product_received': 'received',
      'inspection_completed': 'inspected',
      'listing_started': 'listed',
      'listing_completed': 'listed',
      'price_updated': 'price_changed',
      'product_returned': 'returned'
    };
    return activityMap[status || ''] || 'received';
  }
  
  if (eventType === 'movement') return 'received';
  if (eventType === 'order') return 'sold';
  if (eventType === 'shipping') return 'shipped';
  if (eventType === 'delivery') return 'shipped';
  
  return 'received';
}

function getGroupByEventType(eventType: string, status?: string): string {
  const mappedType = mapEventTypeToHistoryType(eventType, status);
  const groupMap = {
    'received': 'inventory',
    'inspected': 'quality',
    'listed': 'sales',
    'price_changed': 'sales',
    'sold': 'sales',
    'shipped': 'logistics',
    'returned': 'customer',
    'relisted': 'sales'
  };
  return groupMap[mappedType] || 'other';
}

function getLatestStatusFromRealData(events: any[]): string {
  if (events.length === 0) return '未登録';
  
  const latestEvent = events[events.length - 1];
  const statusMap = {
    'received': '入庫済み',
    'inspected': '検品済み',
    'listed': '出品中',
    'price_changed': '出品中',
    'sold': '販売済み',
    'shipped': '発送済み',
    'returned': '返品処理中',
    'relisted': '再出品中'
  };
  
  return statusMap[latestEvent.type] || '処理中';
}

function calculateDaysInInventoryFromRealData(events: any[]): number {
  const receivedEvent = events.find(e => e.type === 'received');
  const soldEvent = events.find(e => e.type === 'sold');
  
  if (!receivedEvent) return 0;
  
  const endDate = soldEvent ? new Date(soldEvent.timestamp) : new Date();
  const startDate = new Date(receivedEvent.timestamp);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}