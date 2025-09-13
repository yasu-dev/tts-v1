const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSpecificProducts() {
  console.log('=== TESTカメラE と TESTカメラG の詳細確認 ===');

  const targetProducts = await prisma.product.findMany({
    where: {
      name: { in: ['TESTカメラE', 'TESTカメラG'] }
    },
    include: {
      currentLocation: true,
      orderItems: {
        include: {
          order: {
            include: {
              customer: true
            }
          }
        }
      }
    }
  });

  targetProducts.forEach(p => {
    console.log(`\n商品: ${p.name} (${p.id})`);
    console.log(`  Status: ${p.status}`);
    console.log(`  Location: ${p.currentLocation?.code || 'なし'}`);
    console.log(`  Order Items: ${p.orderItems.length}件`);
    p.orderItems.forEach((oi, idx) => {
      console.log(`    ${idx + 1}. Order: ${oi.order.orderNumber}, Status: ${oi.order.status}, Customer: ${oi.order.customer?.fullName || oi.order.customer?.username}`);
    });
  });

  console.log('\n=== 全ての同梱Shipment詳細確認 ===');
  const allBundleShipments = await prisma.shipment.findMany({
    where: {
      notes: { contains: 'bundle' }
    },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      }
    }
  });

  allBundleShipments.forEach((s, idx) => {
    console.log(`\n${idx + 1}. Shipment: ${s.id}`);
    console.log(`   Tracking: ${s.trackingNumber}`);
    console.log(`   Status: ${s.status}`);
    if (s.notes) {
      try {
        const bundleData = JSON.parse(s.notes);
        console.log(`   Bundle Type: ${bundleData.type}`);
        console.log(`   Bundle ID: ${bundleData.bundleId}`);
        if (bundleData.bundleItems) {
          console.log(`   Bundle Items:`);
          bundleData.bundleItems.forEach((item, itemIdx) => {
            console.log(`     ${itemIdx + 1}. Product: ${item.productName || item.product} (ID: ${item.productId})`);
          });
        }
      } catch (e) {
        console.log(`   Notes: ${s.notes.substring(0, 100)}...`);
      }
    }
  });

  await prisma.$disconnect();
}

checkSpecificProducts().catch(console.error);