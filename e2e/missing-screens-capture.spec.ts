import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

test.describe('残り9画面のスクリーンショット取得', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  const missingScreens = [
    { name: 'billing', url: '/billing', role: 'seller' },
    { name: 'dashboard', url: '/dashboard', role: 'seller' },
    { name: 'delivery', url: '/delivery', role: 'seller' },
    { name: 'delivery-plan', url: '/delivery-plan', role: 'seller' },
    { name: 'inventory', url: '/inventory', role: 'seller' },
    { name: 'returns', url: '/returns', role: 'seller' },
    { name: 'sales', url: '/sales', role: 'seller' },
    { name: 'profile', url: '/profile', role: 'seller' },
    { name: 'staff-tasks', url: '/staff/tasks', role: 'staff' },
  ];

  test('残り9画面のスクリーンショット取得', async () => {
    const screenshotDir = 'test-results/fullscreen-width-verification';
    await fs.mkdir(screenshotDir, { recursive: true });

    for (const screen of missingScreens) {
      console.log(`\n🔄 ${screen.name} 画面のスクリーンショット取得中...`);
      
      // ログイン
      if (screen.role === 'staff') {
        await page.goto('http://localhost:3001/login');
        await page.fill('input[type="email"]', 'staff@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/staff/dashboard');
      } else {
        await page.goto('http://localhost:3001/login');
        await page.fill('input[type="email"]', 'seller@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');
      }

      // 画面に移動
      await page.goto(`http://localhost:3001${screen.url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 全画面スクリーンショット取得
      const screenshotPath = path.join(screenshotDir, `${screen.name}-fullscreen.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true,
        type: 'png'
      });

      // ビューポート幅を測定
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      console.log(`✅ ${screen.name}: ${viewportWidth}px × ${viewportHeight}px - スクリーンショット保存完了`);
    }

    console.log(`\n🎉 残り9画面のスクリーンショット取得完了！`);
  });
}); 