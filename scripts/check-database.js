const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 データベース接続テスト開始...');
  
  try {
    // 1. データベース接続テスト
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ データベース接続成功:', dbTest);

    // 2. 各テーブルのレコード数を確認
    console.log('\n📊 テーブル別レコード数:');
    
    try {
      const userCount = await prisma.user.count();
      console.log(`- users: ${userCount}件`);
    } catch (error) {
      console.log(`- users: エラー - ${error.message}`);
    }

    try {
      const orderCount = await prisma.order.count();
      console.log(`- orders: ${orderCount}件`);
    } catch (error) {
      console.log(`- orders: エラー - ${error.message}`);
    }

    try {
      const productCount = await prisma.product.count();
      console.log(`- products: ${productCount}件`);
    } catch (error) {
      console.log(`- products: エラー - ${error.message}`);
    }

    try {
      const orderItemCount = await prisma.orderItem.count();
      console.log(`- orderItems: ${orderItemCount}件`);
    } catch (error) {
      console.log(`- orderItems: エラー - ${error.message}`);
    }

    // 3. 既存の注文データをチェック
    console.log('\n📦 既存の注文データ:');
    try {
      const orders = await prisma.order.findMany({
        take: 3,
        include: {
          customer: { select: { username: true } },
          items: {
            include: {
              product: { select: { name: true, category: true } }
            }
          }
        }
      });
      
      if (orders.length > 0) {
        console.log(`✅ ${orders.length}件の注文が存在します:`);
        orders.forEach((order, index) => {
          console.log(`  ${index + 1}. ${order.orderNumber} - ${order.customer?.username} - ¥${order.totalAmount?.toLocaleString()}`);
          order.items.forEach(item => {
            console.log(`     商品: ${item.product.name}`);
          });
        });
      } else {
        console.log('❌ 注文データが存在しません');
      }
    } catch (error) {
      console.log(`❌ 注文データ取得エラー: ${error.message}`);
    }

    // 4. 既存のユーザーデータをチェック
    console.log('\n👥 既存のユーザーデータ:');
    try {
      const users = await prisma.user.findMany({
        take: 3,
        select: { username: true, role: true, email: true }
      });
      
      if (users.length > 0) {
        console.log(`✅ ${users.length}件のユーザーが存在します:`);
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.username} (${user.role}) - ${user.email}`);
        });
      } else {
        console.log('❌ ユーザーデータが存在しません');
      }
    } catch (error) {
      console.log(`❌ ユーザーデータ取得エラー: ${error.message}`);
    }

    // 5. 既存の商品データをチェック
    console.log('\n🏷️ 既存の商品データ:');
    try {
      const products = await prisma.product.findMany({
        take: 3,
        select: { name: true, category: true, price: true, sku: true }
      });
      
      if (products.length > 0) {
        console.log(`✅ ${products.length}件の商品が存在します:`);
        products.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} (${product.category}) - ¥${product.price?.toLocaleString()} [${product.sku}]`);
        });
      } else {
        console.log('❌ 商品データが存在しません');
      }
    } catch (error) {
      console.log(`❌ 商品データ取得エラー: ${error.message}`);
    }

    console.log('\n🎯 結論:');
    const orderCount = await prisma.order.count().catch(() => 0);
    const userCount = await prisma.user.count().catch(() => 0);
    const productCount = await prisma.product.count().catch(() => 0);
    
    if (orderCount === 0 && userCount === 0 && productCount === 0) {
      console.log('❌ データベースは空です。デモデータの挿入が必要です。');
      return false;
    } else if (orderCount === 0) {
      console.log('⚠️ 注文データがありません。Sales APIは正常に動作しません。');
      return false;
    } else {
      console.log('✅ 必要なデータが揃っています。Sales APIは正常に動作するはずです。');
      return true;
    }

  } catch (error) {
    console.error('💥 データベースチェック中にエラーが発生しました:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().then((success) => {
  if (!success) {
    console.log('\n💡 解決策: npm run seed を実行してデモデータを挿入してください。');
  }
  process.exit(success ? 0 : 1);
});

