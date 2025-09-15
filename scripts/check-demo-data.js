const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDemoData() {
  try {
    console.log('=== デモデータ確認開始 ===\n');

    // 1. デモユーザーの確認
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo-seller@example.com' }
    });

    if (demoUser) {
      console.log('✅ デモユーザー発見:');
      console.log(`   ID: ${demoUser.id}`);
      console.log(`   Email: ${demoUser.email}`);
      console.log(`   Username: ${demoUser.username}`);
      console.log(`   Role: ${demoUser.role}\n`);

      // 2. デモユーザーが作成したDeliveryPlanを確認
      const demoDeliveryPlans = await prisma.deliveryPlan.findMany({
        where: {
          sellerId: demoUser.id
        }
      });

      console.log(`📦 DeliveryPlan (納品プラン): ${demoDeliveryPlans.length}件`);
      if (demoDeliveryPlans.length > 0) {
        demoDeliveryPlans.forEach(plan => {
          console.log(`   - ID: ${plan.id}, Status: ${plan.status}, Created: ${plan.createdAt}`);
        });

        // 関連するDeliveryPlanProductも確認
        const planIds = demoDeliveryPlans.map(p => p.id);
        const demoProducts = await prisma.deliveryPlanProduct.count({
          where: { deliveryPlanId: { in: planIds } }
        });
        console.log(`   関連商品数: ${demoProducts}件\n`);
      }

      // 3. デモユーザーが作成したProductを確認
      const demoUserProducts = await prisma.product.findMany({
        where: {
          sellerId: demoUser.id
        }
      });

      console.log(`📦 Product (商品): ${demoUserProducts.length}件`);
      if (demoUserProducts.length > 0) {
        demoUserProducts.forEach(product => {
          console.log(`   - ID: ${product.id}, Name: ${product.name}, Status: ${product.status}`);
        });
      }

      // 4. 他のユーザーデータの確認
      const otherUsers = await prisma.user.findMany({
        where: {
          email: { not: 'demo-seller@example.com' }
        }
      });

      console.log(`\n👥 その他のユーザー: ${otherUsers.length}件`);
      otherUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.username || 'No name'}) - Role: ${user.role}`);
      });

      // 5. ユーザーが作成した実データの確認
      const userDeliveryPlans = await prisma.deliveryPlan.count({
        where: {
          sellerId: { not: demoUser.id }
        }
      });

      const userProducts = await prisma.product.count({
        where: {
          sellerId: { not: demoUser.id }
        }
      });

      console.log(`\n📊 ユーザー作成データ統計:`);
      console.log(`   - DeliveryPlan: ${userDeliveryPlans}件`);
      console.log(`   - Product: ${userProducts}件`);

    } else {
      console.log('❌ デモユーザーが見つかりません');
      console.log('   データベースにデモデータが存在しない可能性があります。');
    }

    // 6. マスターデータの確認（これは削除しない）
    const carriers = await prisma.carrier.count();
    const locations = await prisma.location.count();
    const systemSettings = await prisma.systemSetting.count();

    console.log(`\n🔧 マスターデータ（削除対象外）:`);
    console.log(`   - Carrier: ${carriers}件`);
    console.log(`   - Location: ${locations}件`);
    console.log(`   - SystemSetting: ${systemSettings}件`);

    console.log('\n=== 確認完了 ===');

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDemoData();