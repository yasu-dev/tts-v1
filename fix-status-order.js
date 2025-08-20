const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixStatusOrder() {
  try {
    console.log('=== ステータスのソート順序を修正中 ===');
    
    // 新しいソート順序を定義
    const newOrder = {
      'inbound': 1,        // 入庫待ち
      'inspection': 2,     // 保管作業中
      'storage': 3,        // 保管中
      'listing': 4,        // 出品中
      'sold': 5,           // 購入者決定（出品中の下に移動）
      'ordered': 6,        // 出荷準備中
      'shipping': 7,       // 出荷済み
      'returned': 8,       // 返品
      'on_hold': 9         // 保留中
    };
    
    // 各ステータスのソート順序を更新
    for (const [key, sortOrder] of Object.entries(newOrder)) {
      await prisma.productStatus.updateMany({
        where: { key: key },
        data: { sortOrder: sortOrder }
      });
      console.log(`${key}: sortOrder = ${sortOrder}`);
    }
    
    console.log('✅ ステータスのソート順序を修正しました');
    
    // 更新後のデータを確認
    console.log('\n=== 修正後の商品ステータスデータ（ソート順） ===');
    const productStatuses = await prisma.productStatus.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    
    productStatuses.forEach(status => {
      console.log(`${status.sortOrder}. ${status.key}: ${status.nameJa} (${status.nameEn})`);
    });

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStatusOrder();
