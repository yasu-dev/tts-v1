const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteDemoData() {
  try {
    console.log('=== デモデータ削除開始 ===\n');

    // 1. デモユーザーの確認
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo-seller@example.com' }
    });

    if (!demoUser) {
      console.log('❌ デモユーザーが見つかりません。削除する必要はありません。');
      return;
    }

    console.log('✅ 削除対象デモユーザー:');
    console.log(`   ID: ${demoUser.id}`);
    console.log(`   Email: ${demoUser.email}`);
    console.log(`   Username: ${demoUser.username}\n`);

    // 削除対象の商品IDを取得
    const targetProducts = await prisma.product.findMany({
      where: { sellerId: demoUser.id },
      select: { id: true, name: true }
    });

    console.log(`削除対象商品: ${targetProducts.length}件`);
    targetProducts.forEach(p => console.log(`   - ${p.name} (${p.id})`));
    console.log('');

    // トランザクションで安全に削除（外部キー制約を考慮した順序）
    await prisma.$transaction(async (tx) => {
      const productIds = targetProducts.map(p => p.id);

      // 関連テーブルから先に削除
      // Listingを削除
      const deletedListings = await tx.listing.deleteMany({
        where: { productId: { in: productIds } }
      });
      console.log(`   - Listing削除: ${deletedListings.count}件`);

      // Shipmentを削除
      const deletedShipments = await tx.shipment.deleteMany({
        where: { productId: { in: productIds } }
      });
      console.log(`   - Shipment削除: ${deletedShipments.count}件`);

      // InspectionChecklistを削除
      const deletedChecklists = await tx.inspectionChecklist.deleteMany({
        where: { productId: { in: productIds } }
      });
      console.log(`   - InspectionChecklist削除: ${deletedChecklists.count}件`);

      // ProductImageを削除
      const deletedImages = await tx.productImage.deleteMany({
        where: { productId: { in: productIds } }
      });
      console.log(`   - ProductImage削除: ${deletedImages.count}件`);

      // HierarchicalInspectionDataを削除（存在する場合）
      try {
        if (tx.hierarchicalInspectionData) {
          const deletedHierarchical = await tx.hierarchicalInspectionData.deleteMany({
            where: { productId: { in: productIds } }
          });
          console.log(`   - HierarchicalInspectionData削除: ${deletedHierarchical.count}件`);
        }
      } catch (e) {
        // テーブルが存在しない場合はスキップ
      }

      // Productを削除
      const deletedProducts = await tx.product.deleteMany({
        where: { sellerId: demoUser.id }
      });
      console.log(`📦 Product削除: ${deletedProducts.count}件`);

      // DeliveryPlanProductを削除（DeliveryPlanに関連）
      const demoPlans = await tx.deliveryPlan.findMany({
        where: { sellerId: demoUser.id },
        select: { id: true }
      });
      const planIds = demoPlans.map(p => p.id);

      if (planIds.length > 0) {
        // DeliveryPlanProductImageを削除
        const planProducts = await tx.deliveryPlanProduct.findMany({
          where: { deliveryPlanId: { in: planIds } },
          select: { id: true }
        });
        const planProductIds = planProducts.map(p => p.id);

        if (planProductIds.length > 0) {
          const deletedPlanImages = await tx.deliveryPlanProductImage.deleteMany({
            where: { deliveryPlanProductId: { in: planProductIds } }
          });
          console.log(`   - DeliveryPlanProductImage削除: ${deletedPlanImages.count}件`);
        }

        // DeliveryPlanProductを削除
        const deletedPlanProducts = await tx.deliveryPlanProduct.deleteMany({
          where: { deliveryPlanId: { in: planIds } }
        });
        console.log(`   - DeliveryPlanProduct削除: ${deletedPlanProducts.count}件`);
      }

      // DeliveryPlanを削除
      const deletedPlans = await tx.deliveryPlan.deleteMany({
        where: { sellerId: demoUser.id }
      });
      console.log(`📋 DeliveryPlan削除: ${deletedPlans.count}件`);

      // デモユーザーアカウントを削除
      await tx.user.delete({
        where: { id: demoUser.id }
      });
      console.log(`👤 デモユーザーアカウント削除完了`);
    });

    console.log('\n✅ デモデータの削除が完了しました');

    // 削除後の統計を表示
    const remainingUsers = await prisma.user.count();
    const remainingProducts = await prisma.product.count();
    const remainingPlans = await prisma.deliveryPlan.count();

    console.log('\n📊 削除後のデータ統計:');
    console.log(`   - ユーザー: ${remainingUsers}件`);
    console.log(`   - 商品: ${remainingProducts}件`);
    console.log(`   - 納品プラン: ${remainingPlans}件`);

    console.log('\n=== 削除完了 ===');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    console.log('\nデータベースは変更されていません。');
  } finally {
    await prisma.$disconnect();
  }
}

// 実行確認
console.log('⚠️  警告: このスクリプトはデモデータを削除します。');
console.log('削除対象: demo-seller@example.com とその関連データ');
console.log('');

deleteDemoData();