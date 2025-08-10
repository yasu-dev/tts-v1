const { PrismaClient } = require('@prisma/client');

async function verifyDatabaseData() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('🔍 データベース接続テスト...');
    
    // 1. 接続テスト
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ データベース接続成功');

    // 2. テーブル存在確認
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `;
    console.log(`📊 テーブル数: ${tableCount[0].count}`);

    // 3. 商品データ確認
    const productCount = await prisma.product.count();
    console.log(`📦 商品総数: ${productCount}件`);

    if (productCount > 0) {
      // 最初の5件を取得
      const sampleProducts = await prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          sku: true,
          category: true,
          status: true,
          price: true,
          createdAt: true
        }
      });

      console.log('\n📋 商品データサンプル:');
      sampleProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (SKU: ${product.sku})`);
        console.log(`   カテゴリ: ${product.category}, ステータス: ${product.status}`);
        console.log(`   価格: ¥${product.price.toLocaleString()}`);
        console.log(`   作成日: ${product.createdAt.toISOString().split('T')[0]}`);
        console.log('');
      });

      // ステータス別集計
      const statusCounts = await prisma.product.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      });

      console.log('📊 ステータス別集計:');
      statusCounts.forEach(item => {
        console.log(`   ${item.status}: ${item._count.status}件`);
      });

      // カテゴリ別集計
      const categoryCounts = await prisma.product.groupBy({
        by: ['category'],
        _count: {
          category: true
        }
      });

      console.log('\n📊 カテゴリ別集計:');
      categoryCounts.forEach(item => {
        console.log(`   ${item.category}: ${item._count.category}件`);
      });
    }

    // 4. その他のテーブル確認
    const userCount = await prisma.user.count();
    const orderCount = await prisma.order.count();
    const locationCount = await prisma.location.count();

    console.log(`\n👥 ユーザー数: ${userCount}件`);
    console.log(`🛒 注文数: ${orderCount}件`);
    console.log(`📍 ロケーション数: ${locationCount}件`);

    // 5. 最新のアクティビティ確認
    const recentActivities = await prisma.activity.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        type: true,
        description: true,
        createdAt: true,
        user: {
          select: { username: true }
        }
      }
    });

    if (recentActivities.length > 0) {
      console.log('\n🔄 最新アクティビティ:');
      recentActivities.forEach((activity, index) => {
        console.log(`${index + 1}. [${activity.type}] ${activity.description}`);
        console.log(`   ユーザー: ${activity.user?.username || '不明'}`);
        console.log(`   日時: ${activity.createdAt.toISOString()}`);
        console.log('');
      });
    }

    console.log('✅ データベース検証完了 - すべてのデータは実際のSQLite→Prismaから取得されています');

  } catch (error) {
    console.error('❌ データベースエラー:', error);
    console.error('スタックトレース:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
verifyDatabaseData();
