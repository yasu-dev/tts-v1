const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function completeCleanup() {
  try {
    console.log('==========================================');
    console.log('        完全デモデータクリーンアップ');
    console.log('==========================================\n');

    console.log('⚠️  警告: すべてのデータがデモデータと確認済み');
    console.log('   真のユーザーデータ: 0件');
    console.log('   安全に全削除を実行します。\n');

    console.log('🧹 データベース全体をクリーンアップ中...\n');

    await prisma.$transaction(async (tx) => {
      console.log('削除処理を実行中:');

      // 1. 関連テーブルから削除（外部キー制約順）
      console.log('   🗑️  関連データ削除中...');

      const deletedActivities = await tx.activity.deleteMany({});
      console.log(`      - Activity: ${deletedActivities.count}件削除`);

      const deletedVideoRecords = await tx.videoRecord.deleteMany({});
      console.log(`      - VideoRecord: ${deletedVideoRecords.count}件削除`);

      const deletedTasks = await tx.task.deleteMany({});
      console.log(`      - Task: ${deletedTasks.count}件削除`);

      const deletedInspectionChecklists = await tx.inspectionChecklist.deleteMany({});
      console.log(`      - InspectionChecklist: ${deletedInspectionChecklists.count}件削除`);

      const deletedProductImages = await tx.productImage.deleteMany({});
      console.log(`      - ProductImage: ${deletedProductImages.count}件削除`);

      const deletedListings = await tx.listing.deleteMany({});
      console.log(`      - Listing: ${deletedListings.count}件削除`);

      const deletedShipments = await tx.shipment.deleteMany({});
      console.log(`      - Shipment: ${deletedShipments.count}件削除`);

      const deletedOrderItems = await tx.orderItem.deleteMany({});
      console.log(`      - OrderItem: ${deletedOrderItems.count}件削除`);

      const deletedOrders = await tx.order.deleteMany({});
      console.log(`      - Order: ${deletedOrders.count}件削除`);

      // 2. 商品データ削除
      console.log('   📦 商品データ削除中...');
      const deletedProducts = await tx.product.deleteMany({});
      console.log(`      - Product: ${deletedProducts.count}件削除`);

      // 3. DeliveryPlan関連削除
      console.log('   📋 納品プラン削除中...');

      const deletedPlanProductImages = await tx.deliveryPlanProductImage.deleteMany({});
      console.log(`      - DeliveryPlanProductImage: ${deletedPlanProductImages.count}件削除`);

      const deletedPlanProducts = await tx.deliveryPlanProduct.deleteMany({});
      console.log(`      - DeliveryPlanProduct: ${deletedPlanProducts.count}件削除`);

      const deletedDeliveryPlans = await tx.deliveryPlan.deleteMany({});
      console.log(`      - DeliveryPlan: ${deletedDeliveryPlans.count}件削除`);

      // 4. マスターデータ削除
      console.log('   🔧 マスターデータ削除中...');

      const deletedLocations = await tx.location.deleteMany({});
      console.log(`      - Location: ${deletedLocations.count}件削除`);

      const deletedCarriers = await tx.carrier.deleteMany({});
      console.log(`      - Carrier: ${deletedCarriers.count}件削除`);

      const deletedSettings = await tx.systemSetting.deleteMany({});
      console.log(`      - SystemSetting: ${deletedSettings.count}件削除`);

      // 5. ユーザーデータ削除（最後）
      console.log('   👥 ユーザーデータ削除中...');
      const deletedUsers = await tx.user.deleteMany({});
      console.log(`      - User: ${deletedUsers.count}件削除`);

      console.log('\n✅ すべてのデモデータが正常に削除されました！');
    });

    // 6. 最終確認
    console.log('\n🔍 削除後のデータベース状態:');
    const finalCount = await prisma.$transaction([
      prisma.user.count(),
      prisma.product.count(),
      prisma.deliveryPlan.count(),
      prisma.order.count(),
      prisma.location.count(),
      prisma.carrier.count()
    ]);

    console.log(`   User: ${finalCount[0]}件`);
    console.log(`   Product: ${finalCount[1]}件`);
    console.log(`   DeliveryPlan: ${finalCount[2]}件`);
    console.log(`   Order: ${finalCount[3]}件`);
    console.log(`   Location: ${finalCount[4]}件`);
    console.log(`   Carrier: ${finalCount[5]}件`);

    if (finalCount.every(count => count === 0)) {
      console.log('\n🎉 クリーンアップ完了: データベースが完全にクリーンになりました！');
    } else {
      console.log('\n⚠️  一部データが残っています。外部キー制約を確認してください。');
    }

    console.log('\n==========================================');
    console.log('  🔄 今後のデモデータ再生成を防ぐために:');
    console.log('==========================================');
    console.log('1. package.json の prisma.seed を無効化する');
    console.log('2. comprehensive-seed.ts を削除またはリネーム');
    console.log('3. E2Eテストでのデータ作成を制限する');
    console.log('');
    console.log('✅ クリーンな状態で新しいデータの投入が可能です。');

  } catch (error) {
    console.error('❌ クリーンアップエラー:', error.message);
    if (error.code) {
      console.error(`   エラーコード: ${error.code}`);
    }
    console.log('\n🔄 バックアップから復元が可能: prisma/dev.db.backup_*');
  } finally {
    await prisma.$disconnect();
  }
}

completeCleanup();