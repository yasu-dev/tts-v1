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

    // Build timeline events
    const timelineEvents: any[] = [];

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

    // モック履歴データ
    const mockHistory: HistoryEvent[] = [
      {
        id: 'event-001',
        timestamp: '2024-01-05T09:00:00Z',
        type: 'received',
        title: '商品入庫',
        description: 'セラーから商品を受領しました',
        user: '受付担当: 山田太郎',
        metadata: {
          location: 'A-01-01',
          condition: '新品同様'
        }
      },
      {
        id: 'event-002',
        timestamp: '2024-01-05T14:30:00Z',
        type: 'inspected',
        title: '検品完了',
        description: '動作確認、外観チェック、付属品確認を完了',
        user: '検品担当: 佐藤花子',
        metadata: {
          condition: 'A (新品同様)'
        }
      },
      {
        id: 'event-003',
        timestamp: '2024-01-06T10:00:00Z',
        type: 'listed',
        title: '出品開始',
        description: 'eBayとメルカリに出品しました',
        user: '出品担当: 鈴木一郎',
        metadata: {
          price: 450000,
          marketplace: 'eBay, メルカリ'
        }
      },
      {
        id: 'event-004',
        timestamp: '2024-01-10T15:00:00Z',
        type: 'price_changed',
        title: '価格変更',
        description: '市場動向を考慮して価格を調整しました',
        user: 'システム自動調整',
        metadata: {
          previousPrice: 450000,
          price: 430000
        }
      },
      {
        id: 'event-005',
        timestamp: '2024-01-15T11:00:00Z',
        type: 'sold',
        title: '販売成立',
        description: 'eBayで購入されました',
        user: '販売担当: 田中次郎',
        metadata: {
          price: 430000,
          marketplace: 'eBay'
        }
      },
      {
        id: 'event-006',
        timestamp: '2024-01-15T16:00:00Z',
        type: 'shipped',
        title: '発送完了',
        description: '梱包・発送を完了しました',
        user: '発送担当: 高橋三郎',
        metadata: {
          trackingNumber: 'JP123456789',
          location: 'B-02-15'
        }
      },
      {
        id: 'event-007',
        timestamp: '2024-01-25T10:00:00Z',
        type: 'returned',
        title: '返品受付',
        description: '商品説明と異なるとの理由で返品されました',
        user: 'CS担当: 渡辺四郎',
        metadata: {
          reason: '商品説明と異なる',
          condition: 'A- (若干の使用感あり)'
        }
      },
      {
        id: 'event-008',
        timestamp: '2024-01-26T14:00:00Z',
        type: 'inspected',
        title: '再検品完了',
        description: '返品商品の状態を確認しました',
        user: '検品担当: 佐藤花子',
        metadata: {
          condition: 'A- (若干の使用感あり)',
          location: 'C-03-08'
        }
      },
      {
        id: 'event-009',
        timestamp: '2024-01-27T10:00:00Z',
        type: 'relisted',
        title: '再出品',
        description: '価格を調整して再出品しました',
        user: '出品担当: 鈴木一郎',
        metadata: {
          price: 380000,
          marketplace: 'ヤフオク, メルカリ'
        }
      }
    ];

    // タイムライン用のデータ形式に変換
    const timelineData = mockHistory.map(event => ({
      ...event,
      start: event.timestamp,
      content: event.title,
      className: `timeline-${event.type}`,
      group: getGroupByType(event.type)
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
        totalEvents: mockHistory.length,
        currentStatus: getLatestStatus(mockHistory),
        daysInInventory: calculateDaysInInventory(mockHistory)
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
function getGroupByType(type: HistoryEventType): string {
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
  return groupMap[type] || 'other';
}

function getLatestStatus(events: HistoryEvent[]): string {
  if (events.length === 0) return 'unknown';
  
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
  
  return statusMap[latestEvent.type] || '不明';
}

function calculateDaysInInventory(events: HistoryEvent[]): number {
  const receivedEvent = events.find(e => e.type === 'received');
  const soldEvent = events.find(e => e.type === 'sold');
  
  if (!receivedEvent || !soldEvent) return 0;
  
  const received = new Date(receivedEvent.timestamp);
  const sold = new Date(soldEvent.timestamp);
  const diffTime = Math.abs(sold.getTime() - received.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}