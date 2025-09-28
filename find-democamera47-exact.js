const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('🔍 DEMOカメラ４７の正確なIDと履歴確認');

  try {
    // port 3002でAPIアクセス（ユーザーと同じ環境）
    const response = await page.request.get('http://localhost:3002/api/products');
    const data = await response.json();

    // SKUでDEMOカメラ４７を検索
    const targetProduct = data.products.find(p =>
      p.sku && p.sku.includes('DP-1759039405420-CQ0ZW24RG-Z7KLD9')
    );

    if (targetProduct) {
      console.log('✅ DEMOカメラ４７発見:');
      console.log('ID:', targetProduct.id);
      console.log('名前:', targetProduct.name);
      console.log('SKU:', targetProduct.sku);
      console.log('ステータス:', targetProduct.status);

      // この商品の履歴を取得
      const historyResponse = await page.request.get(`http://localhost:3002/api/products/${targetProduct.id}/history`);

      if (historyResponse.ok()) {
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
        if (pickingHistory.length > 0) {
          pickingHistory.forEach((item, index) => {
            console.log(`✅ ${index + 1}. ${item.action} | ${item.timestamp} | ${item.user}`);
          });
        } else {
          console.log('❌ ピッキング関連の履歴が見つかりません');
        }

        // 完全ワークフロー履歴の確認
        const expectedActions = [
          '納品プラン', '商品登録', '検品', '撮影', '保管', '出品', '購入者決定', 'ピッキング', '梱包', 'ラベル貼付', '配送準備'
        ];

        console.log(`\n📋 期待される履歴項目の確認:`);
        expectedActions.forEach(expectedAction => {
          const found = historyData.history.some(h =>
            h.action.includes(expectedAction) || h.description.includes(expectedAction)
          );
          console.log(`${found ? '✅' : '❌'} ${expectedAction}`);
        });

      } else {
        console.log('❌ 履歴API呼び出し失敗:', historyResponse.status());
      }

    } else {
      console.log('❌ DEMOカメラ４７が見つかりません（SKU検索）');

      // 名前で再検索
      const nameMatch = data.products.find(p =>
        p.name && p.name.includes('DEMOカメラ４７')
      );

      if (nameMatch) {
        console.log('⚠️ 名前では見つかりました:', nameMatch.name, nameMatch.id);
      }
    }

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }

  await browser.close();
})();