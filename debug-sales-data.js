const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSalesData() {
  try {
    console.log('=== 販売管理データのデバッグ ===\n');
    
    // 1. 全Listingデータの状態確認
    console.log('1. 全Listingデータの状態:');
    const allListings = await prisma.listing.findMany({
      include: {
        product: {
          include: {
            orderItems: {
              include: {
                order: true
              }
            }
          }
        }
      }
    });
    
    console.log(`総Listing数: ${allListings.length}`);
    
    // ステータス別の集計
    const statusCounts = {};
    allListings.forEach(listing => {
      const status = listing.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    console.log('ステータス別集計:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}件`);
    });
    
    // 2. 各ステータスの詳細確認
    console.log('\n2. 各ステータスの詳細:');
    
    for (const status of ['draft', 'active', 'inactive', 'sold', 'expired', 'pending']) {
      const listings = allListings.filter(l => l.status === status);
      console.log(`\n${status}ステータス (${listings.length}件):`);
      
      if (listings.length > 0) {
        const sample = listings[0];
        console.log(`  サンプル: ID=${sample.id}, タイトル=${sample.title}`);
        
        // 関連する注文データの確認
        const orderItems = sample.product?.orderItems || [];
        console.log(`  関連注文数: ${orderItems.length}`);
        
        if (orderItems.length > 0) {
          const order = orderItems[0].order;
          console.log(`  注文ID: ${order?.id}`);
          console.log(`  トラッキング番号: ${order?.trackingNumber || 'なし'}`);
        }
      }
    }
    
    // 3. ラベル生成状況の確認
    console.log('\n3. ラベル生成状況:');
    
    const withTracking = allListings.filter(listing => {
      const orderItems = listing.product?.orderItems || [];
      return orderItems.some(item => item.order?.trackingNumber);
    });
    
    const withoutTracking = allListings.filter(listing => {
      const orderItems = listing.product?.orderItems || [];
      return !orderItems.some(item => item.order?.trackingNumber);
    });
    
    console.log(`ラベル生成済み: ${withTracking.length}件`);
    console.log(`ラベル未生成: ${withoutTracking.length}件`);
    
    // 4. フィルター結果のシミュレーション
    console.log('\n4. フィルター結果のシミュレーション:');
    
    const filterResults = {
      listing: allListings.filter(l => l.status === 'active' && !l.product?.orderItems?.some(item => item.order?.trackingNumber)),
      sold: allListings.filter(l => l.status === 'sold' && !l.product?.orderItems?.some(item => item.order?.trackingNumber)),
      processing: allListings.filter(l => ['draft', 'inactive', 'expired', 'pending'].includes(l.status)),
      shipped: allListings.filter(l => l.status === 'active' && l.product?.orderItems?.some(item => item.order?.trackingNumber)),
      delivered: allListings.filter(l => l.status === 'sold' && l.product?.orderItems?.some(item => item.order?.trackingNumber))
    };
    
    Object.entries(filterResults).forEach(([filter, results]) => {
      console.log(`${filter}: ${results.length}件`);
    });
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSalesData();
