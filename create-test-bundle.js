const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestBundle() {
  console.log('=== TESTカメラE と TESTカメラG の同梱Shipment作成 ===');

  // First, get the products
  const products = await prisma.product.findMany({
    where: {
      name: { in: ['TESTカメラE', 'TESTカメラG'] }
    }
  });

  if (products.length !== 2) {
    console.log('必要な商品が見つかりません');
    return;
  }

  console.log('対象商品:');
  products.forEach(p => {
    console.log(`- ${p.name} (${p.id})`);
  });

  // Create a temp customer if not exists
  let tempCustomer = await prisma.user.findFirst({
    where: { username: 'temp-customer-bundle' }
  });

  if (!tempCustomer) {
    tempCustomer = await prisma.user.create({
      data: {
        username: 'temp-customer-bundle',
        fullName: 'Bundle Test Customer',
        email: 'bundle@test.com',
        password: 'temp-password',
        role: 'customer'
      }
    });
    console.log('テスト顧客を作成しました');
  }

  // Create a temp order
  const tempOrder = await prisma.order.create({
    data: {
      orderNumber: `BUNDLE-TEST-${Date.now()}`,
      status: 'processing',
      customerId: tempCustomer.id,
      totalAmount: 50000,
      shippingAddress: 'Test Bundle Address'
    }
  });

  console.log(`テスト注文を作成しました: ${tempOrder.orderNumber}`);

  // Create order items for both products
  for (const product of products) {
    await prisma.orderItem.create({
      data: {
        orderId: tempOrder.id,
        productId: product.id,
        quantity: 1,
        price: 25000
      }
    });
  }

  console.log('注文アイテムを作成しました');

  // Create bundle shipment
  const bundleData = {
    type: 'sales_bundle',
    bundleId: `BUNDLE-${Date.now()}`,
    totalItems: 2,
    bundleItems: products.map(p => ({
      productId: p.id,
      productName: p.name,
      product: p.name
    }))
  };

  const trackingNumber = `FX${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const bundleShipment = await prisma.shipment.create({
    data: {
      orderId: tempOrder.id,
      status: 'pending',
      carrier: 'fedx',
      method: 'standard',
      trackingNumber: trackingNumber,
      customerName: tempCustomer.fullName,
      address: tempOrder.shippingAddress,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      priority: 'normal',
      value: 50000,
      notes: JSON.stringify(bundleData)
    }
  });

  console.log(`同梱Shipmentを作成しました:`);
  console.log(`- Shipment ID: ${bundleShipment.id}`);
  console.log(`- Tracking Number: ${trackingNumber}`);
  console.log(`- Bundle ID: ${bundleData.bundleId}`);

  // Update products to 'ordered' status so they appear in picking
  await prisma.product.updateMany({
    where: {
      id: { in: products.map(p => p.id) }
    },
    data: {
      status: 'ordered'
    }
  });

  console.log('商品ステータスを ordered に更新しました');

  await prisma.$disconnect();
  console.log('=== 完了 ===');
}

createTestBundle().catch(console.error);