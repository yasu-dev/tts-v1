const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('📸 履歴画面スクリーンショット撮影');

  try {
    // 商品詳細ページに直接移動（URL from image: localhost:3002/inventory）
    await page.goto('http://localhost:3003/inventory');
    await page.waitForTimeout(5000);

    // スクリーンショット1: 在庫画面
    await page.screenshot({
      path: 'current-inventory-page.png',
      fullPage: true
    });
    console.log('✅ 在庫画面スクリーンショット保存');

    // 商品詳細モーダルを開く（商品名をクリック）
    try {
      await page.click('text=XYZcamera1', { timeout: 5000 });
      await page.waitForTimeout(3000);

      // スクリーンショット2: 商品詳細モーダル
      await page.screenshot({
        path: 'product-detail-modal.png',
        fullPage: true
      });
      console.log('✅ 商品詳細モーダルスクリーンショット保存');

    } catch (error) {
      console.log('⚠️ 商品詳細モーダルを開けませんでした');
    }

    // APIから履歴データを取得して表示
    const apiResponse = await page.request.get(`http://localhost:3003/api/products/cmfl8fzdf001uld92sxg84jio/history`);
    const apiData = await apiResponse.json();

    console.log('\n📊 API履歴データ（最新5件）:');
    apiData.history.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.action} | ${item.timestamp} | ${item.user}`);
    });

    console.log(`\n✅ 合計 ${apiData.history.length} 件の履歴がAPIに記録されています`);

  } catch (error) {
    console.error('❌ エラー:', error);
    await page.screenshot({ path: 'screenshot-error.png' });
  }

  await browser.close();
})();