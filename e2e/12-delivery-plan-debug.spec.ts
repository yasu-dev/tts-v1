import { test, expect } from '@playwright/test';

test.describe('納品プラン画面の業務フロー詳細デバッグ', () => {

  test.beforeEach(async ({ page }) => {
    // Sellerログイン処理
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(3000); // 初期化待機
  });

  test('納品プラン画面での業務フロー状態詳細調査', async ({ page }) => {
    console.log('🔍 デバッグ開始: 納品プラン画面');
    
    // 画面に移動
    await page.goto('/delivery-plan');
    await page.waitForTimeout(3000);
    
    // DashboardLayoutの存在確認
    const dashboardExists = await page.locator('.main-content').count();
    console.log(`DashboardLayout存在: ${dashboardExists > 0}`);
    
    // スクロールコンテナの存在確認
    const scrollContainerExists = await page.locator('.page-scroll-container').count();
    console.log(`スクロールコンテナ存在: ${scrollContainerExists > 0}`);
    
    // 業務フロー関連要素の詳細確認
    const flowSelectors = [
      '.unified-product-flow',
      '[data-testid="unified-product-flow"]',
      '.business-flow',
      '.product-flow',
      '[class*="flow"]'
    ];
    
    console.log('📊 業務フロー要素の検索結果:');
    for (const selector of flowSelectors) {
      const count = await page.locator(selector).count();
      console.log(`  ${selector}: ${count}個`);
      
      if (count > 0) {
        const visible = await page.locator(selector).first().isVisible();
        console.log(`    最初の要素は表示: ${visible}`);
      }
    }
    
    // 実際のスクロール動作テスト
    const scrollContainer = page.locator('.page-scroll-container').first();
    if (await scrollContainer.count() > 0) {
      console.log('📜 スクロール動作テスト実行中...');
      
      // 初期スクロール位置
      const initialScrollTop = await scrollContainer.evaluate(el => el.scrollTop);
      console.log(`初期スクロール位置: ${initialScrollTop}px`);
      
      // 300px下スクロール
      await scrollContainer.evaluate(el => el.scrollTop = 300);
      await page.waitForTimeout(1500);
      
      const finalScrollTop = await scrollContainer.evaluate(el => el.scrollTop);
      console.log(`最終スクロール位置: ${finalScrollTop}px`);
      
      // スクロール可能な高さを確認
      const scrollHeight = await scrollContainer.evaluate(el => el.scrollHeight);
      const clientHeight = await scrollContainer.evaluate(el => el.clientHeight);
      console.log(`スクロール可能領域: ${scrollHeight}px (表示領域: ${clientHeight}px)`);
      
      if (scrollHeight <= clientHeight) {
        console.log('⚠️ スクロール不可: コンテンツが短すぎる');
      }
    } else {
      console.log('❌ スクロールコンテナが見つからない');
    }
    
    // Console.logの内容を取得
    page.on('console', msg => {
      if (msg.text().includes('スクロール') || msg.text().includes('業務フロー') || msg.text().includes('初期化')) {
        console.log(`🖥️ ブラウザログ: ${msg.text()}`);
      }
    });
    
    // 最後に、業務フローが実際に存在するかの最終確認
    const businessFlowTitle = await page.locator('text=業務フロー').count();
    console.log(`「業務フロー」テキスト数: ${businessFlowTitle}`);
    
    if (businessFlowTitle === 0) {
      console.log('⚠️ この画面には業務フローが存在しない可能性があります');
    }
  });
});