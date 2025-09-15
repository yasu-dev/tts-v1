const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showProductNames() {
  try {
    console.log('=== 商品名一覧（判断用） ===\n');

    // 1. 全商品を作成日順で表示
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        seller: { select: { email: true, username: true } }
      }
    });

    console.log(`📦 全商品一覧（${products.length}件）:\n`);

    products.forEach((product, index) => {
      console.log(`${index + 1}. 商品名: "${product.name}"`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   カテゴリ: ${product.category}`);
      console.log(`   価格: ¥${product.price?.toLocaleString() || 0}`);
      console.log(`   セラー: ${product.seller?.username || product.seller?.email}`);
      console.log(`   作成日: ${product.createdAt}`);
      console.log(`   ステータス: ${product.status}`);
      console.log('');
    });

    // 2. 納品プラン商品も表示
    const planProducts = await prisma.deliveryPlanProduct.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        deliveryPlan: { select: { sellerName: true, contactEmail: true } }
      }
    });

    console.log(`\n📋 納品プラン商品一覧（${planProducts.length}件）:\n`);

    planProducts.forEach((product, index) => {
      console.log(`${index + 1}. 商品名: "${product.name}"`);
      console.log(`   カテゴリ: ${product.category}`);
      console.log(`   予想価格: ¥${product.estimatedValue?.toLocaleString() || 0}`);
      console.log(`   セラー: ${product.deliveryPlan?.sellerName} (${product.deliveryPlan?.contactEmail})`);
      console.log(`   作成日: ${product.createdAt}`);
      console.log('');
    });

    console.log('\n❓ 判断してください:');
    console.log('上記の商品名で、実際にあなたがUIから手動登録した商品はありますか？');
    console.log('もしあれば、その商品名を教えてください。');

  } catch (error) {
    console.error('❌ エラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

showProductNames();