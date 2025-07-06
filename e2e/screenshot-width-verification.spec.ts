import { test, expect } from '@playwright/test';

test.describe('全画面横幅確認 - スクリーンショット検証', () => {
  test('全画面のスクリーンショットを撮影して横幅を確認', async ({ page }) => {
    // ブラウザサイズを固定
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log('=== セラー画面のスクリーンショット撮影 ===');

    // Dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/seller-dashboard.png', 
      fullPage: true 
    });
    console.log('✅ Seller Dashboard screenshot saved');

    // Sales
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/seller-sales.png', 
      fullPage: true 
    });
    console.log('✅ Seller Sales screenshot saved');

    // Inventory
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/seller-inventory.png', 
      fullPage: true 
    });
    console.log('✅ Seller Inventory screenshot saved');

    // Returns
    await page.goto('/returns');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/seller-returns.png', 
      fullPage: true 
    });
    console.log('✅ Seller Returns screenshot saved');

    console.log('=== スタッフ画面のスクリーンショット撮影 ===');

    // Staff Dashboard
    await page.goto('/staff/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/staff-dashboard.png', 
      fullPage: true 
    });
    console.log('✅ Staff Dashboard screenshot saved');

    // Staff Picking
    await page.goto('/staff/picking');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/staff-picking.png', 
      fullPage: true 
    });
    console.log('✅ Staff Picking screenshot saved');

    // Staff Returns - メイン画面
    await page.goto('/staff/returns');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/staff-returns-main.png', 
      fullPage: true 
    });
    console.log('✅ Staff Returns Main screenshot saved');

    // Staff Returns - 返品検品タブ
    const inspectionTab = page.locator('text=返品検品');
    if (await inspectionTab.isVisible()) {
      await inspectionTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: 'test-results/staff-returns-inspection.png', 
        fullPage: true 
      });
      console.log('✅ Staff Returns Inspection tab screenshot saved');
    }

    // Staff Returns - 再出品業務フロータブ
    const relistingTab = page.locator('text=再出品業務フロー');
    if (await relistingTab.isVisible()) {
      await relistingTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: 'test-results/staff-returns-relisting.png', 
        fullPage: true 
      });
      console.log('✅ Staff Returns Relisting tab screenshot saved');
    }

    // Staff Returns - 返品理由分析タブ
    const analysisTab = page.locator('text=返品理由分析');
    if (await analysisTab.isVisible()) {
      await analysisTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: 'test-results/staff-returns-analysis.png', 
        fullPage: true 
      });
      console.log('✅ Staff Returns Analysis tab screenshot saved');
    }

    console.log('=== 追加画面のスクリーンショット撮影 ===');

    // Staff Inspection
    await page.goto('/staff/inspection');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/staff-inspection.png', 
      fullPage: true 
    });
    console.log('✅ Staff Inspection screenshot saved');

    // Staff Location
    await page.goto('/staff/location');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/staff-location.png', 
      fullPage: true 
    });
    console.log('✅ Staff Location screenshot saved');

    // Staff Reports
    await page.goto('/staff/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/staff-reports.png', 
      fullPage: true 
    });
    console.log('✅ Staff Reports screenshot saved');

    console.log('=== レスポンシブ確認 ===');

    // モバイルサイズでダッシュボード確認
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/mobile-dashboard.png', 
      fullPage: true 
    });
    console.log('✅ Mobile Dashboard screenshot saved');

    // タブレットサイズでダッシュボード確認
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/tablet-dashboard.png', 
      fullPage: true 
    });
    console.log('✅ Tablet Dashboard screenshot saved');

    console.log('=== 全スクリーンショット撮影完了 ===');
    console.log('test-results/ フォルダ内に画像が保存されました');
  });
});