const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBundleData() {
  console.log('=== 商品データ確認 ===');
  const products = await prisma.product.findMany({
    where: {
      name: { contains: 'カメラ' }
    },
    select: {
      id: true,
      name: true,
      status: true,
      currentLocation: {
        select: {
          code: true,
          name: true
        }
      }
    }
  });

  console.log('カメラ商品一覧:');
  products.forEach(p => {
    console.log(`- ${p.name} (${p.id}) - Status: ${p.status}, Location: ${p.currentLocation?.code || 'なし'}`);
  });

  console.log('\n=== 同梱Shipment確認 ===');
  const bundleShipments = await prisma.shipment.findMany({
    where: {
      notes: { contains: 'sales_bundle' }
    },
    select: {
      id: true,
      trackingNumber: true,
      notes: true,
      status: true
    }
  });

  console.log('同梱Shipment一覧:');
  bundleShipments.forEach(s => {
    console.log(`- Shipment ${s.id}: ${s.trackingNumber}, Status: ${s.status}`);
    if (s.notes) {
      try {
        const bundleData = JSON.parse(s.notes);
        console.log(`  Bundle ID: ${bundleData.bundleId}`);
        console.log(`  Items: ${bundleData.bundleItems?.map(i => i.productName || i.product).join(', ')}`);
      } catch (e) {
        console.log('  Notes parse error');
      }
    }
  });

  await prisma.$disconnect();
}

checkBundleData().catch(console.error);