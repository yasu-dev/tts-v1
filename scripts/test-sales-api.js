const https = require('https');
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ ok: response.statusCode === 200, status: response.statusCode, json: () => jsonData });
        } catch (error) {
          reject(new Error('JSONの解析に失敗: ' + error.message));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
  });
}

async function testSalesAPI() {
  console.log('🧪 Sales API テスト開始...');
  
  try {
    const response = await makeRequest('http://localhost:3000/api/sales');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = response.json();
    
    console.log('\n📊 Sales API レスポンス:');
    console.log(`データソース: ${data._dataSource || '不明'}`);
    console.log(`総売上: ¥${data.overview.totalSales?.toLocaleString()}`);
    console.log(`注文数: ${data.overview.totalOrders}`);
    console.log(`最新注文件数: ${data.recentOrders?.length || 0}`);
    
    if (data.recentOrders && data.recentOrders.length > 0) {
      console.log('\n📦 最新注文（先頭3件）:');
      data.recentOrders.slice(0, 3).forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.orderNumber}`);
        console.log(`     顧客: ${order.customer}`);
        console.log(`     商品: ${order.product || '商品名不明'}`);
        console.log(`     金額: ¥${order.totalAmount?.toLocaleString()}`);
        console.log(`     ステータス: ${order.status}`);
        console.log('     ---');
      });
    }
    
    // 判定
    if (data._dataSource === 'prisma') {
      console.log('✅ 結論: Sales APIは正常にPrismaからデータを取得しています！');
      
      // 商品名がeBayスタイルかチェック
      const hasEbayStyleTitles = data.recentOrders.some(order => 
        order.product && 
        order.product.length > 50 && 
        order.product.includes(' - ')
      );
      
      if (hasEbayStyleTitles) {
        console.log('✅ 商品タイトルはeBayスタイルです！');
      } else {
        console.log('⚠️  商品タイトルがeBayスタイルではありません。データベース更新が必要です。');
        console.log('   現在の商品名例:', data.recentOrders[0]?.product);
      }
    } else if (data._dataSource === 'mock') {
      console.log('⚠️  結論: Sales APIはモックデータを返しています。Prismaでエラーが発生している可能性があります。');
    } else {
      console.log('❓ 結論: データソースが不明です。');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ 開発サーバーが起動していません。npm run dev を実行してください。');
    } else {
      console.error('❌ Sales API テスト中にエラーが発生:', error.message);
    }
  }
}

testSalesAPI();
