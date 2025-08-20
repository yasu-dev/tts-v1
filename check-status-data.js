const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStatusData() {
  try {
    console.log('=== 商品ステータスデータ ===');
    const productStatuses = await prisma.productStatus.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    
    productStatuses.forEach(status => {
      console.log(`${status.key}: ${status.nameJa} (${status.nameEn})`);
    });

    console.log('\n=== 商品データのステータス分布 ===');
    const statusCounts = await prisma.product.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    statusCounts.forEach(count => {
      console.log(`${count.status}: ${count._count.status}件`);
    });

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatusData();
