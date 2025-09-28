const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  console.log('🔍 履歴表示確認テスト開始');

  try {
    // 既存商品の履歴を直接確認
    const productId = 'cmfl8fzdf001uld92sxg84jio'; // 問題の商品ID

    // スタッフログイン
    await page.goto('http://localhost:3003/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 商品詳細ページに直接移動
    await page.goto(`http://localhost:3003/staff/products/${productId}`);
    await page.waitForTimeout(3000);

    // 履歴タブをクリック
    await page.click('text=履歴');
    await page.waitForTimeout(3000);

    // ページ全体のスクリーンショット
    await page.screenshot({
      path: 'actual-history-display.png',
      fullPage: true
    });

    // 履歴項目のテキストを全て取得
    const historyTexts = await page.evaluate(() => {
      const historyElements = document.querySelectorAll('[class*="history"], [class*="activity"], [class*="timeline"], .timeline-item, .activity-item, .history-item, tr');
      return Array.from(historyElements).map(el => el.textContent?.trim()).filter(text => text && text.length > 5);
    });

    console.log('📋 UI表示の履歴項目:');
    historyTexts.forEach((text, index) => {
      if (text.includes('アクション') || text.includes('ピッキング') || text.includes('出品') || text.includes('保管') || text.includes('検品')) {
        console.log(`  ${index + 1}. ${text}`);
      }
    });

    // APIデータと比較
    const apiResponse = await page.request.get(`http://localhost:3003/api/products/${productId}/history`);
    const apiData = await apiResponse.json();

    console.log('\n📊 API履歴データ:');
    apiData.history.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.action} - ${item.timestamp} - ${item.user}`);
    });

    console.log('\n✅ スクリーンショット保存: actual-history-display.png');
    console.log(`📈 UI履歴項目数: ${historyTexts.length}`);
    console.log(`📈 API履歴項目数: ${apiData.history.length}`);

    // ピッキング完了があるかチェック
    const hasPickingInUI = historyTexts.some(text => text.includes('ピッキング'));
    const hasPickingInAPI = apiData.history.some(item => item.action.includes('ピッキング'));

    console.log(`\n🔍 ピッキング完了チェック:`);
    console.log(`  UI表示: ${hasPickingInUI ? '✅ 見つかった' : '❌ 見つからない'}`);
    console.log(`  API: ${hasPickingInAPI ? '✅ 見つかった' : '❌ 見つからない'}`);

  } catch (error) {
    console.error('❌ エラー:', error);
    await page.screenshot({ path: 'history-check-error.png' });
  }

  await browser.close();
})();