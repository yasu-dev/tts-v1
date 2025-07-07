import { test, expect } from '@playwright/test';

test.describe('横幅問題の詳細分析', () => {
  test('全画面の実際の幅を数値で測定', async ({ page }) => {
    const pages = [
      { name: 'dashboard', url: '/dashboard' },
      { name: 'inventory', url: '/inventory' },
      { name: 'sales', url: '/sales' },
      { name: 'billing', url: '/billing' },
      { name: 'staff-returns', url: '/staff/returns' }
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForTimeout(3000);
      
      // メインコンテンツエリアの実際の幅を測定
      const mainContent = page.locator('main[role="main"]');
      const mainBox = await mainContent.boundingBox();
      
      // intelligence-cardの幅を測定
      const intelligenceCard = page.locator('.intelligence-card').first();
      const cardBox = await intelligenceCard.boundingBox();
      
      // DashboardLayoutのコンテナ幅を測定
      const layoutContainer = page.locator('.max-w-\\[1600px\\]');
      const containerBox = await layoutContainer.boundingBox();
      
      console.log(`\n=== ${pageInfo.name.toUpperCase()} ===`);
      console.log(`Main content width: ${mainBox?.width}px`);
      console.log(`Intelligence card width: ${cardBox?.width}px`);
      console.log(`Layout container width: ${containerBox?.width}px`);
      
      // 各要素の左右マージンも計算
      if (mainBox && cardBox) {
        const leftMargin = cardBox.x - mainBox.x;
        const rightMargin = (mainBox.x + mainBox.width) - (cardBox.x + cardBox.width);
        console.log(`Left margin: ${leftMargin}px, Right margin: ${rightMargin}px`);
      }
      
      await page.screenshot({ 
        path: `test-results/width-analysis-${pageInfo.name}.png`, 
        fullPage: false 
      });
    }
  });
});