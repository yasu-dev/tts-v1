const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function safeDemoDataDeletion() {
  try {
    console.log('=== 安全デモデータ削除（外部キー制約考慮） ===\n');

    // 保護すべきユーザー商品名
    const protectedProductNames = [
      'YST4カメラ',
      'TESTカメラA'
    ];

    console.log('🛡️  保護するユーザー商品:');
    protectedProductNames.forEach(name => {
      console.log(`   - ${name}`);
    });

    // 1. 保護対象の特定
    const protectedProducts = await prisma.product.findMany({
      where: {
        name: { in: protectedProductNames }
      }
    });

    const protectedPlanProducts = await prisma.deliveryPlanProduct.findMany({
      where: {
        name: { in: protectedProductNames }
      }
    });

    const protectedPlanIds = [...new Set(protectedPlanProducts.map(p => p.deliveryPlanId))];
    const protectedProductIds = protectedProducts.map(p => p.id);

    console.log(`\n📊 保護対象データ:`);
    console.log(`   商品: ${protectedProducts.length}件`);
    console.log(`   納品プラン商品: ${protectedPlanProducts.length}件`);
    console.log(`   納品プラン: ${protectedPlanIds.length}件`);

    // 保護対象商品の詳細表示
    protectedProducts.forEach(p => {
      console.log(`     ✅ Product: ${p.name} (${p.sku})`);
    });

    protectedPlanProducts.forEach(p => {
      console.log(`     ✅ Plan Product: ${p.name} (Plan: ${p.deliveryPlanId})`);
    });

    // demo-seller@example.com も保護
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo-seller@example.com' }
    });

    let protectedUserIds = demoUser ? [demoUser.id] : [];

    console.log(`\n👤 保護対象ユーザー: demo-seller@example.com${demoUser ? ` (${demoUser.id})` : ' (見つからない)'}`);

    // 2. 外部キー制約を考慮した削除順序
    console.log('\n🗑️  外部キー制約を考慮した削除実行...');

    const result = await prisma.$transaction(async (tx) => {
      let deletedCounts = {
        deliveryPlanProductImages: 0,
        deliveryPlanProducts: 0,
        deliveryPlans: 0,
        products: 0,
        users: 0
      };

      // Step 1: 画像データ削除（保護プラン以外）
      const deletedImages = await tx.deliveryPlanProductImage.deleteMany({
        where: {
          deliveryPlanProduct: {
            deliveryPlanId: { notIn: protectedPlanIds }
          }
        }
      });
      deletedCounts.deliveryPlanProductImages = deletedImages.count;

      // Step 2: 納品プラン商品削除（保護商品以外）
      const deletedPlanProducts = await tx.deliveryPlanProduct.deleteMany({
        where: {
          deliveryPlanId: { notIn: protectedPlanIds }
        }
      });
      deletedCounts.deliveryPlanProducts = deletedPlanProducts.count;

      // Step 3: 納品プラン削除（保護プラン以外）
      const deletedPlans = await tx.deliveryPlan.deleteMany({
        where: {
          id: { notIn: protectedPlanIds }
        }
      });
      deletedCounts.deliveryPlans = deletedPlans.count;

      // Step 4: 商品削除（保護商品以外）
      const deletedProducts = await tx.product.deleteMany({
        where: {
          id: { notIn: protectedProductIds }
        }
      });
      deletedCounts.products = deletedProducts.count;

      // Step 5: ユーザー削除（demo-seller以外）
      const deletedUsers = await tx.user.deleteMany({
        where: {
          id: { notIn: protectedUserIds }
        }
      });
      deletedCounts.users = deletedUsers.count;

      return deletedCounts;
    });

    // 3. 削除結果の表示
    console.log('\n✅ 削除完了:');
    console.log(`   削除された画像: ${result.deliveryPlanProductImages}件`);
    console.log(`   削除された納品プラン商品: ${result.deliveryPlanProducts}件`);
    console.log(`   削除された納品プラン: ${result.deliveryPlans}件`);
    console.log(`   削除された商品: ${result.products}件`);
    console.log(`   削除されたユーザー: ${result.users}件`);

    // 4. 残存データの確認
    console.log('\n📊 残存データ確認:');

    const remainingProducts = await prisma.product.findMany({
      include: { seller: { select: { email: true, username: true } } }
    });
    const remainingPlans = await prisma.deliveryPlan.findMany();
    const remainingUsers = await prisma.user.findMany();

    console.log(`\n   残存商品: ${remainingProducts.length}件`);
    remainingProducts.forEach(p => {
      console.log(`     ✅ ${p.name} (${p.sku}) - ${p.seller?.email || p.seller?.username}`);
    });

    console.log(`\n   残存納品プラン: ${remainingPlans.length}件`);
    remainingPlans.forEach(p => {
      console.log(`     ✅ ${p.sellerName} - 商品数: ${p.totalItems}件 (ID: ${p.id})`);
    });

    console.log(`\n   残存ユーザー: ${remainingUsers.length}件`);
    remainingUsers.forEach(u => {
      console.log(`     ✅ ${u.email} (${u.username || 'No name'})`);
    });

    console.log('\n🎉 安全削除完了！ユーザーデータ「YST4カメラ」「TESTカメラA」は保護されました！');

  } catch (error) {
    console.error('❌ エラー:', error.message);
    if (error.meta) {
      console.error('   詳細:', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

safeDemoDataDeletion();