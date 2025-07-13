import { test, expect } from '@playwright/test';

test.describe('UI統一検証 - 指定5画面', () => {
  
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'THE WORLD DOOR' })).toBeVisible({ timeout: 30000 });
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log('Current URL after login:', page.url());
  });

  test('🔍 スタッフ検品・撮影画面 - UI統一確認', async ({ page }) => {
    await page.goto('/staff/inspection');
    await page.waitForLoadState('networkidle');
    
    // 統計カードの存在確認
    const statsCards = await page.locator('.intelligence-card .p-5').count();
    console.log(`スタッフ検品・撮影: 統計カード数: ${statsCards}`);
    
    // p-8が残っていないことを確認
    const p8Elements = await page.locator('[class*="p-8"]').count();
    expect(p8Elements).toBe(0);
    
    // 統一されたpadding p-5の確認
    const p5Elements = await page.locator('.intelligence-card .p-5').count();
    expect(p5Elements).toBeGreaterThan(0);
    
    // アイコンサイズの統一確認
    const icons = await page.locator('.action-orb svg').first();
    await expect(icons).toHaveClass(/w-[35] h-[35]/);
    
    // テキストサイズの統一確認
    const metricValue = await page.locator('.metric-value').first();
    await expect(metricValue).toHaveClass(/text-(lg|xl|2xl)/);
    
    // スクリーンショット撮影
    await page.screenshot({ path: 'test-results/staff-inspection-ui-verification.png', fullPage: true });
    
    console.log('✅ スタッフ検品・撮影画面: UI統一確認完了');
  });

  test('🔍 スタッフ返品管理画面 - UI統一確認', async ({ page }) => {
    await page.goto('/staff/returns');
    await page.waitForLoadState('networkidle');
    
    // 統計カードの存在確認
    const statsCards = await page.locator('.intelligence-card .p-5').count();
    console.log(`スタッフ返品管理: 統計カード数: ${statsCards}`);
    
    // p-8が残っていないことを確認
    const p8Elements = await page.locator('[class*="p-8"]').count();
    expect(p8Elements).toBe(0);
    
    // 統一されたpadding p-5の確認
    const p5Elements = await page.locator('.intelligence-card .p-5').count();
    expect(p5Elements).toBeGreaterThan(0);
    
    // スクリーンショット撮影
    await page.screenshot({ path: 'test-results/staff-returns-ui-verification.png', fullPage: true });
    
    console.log('✅ スタッフ返品管理画面: UI統一確認完了');
  });

  test('🔍 スタッフロケーション管理画面 - UI統一確認', async ({ page }) => {
    await page.goto('/staff/location');
    await page.waitForLoadState('networkidle');
    
    // 統計カードの存在確認
    const statsCards = await page.locator('.intelligence-card .p-5').count();
    console.log(`スタッフロケーション管理: 統計カード数: ${statsCards}`);
    
    // p-8が残っていないことを確認
    const p8Elements = await page.locator('[class*="p-8"]').count();
    expect(p8Elements).toBe(0);
    
    // 統一されたpadding p-5の確認
    const p5Elements = await page.locator('.intelligence-card .p-5').count();
    expect(p5Elements).toBeGreaterThan(0);
    
    // アイコンサイズの統一確認
    const icons = await page.locator('.action-orb svg').first();
    await expect(icons).toHaveClass(/w-[35] h-[35]/);
    
    // テキストサイズの統一確認
    const metricValue = await page.locator('.metric-value').first();
    await expect(metricValue).toHaveClass(/text-(lg|xl|2xl)/);
    
    // スクリーンショット撮影
    await page.screenshot({ path: 'test-results/staff-location-ui-verification.png', fullPage: true });
    
    console.log('✅ スタッフロケーション管理画面: UI統一確認完了');
  });

  test('🔍 セラー返品管理画面 - UI統一確認', async ({ page }) => {
    await page.goto('/returns');
    await page.waitForLoadState('networkidle');
    
    // 統計カードの存在確認
    const statsCards = await page.locator('.intelligence-card .p-5').count();
    console.log(`セラー返品管理: 統計カード数: ${statsCards}`);
    
    // p-8が残っていないことを確認
    const p8Elements = await page.locator('[class*="p-8"]').count();
    expect(p8Elements).toBe(0);
    
    // 統一されたpadding p-5の確認
    const p5Elements = await page.locator('.intelligence-card .p-5').count();
    expect(p5Elements).toBeGreaterThan(0);
    
    // テキストサイズの統一確認
    const metricValue = await page.locator('.metric-value').first();
    await expect(metricValue).toHaveClass(/text-(lg|xl|2xl)/);
    
    // スクリーンショット撮影
    await page.screenshot({ path: 'test-results/seller-returns-ui-verification.png', fullPage: true });
    
    console.log('✅ セラー返品管理画面: UI統一確認完了');
  });

  test('🔍 セラー請求・精算画面 - UI統一確認', async ({ page }) => {
    await page.goto('/billing');
    await page.waitForLoadState('networkidle');
    
    // 統計カードの存在確認
    const statsCards = await page.locator('.intelligence-card .p-5').count();
    console.log(`セラー請求・精算: 統計カード数: ${statsCards}`);
    
    // p-8が残っていないことを確認
    const p8Elements = await page.locator('[class*="p-8"]').count();
    expect(p8Elements).toBe(0);
    
    // 統一されたpadding p-5の確認
    const p5Elements = await page.locator('.intelligence-card .p-5').count();
    expect(p5Elements).toBeGreaterThan(0);
    
    // アイコンサイズの統一確認
    const icons = await page.locator('.action-orb svg').first();
    await expect(icons).toHaveClass(/w-[35] h-[35]/);
    
    // テキストサイズの統一確認
    const metricValue = await page.locator('.metric-value').first();
    await expect(metricValue).toHaveClass(/text-(lg|xl|2xl)/);
    
    // スクリーンショット撮影
    await page.screenshot({ path: 'test-results/seller-billing-ui-verification.png', fullPage: true });
    
    console.log('✅ セラー請求・精算画面: UI統一確認完了');
  });

  test('📊 全5画面 - 統一性総合検証', async ({ page }) => {
    const screens = [
      { url: '/staff/inspection', name: 'スタッフ検品・撮影' },
      { url: '/staff/returns', name: 'スタッフ返品管理' },
      { url: '/staff/location', name: 'スタッフロケーション管理' },
      { url: '/returns', name: 'セラー返品管理' },
      { url: '/billing', name: 'セラー請求・精算' }
    ];

    const results = [];

    for (const screen of screens) {
      await page.goto(screen.url);
      await page.waitForLoadState('networkidle');
      
      // 各画面でp-8が残っていないことを確認
      const p8Count = await page.locator('[class*="p-8"]').count();
      const p5Count = await page.locator('.intelligence-card .p-5').count();
      
      results.push({
        screen: screen.name,
        p8Remaining: p8Count,
        p5Applied: p5Count,
        isUnified: p8Count === 0 && p5Count > 0
      });
    }

    // 結果をログ出力
    console.log('=== UI統一検証結果 ===');
    results.forEach(result => {
      console.log(`${result.screen}: ${result.isUnified ? '✅ 統一済み' : '❌ 未統一'} (p-8残存: ${result.p8Remaining}, p-5適用: ${result.p5Applied})`);
    });

    // 全画面が統一されていることを確認
    const allUnified = results.every(result => result.isUnified);
    expect(allUnified).toBe(true);
    
    if (allUnified) {
      console.log('🎉 全5画面のUI統一が完了しています！');
    } else {
      console.log('⚠️ まだ統一されていない画面があります');
    }
  });
}); 