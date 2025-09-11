const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugBundleData() {
  console.log('🔍 Bundle data debugging...');
  
  try {
    // 1. Check Shipment records with bundle information
    console.log('\n📦 === Shipment Bundle Records ===');
    const shipmentsWithBundles = await prisma.shipment.findMany({
      where: {
        OR: [
          { notes: { contains: 'bundle' } },
          { notes: { contains: '同梱' } },
          { notes: { contains: 'sales_bundle' } }
        ]
      },
      select: {
        id: true,
        productId: true,
        trackingNumber: true,
        notes: true,
        status: true
      },
      take: 10
    });
    
    console.log(`Found ${shipmentsWithBundles.length} shipments with bundle info:`);
    shipmentsWithBundles.forEach((s, i) => {
      console.log(`${i+1}. ProductID: ${s.productId}, TrackingNumber: ${s.trackingNumber}, Status: ${s.status}`);
      if (s.notes && s.notes.length > 0) {
        try {
          const parsedNotes = JSON.parse(s.notes);
          if (parsedNotes.type === 'sales_bundle') {
            console.log(`   🎯 Bundle Type: ${parsedNotes.type}`);
            console.log(`   🎯 Bundle ID: ${parsedNotes.bundleId}`);
            console.log(`   🎯 Total Items: ${parsedNotes.totalItems}`);
            if (parsedNotes.bundleItems) {
              console.log(`   🎯 Bundle Items:`, parsedNotes.bundleItems.map(bi => `${bi.product} (${bi.productId})`));
            }
          }
        } catch (e) {
          console.log(`   📝 Notes (raw): ${s.notes.substring(0, 100)}...`);
        }
      }
    });

    // 2. Check Activity records for sales_bundle_created
    console.log('\n🔄 === Activity Bundle Records ===');
    const bundleActivities = await prisma.activity.findMany({
      where: {
        type: 'sales_bundle_created'
      },
      select: {
        id: true,
        description: true,
        metadata: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`Found ${bundleActivities.length} bundle creation activities:`);
    bundleActivities.forEach((a, i) => {
      console.log(`${i+1}. ${a.description}`);
      if (a.metadata) {
        try {
          const parsedMeta = JSON.parse(a.metadata);
          console.log(`   🎯 Bundle ID: ${parsedMeta.bundleId}`);
          console.log(`   🎯 Total Items: ${parsedMeta.totalItems}`);
          if (parsedMeta.items) {
            console.log(`   🎯 Items: ${parsedMeta.items.map(item => item.product || item.productName).join(', ')}`);
          }
        } catch (e) {
          console.log(`   📝 Metadata (raw): ${a.metadata.substring(0, 100)}...`);
        }
      }
    });

    // 3. Check specific products: Sony FX3 and ABC
    console.log('\n🎯 === Target Products Check ===');
    const targetProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Sony FX3' } },
          { name: { contains: 'ABC' } }
        ]
      },
      select: {
        id: true,
        name: true,
        status: true
      }
    });

    console.log(`Found ${targetProducts.length} target products:`);
    for (const product of targetProducts) {
      console.log(`📦 Product: ${product.name} (${product.id}) - Status: ${product.status}`);
      
      // Check shipments for this product
      const productShipments = await prisma.shipment.findMany({
        where: { productId: product.id },
        select: {
          id: true,
          status: true,
          trackingNumber: true,
          notes: true
        }
      });
      
      console.log(`  📮 Shipments: ${productShipments.length}`);
      productShipments.forEach((s, si) => {
        console.log(`    ${si+1}. Status: ${s.status}, Tracking: ${s.trackingNumber}`);
        if (s.notes && s.notes.includes('bundle')) {
          console.log(`      🔗 Has bundle info in notes`);
        }
      });
    }
    
    console.log('\n✅ Bundle data debugging complete!');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugBundleData();