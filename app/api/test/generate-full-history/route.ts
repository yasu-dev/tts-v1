import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

/**
 * テスト用: 指定商品の全種類の履歴を一括で作成
 * 注意: デモ/検証専用。実運用では無効化すること。
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { productId, sku } = body || {};

    // 既定SKU（ユーザー指定のデモ商品）
    const fallbackSku = 'DP-1758504531585-ZVP8942Q9-AUCMP9';

    // 対象商品特定
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          productId ? { id: productId } : undefined,
          { sku: sku || fallbackSku }
        ].filter(Boolean) as any
      }
    });

    if (!product) {
      return NextResponse.json({ error: '対象商品が見つかりません' }, { status: 404 });
    }

    // テスト用ユーザーを用意（スタッフ/セラー）
    const [staff, seller] = await Promise.all([
      prisma.user.upsert({
        where: { email: 'staff@example.com' },
        update: {},
        create: {
          email: 'staff@example.com',
          username: 'テストスタッフ',
          password: 'dummy',
          role: 'staff',
          fullName: 'テストスタッフ'
        }
      }),
      prisma.user.upsert({
        where: { email: 'seller@example.com' },
        update: {},
        create: {
          email: 'seller@example.com',
          username: 'テストセラー',
          password: 'dummy',
          role: 'seller',
          fullName: 'テストセラー'
        }
      })
    ]);

    // ロケーション用意
    const [recv, store] = await Promise.all([
      prisma.location.upsert({
        where: { code: 'RECV-01' },
        update: {},
        create: { code: 'RECV-01', name: '受入エリア', zone: 'RECV' }
      }),
      prisma.location.upsert({
        where: { code: 'STORE-A01' },
        update: {},
        create: { code: 'STORE-A01', name: '保管エリアA', zone: 'STORE' }
      })
    ]);

    // 既存の付随データ（Listing/Order/Shipment/Movement）は重複を避けつつ作成
    const now = new Date();
    const addMinutes = (date: Date, m: number) => new Date(date.getTime() + m * 60000);

    // 1) Listing（単純作成: 既存があっても追加）
    await prisma.listing.create({
      data: {
        productId: product.id,
        platform: 'ebay',
        listingId: `EBAY-${Date.now()}`,
        title: `${product.name} 出品タイトル`,
        description: product.description || '自動テストによる登録',
        price: product.price || 10000,
        status: 'active',
        listedAt: addMinutes(now, -30)
      }
    });

    // 2) Order + OrderItem
    const order = await prisma.order.create({
      data: {
        orderNumber: `E2E-${Date.now()}-${product.id.slice(-4)}`,
        customerId: seller.id,
        status: 'confirmed',
        totalAmount: product.price || 10000,
        shippingAddress: '東京都テスト区1-2-3',
        paymentMethod: 'credit',
        notes: '自動テスト用',
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            price: product.price || 10000
          }
        }
      }
    });

    // 3) Shipment
    await prisma.shipment.create({
      data: {
        orderId: order.id,
        productId: product.id,
        trackingNumber: `TRK-${Date.now()}`,
        carrier: 'ヤマト運輸',
        method: 'standard',
        status: 'shipped',
        shippedAt: addMinutes(now, -10),
        customerName: 'テスト購入者',
        address: '〒150-0001 東京都渋谷区神宮前1-1-1 テストビル101',
        value: product.price || 10000
      }
    });

    // 4) InventoryMovement
    await prisma.inventoryMovement.create({
      data: {
        productId: product.id,
        fromLocationId: recv.id,
        toLocationId: store.id,
        movedBy: 'テストスタッフ',
        notes: '自動テスト: 受入→保管'
      }
    });

    // 5) Activity（実行者: スタッフ/セラー/システム混在）
    const activities = [
      {
        type: 'product_created',
        description: `商品「${product.name}」を登録しました`,
        userId: seller.id,
        metadata: { source: 'seller' }
      },
      {
        type: 'product_updated',
        description: 'セラーが商品情報を更新しました',
        userId: seller.id,
        metadata: { previousPrice: (product.price || 10000), newPrice: (product.price || 10000) + 111 }
      },
      {
        type: 'inspection_complete',
        description: `商品「${product.name}」の検品が完了しました`,
        userId: staff.id,
        metadata: { condition: product.condition, inspectionCompleted: true }
      },
      {
        type: 'photography_completed',
        description: '商品撮影が完了しました',
        userId: staff.id,
        metadata: { photosCount: 12 }
      },
      {
        type: 'storage_complete',
        description: '保管エリアに配置しました',
        userId: staff.id,
        metadata: { locationName: store.name }
      },
      {
        type: 'label_generated',
        description: '配送ラベルを生成しました',
        userId: staff.id,
        metadata: { carrier: 'ヤマト運輸' }
      },
      {
        type: 'weight_recorded',
        description: '重量を記録しました',
        userId: staff.id,
        metadata: { weightGrams: 850 }
      },
      {
        type: 'status_change',
        description: 'ステータスを変更しました',
        userId: staff.id,
        metadata: { previousStatus: 'inspection', newStatus: 'storage' }
      },
      {
        type: 'order_received',
        description: '注文を受け付けました',
        userId: null,
        metadata: { orderNumber: order.orderNumber, userRole: 'system', price: product.price || 10000 }
      },
      {
        type: 'payment_received',
        description: '入金を確認しました',
        userId: null,
        metadata: { orderNumber: order.orderNumber, userRole: 'system' }
      },
      {
        type: 'shipping_started',
        description: '出荷準備を開始しました',
        userId: staff.id,
        metadata: { userRole: 'staff' }
      },
      {
        type: 'shipped',
        description: '出荷完了しました',
        userId: staff.id,
        metadata: { trackingNumber: `TRK-${Date.now()}`, carrier: 'ヤマト運輸', userRole: 'staff' }
      },
      {
        type: 'listing',
        description: 'セラーが出品を作成しました',
        userId: seller.id,
        metadata: { platform: 'ebay', price: (product.price || 10000) + 111 }
      },
      {
        type: 'notification_sent',
        description: 'セラーへ通知を送信しました',
        userId: null, // システム
        metadata: { notificationType: 'info' }
      },
      {
        type: 'inbound',
        description: '入庫登録を行いました',
        userId: seller.id, // セラーによる登録の想定
        metadata: { receivedBy: 'seller' }
      }
    ];

    for (const a of activities) {
      await prisma.activity.create({
        data: {
          type: a.type,
          description: a.description,
          userId: a.userId,
          productId: product.id,
          metadata: a.metadata ? JSON.stringify(a.metadata) : null
        }
      });
    }

    return NextResponse.json({ success: true, productId: product.id });
  } catch (error) {
    console.error('[generate-full-history] error', error);
    return NextResponse.json({ error: '作成に失敗しました' }, { status: 500 });
  }
}


