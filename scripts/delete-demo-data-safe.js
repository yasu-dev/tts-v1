const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteDemoDataSafely() {
  try {
    console.log('=== デモデータ安全削除開始 ===\n');

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

    const productIds = targetProducts.map(p => p.id);

    // トランザクションで安全に削除（すべての関連テーブルを考慮）
    await prisma.$transaction(async (tx) => {
      console.log('関連データを削除中...\n');

      // Order関連の削除（重要）
      // まずOrderを取得
      const orders = await tx.order.findMany({
        where: { productId: { in: productIds } },
        select: { id: true }
      });
      const orderIds = orders.map(o => o.id);

      if (orderIds.length > 0) {
        // Shipmentを削除（Orderに依存）
        const deletedShipments = await tx.shipment.deleteMany({
          where: { orderId: { in: orderIds } }
        });
        console.log(`   - Shipment削除: ${deletedShipments.count}件`);
      }

      // Orderを削除
      const deletedOrders = await tx.order.deleteMany({
        where: { productId: { in: productIds } }
      });
      console.log(`   - Order削除: ${deletedOrders.count}件`);

      // その他の関連テーブルを削除
      // Listingを削除
      const deletedListings = await tx.listing.deleteMany({
        where: { productId: { in: productIds } }
      });
      console.log(`   - Listing削除: ${deletedListings.count}件`);

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

      // Productを削除
      const deletedProducts = await tx.product.deleteMany({
        where: { sellerId: demoUser.id }
      });
      console.log(`\n📦 Product削除: ${deletedProducts.count}件`);

      // DeliveryPlan関連を削除
      const demoPlans = await tx.deliveryPlan.findMany({
        where: { sellerId: demoUser.id },
        select: { id: true }
      });
      const planIds = demoPlans.map(p => p.id);

      if (planIds.length > 0) {
        // DeliveryPlanProductを取得
        const planProducts = await tx.deliveryPlanProduct.findMany({
          where: { deliveryPlanId: { in: planIds } },
          select: { id: true }
        });
        const planProductIds = planProducts.map(p => p.id);

        if (planProductIds.length > 0) {
          // DeliveryPlanProductImageを削除
          const deletedPlanImages = await tx.deliveryPlanProductImage.deleteMany({
            where: { deliveryPlanProductId: { in: planProductIds } }
          });
          console.log(`   - DeliveryPlanProductImage削除: ${deletedPlanImages.count}件`);

          // InspectionChecklistを削除（DeliveryPlanProductに関連）
          const deletedPlanChecklists = await tx.inspectionChecklist.deleteMany({
            where: { deliveryPlanProductId: { in: planProductIds } }
          });
          console.log(`   - InspectionChecklist (DeliveryPlanProduct)削除: ${deletedPlanChecklists.count}件`);
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

      // 最後にデモユーザーアカウントを削除
      await tx.user.delete({
        where: { id: demoUser.id }
      });
      console.log(`\n👤 デモユーザーアカウント削除完了`);
    });

    console.log('\n✅ デモデータの削除が完了しました');

    // 削除後の統計を表示
    const remainingUsers = await prisma.user.count();
    const remainingProducts = await prisma.product.count();
    const remainingPlans = await prisma.deliveryPlan.count();
    const remainingOrders = await prisma.order.count();

    console.log('\n📊 削除後のデータ統計:');
    console.log(`   - ユーザー: ${remainingUsers}件`);
    console.log(`   - 商品: ${remainingProducts}件`);
    console.log(`   - 納品プラン: ${remainingPlans}件`);
    console.log(`   - 注文: ${remainingOrders}件`);

    // マスターデータの確認
    const carriers = await prisma.carrier.count();
    const locations = await prisma.location.count();
    const systemSettings = await prisma.systemSetting.count();

    console.log('\n🔧 マスターデータ（変更なし）:');
    console.log(`   - Carrier: ${carriers}件`);
    console.log(`   - Location: ${locations}件`);
    console.log(`   - SystemSetting: ${systemSettings}件`);

    console.log('\n=== 削除完了 ===');
    console.log('✅ デモデータのみを削除し、ユーザーデータは保持されています。');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    console.log('\nデータベースは変更されていません。');
    console.log('バックアップファイルが prisma/dev.db.backup_* に保存されています。');
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
console.log('⚠️  警告: このスクリプトはデモデータを削除します。');
console.log('削除対象: demo-seller@example.com とその関連データ');
console.log('保護対象: ユーザーが作成したすべてのデータ');
console.log('');

deleteDemoDataSafely();