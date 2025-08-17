// 完全な状況確認スクリプト
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function completeAnalysis() {
  try {
    console.log('🔍 COMPLETE ANALYSIS - 完全な状況確認');
    console.log('='.repeat(60));

    // 1. データベースの実際の状況
    console.log('📊 データベース状況:');
    const shipmentCount = await prisma.shipment.count();
    const orderCount = await prisma.order.count();
    const userCount = await prisma.user.count();
    
    console.log(`- Shipment: ${shipmentCount}件`);
    console.log(`- Order: ${orderCount}件`);
    console.log(`- User: ${userCount}件`);

    // 2. 実際のShipmentデータサンプル
    if (shipmentCount > 0) {
      console.log('\n📦 Shipmentデータサンプル:');
      const shipments = await prisma.shipment.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' }
      });
      
      shipments.forEach((ship, i) => {
        console.log(`${i+1}. ID: ${ship.id}`);
        console.log(`   Customer: ${ship.customerName}`);
        console.log(`   Carrier: ${ship.carrier}`);
        console.log(`   Status: ${ship.status}`);
        console.log(`   TrackingNumber: ${ship.trackingNumber || 'NULL'}`);
        console.log(`   Created: ${ship.createdAt}`);
        console.log('---');
      });
    }

    // 3. APIテスト（実際の呼び出し）
    console.log('\n🌐 API実行テスト:');
    
    try {
      // orders/shipping API
      const ordersResponse = await fetch('http://localhost:3002/api/orders/shipping?page=1&limit=20');
      const ordersData = await ordersResponse.json();
      console.log(`/api/orders/shipping: ${ordersData.items?.length || 0}件`);
      
      if (ordersData.pagination) {
        console.log(`  Pagination - Total: ${ordersData.pagination.totalCount}, Pages: ${ordersData.pagination.totalPages}`);
      }
    } catch (e) {
      console.log('/api/orders/shipping: ERROR -', e.message);
    }

    try {
      // shipping API
      const shippingResponse = await fetch('http://localhost:3002/api/shipping');
      const shippingData = await shippingResponse.json();
      console.log(`/api/shipping: ${shippingData.todayShipments?.length || 0}件（今日分のみ）`);
      
      if (shippingData.stats) {
        console.log(`  Stats - Total: ${shippingData.stats.todayTotal}, Pending: ${shippingData.stats.pending}`);
      }
    } catch (e) {
      console.log('/api/shipping: ERROR -', e.message);
    }

    // 4. 復旧API実行テスト
    console.log('\n🛠️ 復旧API実行:');
    try {
      const repairResponse = await fetch('http://localhost:3002/api/fix-shipment-data');
      const repairData = await repairResponse.json();
      console.log('復旧API結果:', repairData.success ? '成功' : '失敗');
      if (repairData.data) {
        console.log(`作成された出荷データ: ${repairData.data.createdShipments}件`);
      }
    } catch (e) {
      console.log('復旧API: ERROR -', e.message);
    }

    // 5. 復旧後の再確認
    console.log('\n📊 復旧後データベース確認:');
    const finalShipmentCount = await prisma.shipment.count();
    console.log(`最終Shipment件数: ${finalShipmentCount}件`);

    if (finalShipmentCount > shipmentCount) {
      console.log(`✅ ${finalShipmentCount - shipmentCount}件のデータが追加されました`);
      
      // 追加されたデータのサンプル
      const newShipments = await prisma.shipment.findMany({
        take: 2,
        orderBy: { createdAt: 'desc' }
      });
      
      console.log('追加されたデータサンプル:');
      newShipments.forEach((ship, i) => {
        console.log(`${i+1}. ${ship.customerName} - ${ship.carrier} - ${ship.status}`);
      });
    }

    console.log('\n='.repeat(60));
    console.log('🎯 結論:');
    
    if (finalShipmentCount === 0) {
      console.log('❌ 復旧APIが正常に動作していない可能性があります');
    } else {
      console.log(`✅ データベースに${finalShipmentCount}件のShipmentデータが存在します`);
      console.log('💡 フロントエンドまたはAPIの処理に問題がある可能性があります');
    }

  } catch (error) {
    console.error('❌ 分析エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeAnalysis();
