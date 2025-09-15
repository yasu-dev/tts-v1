const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalCleanupStepByStep() {
  try {
    console.log('=== 段階的最終クリーンアップ ===\n');

    // 1. 現在のデータ状況確認
    console.log('📊 現在のデータ状況:');
    const currentCounts = await prisma.$transaction([
      prisma.user.count(),
      prisma.product.count(),
      prisma.deliveryPlan.count(),
      prisma.order.count(),
      prisma.activity.count(),
      prisma.task.count()
    ]);

    console.log(`   User: ${currentCounts[0]}件`);
    console.log(`   Product: ${currentCounts[1]}件`);
    console.log(`   DeliveryPlan: ${currentCounts[2]}件`);
    console.log(`   Order: ${currentCounts[3]}件`);
    console.log(`   Activity: ${currentCounts[4]}件`);
    console.log(`   Task: ${currentCounts[5]}件\n`);

    // 2. 残りのProductに関連するテーブルを特定
    console.log('🔍 Product関連の制約を確認中...');

    if (currentCounts[1] > 0) {
      const products = await prisma.product.findMany({
        select: { id: true, name: true },
        take: 5
      });

      console.log('残存商品例:');
      products.forEach(p => {
        console.log(`   - ${p.name} (${p.id})`);
      });

      const productIds = products.map(p => p.id);

      // 各関連テーブルをチェック
      console.log('\n関連テーブルの残存データ:');

      const relatedCounts = await prisma.$transaction([
        prisma.orderItem.count({ where: { productId: { in: productIds } } }),
        prisma.shipment.count({ where: { productId: { in: productIds } } }),
        prisma.listing.count({ where: { productId: { in: productIds } } }),
        prisma.inspectionChecklist.count({ where: { productId: { in: productIds } } }),
        prisma.productImage.count({ where: { productId: { in: productIds } } })
      ]);

      console.log(`   OrderItem: ${relatedCounts[0]}件`);
      console.log(`   Shipment: ${relatedCounts[1]}件`);
      console.log(`   Listing: ${relatedCounts[2]}件`);
      console.log(`   InspectionChecklist: ${relatedCounts[3]}件`);
      console.log(`   ProductImage: ${relatedCounts[4]}件`);

      // 3. 段階的削除
      console.log('\n🔧 段階的削除を実行:');

      await prisma.$transaction(async (tx) => {
        // 残存する関連データを削除
        if (relatedCounts[0] > 0) {
          const deleted = await tx.orderItem.deleteMany({
            where: { productId: { in: productIds } }
          });
          console.log(`   ✓ OrderItem追加削除: ${deleted.count}件`);
        }

        if (relatedCounts[1] > 0) {
          const deleted = await tx.shipment.deleteMany({
            where: { productId: { in: productIds } }
          });
          console.log(`   ✓ Shipment追加削除: ${deleted.count}件`);
        }

        if (relatedCounts[2] > 0) {
          const deleted = await tx.listing.deleteMany({
            where: { productId: { in: productIds } }
          });
          console.log(`   ✓ Listing追加削除: ${deleted.count}件`);
        }

        if (relatedCounts[3] > 0) {
          const deleted = await tx.inspectionChecklist.deleteMany({
            where: { productId: { in: productIds } }
          });
          console.log(`   ✓ InspectionChecklist追加削除: ${deleted.count}件`);
        }

        if (relatedCounts[4] > 0) {
          const deleted = await tx.productImage.deleteMany({
            where: { productId: { in: productIds } }
          });
          console.log(`   ✓ ProductImage追加削除: ${deleted.count}件`);
        }

        // Productを削除
        console.log('\n   📦 Product削除試行...');
        const deletedProducts = await tx.product.deleteMany({});
        console.log(`   ✅ Product削除成功: ${deletedProducts.count}件`);
      });
    }

    // 4. 残りのテーブルを順次削除
    console.log('\n📋 残りデータの削除:');

    await prisma.$transaction(async (tx) => {
      if (currentCounts[2] > 0) {
        // DeliveryPlan関連
        await tx.deliveryPlanProductImage.deleteMany({});
        await tx.deliveryPlanProduct.deleteMany({});
        const plans = await tx.deliveryPlan.deleteMany({});
        console.log(`   ✅ DeliveryPlan削除: ${plans.count}件`);
      }

      // マスターデータとユーザー
      const locations = await tx.location.deleteMany({});
      const carriers = await tx.carrier.deleteMany({});
      const settings = await tx.systemSetting.deleteMany({});
      const users = await tx.user.deleteMany({});

      console.log(`   ✅ Location削除: ${locations.count}件`);
      console.log(`   ✅ Carrier削除: ${carriers.count}件`);
      console.log(`   ✅ SystemSetting削除: ${settings.count}件`);
      console.log(`   ✅ User削除: ${users.count}件`);
    });

    // 5. 最終確認
    console.log('\n🎯 最終確認:');
    const finalCounts = await prisma.$transaction([
      prisma.user.count(),
      prisma.product.count(),
      prisma.deliveryPlan.count(),
      prisma.order.count(),
      prisma.location.count(),
      prisma.carrier.count()
    ]);

    console.log(`   User: ${finalCounts[0]}件`);
    console.log(`   Product: ${finalCounts[1]}件`);
    console.log(`   DeliveryPlan: ${finalCounts[2]}件`);
    console.log(`   Order: ${finalCounts[3]}件`);
    console.log(`   Location: ${finalCounts[4]}件`);
    console.log(`   Carrier: ${finalCounts[5]}件`);

    if (finalCounts.every(count => count === 0)) {
      console.log('\n🎉 完全クリーンアップ成功！');
      console.log('✅ データベースは完全にクリーンになりました。');
      console.log('📝 新しいユーザーデータの投入準備完了です。');
    } else {
      console.log('\n⚠️  一部データが残存しています。');
    }

  } catch (error) {
    console.error('❌ エラー:', error.message);
    console.log('コード:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

finalCleanupStepByStep();