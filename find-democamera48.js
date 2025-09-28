const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findDemoCamera48() {
  try {
    // DEMOカメラ４８を検索
    const product = await prisma.product.findFirst({
      where: {
        name: { contains: 'DEMOカメラ４８' }
      }
    });

    if (!product) {
      console.log('❌ DEMOカメラ４８が見つかりません');

      // 今日作成された商品を確認
      const todayProducts = await prisma.product.findMany({
        where: {
          createdAt: {
            gte: new Date('2025-09-28T00:00:00Z')
          }
        },
        select: {
          id: true,
          name: true,
          sku: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      console.log('\n今日作成された商品:');
      todayProducts.forEach((p, index) => {
        console.log(`${index + 1}. ${p.name} (${p.sku}) - Status: ${p.status} - ID: ${p.id}`);
      });

      return;
    }

    console.log('✅ DEMOカメラ４８発見:');
    console.log('ID:', product.id);
    console.log('名前:', product.name);
    console.log('SKU:', product.sku);
    console.log('ステータス:', product.status);

    // 履歴を確認
    const activities = await prisma.activity.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📊 DEMOカメラ４８の履歴: ${activities.length}件`);
    activities.forEach((a, index) => {
      console.log(`${index + 1}. ${a.type} - ${a.description} (${a.createdAt.toISOString()})`);
    });

    // 期待される履歴項目をチェック
    const expectedActivities = [
      'product_created',
      'photography_completed',
      'weight_recorded',
      'label_generated',
      'storage_complete',
      'inspection_complete',
      'listing_created',
      'purchase_decision',
      'picking_completed',
      'packing_completed',
      'label_attached',
      'shipping_prepared'
    ];

    console.log('\n📋 期待される履歴項目の確認:');
    expectedActivities.forEach(expectedType => {
      const found = activities.some(a => a.type === expectedType);
      console.log(`${found ? '✅' : '❌'} ${expectedType}`);
    });

    // 不足している履歴を特定
    const missingActivities = expectedActivities.filter(expectedType =>
      !activities.some(a => a.type === expectedType)
    );

    if (missingActivities.length > 0) {
      console.log('\n❌ 不足している履歴:');
      missingActivities.forEach(missing => {
        console.log(`  - ${missing}`);
      });
    } else {
      console.log('\n✅ すべての履歴が記録されています');
    }

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findDemoCamera48();