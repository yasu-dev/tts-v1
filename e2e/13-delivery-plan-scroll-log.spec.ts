import { test, expect } from '@playwright/test';

test.describe('納品プラン画面のスクロールログ確認', () => {

  test.beforeEach(async ({ page }) => {
    // コンソールログをキャプチャ
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('スクロール') || text.includes('フロー') || text.includes('初期化') || text.includes('🚀')) {
        console.log(`📺 [${msg.type()}] ${text}`);
      }
    });

    // Sellerログイン処理
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(3000);
  });

  test('納品プラン画面でのスクロールイベント発火確認', async ({ page }) => {
    console.log('🔍 スクロールログ確認開始: 納品プラン画面');
    
    // 画面に移動
    await page.goto('/delivery-plan');
    await page.waitForTimeout(4000); // 初期化完了まで十分待機
    
    console.log('⏳ 初期化完了、スクロールテスト開始...');
    
    // スクロールコンテナを取得
    const scrollContainer = page.locator('.page-scroll-container').first();
    
    // 初期状態の確認
    const initialState = await scrollContainer.evaluate(el => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight
    }));
    console.log('📊 初期状態:', initialState);
    
    // 業務フローの状態確認
    const flowElement = page.locator('.unified-product-flow, [class*="flow"]').first();
    const isInitiallyVisible = await flowElement.isVisible();
    console.log(`💼 業務フロー初期状態: ${isInitiallyVisible ? '表示' : '非表示'}`);
    
    // 段階的スクロールでイベント発火を確認
    const scrollSteps = [100, 200, 250, 300, 400];
    
    for (const scrollPos of scrollSteps) {
      console.log(`📜 ${scrollPos}pxにスクロール実行中...`);
      
      await scrollContainer.evaluate((el, pos) => {
        el.scrollTop = pos;
      }, scrollPos);
      
      // スクロールイベントの処理を待つ
      await page.waitForTimeout(1000);
      
      const currentState = await scrollContainer.evaluate(el => ({
        scrollTop: el.scrollTop
      }));
      
      const flowVisible = await flowElement.isVisible();
      console.log(`  スクロール位置: ${currentState.scrollTop}px, 業務フロー: ${flowVisible ? '表示' : '非表示'}`);
      
      // 250px以上でフローが閉じているかチェック
      if (scrollPos >= 250 && flowVisible) {
        console.log(`  ⚠️ ${scrollPos}px時点で業務フローがまだ表示されています`);
      } else if (scrollPos >= 250 && !flowVisible) {
        console.log(`  ✅ ${scrollPos}px時点で業務フローが正常に閉じました`);
        break;
      }
    }
    
    // 最終状態の詳細確認
    const finalFlowVisible = await flowElement.isVisible();
    console.log(`🏁 最終結果: 業務フロー ${finalFlowVisible ? '表示中' : '非表示'}`);
    
    if (finalFlowVisible) {
      // 業務フローが閉じない場合の追加診断
      const flowClasses = await flowElement.evaluate(el => ({
        className: el.className,
        tagName: el.tagName,
        display: window.getComputedStyle(el).display,
        visibility: window.getComputedStyle(el).visibility,
        opacity: window.getComputedStyle(el).opacity
      }));
      console.log('🔬 業務フロー要素の詳細:', flowClasses);
    }
  });
});