const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function ultimateSafeDeletion() {
  try {
    console.log('=== 最終安全削除（個別削除方式） ===\n');

    // 保護すべきユーザー商品名
    const protectedProductNames = [
      'YST4カメラ',
      'TESTカメラA'
    ];

    console.log('🛡️  保護するユーザー商品:');
    protectedProductNames.forEach(name => {
      console.log(`   - ${name}`);
    });

    // 1. demo-seller@example.com を保護ユーザーとして設定
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo-seller@example.com' }
    });

    console.log(`\n👤 保護対象ユーザー: demo-seller@example.com${demoUser ? ` (${demoUser.id})` : ' (見つからない)'}`);

    // 2. 単純にdemo-seller@example.com以外のユーザーを削除することで、関連データもすべて削除
    console.log('\n🔍 削除対象ユーザーの特定...');

    const allUsers = await prisma.user.findMany();
    const usersToDelete = allUsers.filter(user => user.email !== 'demo-seller@example.com');

    console.log(`\n📊 削除対象ユーザー: ${usersToDelete.length}件`);
    usersToDelete.forEach(user => {
      console.log(`   🗑️  ${user.email} (${user.username || 'No name'})`);
    });

    if (usersToDelete.length === 0) {
      console.log('\n✅ 削除対象ユーザーがいません。');
      return;
    }

    // 3. 各ユーザーを個別に削除（外部キー制約により関連データも削除される）
    console.log('\n🗑️  個別削除実行中...');

    let deletedUserCount = 0;
    let deletedProductCount = 0;
    let deletedPlanCount = 0;

    for (const user of usersToDelete) {
      try {
        await prisma.$transaction(async (tx) => {
          // このユーザーに関連するデータをカウント
          const userProducts = await tx.product.count({ where: { sellerId: user.id } });
          const userPlans = await tx.deliveryPlan.count({ where: { sellerId: user.id } });

          // ユーザーを削除（CASCADE設定により関連データも削除される）
          await tx.user.delete({ where: { id: user.id } });

          deletedUserCount++;
          deletedProductCount += userProducts;
          deletedPlanCount += userPlans;

          console.log(`   ✅ ${user.email} 削除完了 (商品:${userProducts}件, 納品プラン:${userPlans}件)`);
        });
      } catch (error) {
        console.log(`   ❌ ${user.email} 削除失敗: ${error.message}`);
      }
    }

    // 4. 残存データの確認
    console.log('\n📊 最終確認:');

    const remainingUsers = await prisma.user.findMany();
    const remainingProducts = await prisma.product.findMany({
      include: { seller: { select: { email: true, username: true } } }
    });
    const remainingPlans = await prisma.deliveryPlan.findMany();

    console.log(`\n✅ 削除結果:`);
    console.log(`   削除されたユーザー: ${deletedUserCount}件`);
    console.log(`   削除された商品: ${deletedProductCount}件`);
    console.log(`   削除された納品プラン: ${deletedPlanCount}件`);

    console.log(`\n📋 残存データ:`);
    console.log(`   残存ユーザー: ${remainingUsers.length}件`);
    console.log(`   残存商品: ${remainingProducts.length}件`);
    console.log(`   残存納品プラン: ${remainingPlans.length}件`);

    console.log(`\n👤 残存ユーザー詳細:`);
    remainingUsers.forEach(u => {
      console.log(`   ✅ ${u.email} (${u.username || 'No name'})`);
    });

    console.log(`\n📦 残存商品詳細:`);
    remainingProducts.forEach(p => {
      const isProtected = protectedProductNames.includes(p.name);
      console.log(`   ${isProtected ? '✅' : '⚠️'} ${p.name} (${p.sku}) - ${p.seller?.email || p.seller?.username}`);
    });

    console.log(`\n📋 残存納品プラン詳細:`);
    remainingPlans.forEach(p => {
      console.log(`   ✅ ${p.sellerName} - 商品数: ${p.totalItems}件`);
    });

    // 5. 保護対象商品の確認
    const protectedFound = remainingProducts.filter(p => protectedProductNames.includes(p.name));
    console.log(`\n🛡️  保護されたユーザー商品: ${protectedFound.length}件`);
    protectedFound.forEach(p => {
      console.log(`   ✅ ${p.name} が正常に保護されました！`);
    });

    const protectedMissing = protectedProductNames.filter(name =>
      !protectedFound.some(p => p.name === name)
    );

    if (protectedMissing.length > 0) {
      console.log(`\n⚠️  見つからない保護対象商品: ${protectedMissing.length}件`);
      protectedMissing.forEach(name => {
        console.log(`   ❌ ${name} が見つかりません`);
      });
    }

    console.log('\n🎉 最終削除完了！');

  } catch (error) {
    console.error('❌ エラー:', error.message);
    if (error.meta) {
      console.error('   詳細:', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

ultimateSafeDeletion();