const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestShipment() {
  try {
    // 商品ABCを確認
    const product = await prisma.product.findUnique({
      where: { id: 'cmfdp6bte000prpavljbugfjy' }
    });
    
    if (!product) {
      console.log('商品ABCが見つかりません');
      return;
    }
    
    console.log('商品ABC情報:', {
      id: product.id,
      name: product.name,
      status: product.status
    });
    
    // テスト用顧客を取得または作成（Userモデル使用）
    let testCustomer = await prisma.user.findFirst({
      where: { 
        username: 'test-customer',
        role: 'seller' // sellerロールのユーザーを使用
      }
    });
    
    if (!testCustomer) {
      testCustomer = await prisma.user.create({
        data: {
          username: 'test-customer',
          fullName: 'テストカスタマー',
          email: 'test@customer.com',
          password: 'test-password',
          role: 'seller'
        }
      });
      console.log('テスト顧客作成:', testCustomer.id);
    }
    
    // テスト用注文を作成
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `TEST-ORDER-${Date.now()}`,
        status: 'pending',
        customerId: testCustomer.id,
        totalAmount: product.price || 0,
        shippingAddress: 'テスト出荷エリア'
      }
    });
    console.log('テスト注文作成:', testOrder.id);
    
    // Shipmentレコードを作成（最小限のフィールドで）
    const testShipment = await prisma.shipment.create({
      data: {
        orderId: testOrder.id,
        productId: product.id,
        status: 'workstation', // ピッキング作業中状態
        carrier: 'pending',
        method: 'standard',
        customerName: 'テストロケーション: A-01',
        address: 'テスト出荷エリア',
        deadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4時間後
        priority: 'normal',
        value: product.price || 0,
        notes: 'テスト用Shipment - ピッキング指示作成テスト'
      }
    });
    
    console.log('テスト用Shipment作成完了:', {
      shipmentId: testShipment.id,
      productId: testShipment.productId,
      status: testShipment.status,
      orderId: testShipment.orderId,
      customerName: testShipment.customerName
    });
    
    console.log('✅ テスト完了。出荷管理画面でABC商品が表示されるか確認してください。');
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestShipment();