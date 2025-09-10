const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixYST5Shipment() {
  try {
    // YST5カメラ商品を確認
    const product = await prisma.product.findUnique({
      where: { id: 'cmfdq7gw1003orpavtjotoj1p' }
    });
    
    if (!product) {
      console.log('YST5カメラ商品が見つかりません');
      return;
    }
    
    console.log('YST5カメラ商品情報:', {
      id: product.id,
      name: product.name,
      status: product.status
    });
    
    // 既存のShipmentレコードを確認
    const existingShipments = await prisma.shipment.findMany({
      where: { productId: product.id }
    });
    
    console.log(`既存Shipment数: ${existingShipments.length}`);
    
    if (existingShipments.length > 0) {
      console.log('既存Shipmentが存在します:', existingShipments[0].id);
      return;
    }
    
    // テスト用顧客を取得または作成
    let testCustomer = await prisma.user.findFirst({
      where: { 
        username: 'yst5-test-customer',
        role: 'seller'
      }
    });
    
    if (!testCustomer) {
      testCustomer = await prisma.user.create({
        data: {
          username: 'yst5-test-customer',
          fullName: 'YST5テストカスタマー',
          email: 'yst5@test.com',
          password: 'test-password',
          role: 'seller'
        }
      });
      console.log('YST5テスト顧客作成:', testCustomer.id);
    }
    
    // テスト用注文を作成
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `YST5-ORDER-${Date.now()}`,
        status: 'pending',
        customerId: testCustomer.id,
        totalAmount: product.price || 0,
        shippingAddress: 'YST5ピッキング指示エリア'
      }
    });
    console.log('YST5テスト注文作成:', testOrder.id);
    
    // Shipmentレコードを作成
    const testShipment = await prisma.shipment.create({
      data: {
        orderId: testOrder.id,
        productId: product.id,
        status: 'workstation', // ピッキング作業中状態
        carrier: 'pending',
        method: 'standard',
        customerName: 'YST5ピッキング指示 - ロケーション A-01',
        address: 'YST5ピッキングエリア',
        deadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4時間後
        priority: 'normal',
        value: product.price || 0,
        notes: 'YST5カメラ - ピッキング指示作成（手動修正）'
      }
    });
    
    console.log('✅ YST5カメラ用Shipment作成完了:', {
      shipmentId: testShipment.id,
      productId: testShipment.productId,
      status: testShipment.status,
      orderId: testShipment.orderId,
      customerName: testShipment.customerName
    });
    
    console.log('✅ 修正完了。出荷管理画面でYST5カメラが表示されるか確認してください。');
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixYST5Shipment();