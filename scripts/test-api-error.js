const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testApiError() {
  try {
    console.log('=== API エラー調査 ===\n');

    // 1. 基本的なデータベース接続テスト
    console.log('🔧 データベース接続テスト:');
    try {
      const userCount = await prisma.user.count();
      console.log(`   ✅ User接続OK: ${userCount}件`);
    } catch (e) {
      console.log(`   ❌ User接続エラー: ${e.message}`);
    }

    // 2. DeliveryPlanテーブルのスキーマテスト
    console.log('\n📋 DeliveryPlanテーブル確認:');
    try {
      const planCount = await prisma.deliveryPlan.count();
      console.log(`   ✅ DeliveryPlan接続OK: ${planCount}件`);
    } catch (e) {
      console.log(`   ❌ DeliveryPlan接続エラー: ${e.message}`);
      console.log(`   詳細: ${e.code || 'No code'}`);
    }

    // 3. 簡単なDeliveryPlan作成テスト
    console.log('\n🧪 DeliveryPlan作成テスト:');
    try {
      // デモユーザーを取得
      const demoUser = await prisma.user.findUnique({
        where: { email: 'demo-seller@example.com' }
      });

      if (!demoUser) {
        console.log('   ❌ デモユーザーが存在しません');
        return;
      }

      console.log(`   ✅ デモユーザー確認: ${demoUser.email}`);

      // 最小限のDeliveryPlan作成
      const testPlan = await prisma.deliveryPlan.create({
        data: {
          id: `TEST-${Date.now()}`,
          planNumber: `TEST-${Date.now()}`,
          sellerId: demoUser.id,
          sellerName: demoUser.username || demoUser.email,
          deliveryAddress: 'テスト住所',
          contactEmail: demoUser.email,
          status: 'draft',
          totalItems: 1,
          totalValue: 10000
        }
      });

      console.log(`   ✅ テストDeliveryPlan作成成功: ${testPlan.id}`);

      // 作成したテストプランを削除
      await prisma.deliveryPlan.delete({ where: { id: testPlan.id } });
      console.log(`   🗑️  テストデータクリーンアップ完了`);

    } catch (e) {
      console.log(`   ❌ DeliveryPlan作成エラー: ${e.message}`);
      console.log(`   エラーコード: ${e.code || 'No code'}`);
      if (e.meta) {
        console.log(`   メタデータ: ${JSON.stringify(e.meta)}`);
      }
    }

    // 4. GET API動作確認
    console.log('\n🔍 GET API確認:');
    try {
      const plans = await prisma.deliveryPlan.findMany({
        take: 1,
        include: {
          products: true
        }
      });
      console.log(`   ✅ GET API動作確認: ${plans.length}件取得成功`);
    } catch (e) {
      console.log(`   ❌ GET API エラー: ${e.message}`);
    }

    // 5. 関連テーブル確認
    console.log('\n📦 関連テーブル確認:');

    const tables = [
      'deliveryPlanProduct',
      'deliveryPlanProductImage',
      'product',
      'carrier',
      'location'
    ];

    for (const table of tables) {
      try {
        const count = await prisma[table].count();
        console.log(`   ✅ ${table}: ${count}件`);
      } catch (e) {
        console.log(`   ❌ ${table}: エラー - ${e.message}`);
      }
    }

    console.log('\n✅ 調査完了');

  } catch (error) {
    console.error('❌ 調査エラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testApiError();