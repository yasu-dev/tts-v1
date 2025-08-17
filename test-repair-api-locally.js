// 復旧APIのローカルテスト
const { PrismaClient } = require('@prisma/client');

async function testRepairApiLocally() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 復旧APIのローカルテスト開始...');
    
    // 1. 現在のデータ状況
    const beforeShipmentCount = await prisma.shipment.count();
    const beforeOrderCount = await prisma.order.count();
    const beforeUserCount = await prisma.user.count();
    
    console.log('📊 復旧前の状況:');
    console.log(`- Shipment: ${beforeShipmentCount}件`);
    console.log(`- Order: ${beforeOrderCount}件`);
    console.log(`- User: ${beforeUserCount}件`);
    
    // 2. 復旧API内容をローカルで実行
    console.log('\n🛠️ 復旧処理を開始...');
    
    // 注文データを取得
    let orders = await prisma.order.findMany({
      include: { customer: true },
      take: 10
    });
    
    console.log(`注文データ: ${orders.length}件見つかりました`);
    
    if (orders.length === 0) {
      console.log('⚠️ 注文データが存在しません。サンプル注文を作成します...');
      
      // ユーザー確認
      let user = await prisma.user.findFirst({ where: { role: 'customer' } });
      if (!user) {
        console.log('⚠️ 顧客ユーザーが存在しません。作成します...');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 12);
        user = await prisma.user.create({
          data: {
            email: `customer-test-${Date.now()}@example.com`,
            username: 'テスト顧客',
            password: hashedPassword,
            role: 'customer',
            fullName: '復旧テスト顧客'
          }
        });
        console.log(`✅ 顧客ユーザー作成: ${user.id}`);
      }
      
      // サンプル注文作成
      for (let i = 1; i <= 5; i++) {
        const order = await prisma.order.create({
          data: {
            orderNumber: `ORD-2024-REPAIR-${Date.now()}-${i.toString().padStart(3, '0')}`,
            customerId: user.id,
            status: 'confirmed',
            totalAmount: Math.floor(Math.random() * 300000) + 50000,
            shippingAddress: `東京都渋谷区復旧テスト${i}-${i}-${i}`,
            paymentMethod: 'credit_card',
            notes: `復旧テスト用注文 ${i}`,
            orderDate: new Date()
          }
        });
        orders.push({ ...order, customer: user });
        console.log(`✅ サンプル注文作成: ${order.orderNumber}`);
      }
    }
    
    // 3. 出荷データ作成
    console.log('\n📦 出荷データ作成開始...');
    
    const carriers = ['ヤマト運輸', '佐川急便', 'FedEx', '日本郵便'];
    const methods = ['標準配送', '速達', '翌日配送'];
    const shipmentStatuses = ['pending', 'picked', 'packed', 'shipped', 'delivered'];
    const priorities = ['urgent', 'high', 'normal', 'low'];
    
    // 既存の出荷データクリア
    if (beforeShipmentCount > 0) {
      console.log('既存出荷データをクリア...');
      await prisma.shipment.deleteMany({});
    }
    
    const createdShipments = [];
    
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const carrier = carriers[Math.floor(Math.random() * carriers.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const status = shipmentStatuses[Math.floor(Math.random() * shipmentStatuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      
      const shipment = await prisma.shipment.create({
        data: {
          orderId: order.id,
          trackingNumber: status !== 'pending' ? `TRK${Date.now()}${i}` : null,
          carrier: carrier,
          method: method,
          status: status,
          priority: priority,
          customerName: order.customer?.fullName || order.customer?.username || '顧客名不明',
          address: order.shippingAddress || '住所未設定',
          deadline: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
          value: order.totalAmount,
          notes: `ローカル復旧テスト ${i + 1} - ${carrier}`,
          pickedAt: status !== 'pending' ? new Date() : null,
          packedAt: ['packed', 'shipped', 'delivered'].includes(status) ? new Date() : null,
          shippedAt: ['shipped', 'delivered'].includes(status) ? new Date() : null,
          deliveredAt: status === 'delivered' ? new Date() : null
        }
      });
      
      createdShipments.push(shipment);
      console.log(`✅ 出荷データ作成: ${shipment.id} (${status}, ${carrier})`);
    }
    
    // 4. 最終確認
    const afterShipmentCount = await prisma.shipment.count();
    console.log(`\n📊 復旧後の状況:`);
    console.log(`- Shipment: ${afterShipmentCount}件 (${afterShipmentCount - beforeShipmentCount}件増加)`);
    
    console.log('\n✅ ローカル復旧テスト完了');
    console.log(`作成された出荷データ: ${createdShipments.length}件`);
    
    // 作成されたデータのサンプル表示
    console.log('\n📦 作成データサンプル:');
    createdShipments.slice(0, 3).forEach((ship, i) => {
      console.log(`${i+1}. ${ship.customerName} - ${ship.carrier} - ${ship.status}`);
    });
    
    return {
      success: true,
      beforeCount: beforeShipmentCount,
      afterCount: afterShipmentCount,
      created: createdShipments.length
    };
    
  } catch (error) {
    console.error('❌ ローカル復旧テストエラー:', error);
    console.error('詳細:', error.message);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

testRepairApiLocally().then(result => {
  console.log('🎯 最終結果:', result);
});
