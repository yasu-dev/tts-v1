import { test, expect } from '@playwright/test';

test.describe('アイコン表示と横幅検証', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/staff/dashboard');
  });

  test('サイドバーのアイコン表示確認', async ({ page }) => {
    // スタッフダッシュボードでサイドバーを確認
    await page.goto('/staff/dashboard');
    
    // サイドバーの存在確認
    const sidebar = page.locator('nav, aside, [role="navigation"]').first();
    await expect(sidebar).toBeVisible({ timeout: 10000 });
    
    // メニュー項目の確認
    const menuItems = [
      'スタッフダッシュボード',
      'タスク管理', 
      '在庫管理',
      '検品・撮影',
      'ロケーション管理',
      '出荷管理',
      '返品処理',
      '業務レポート'
    ];
    
    for (const item of menuItems) {
      const menuItem = page.locator(`text="${item}"`).first();
      await expect(menuItem).toBeVisible();
      
      // アイコンの存在確認（SVGまたはアイコンクラス）
      const menuButton = menuItem.locator('..').first();
      const icon = menuButton.locator('svg, [class*="icon"], [class*="Icon"]').first();
      await expect(icon).toBeVisible();
      
      console.log(`✓ ${item}: アイコンとテキストが表示されています`);
    }
  });

  test('返品処理ページの横幅確認', async ({ page }) => {
    // 返品処理ページに移動
    await page.goto('/staff/returns');
    await page.waitForLoadState('networkidle');
    
    // intelligence-card要素の確認
    const cards = page.locator('.intelligence-card');
    const cardCount = await cards.count();
    
    console.log(`intelligence-card要素数: ${cardCount}`);
    
    // 各カードのパディング確認
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      const cardContent = card.locator('> div').first();
      
      // パディングクラスの確認
      const className = await cardContent.getAttribute('class');
      console.log(`Card ${i + 1} classes: ${className}`);
      
      // p-8 パディングの確認
      if (className && className.includes('p-8')) {
        console.log(`✓ Card ${i + 1}: p-8 パディングが適用されています`);
      } else {
        console.log(`✗ Card ${i + 1}: p-8 パディングが適用されていません`);
      }
    }
    
    // 画面全体の横幅一貫性確認
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    console.log(`ページ幅: ${pageWidth}px, ビューポート幅: ${viewportWidth}px`);
    
    // 横スクロールが発生していないか確認
    expect(pageWidth).toBeLessThanOrEqual(viewportWidth + 20); // 20pxのマージンを許容
  });

  test('画面スクリーンショット撮影', async ({ page }) => {
    // 主要画面のスクリーンショットを撮影
    const pages = [
      '/staff/dashboard',
      '/staff/returns',
      '/staff/inventory',
      '/staff/tasks'
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const screenshotPath = `test-results/current-${pagePath.replace(/\//g, '-')}.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      console.log(`スクリーンショット保存: ${screenshotPath}`);
    }
  });
}); 