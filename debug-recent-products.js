const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugRecentProducts() {
  try {
    // 最近作成された商品（24時間以内）をチェック
    const recentProducts = await prisma.product.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24時間前から
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log(`📦 最近作成された商品 (${recentProducts.length}件):`);
    
    for (let i = 0; i < recentProducts.length; i++) {
      const product = recentProducts[i];
      console.log(`\n${i + 1}. 商品名: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Status: ${product.status}`);
      console.log(`   作成日時: ${product.createdAt.toISOString()}`);
      
      // Shipmentレコードを確認
      const shipments = await prisma.shipment.findMany({
        where: { productId: product.id },
        orderBy: { updatedAt: 'desc' }
      });
      
      console.log(`   Shipments: ${shipments.length}件`);
      shipments.forEach((shipment, j) => {
        console.log(`     ${j + 1}. Status: ${shipment.status}, ID: ${shipment.id}`);
        console.log(`        Created: ${shipment.createdAt.toISOString()}`);
        console.log(`        Notes: ${shipment.notes || 'なし'}`);
      });
      
      // 納品プラン関連情報もチェック
      if (product.metadata) {
        try {
          const metadata = JSON.parse(product.metadata);
          if (metadata.deliveryPlanId) {
            console.log(`   納品プランID: ${metadata.deliveryPlanId}`);
          }
        } catch (e) {
          // メタデータ解析エラーは無視
        }
      }
    }
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugRecentProducts();