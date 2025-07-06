import { test, expect } from '@playwright/test';

test.describe('UI Width Verification - All Pages', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login');
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('セラー画面の横幅統一確認', async ({ page }) => {
    // Dashboard
    await page.goto('/dashboard');
    await page.waitForSelector('.intelligence-card');
    
    const dashboardPadding = await page.locator('.intelligence-card .p-8').first().evaluate(el => {
      return window.getComputedStyle(el).padding;
    });
    console.log('Dashboard padding:', dashboardPadding);
    
    // Sales
    await page.goto('/sales');
    await page.waitForSelector('.intelligence-card');
    
    const salesPadding = await page.locator('.intelligence-card .p-8').first().evaluate(el => {
      return window.getComputedStyle(el).padding;
    });
    console.log('Sales padding:', salesPadding);
    
    // Inventory
    await page.goto('/inventory');
    await page.waitForSelector('.intelligence-card');
    
    const inventoryPadding = await page.locator('.intelligence-card .p-8').first().evaluate(el => {
      return window.getComputedStyle(el).padding;
    });
    console.log('Inventory padding:', inventoryPadding);
    
    // Returns - 返品処理確認
    await page.goto('/returns');
    await page.waitForSelector('body', { timeout: 10000 });
    
    // 返品検品タブをクリック
    const inspectionTab = page.locator('text=返品検品');
    if (await inspectionTab.isVisible()) {
      await inspectionTab.click();
      await page.waitForTimeout(1000);
      
      const returnsInspectionPadding = await page.locator('.intelligence-card').first().evaluate(el => {
        const contentDiv = el.querySelector('div');
        return contentDiv ? window.getComputedStyle(contentDiv).padding : 'not found';
      });
      console.log('Returns Inspection padding:', returnsInspectionPadding);
    }
    
    // 再出品業務フローをクリック
    const relistingTab = page.locator('text=再出品業務フロー');
    if (await relistingTab.isVisible()) {
      await relistingTab.click();
      await page.waitForTimeout(1000);
      
      const relistingPadding = await page.locator('.intelligence-card').first().evaluate(el => {
        const contentDiv = el.querySelector('div');
        return contentDiv ? window.getComputedStyle(contentDiv).padding : 'not found';
      });
      console.log('Relisting Flow padding:', relistingPadding);
    }
    
    // 返品理由分析をクリック
    const analysisTab = page.locator('text=返品理由分析');
    if (await analysisTab.isVisible()) {
      await analysisTab.click();
      await page.waitForTimeout(1000);
      
      const analysisPadding = await page.locator('.intelligence-card').first().evaluate(el => {
        const contentDiv = el.querySelector('div');
        return contentDiv ? window.getComputedStyle(contentDiv).padding : 'not found';
      });
      console.log('Analysis padding:', analysisPadding);
    }
    
    // 全て32px (2rem) であることを期待
    expect(dashboardPadding).toBe('32px');
    expect(salesPadding).toBe('32px'); 
    expect(inventoryPadding).toBe('32px');
  });

  test('スタッフ画面の横幅統一確認', async ({ page }) => {
    // スタッフダッシュボード
    await page.goto('/staff/dashboard');
    await page.waitForSelector('.intelligence-card');
    
    const staffDashboardPadding = await page.locator('.intelligence-card .p-8').first().evaluate(el => {
      return window.getComputedStyle(el).padding;
    });
    console.log('Staff Dashboard padding:', staffDashboardPadding);
    
    // ピッキング
    await page.goto('/staff/picking');
    await page.waitForSelector('.intelligence-card');
    
    const pickingPadding = await page.locator('.intelligence-card .p-8').first().evaluate(el => {
      return window.getComputedStyle(el).padding;
    });
    console.log('Picking padding:', pickingPadding);
    
    // 検品
    await page.goto('/staff/inspection');
    await page.waitForSelector('body', { timeout: 10000 });
    
    const inspectionPagePadding = await page.locator('.intelligence-card').first().evaluate(el => {
      const contentDiv = el.querySelector('div');
      return contentDiv ? window.getComputedStyle(contentDiv).padding : 'not found';
    });
    console.log('Staff Inspection padding:', inspectionPagePadding);
    
    // 全て32px であることを期待
    expect(staffDashboardPadding).toBe('32px');
    expect(pickingPadding).toBe('32px');
  });

  test('レスポンシブ対応確認', async ({ page }) => {
    // モバイルサイズでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboard');
    await page.waitForSelector('.intelligence-card');
    
    const mobilePadding = await page.locator('.intelligence-card .p-8').first().evaluate(el => {
      return window.getComputedStyle(el).padding;
    });
    console.log('Mobile Dashboard padding:', mobilePadding);
    
    // タブレットサイズでテスト
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const tabletPadding = await page.locator('.intelligence-card .p-8').first().evaluate(el => {
      return window.getComputedStyle(el).padding;
    });
    console.log('Tablet Dashboard padding:', tabletPadding);
    
    // デスクトップサイズでテスト
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const desktopPadding = await page.locator('.intelligence-card .p-8').first().evaluate(el => {
      return window.getComputedStyle(el).padding;
    });
    console.log('Desktop Dashboard padding:', desktopPadding);
    
    // 全て32px であることを期待
    expect(mobilePadding).toBe('32px');
    expect(tabletPadding).toBe('32px');
    expect(desktopPadding).toBe('32px');
  });
});