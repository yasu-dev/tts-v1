import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Prismaを使用して出荷データを取得
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayShipments = await prisma.shipment.findMany({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        },
        // スタッフ画面には追跡番号付きの商品のみ表示（セラーがラベル生成済み）
        trackingNumber: {
          not: null,
          notIn: ['', ' ']
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // ピッキングタスクを取得
    const pickingTasks = await prisma.pickingTask.findMany({
      where: {
        status: { in: ['pending', 'in_progress'] }
      },
      include: {
        items: true
      },
      orderBy: { dueDate: 'asc' },
      take: 15
    });

    // 統計情報を計算
    const totalShipments = await prisma.shipment.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    const completedShipments = await prisma.shipment.count({
      where: {
        status: 'delivered',
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    const pendingShipments = await prisma.shipment.count({
      where: {
        status: { in: ['pending', 'picked', 'packed'] },
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        },
        // 統計にも追跡番号付きの商品のみ含める
        trackingNumber: {
          not: null,
          notIn: ['', ' ']
        }
      }
    });

    const urgentShipments = await prisma.shipment.count({
      where: {
        priority: 'urgent',
        status: { not: 'delivered' }
      }
    });

    const shippingData = {
      todayShipments: todayShipments.map(shipment => ({
        id: shipment.id,
        orderId: shipment.orderId,
        productId: shipment.productId,
        productName: `商品 ${shipment.productId?.substring(0, 8) || 'N/A'}`,
        customer: shipment.customerName,
        address: shipment.address,
        shippingMethod: shipment.carrier,
        priority: shipment.priority,
        deadline: shipment.deadline?.toTimeString().substring(0, 5) || '',
        status: shipment.status,
        trackingNumber: shipment.trackingNumber, // 必ず有効な追跡番号が存在
        value: shipment.value,
        locationCode: 'STD-A-01', // デフォルト値
        locationName: '標準棚A-01' // デフォルト値
      })),
      pickingTasks: pickingTasks.map(task => ({
        id: task.id,
        orderId: task.orderId,
        customer: task.customerName,
        priority: task.priority,
        status: task.status,
        totalItems: task.totalItems,
        pickedItems: task.pickedItems,
        deadline: task.dueDate.toTimeString().substring(0, 5),
        items: task.items.map(item => ({
          productName: item.productName,
          sku: item.sku,
          location: item.location,
          quantity: item.quantity,
          pickedQuantity: item.pickedQuantity,
          status: item.status
        }))
      })),
      carriers: [
        { id: 'yamato', name: 'ヤマト運輸', isActive: true },
        { id: 'sagawa', name: '佐川急便', isActive: true },
        { id: 'fedex', name: 'FedEx', isActive: true },
        { id: 'dhl', name: 'DHL', isActive: true },
        { id: 'ups', name: 'UPS', isActive: false },
      ],
      stats: {
        todayTotal: totalShipments,
        completed: completedShipments,
        pending: pendingShipments,
        urgent: urgentShipments,
        efficiency: totalShipments > 0 ? Math.round((completedShipments / totalShipments) * 100) : 0,
      }
    };

    return NextResponse.json(shippingData);
  } catch (error) {
    console.error('[ERROR] GET /api/shipping:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch shipping data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, carrier, method, priority, customerName, address, value, notes } = body;

    const newShipment = await prisma.shipment.create({
      data: {
        orderId,
        carrier: carrier || 'ヤマト運輸',
        method: method || 'Standard',
        priority: priority || 'normal',
        customerName,
        address,
        value: value || 0,
        notes,
        status: 'pending',
        trackingNumber: `TRK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      }
    });

    return NextResponse.json(newShipment, { status: 201 });
  } catch (error) {
    console.error('[ERROR] POST /api/shipping:', error);
    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { shipmentId, status, notes } = body;

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status,
        notes,
        ...(status === 'picked' && { pickedAt: new Date() }),
        ...(status === 'packed' && { packedAt: new Date() }),
        ...(status === 'shipped' && { shippedAt: new Date() }),
        ...(status === 'delivered' && { deliveredAt: new Date() }),
      }
    });

    // ready_for_pickup（集荷準備完了）ステータス更新時にセラー販売管理も連携更新
    if (status === 'delivered') { // ready_for_pickupはdeliveredでDBに保存される
      try {
        // 関連するListingを特定してshippedステータスに更新
        const relatedOrders = await prisma.order.findMany({
          where: {
            shipments: {
              some: { id: shipmentId }
            }
          },
          include: {
            orderItems: {
              include: {
                product: {
                  include: {
                    listings: true
                  }
                }
              }
            }
          }
        });

        for (const order of relatedOrders) {
          for (const item of order.orderItems) {
            if (item.product?.listings) {
              for (const listing of item.product.listings) {
                // shippingStatusカラムを更新
                await prisma.listing.update({
                  where: { id: listing.id },
                  data: {
                    shippingStatus: 'shipped',
                    shippedAt: new Date()
                  }
                });
              }
            }
          }
        }

        console.log(`✅ セラー販売管理連携完了: shipmentId=${shipmentId} -> shipped`);
      } catch (linkError) {
        console.error('セラー販売管理連携エラー:', linkError);
        // 連携エラーでもShipment更新は成功として扱う
      }
    }

    return NextResponse.json(updatedShipment);
  } catch (error) {
    console.error('[ERROR] PUT /api/shipping:', error);
    return NextResponse.json(
      { error: 'Failed to update shipment' },
      { status: 500 }
    );
  }
}