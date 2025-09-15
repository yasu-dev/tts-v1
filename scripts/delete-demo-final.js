const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteDemoDataFinal() {
  try {
    console.log('=== デモデータ最終削除処理 ===\n');

    // 1. デモユーザーの確認
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo-seller@example.com' }
    });

    if (!demoUser) {
      console.log('✅ デモユーザーは既に削除されています。');
      return;
    }

    console.log('📍 削除対象デモユーザー:');
    console.log(`   ID: ${demoUser.id}`);
    console.log(`   Email: ${demoUser.email}`);
    console.log(`   Username: ${demoUser.username}\n`);

    // 削除対象の商品を取得
    const targetProducts = await prisma.product.findMany({
      where: { sellerId: demoUser.id },
      select: { id: true, name: true }
    });

    console.log(`📦 削除対象商品: ${targetProducts.length}件`);
    if (targetProducts.length > 0) {
      targetProducts.forEach(p => console.log(`   - ${p.name}`));
      console.log('');
    }

    const productIds = targetProducts.map(p => p.id);

    // トランザクションで削除（シンプルに必要最小限のみ）
    await prisma.$transaction(async (tx) => {
      console.log('削除処理を実行中...\n');

      // OrderItem経由でOrderを確認
      if (productIds.length > 0) {
        // OrderItemを削除
        const deletedOrderItems = await tx.orderItem.deleteMany({
          where: { productId: { in: productIds } }
        });
        if (deletedOrderItems.count > 0) {
          console.log(`   ✓ OrderItem削除: ${deletedOrderItems.count}件`);
        }

        // Shipmentを削除（productIdで直接削除）
        const deletedShipments = await tx.shipment.deleteMany({
          where: { productId: { in: productIds } }
        });
        if (deletedShipments.count > 0) {
          console.log(`   ✓ Shipment削除: ${deletedShipments.count}件`);
        }

        // Listingを削除
        const deletedListings = await tx.listing.deleteMany({
          where: { productId: { in: productIds } }
        });
        if (deletedListings.count > 0) {
          console.log(`   ✓ Listing削除: ${deletedListings.count}件`);
        }

        // InspectionChecklistを削除
        const deletedChecklists = await tx.inspectionChecklist.deleteMany({
          where: { productId: { in: productIds } }
        });
        if (deletedChecklists.count > 0) {
          console.log(`   ✓ InspectionChecklist削除: ${deletedChecklists.count}件`);
        }

        // ProductImageを削除
        const deletedImages = await tx.productImage.deleteMany({
          where: { productId: { in: productIds } }
        });
        if (deletedImages.count > 0) {
          console.log(`   ✓ ProductImage削除: ${deletedImages.count}件`);
        }

        // Productを削除
        const deletedProducts = await tx.product.deleteMany({
          where: { id: { in: productIds } }
        });
        console.log(`   ✓ Product削除: ${deletedProducts.count}件`);
      }

      // DeliveryPlan関連の削除
      const demoPlans = await tx.deliveryPlan.findMany({
        where: { sellerId: demoUser.id },
        select: { id: true }
      });

      if (demoPlans.length > 0) {
        const planIds = demoPlans.map(p => p.id);

        // DeliveryPlanProductを取得
        const planProducts = await tx.deliveryPlanProduct.findMany({
          where: { deliveryPlanId: { in: planIds } },
          select: { id: true }
        });

        if (planProducts.length > 0) {
          const planProductIds = planProducts.map(p => p.id);

          // DeliveryPlanProductImageを削除
          const deletedPlanImages = await tx.deliveryPlanProductImage.deleteMany({
            where: { deliveryPlanProductId: { in: planProductIds } }
          });
          if (deletedPlanImages.count > 0) {
            console.log(`   ✓ DeliveryPlanProductImage削除: ${deletedPlanImages.count}件`);
          }

          // InspectionChecklistを削除（DeliveryPlanProduct関連）
          const deletedPlanChecklists = await tx.inspectionChecklist.deleteMany({
            where: { deliveryPlanProductId: { in: planProductIds } }
          });
          if (deletedPlanChecklists.count > 0) {
            console.log(`   ✓ InspectionChecklist(Plan)削除: ${deletedPlanChecklists.count}件`);
          }
        }

        // DeliveryPlanProductを削除
        const deletedPlanProducts = await tx.deliveryPlanProduct.deleteMany({
          where: { deliveryPlanId: { in: planIds } }
        });
        if (deletedPlanProducts.count > 0) {
          console.log(`   ✓ DeliveryPlanProduct削除: ${deletedPlanProducts.count}件`);
        }

        // DeliveryPlanを削除
        const deletedPlans = await tx.deliveryPlan.deleteMany({
          where: { id: { in: planIds } }
        });
        console.log(`   ✓ DeliveryPlan削除: ${deletedPlans.count}件`);
      }

      // デモユーザーを削除
      await tx.user.delete({
        where: { id: demoUser.id }
      });
      console.log(`   ✓ デモユーザー削除完了`);
    });

    console.log('\n✅ デモデータの削除が正常に完了しました！');

    // 削除後の統計
    const stats = await prisma.$transaction([
      prisma.user.count(),
      prisma.product.count(),
      prisma.deliveryPlan.count(),
      prisma.order.count()
    ]);

    console.log('\n📊 現在のデータベース状態:');
    console.log(`   ユーザー: ${stats[0]}件`);
    console.log(`   商品: ${stats[1]}件`);
    console.log(`   納品プラン: ${stats[2]}件`);
    console.log(`   注文: ${stats[3]}件`);

    console.log('\n=== 処理完了 ===');
    console.log('✅ デモデータのみ削除され、ユーザーデータは保護されています。');

  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    if (error.code) {
      console.error(`   エラーコード: ${error.code}`);
    }
    console.log('\n⚠️  データベースは変更されていません。');
    console.log('   バックアップ: prisma/dev.db.backup_*');
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
console.log('========================================');
console.log('  デモデータ削除スクリプト');
console.log('========================================');
console.log('対象: demo-seller@example.com');
console.log('保護: ユーザー作成データ');
console.log('');

deleteDemoDataFinal();