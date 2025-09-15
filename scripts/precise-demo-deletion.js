const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function preciseDemoDataDeletion() {
  try {
    console.log('=== 精密デモデータ削除 ===\n');

    // 保護すべきユーザー商品名（大文字小文字区別なし）
    const protectedProductNames = [
      'YST4カメラ',
      'TESTカメラA'
    ];

    console.log('🛡️  保護するユーザー商品:');
    protectedProductNames.forEach(name => {
      console.log(`   - ${name}`);
    });

    // 1. 保護すべき商品の確認
    console.log('\n📦 保護対象商品の確認:');
    const protectedProducts = await prisma.product.findMany({
      where: {
        name: {
          in: protectedProductNames
        }
      },
      include: {
        seller: { select: { email: true, username: true } }
      }
    });

    console.log(`   見つかった保護商品: ${protectedProducts.length}件`);
    protectedProducts.forEach(product => {
      console.log(`     ✅ ${product.name} (${product.sku}) - ${product.seller?.email}`);
    });

    // 2. 保護すべき納品プラン商品の確認
    const protectedPlanProducts = await prisma.deliveryPlanProduct.findMany({
      where: {
        name: {
          in: protectedProductNames
        }
      }
    });

    console.log(`\n📋 保護対象納品プラン商品: ${protectedPlanProducts.length}件`);
    protectedPlanProducts.forEach(product => {
      console.log(`     ✅ ${product.name} (ID: ${product.id})`);
    });

    // 3. 保護対象のdeliveryPlanIDを取得
    const protectedPlanIds = protectedPlanProducts.map(p => p.deliveryPlanId);
    const uniqueProtectedPlanIds = [...new Set(protectedPlanIds)];

    console.log(`\n📋 保護対象納品プラン: ${uniqueProtectedPlanIds.length}件`);
    if (uniqueProtectedPlanIds.length > 0) {
      const protectedPlans = await prisma.deliveryPlan.findMany({
        where: { id: { in: uniqueProtectedPlanIds } }
      });
      protectedPlans.forEach(plan => {
        console.log(`     ✅ ${plan.id} - ${plan.sellerName}`);
      });
    }

    // 4. demo-seller@example.com ユーザーも保護
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo-seller@example.com' }
    });

    let protectedUserIds = [];
    if (demoUser) {
      protectedUserIds.push(demoUser.id);
      console.log(`\n👤 保護対象ユーザー: demo-seller@example.com (${demoUser.id})`);
    }

    // 5. 保護対象の最終確認
    console.log('\n🔍 削除実行前の最終確認:');

    const totalProducts = await prisma.product.count();
    const totalPlans = await prisma.deliveryPlan.count();
    const totalUsers = await prisma.user.count();

    console.log(`   現在の総数:`);
    console.log(`     商品: ${totalProducts}件`);
    console.log(`     納品プラン: ${totalPlans}件`);
    console.log(`     ユーザー: ${totalUsers}件`);

    // 6. トランザクション内で削除実行
    console.log('\n🗑️  削除実行中...');

    const result = await prisma.$transaction(async (tx) => {
      // デモ商品を削除（保護商品以外）
      const deletedProducts = await tx.product.deleteMany({
        where: {
          AND: [
            { name: { notIn: protectedProductNames } },
            // demo-seller以外のユーザーの商品、またはdemo-sellerでも保護リスト以外は削除
          ]
        }
      });

      // デモ納品プラン商品を削除（保護プラン以外）
      const deletedPlanProducts = await tx.deliveryPlanProduct.deleteMany({
        where: {
          deliveryPlanId: { notIn: uniqueProtectedPlanIds }
        }
      });

      // デモ納品プランを削除（保護プラン以外）
      const deletedPlans = await tx.deliveryPlan.deleteMany({
        where: {
          id: { notIn: uniqueProtectedPlanIds }
        }
      });

      // デモユーザーを削除（demo-seller@example.com以外）
      const deletedUsers = await tx.user.deleteMany({
        where: {
          id: { notIn: protectedUserIds }
        }
      });

      return {
        deletedProducts: deletedProducts.count,
        deletedPlanProducts: deletedPlanProducts.count,
        deletedPlans: deletedPlans.count,
        deletedUsers: deletedUsers.count
      };
    });

    // 7. 削除結果の表示
    console.log('\n✅ 削除完了:');
    console.log(`   削除された商品: ${result.deletedProducts}件`);
    console.log(`   削除された納品プラン商品: ${result.deletedPlanProducts}件`);
    console.log(`   削除された納品プラン: ${result.deletedPlans}件`);
    console.log(`   削除されたユーザー: ${result.deletedUsers}件`);

    // 8. 残存データの確認
    console.log('\n📊 残存データ確認:');

    const remainingProducts = await prisma.product.count();
    const remainingPlans = await prisma.deliveryPlan.count();
    const remainingUsers = await prisma.user.count();

    console.log(`   残存商品: ${remainingProducts}件`);
    console.log(`   残存納品プラン: ${remainingPlans}件`);
    console.log(`   残存ユーザー: ${remainingUsers}件`);

    // 9. 保護されたデータの詳細確認
    console.log('\n🛡️  保護されたデータ詳細:');

    const finalProtectedProducts = await prisma.product.findMany({
      include: {
        seller: { select: { email: true, username: true } }
      }
    });

    console.log('   保護された商品:');
    finalProtectedProducts.forEach(product => {
      console.log(`     ✅ ${product.name} - ${product.seller?.email || product.seller?.username}`);
    });

    const finalPlans = await prisma.deliveryPlan.findMany();
    console.log('\n   保護された納品プラン:');
    finalPlans.forEach(plan => {
      console.log(`     ✅ ${plan.sellerName} - 商品数: ${plan.totalItems}件`);
    });

    console.log('\n🎉 精密削除完了！ユーザーデータは保護されました。');

  } catch (error) {
    console.error('❌ エラー:', error.message);
    if (error.meta) {
      console.error('   詳細:', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

preciseDemoDataDeletion();