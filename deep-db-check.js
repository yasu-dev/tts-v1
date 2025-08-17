const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deepDatabaseCheck() {
  try {
    console.log('🔍 データベース構造の徹底調査を開始...');

    // 1. 全テーブルの件数確認
    const tables = [
      'User', 'Order', 'OrderItem', 'Shipment', 
      'Product', 'Location', 'InventoryMovement',
      'Activity', 'DeliveryPlan', 'PickingTask'
    ];

    for (const table of tables) {
      try {
        const count = await prisma[table.toLowerCase()].count();
        console.log(`📊 ${table}: ${count}件`);
      } catch (e) {
        console.log(`❌ ${table}: エラー - ${e.message}`);
      }
    }

    // 2. Shipmentテーブルの詳細確認
    console.log('\n🚚 Shipmentテーブル詳細:');
    const shipments = await prisma.shipment.findMany({
      take: 3,
      include: {
        order: {
          include: {
            customer: true
          }
        }
      }
    });

    if (shipments.length > 0) {
      console.log('📦 Shipmentデータサンプル:');
      shipments.forEach((ship, index) => {
        console.log(`${index + 1}. ID: ${ship.id}`);
        console.log(`   OrderID: ${ship.orderId}`);
        console.log(`   Customer: ${ship.customerName}`);
        console.log(`   Carrier: ${ship.carrier}`);
        console.log(`   Status: ${ship.status}`);
        console.log(`   Created: ${ship.createdAt}`);
        console.log(`   Order exists: ${ship.order ? 'Yes' : 'No'}`);
        if (ship.order?.customer) {
          console.log(`   Customer from Order: ${ship.order.customer.username}`);
        }
        console.log('---');
      });
    } else {
      console.log('❌ Shipmentテーブルは空です');
    }

    // 3. Orderテーブルの詳細確認
    console.log('\n📋 Orderテーブル詳細:');
    const orders = await prisma.order.findMany({
      take: 3,
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        },
        shipments: true
      }
    });

    if (orders.length > 0) {
      console.log('📋 Orderデータサンプル:');
      orders.forEach((order, index) => {
        console.log(`${index + 1}. OrderNumber: ${order.orderNumber}`);
        console.log(`   Customer: ${order.customer.username}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Items: ${order.items.length}件`);
        console.log(`   Shipments: ${order.shipments.length}件`);
        console.log(`   Created: ${order.createdAt}`);
        console.log('---');
      });
    } else {
      console.log('❌ Orderテーブルは空です');
    }

    // 4. データ整合性チェック
    console.log('\n🔍 データ整合性チェック:');
    const ordersWithoutShipments = await prisma.order.findMany({
      where: {
        shipments: {
          none: {}
        },
        status: {
          in: ['confirmed', 'processing', 'shipped']
        }
      }
    });
    
    console.log(`📋 出荷データが無い注文: ${ordersWithoutShipments.length}件`);

    if (ordersWithoutShipments.length > 0) {
      console.log('出荷データが無い注文のサンプル:');
      ordersWithoutShipments.slice(0, 3).forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderNumber} - ${order.status}`);
      });
    }

    // 5. スキーマチェック（Shipmentテーブルの構造）
    console.log('\n🏗️ Shipmentテーブル構造チェック完了');
    
    // 6. 最新のアクティビティチェック
    console.log('\n📋 最新のActivity:');
    const activities = await prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true
      }
    });

    activities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.type}: ${activity.description}`);
      console.log(`   User: ${activity.user?.username || 'Unknown'}`);
      console.log(`   Date: ${activity.createdAt}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ データベース調査エラー:', error);
    console.error('詳細:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deepDatabaseCheck();
