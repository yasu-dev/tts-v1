const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixShipmentProductNames() {
  console.log('=== 同梱Shipmentの商品名修正 ===');

  // TESTカメラEとGのShipmentを特定
  const testShipments = await prisma.shipment.findMany({
    where: {
      trackingNumber: 'FXTEMRUYE'
    }
  });

  console.log('修正対象Shipment:');
  for (const shipment of testShipments) {
    console.log(`- Shipment: ${shipment.id}`);
    console.log(`  Product ID: ${shipment.productId}`);
    console.log(`  Current productName: ${shipment.productName || 'N/A'}`);

    if (shipment.productId) {
      // Get the actual product
      const product = await prisma.product.findUnique({
        where: { id: shipment.productId }
      });

      if (product) {
        console.log(`  Actual product name: ${product.name}`);

        // Update shipment with correct product name
        await prisma.shipment.update({
          where: { id: shipment.id },
          data: {
            productName: product.name
          }
        });
        console.log(`✅ 修正完了: ${shipment.id} -> ${product.name}`);
      }
    }
  }

  // 修正後の確認
  const updatedShipments = await prisma.shipment.findMany({
    where: {
      trackingNumber: 'FXTEMRUYE'
    }
  });

  console.log('\n修正後の状態:');
  updatedShipments.forEach(shipment => {
    console.log(`- ${shipment.productName} (ID: ${shipment.id})`);
  });

  await prisma.$disconnect();
}

fixShipmentProductNames().catch(console.error);