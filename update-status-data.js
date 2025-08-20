const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateStatusData() {
  try {
    console.log('=== ステータスデータを更新中 ===');
    
    // ステータス名を更新
    await prisma.productStatus.updateMany({
      where: { key: 'inspection' },
      data: { nameJa: '保管作業中' }
    });
    
    await prisma.productStatus.updateMany({
      where: { key: 'ordered' },
      data: { nameJa: '出荷準備中' }
    });
    
    await prisma.productStatus.updateMany({
      where: { key: 'shipping' },
      data: { nameJa: '出荷済み' }
    });
    
    await prisma.productStatus.updateMany({
      where: { key: 'sold' },
      data: { nameJa: '購入者決定' }
    });
    
    // damagedステータスをon_holdに変更
    await prisma.productStatus.updateMany({
      where: { key: 'damaged' },
      data: { key: 'on_hold', nameJa: '保留中', nameEn: 'On Hold' }
    });
    
    // 商品データのfailedステータスをon_holdに変更
    await prisma.product.updateMany({
      where: { status: 'failed' },
      data: { status: 'on_hold' }
    });
    
    // 商品データのcompletedステータスをstorageに変更
    await prisma.product.updateMany({
      where: { status: 'completed' },
      data: { status: 'storage' }
    });
    
    console.log('✅ ステータスデータの更新が完了しました');
    
    // 更新後のデータを確認
    console.log('\n=== 更新後の商品ステータスデータ ===');
    const productStatuses = await prisma.productStatus.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    
    productStatuses.forEach(status => {
      console.log(`${status.key}: ${status.nameJa} (${status.nameEn})`);
    });

    console.log('\n=== 更新後の商品データのステータス分布 ===');
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

updateStatusData();
