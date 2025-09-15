const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDemoProductsOnly() {
  try {
    console.log('=== デモ商品データのみ削除 ===\n');

    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo-seller@example.com' }
    });

    if (!demoUser) {
      console.log('デモユーザーが見つかりません。');
      return;
    }

    // デモユーザーの商品を削除（ユーザーアカウントは残す）
    const products = await prisma.product.findMany({
      where: { sellerId: demoUser.id },
      select: { id: true, name: true }
    });

    console.log(`削除対象商品: ${products.length}件`);
    products.forEach(p => console.log(`   - ${p.name}`));

    if (products.length === 0) {
      console.log('削除する商品はありません。');
      return;
    }

    const productIds = products.map(p => p.id);

    await prisma.$transaction(async (tx) => {
      console.log('\n削除処理中...');

      // 関連データを削除
      await tx.orderItem.deleteMany({
        where: { productId: { in: productIds } }
      });

      await tx.shipment.deleteMany({
        where: { productId: { in: productIds } }
      });

      await tx.listing.deleteMany({
        where: { productId: { in: productIds } }
      });

      await tx.inspectionChecklist.deleteMany({
        where: { productId: { in: productIds } }
      });

      await tx.productImage.deleteMany({
        where: { productId: { in: productIds } }
      });

      // 商品を削除
      const result = await tx.product.deleteMany({
        where: { id: { in: productIds } }
      });

      console.log(`✓ デモ商品削除完了: ${result.count}件`);
    });

    console.log('\n✅ デモ商品データの削除が完了しました。');
    console.log('📝 デモユーザーアカウントは保持されています。');
    console.log('   （ログイン機能に影響しないよう配慮）');

    // 統計
    const stats = await prisma.$transaction([
      prisma.user.count(),
      prisma.product.count(),
      prisma.deliveryPlan.count()
    ]);

    console.log('\n📊 現在のデータベース:');
    console.log(`   ユーザー: ${stats[0]}件（デモユーザー含む）`);
    console.log(`   商品: ${stats[1]}件（ユーザーデータのみ）`);
    console.log(`   納品プラン: ${stats[2]}件`);

    console.log('\n🎉 処理完了: ユーザーデータは完全に保護されています！');

  } catch (error) {
    console.error('❌ エラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDemoProductsOnly();