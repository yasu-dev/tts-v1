const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function identifyRealUserData() {
  try {
    console.log('=== 真のユーザーデータ特定調査 ===\n');

    // 1. デモパターンを特定
    const demoUserEmails = [
      'demo-seller@example.com',
      'seller@example.com',
      'staff@example.com',
      'admin@example.com',
      'demo@example.com'
    ];

    const demoEmailPatterns = ['@example.com', '@test.com', '@system.local'];
    const demoNamePatterns = ['デモ', 'テスト', 'demo', 'test', 'temp', '田中', '太郎', '花子'];

    console.log('🔍 デモパターンを除外してユーザーデータを特定中...\n');

    // 2. ユーザー分析
    console.log('👥 ユーザー分析:');
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    });

    const realUsers = allUsers.filter(user => {
      // デモメールパターンをチェック
      const isDemo = demoEmailPatterns.some(pattern => user.email.includes(pattern));
      const isDemoName = demoNamePatterns.some(pattern =>
        (user.username || '').includes(pattern) ||
        (user.fullName || '').includes(pattern)
      );

      return !isDemo && !isDemoName;
    });

    console.log(`   全ユーザー: ${allUsers.length}件`);
    console.log(`   デモユーザー: ${allUsers.length - realUsers.length}件`);
    console.log(`   真のユーザー: ${realUsers.length}件`);

    if (realUsers.length > 0) {
      console.log('   真のユーザー一覧:');
      realUsers.forEach(user => {
        console.log(`     - ${user.email} (${user.username || 'No name'}) - Created: ${user.createdAt}`);
      });
    }
    console.log('');

    // 3. 商品分析
    console.log('📦 商品データ分析:');
    const allProducts = await prisma.product.findMany({
      include: {
        seller: { select: { email: true, username: true } }
      }
    });

    const realUserIds = realUsers.map(u => u.id);
    const realProducts = allProducts.filter(p => realUserIds.includes(p.sellerId));

    console.log(`   全商品: ${allProducts.length}件`);
    console.log(`   デモ商品: ${allProducts.length - realProducts.length}件`);
    console.log(`   真のユーザー商品: ${realProducts.length}件`);

    if (realProducts.length > 0) {
      console.log('   真のユーザー商品一覧:');
      realProducts.forEach(product => {
        console.log(`     - ${product.name} (${product.seller?.email}) - Created: ${product.createdAt}`);
      });
    }
    console.log('');

    // 4. 納品プラン分析
    console.log('📋 納品プラン分析:');
    const allPlans = await prisma.deliveryPlan.findMany({
      orderBy: { createdAt: 'asc' }
    });

    const realPlans = allPlans.filter(plan => {
      // デモパターンをチェック
      const isDemoName = demoNamePatterns.some(pattern =>
        (plan.sellerName || '').includes(pattern)
      );

      return realUserIds.includes(plan.sellerId) && !isDemoName;
    });

    console.log(`   全納品プラン: ${allPlans.length}件`);
    console.log(`   デモ納品プラン: ${allPlans.length - realPlans.length}件`);
    console.log(`   真のユーザー納品プラン: ${realPlans.length}件`);

    if (realPlans.length > 0) {
      console.log('   真のユーザー納品プラン一覧:');
      realPlans.slice(0, 5).forEach(plan => {
        console.log(`     - ${plan.id} by ${plan.sellerName} - Status: ${plan.status} - Created: ${plan.createdAt}`);
      });
      if (realPlans.length > 5) {
        console.log(`     ... 他${realPlans.length - 5}件`);
      }
    }
    console.log('');

    // 5. 時系列分析（最近作成されたデータ）
    console.log('⏰ 最近作成されたデータ（過去7日）:');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: weekAgo } }
    });

    const recentProducts = await prisma.product.count({
      where: { createdAt: { gte: weekAgo } }
    });

    const recentPlans = await prisma.deliveryPlan.count({
      where: { createdAt: { gte: weekAgo } }
    });

    console.log(`   ユーザー: ${recentUsers}件`);
    console.log(`   商品: ${recentProducts}件`);
    console.log(`   納品プラン: ${recentPlans}件`);

    // 6. 削除すべきデモユーザーの特定
    console.log('\n🎯 削除対象デモユーザー:');
    const demoUsers = allUsers.filter(user => {
      const isDemo = demoEmailPatterns.some(pattern => user.email.includes(pattern));
      const isDemoName = demoNamePatterns.some(pattern =>
        (user.username || '').includes(pattern) ||
        (user.fullName || '').includes(pattern)
      );

      return isDemo || isDemoName;
    });

    demoUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.username || 'No name'}) - ID: ${user.id}`);
    });

    console.log(`\n📊 要約:`);
    console.log(`   保護すべき真のユーザーデータ:`);
    console.log(`     ユーザー: ${realUsers.length}件`);
    console.log(`     商品: ${realProducts.length}件`);
    console.log(`     納品プラン: ${realPlans.length}件`);
    console.log(`   削除すべきデモデータ:`);
    console.log(`     ユーザー: ${demoUsers.length}件`);
    console.log(`     商品: ${allProducts.length - realProducts.length}件`);
    console.log(`     納品プラン: ${allPlans.length - realPlans.length}件`);

    return {
      demoUserIds: demoUsers.map(u => u.id),
      realUserIds,
      demoProductCount: allProducts.length - realProducts.length,
      realProductCount: realProducts.length
    };

  } catch (error) {
    console.error('❌ エラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

identifyRealUserData();