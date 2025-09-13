const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixShipmentProductNames() {
  console.log('=== 同梱Shipmentの商品名修正 ===');

  // TESTカメラEとGのShipmentを特定
  const testShipments = await prisma.shipment.findMany({
    where: {
      trackingNumber: 'FXTEMRUYE'
    },
    include: {
      product: true
    }
  });

  console.log('修正対象Shipment:');
  testShipments.forEach(shipment => {
    console.log(`- Shipment: ${shipment.id}`);
    console.log(`  Product ID: ${shipment.productId}`);
    console.log(`  Current productName: ${shipment.productName || 'N/A'}`);
    console.log(`  Actual product name: ${shipment.product?.name || 'N/A'}`);
  });

  // 各Shipmentの商品名を修正
  for (const shipment of testShipments) {
    if (shipment.product) {
      await prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          productName: shipment.product.name
        }
      });
      console.log(`✅ 修正完了: ${shipment.id} -> ${shipment.product.name}`);
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