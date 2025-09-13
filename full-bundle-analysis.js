const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fullBundleAnalysis() {
  console.log('🔍 === 完全な同梱機能分析 ===\n');

  // 1. すべての同梱Shipmentを取得
  console.log('📦 1. 同梱Shipment分析');
  const bundleShipments = await prisma.shipment.findMany({
    where: {
      notes: { contains: 'sales_bundle' }
    }
  });

  console.log(`同梱Shipment数: ${bundleShipments.length}\n`);

  const allBundleProductIds = new Set();
  const bundleMapping = new Map();

  bundleShipments.forEach(shipment => {
    console.log(`Shipment ${shipment.id}:`);
    console.log(`  Status: ${shipment.status}`);
    console.log(`  Tracking: ${shipment.trackingNumber}`);

    if (shipment.notes) {
      try {
        const bundleData = JSON.parse(shipment.notes);
        console.log(`  Bundle ID: ${bundleData.bundleId}`);
        console.log(`  Type: ${bundleData.type}`);
        console.log(`  Items: ${bundleData.bundleItems?.length || 0}件`);

        if (bundleData.bundleItems) {
          bundleData.bundleItems.forEach(item => {
            console.log(`    - ${item.productName || item.product} (${item.productId})`);
            allBundleProductIds.add(item.productId);
            bundleMapping.set(item.productId, {
              bundleId: bundleData.bundleId,
              shipmentId: shipment.id,
              trackingNumber: shipment.trackingNumber,
              shipmentStatus: shipment.status
            });
          });
        }
      } catch (e) {
        console.log(`  ❌ JSON parse error: ${e.message}`);
      }
    }
    console.log('');
  });

  // 2. 同梱対象商品の現在ステータス確認
  console.log('📊 2. 同梱対象商品のステータス確認');
  const bundleProducts = await prisma.product.findMany({
    where: {
      id: { in: Array.from(allBundleProductIds) }
    },
    include: {
      currentLocation: { select: { code: true, name: true } }
    }
  });

  console.log(`同梱対象商品数: ${bundleProducts.length}\n`);

  const statusIssues = [];
  const locationIssues = [];

  bundleProducts.forEach(product => {
    const bundleInfo = bundleMapping.get(product.id);
    console.log(`${product.name} (${product.id}):`);
    console.log(`  Product Status: ${product.status}`);
    console.log(`  Location: ${product.currentLocation?.code || 'なし'}`);
    console.log(`  Bundle ID: ${bundleInfo.bundleId}`);
    console.log(`  Shipment Status: ${bundleInfo.shipmentStatus}`);

    // ステータス不整合チェック
    if (product.status === 'sold' && bundleInfo.shipmentStatus === 'pending') {
      statusIssues.push({
        productId: product.id,
        productName: product.name,
        issue: 'Product=sold but Bundle Shipment=pending',
        productStatus: product.status,
        shipmentStatus: bundleInfo.shipmentStatus
      });
    }

    // ロケーション不整合チェック
    if (product.status === 'shipping' && !product.currentLocation) {
      locationIssues.push({
        productId: product.id,
        productName: product.name,
        issue: 'Product=shipping but no location assigned'
      });
    }

    console.log('');
  });

  // 3. 同梱商品の個別Shipmentチェック
  console.log('🚚 3. 同梱商品の個別Shipment確認');
  for (const productId of allBundleProductIds) {
    const individualShipments = await prisma.shipment.findMany({
      where: {
        productId: productId,
        notes: { not: { contains: 'sales_bundle' } }
      }
    });

    if (individualShipments.length > 0) {
      console.log(`Product ${productId} has ${individualShipments.length} individual shipments:`);
      individualShipments.forEach(s => {
        console.log(`  - Shipment ${s.id}: status=${s.status}, tracking=${s.trackingNumber}`);
      });
    }
  }

  // 4. 問題のサマリー
  console.log('\n🚨 4. 検出された問題');

  if (statusIssues.length > 0) {
    console.log(`\nステータス不整合: ${statusIssues.length}件`);
    statusIssues.forEach(issue => {
      console.log(`  ❌ ${issue.productName}: ${issue.issue}`);
    });
  }

  if (locationIssues.length > 0) {
    console.log(`\nロケーション不整合: ${locationIssues.length}件`);
    locationIssues.forEach(issue => {
      console.log(`  ❌ ${issue.productName}: ${issue.issue}`);
    });
  }

  // 5. ピッキングAPI呼び出しで表示される商品を予測
  console.log('\n🔄 5. ピッキングAPIで表示される商品予測');
  const pickingCandidates = await prisma.product.findMany({
    where: {
      status: { in: ['ordered', 'workstation', 'sold', 'completed'] }
    },
    include: {
      currentLocation: { select: { code: true } },
      orderItems: {
        include: {
          order: {
            select: { status: true, customer: { select: { fullName: true } } }
          }
        },
        where: {
          order: { status: 'processing' }
        },
        take: 1
      }
    }
  });

  console.log(`ピッキング対象候補: ${pickingCandidates.length}件`);

  const bundledInPicking = [];
  const unbundledInPicking = [];

  pickingCandidates.forEach(product => {
    if (allBundleProductIds.has(product.id)) {
      bundledInPicking.push(product);
    } else {
      unbundledInPicking.push(product);
    }
  });

  console.log(`  同梱対象: ${bundledInPicking.length}件`);
  console.log(`  非同梱: ${unbundledInPicking.length}件`);

  bundledInPicking.forEach(product => {
    const bundleInfo = bundleMapping.get(product.id);
    console.log(`    🔗 ${product.name} (Bundle: ${bundleInfo.bundleId})`);
  });

  await prisma.$disconnect();
}

fullBundleAnalysis().catch(console.error);