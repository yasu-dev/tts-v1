const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 DEMOカメラ４７の商品ID検索');

  try {
    // APIから全商品を取得してDEMOカメラ４７を検索
    const response = await page.request.get('http://localhost:3003/api/products');
    const data = await response.json();

    // DEMOカメラ４７を検索
    const targetProduct = data.products.find(p =>
      p.name && p.name.includes('DEMOカメラ４７')
    );

    if (targetProduct) {
      console.log('✅ 商品発見:');
      console.log('ID:', targetProduct.id);
      console.log('名前:', targetProduct.name);
      console.log('ステータス:', targetProduct.status);

      // この商品の履歴を取得
      const historyResponse = await page.request.get(`http://localhost:3003/api/products/${targetProduct.id}/history`);
      const historyData = await historyResponse.json();

      console.log(`\n📊 ${targetProduct.name} の履歴（全${historyData.history.length}件）:`);
      historyData.history.forEach((item, index) => {
        console.log(`${index + 1}. ${item.action} | ${item.timestamp} | ${item.user}`);
      });

      // ピッキング関連の履歴をチェック
      const pickingHistory = historyData.history.filter(h =>
        h.action.includes('ピッキング') || h.action.includes('picking')
      );

      console.log(`\n🎯 ピッキング関連履歴: ${pickingHistory.length}件`);
      pickingHistory.forEach((item, index) => {
        console.log(`${index + 1}. ${item.action} | ${item.timestamp} | ${item.user}`);
      });

    } else {
      console.log('❌ DEMOカメラ４７が見つかりません');

      // 似た名前の商品を検索
      const similarProducts = data.products.filter(p =>
        p.name && (p.name.includes('DEMO') || p.name.includes('カメラ'))
      );

      console.log('\n📋 DEMOカメラ商品一覧:');
      similarProducts.slice(0, 10).forEach((p, index) => {
        console.log(`${index + 1}. ${p.name} (ID: ${p.id})`);
      });
    }

  } catch (error) {
    console.error('❌ エラー:', error);
  }

  await browser.close();
})();