const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDemoBundle() {
  console.log('🔍 DEMOカメラ商品の確認と同梱設定...');

  try {
    // DEMOカメラ商品を検索
    const demoProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'DEMOカメラ' } },
          { name: { contains: 'DEMO' } }
        ]
      },
      include: {
        orderItems: {
          include: {
            order: true
          }
        }
      }
    });

    console.log(`📦 検出されたDEMO商品: ${demoProducts.length}件`);
    demoProducts.forEach(product => {
      console.log(`  - ${product.name} (ID: ${product.id})`);
      if (product.orderItems.length > 0) {
        const order = product.orderItems[0].order;
        console.log(`    注文: ${order.orderNumber}, 追跡番号: ${order.trackingNumber}`);
      }
    });

    // DEMOカメラ１２とDEMOカメラ１３を探す
    const demoCamera12 = demoProducts.find(p => p.name.includes('DEMOカメラ１２'));
    const demoCamera13 = demoProducts.find(p => p.name.includes('DEMOカメラ１３'));

    if (!demoCamera12 || !demoCamera13) {
      console.log('❌ DEMOカメラ１２またはDEMOカメラ１３が見つかりません');

      // 代わりにXYZcameraで確認
      const xyzProducts = await prisma.product.findMany({
        where: {
          name: { contains: 'XYZcamera' }
        },
        include: {
          orderItems: {
            include: {
              order: true
            }
          }
        }
      });

      console.log(`📦 XYZcamera商品: ${xyzProducts.length}件`);
      xyzProducts.forEach(product => {
        console.log(`  - ${product.name} (ID: ${product.id})`);
        if (product.orderItems.length > 0) {
          const order = product.orderItems[0].order;
          console.log(`    注文: ${order.orderNumber}, 追跡番号: ${order.trackingNumber}`);
        }
      });

      return;
    }

    console.log('🎯 DEMOカメラ１２とDEMOカメラ１３を同梱設定中...');

    // 同じ追跡番号を設定
    const bundleTrackingNumber = 'BUNDLE-DEMO-12-13';

    // DEMOカメラ１２の注文を更新
    if (demoCamera12.orderItems.length > 0) {
      const order12 = demoCamera12.orderItems[0].order;
      await prisma.order.update({
        where: { id: order12.id },
        data: { trackingNumber: bundleTrackingNumber }
      });
      console.log(`✅ DEMOカメラ１２の注文追跡番号を更新: ${bundleTrackingNumber}`);
    }

    // DEMOカメラ１３の注文を更新
    if (demoCamera13.orderItems.length > 0) {
      const order13 = demoCamera13.orderItems[0].order;
      await prisma.order.update({
        where: { id: order13.id },
        data: { trackingNumber: bundleTrackingNumber }
      });
      console.log(`✅ DEMOカメラ１３の注文追跡番号を更新: ${bundleTrackingNumber}`);
    }

    console.log('🎉 同梱設定完了！');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoBundle();