import { test, expect } from '@playwright/test';

test.describe('全画面での業務フローのスクロール動作テスト', () => {

  test.beforeEach(async ({ page }) => {
    // Sellerログイン処理
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(3000); // 初期化待機
  });

  // テスト対象画面のリスト
  const sellerScreens = [
    { path: '/dashboard', name: 'ダッシュボード' },
    { path: '/sales', name: '売上管理' },
    { path: '/inventory', name: '在庫管理' },
    { path: '/delivery', name: '発送管理' },
    { path: '/returns', name: '返品管理' },
    { path: '/billing', name: '請求管理' },
    { path: '/timeline', name: 'タイムライン' },
    { path: '/settings', name: '設定' },
    { path: '/profile', name: 'プロフィール' },
    { path: '/delivery-plan', name: '納品プラン' }
  ];

  sellerScreens.forEach(({ path, name }) => {
    test(`${name}画面での業務フロー下スクロール機能`, async ({ page }) => {
      console.log(`🔍 テスト開始: ${name} (${path})`);
      
      // 画面に移動
      await page.goto(path);
      await page.waitForTimeout(2000);
      
      // 業務フローの存在確認（包括的セレクタ）
      const businessFlowSelector = '.unified-product-flow, [data-testid="unified-product-flow"], .business-flow, .product-flow, [class*="flow"]';
      
      // まず業務フローコンポーネントの存在を確認
      let flowElement = page.locator(businessFlowSelector).first();
      const flowExists = await flowElement.count() > 0;
      
      if (!flowExists) {
        // 業務フローが見つからない場合は、より広範囲に検索
        console.log(`⚠️ ${name}: 標準的な業務フローセレクタで見つからない、詳細検索中...`);
        const allFlowElements = await page.locator('[class*="flow"], [data-testid*="flow"]').count();
        console.log(`${name}: フロー関連要素数: ${allFlowElements}`);
        
        // 画面固有の業務フロー要素を探す
        flowElement = page.locator('[class*="flow"], [data-testid*="flow"]').first();
      }
      
      await expect(flowElement).toBeVisible({ timeout: 5000 });
      
      try {
        // 初期状態で業務フローが表示されていることを確認
        await expect(flowElement).toBeVisible({ timeout: 3000 });
        console.log(`✅ ${name}: 初期状態で業務フローが表示されています`);
        
        // スクロールコンテナの確認
        const scrollContainer = page.locator('.page-scroll-container').first();
        await expect(scrollContainer).toBeVisible();
        
        // 250px下スクロール（変更後の閾値）
        await page.evaluate(() => {
          const container = document.querySelector('.page-scroll-container');
          if (container) {
            container.scrollTop = 300;
          } else {
            window.scrollTo(0, 300);
          }
        });
        await page.waitForTimeout(1500);
        
        // 業務フローが閉じたことを確認
        const isFlowHidden = await flowElement.isHidden();
        if (!isFlowHidden) {
          // より詳細な確認
          const flowContainer = flowElement.first();
          const isCollapsed = await flowContainer.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display === 'none' || el.scrollHeight === 0 || (el as HTMLElement).offsetHeight === 0;
          });
          expect(isCollapsed, `${name}: 業務フローが閉じられていません`).toBe(true);
        }
        console.log(`✅ ${name}: 下スクロール後に業務フローが閉じました`);
        
        // 最上部に戻る
        await page.evaluate(() => {
          const container = document.querySelector('.page-scroll-container');
          if (container) {
            container.scrollTop = 0;
          } else {
            window.scrollTo(0, 0);
          }
        });
        await page.waitForTimeout(1000);
        
        // 最上部に戻っても業務フローが閉じたままであることを確認
        const isStillHidden = await flowElement.isHidden();
        if (!isStillHidden) {
          const flowContainer = flowElement.first();
          const isStillCollapsed = await flowContainer.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display === 'none' || el.scrollHeight === 0 || (el as HTMLElement).offsetHeight === 0;
          });
          expect(isStillCollapsed, `${name}: 最上部に戻った後も業務フローが閉じたままでありません`).toBe(true);
        }
        console.log(`✅ ${name}: 最上部に戻った後も業務フローは閉じたままです`);
        
        // 右上のトグルボタンで開けることを確認
        const toggleButton = page.locator('button[title*="フローを展開"], button[title*="フローを折りたたむ"]').first();
        await expect(toggleButton).toBeVisible();
        await toggleButton.click();
        await page.waitForTimeout(500);
        
        // 業務フローが開いたことを確認
        await expect(flowElement).toBeVisible();
        console.log(`✅ ${name}: トグルボタンで業務フローが開きました`);
        
      } catch (error) {
        console.error(`❌ ${name}: テスト失敗 - ${error}`);
        
        // デバッグ情報を収集
        const scrollContainerExists = await page.locator('.page-scroll-container').count();
        const businessFlowExists = await page.locator(businessFlowSelector).count();
        const pageTitle = await page.title();
        
        console.log(`デバッグ情報 (${name}):`);
        console.log(`- ページタイトル: ${pageTitle}`);
        console.log(`- スクロールコンテナ数: ${scrollContainerExists}`);
        console.log(`- 業務フロー要素数: ${businessFlowExists}`);
        
        throw error;
      }
    });
  });

  test('スタッフダッシュボードでの業務フロー下スクロール機能', async ({ page }) => {
    // Staffログインに切り替え
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/staff/dashboard');
    await page.waitForTimeout(3000);
    
    console.log('🔍 テスト開始: スタッフダッシュボード (/staff/dashboard)');
    
    // 業務フローの存在確認
    const businessFlowSelector = '.unified-product-flow, [data-testid="unified-product-flow"], .business-flow';
    await expect(page.locator('text=業務フロー')).toBeVisible({ timeout: 5000 });
    const flowElement = page.locator(businessFlowSelector).first();
    
    // 初期状態で業務フローが表示されていることを確認
    await expect(flowElement).toBeVisible({ timeout: 3000 });
    console.log('✅ スタッフダッシュボード: 初期状態で業務フローが表示されています');
    
    // 250px下スクロール
    await page.evaluate(() => {
      const container = document.querySelector('.page-scroll-container');
      if (container) {
        container.scrollTop = 300;
      } else {
        window.scrollTo(0, 300);
      }
    });
    await page.waitForTimeout(1500);
    
    // 業務フローが閉じたことを確認
    const isFlowHidden = await flowElement.isHidden();
    if (!isFlowHidden) {
      const flowContainer = flowElement.first();
      const isCollapsed = await flowContainer.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display === 'none' || el.scrollHeight === 0 || (el as HTMLElement).offsetHeight === 0;
      });
      expect(isCollapsed, 'スタッフダッシュボード: 業務フローが閉じられていません').toBe(true);
    }
    console.log('✅ スタッフダッシュボード: 下スクロール後に業務フローが閉じました');
  });
});