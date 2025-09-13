const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSpecificProducts() {
  console.log('=== 特定商品とShipment調査 ===');

  // TESTカメラE と TESTカメラG の調査
  const targetProducts = ['TESTカメラE', 'TESTカメラG'];

  for (const productName of targetProducts) {
    console.log(`\n--- ${productName} の調査 ---`);

    const product = await prisma.product.findFirst({
      where: { name: productName },
      include: {
        currentLocation: { select: { code: true, name: true } },
        orderItems: {
          include: {
            order: { select: { id: true, orderNumber: true, status: true } }
          }
        }
      }
    });

    if (product) {
      console.log(`Product: ${product.name} (${product.id})`);
      console.log(`Status: ${product.status}`);
      console.log(`Location: ${product.currentLocation?.code || 'なし'}`);
      console.log(`Order Items: ${product.orderItems.length}`);

      // このproductIdに関連するShipmentを検索
      const shipments = await prisma.shipment.findMany({
        where: { productId: product.id }
      });

      console.log(`Related Shipments: ${shipments.length}`);
      shipments.forEach(s => {
        console.log(`  - Shipment ${s.id}: status=${s.status}, tracking=${s.trackingNumber}`);
      });

      // Bundle Shipmentsを検索
      const bundleShipments = await prisma.shipment.findMany({
        where: {
          notes: { contains: product.id }
        }
      });

      console.log(`Bundle Shipments containing this product: ${bundleShipments.length}`);
      bundleShipments.forEach(bs => {
        console.log(`  - Bundle Shipment ${bs.id}: status=${bs.status}, tracking=${bs.trackingNumber}`);
        if (bs.notes) {
          try {
            const bundleData = JSON.parse(bs.notes);
            console.log(`    Bundle ID: ${bundleData.bundleId}`);
            console.log(`    Items: ${bundleData.bundleItems?.map(i => i.productName || i.product).join(', ')}`);
          } catch (e) {
            console.log('    Notes parse error');
          }
        }
      });
    } else {
      console.log(`Product '${productName}' not found`);
    }
  }

  await prisma.$disconnect();
}

checkSpecificProducts().catch(console.error);