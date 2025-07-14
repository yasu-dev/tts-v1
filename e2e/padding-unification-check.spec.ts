import { test, expect } from '@playwright/test';

test.describe('パディング統一確認テスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('📏 在庫管理画面のパディング現状確認', async ({ page }) => {
    console.log('🔍 在庫管理画面のパディング状況を確認します...');
    
    // 在庫管理画面に移動
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // テーブル要素の確認
    const tableElement = await page.locator('table').first();
    await expect(tableElement).toBeVisible();
    
    // テーブルのコンテナ要素を確認
    const tableContainer = await page.locator('.bg-white.rounded-xl').first();
    await expect(tableContainer).toBeVisible();
    
    // 現在のパディング状況をスクリーンショット
    await page.screenshot({ 
      path: 'inventory-current-padding.png',
      fullPage: true 
    });
    
    console.log('📸 現在の在庫管理画面のパディング状況を記録しました');
    
    // テーブル列の要素数を確認
    const headerCells = await page.locator('thead th').count();
    console.log(`📊 テーブル列数: ${headerCells}`);
    
    // 各列の幅を測定
    const headers = await page.locator('thead th').all();
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const box = await header.boundingBox();
      const text = await header.textContent();
      console.log(`📐 列${i + 1}「${text?.trim()}」の幅: ${box?.width}px`);
    }
  });

  test('📏 他の画面との比較確認', async ({ page }) => {
    console.log('🔍 他の画面のパディングと比較します...');
    
    // ダッシュボード画面
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'dashboard-padding-comparison.png',
      fullPage: false 
    });
    
    // 返品画面
    await page.goto('http://localhost:3002/staff/returns');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'returns-padding-comparison.png',
      fullPage: false 
    });
    
    // 出荷画面
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'shipping-padding-comparison.png',
      fullPage: false 
    });
    
    console.log('📸 他の画面のパディング比較用スクリーンショットを記録しました');
  });
}); 