const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();

  console.log('🚀 完全ワークフローテスト開始');

  try {
    // セラーログイン
    await page.goto('http://localhost:3003/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/delivery');

    // 納品プラン作成
    await page.click('text=新規納品プラン作成');
    await page.fill('input[placeholder*="納品先住所"]', 'TEST WAREHOUSE');
    await page.click('text=商品を追加');

    const testProductName = 'テストワークフロー商品' + Date.now();
    await page.fill('input[name="product-name"]', testProductName);
    await page.selectOption('select[name="product-category"]', 'camera');
    await page.fill('input[name="purchase-price"]', '50000');

    // 納品プラン作成実行
    await page.click('button:has-text("納品プラン作成")');
    await page.waitForTimeout(3000);
    console.log('✅ 納品プラン作成完了');

    // スタッフログイン
    await page.goto('http://localhost:3003/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/staff/**');

    // 商品を検索してステータス進行
    await page.goto('http://localhost:3003/staff/receiving');
    const productRow = page.locator(`tr:has-text("${testProductName}")`).first();

    if (await productRow.isVisible()) {
      console.log('✅ 商品見つかりました');

      // 検品完了
      await productRow.locator('button:has-text("検品完了")').click();
      await page.waitForTimeout(1000);

      // 撮影完了
      await productRow.locator('button:has-text("撮影完了")').click();
      await page.waitForTimeout(1000);

      // 棚保管
      await productRow.locator('button:has-text("棚保管")').click();
      await page.waitForTimeout(1000);

      // 出品
      await productRow.locator('button:has-text("出品")').click();
      await page.waitForTimeout(1000);

      console.log('✅ 検品→撮影→保管→出品完了');
    }

    // 商品IDを取得
    const response = await page.request.get('http://localhost:3003/api/products');
    const data = await response.json();
    const testProduct = data.products.find(p => p.name === testProductName);

    if (testProduct) {
      console.log('✅ 商品ID:', testProduct.id);

      // 購入者決定（注文作成）
      await page.request.post('http://localhost:3003/api/orders', {
        data: {
          customerId: 'test-customer',
          items: [{ productId: testProduct.id, quantity: 1, price: 50000 }],
          shippingAddress: 'テスト配送先',
          paymentMethod: 'credit_card'
        }
      });
      console.log('✅ 購入者決定完了');

      // ピッキング完了
      const pickingResponse = await page.request.post('http://localhost:3003/api/picking', {
        data: {
          productIds: [testProduct.id],
          action: 'complete_picking'
        }
      });
      console.log('✅ ピッキング完了:', await pickingResponse.json());

      // 商品詳細の履歴タブを開く
      await page.goto(`http://localhost:3003/staff/products/${testProduct.id}`);
      await page.waitForTimeout(2000);

      // 履歴タブをクリック
      await page.click('text=履歴');
      await page.waitForTimeout(3000);

      // スクリーンショット撮影
      await page.screenshot({
        path: 'workflow-test-result.png',
        fullPage: true
      });

      // 履歴項目を確認
      const historyItems = await page.locator('.activity-item, .history-item, [data-testid*="history"], [class*="timeline"]').allTextContents();
      console.log('📋 履歴項目:', historyItems);

      // APIからも確認
      const historyResponse = await page.request.get(`http://localhost:3003/api/products/${testProduct.id}/history`);
      const historyData = await historyResponse.json();
      console.log('📊 API履歴:', historyData.history.map(h => h.action));

      console.log('✅ テスト完了 - スクリーンショット: workflow-test-result.png');
    }

  } catch (error) {
    console.error('❌ エラー:', error);
    await page.screenshot({ path: 'workflow-test-error.png' });
  }

  await browser.close();
})();