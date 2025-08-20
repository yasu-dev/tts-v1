const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugApiResponse() {
  try {
    console.log('=== APIレスポンスのデバッグ ===\n');
    
    const baseUrl = 'http://localhost:3002';
    
    // 各ステータスフィルターでAPIを呼び出し
    const testCases = [
      { status: 'all', description: 'すべて' },
      { status: 'listing', description: '出品中' },
      { status: 'sold', description: '購入者決定' },
      { status: 'processing', description: '出荷準備中' },
      { status: 'shipped', description: '出荷済み' },
      { status: 'delivered', description: '到着済み' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n--- ${testCase.description}フィルター ---`);
      
      const url = `${baseUrl}/api/sales?page=1&limit=20&status=${testCase.status}`;
      console.log(`URL: ${url}`);
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        console.log(`レスポンスステータス: ${response.status}`);
        console.log(`データソース: ${data._dataSource}`);
        console.log(`注文数: ${data.recentOrders?.length || 0}`);
        
        if (data.recentOrders && data.recentOrders.length > 0) {
          console.log('最初の注文の詳細:');
          const firstOrder = data.recentOrders[0];
          console.log(`  ID: ${firstOrder.id}`);
          console.log(`  ステータス: ${firstOrder.status}`);
          console.log(`  商品: ${firstOrder.product}`);
          console.log(`  ラベル生成: ${firstOrder.labelGenerated}`);
          console.log(`  トラッキング番号: ${firstOrder.trackingNumber || 'なし'}`);
        }
        
        // ステータス別の集計
        if (data.recentOrders && data.recentOrders.length > 0) {
          const statusCounts = {};
          data.recentOrders.forEach(order => {
            const status = order.status;
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });
          console.log('ステータス別集計:', statusCounts);
        }
        
      } catch (error) {
        console.error(`API呼び出しエラー: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

debugApiResponse();
