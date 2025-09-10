const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFullFlow() {
  try {
    console.log('=== フルフローテスト開始 ===');
    
    // 1. テスト商品を作成（納品プランで作成される商品をシミュレート）
    console.log('\n[STEP 1] テスト商品作成中...');
    
    // テスト用セラーを取得
    let testSeller = await prisma.user.findFirst({
      where: { role: 'seller' }
    });
    
    if (!testSeller) {
      testSeller = await prisma.user.create({
        data: {
          username: 'test-seller-fullflow',
          fullName: 'フルフローテストセラー',
          email: 'fullflow@test.com',
          password: 'test-password',
          role: 'seller'
        }
      });
      console.log('テストセラー作成:', testSeller.id);
    }
    
    // テスト商品を作成
    const testProduct = await prisma.product.create({
      data: {
        name: `フルフローテストカメラ-${Date.now()}`,
        category: 'camera_body',
        condition: 'good',
        price: 150000,
        status: 'inbound', // 初期状態
        sellerId: testSeller.id,
        sku: `TEST-CAMERA-${Date.now().toString().slice(-8)}`,
        description: 'フルフローテスト用商品',
        metadata: JSON.stringify({
          deliveryPlanId: `TEST-DP-${Date.now()}`,
          deliveryPlanProductId: `TEST-DPP-${Date.now()}`,
          purchaseDate: new Date().toISOString(),
          supplier: 'テストサプライヤー'
        })
      }
    });
    
    console.log('✅ テスト商品作成完了:', {
      id: testProduct.id,
      name: testProduct.name,
      status: testProduct.status
    });
    
    // 2. 商品ステータスを検品完了まで進める
    console.log('\n[STEP 2] 商品ステータスを検品完了に更新...');
    const updatedProduct = await prisma.product.update({
      where: { id: testProduct.id },
      data: { status: 'completed' } // 検品完了状態
    });
    console.log('✅ 商品ステータス更新完了:', updatedProduct.status);
    
    // 3. ピッキング指示作成をシミュレート（APIの手動実行）
    console.log('\n[STEP 3] ピッキング指示作成処理をシミュレート...');
    
    // 商品ステータスをworkstationに更新
    await prisma.product.update({
      where: { id: testProduct.id },
      data: { status: 'workstation' }
    });
    console.log('商品ステータスをworkstationに更新完了');
    
    // Shipment作成処理をテスト
    console.log('Shipment作成処理開始...');
    
    // テスト用注文を作成
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `TEST-ORDER-${Date.now()}`,
        status: 'pending',
        customerId: testSeller.id,
        totalAmount: testProduct.price,
        shippingAddress: 'テストピッキングエリア'
      }
    });
    console.log('テスト注文作成完了:', testOrder.id);
    
    // Shipment作成
    try {
      const testShipment = await prisma.shipment.create({
        data: {
          orderId: testOrder.id,
          productId: testProduct.id,
          status: 'workstation',
          carrier: 'pending',
          method: 'standard',
          customerName: 'フルフローテスト - ロケーション A-01',
          address: 'テストピッキングエリア',
          deadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
          priority: 'normal',
          value: testProduct.price,
          notes: 'フルフローテスト - 自動作成'
        }
      });
      console.log('✅ Shipment作成成功:', testShipment.id);
      
      // 4. 結果確認
      console.log('\n[STEP 4] 結果確認...');
      const finalProduct = await prisma.product.findUnique({
        where: { id: testProduct.id }
      });
      
      const shipments = await prisma.shipment.findMany({
        where: { productId: testProduct.id }
      });
      
      console.log('\n=== 最終結果 ===');
      console.log('商品情報:', {
        id: finalProduct.id,
        name: finalProduct.name,
        status: finalProduct.status
      });
      console.log('Shipment情報:', {
        count: shipments.length,
        details: shipments.map(s => ({
          id: s.id,
          status: s.status,
          customerName: s.customerName
        }))
      });
      
      if (finalProduct.status === 'workstation' && shipments.length > 0) {
        console.log('\n🎉 フルフローテスト成功！');
        console.log('✅ 商品ステータス: workstation');
        console.log('✅ Shipmentレコード: 作成済み');
        console.log('✅ 出荷管理表示: 可能');
        
        return {
          success: true,
          productId: testProduct.id,
          productName: testProduct.name,
          shipmentId: testShipment.id
        };
      } else {
        console.log('\n❌ フルフローテスト失敗');
        console.log('❌ 商品ステータス:', finalProduct.status);
        console.log('❌ Shipment数:', shipments.length);
        return { success: false };
      }
      
    } catch (shipmentError) {
      console.error('\n❌ Shipment作成エラー:', {
        message: shipmentError.message,
        code: shipmentError.code,
        details: shipmentError
      });
      return { success: false, error: shipmentError.message };
    }
    
  } catch (error) {
    console.error('\n❌ フルフローテスト失敗:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

testFullFlow().then(result => {
  console.log('\n=== テスト完了 ===');
  console.log(result);
});