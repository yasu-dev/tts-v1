import { test, expect } from '@playwright/test';

test.describe('スタッフ画面タブ表示UI/UX統一性テスト', () => {
  
  test('検品管理と出荷管理のタブバッジスタイルが統一されている', async ({ page }) => {
    // 検品管理画面に移動
    await page.goto('http://localhost:3002/staff/inspection');
    
    // ページ読み込み完了を待機
    await page.waitForSelector('.intelligence-card');
    
    // 検品管理のタブを確認
    const inspectionTabs = await page.locator('nav[aria-label="Tabs"] button').all();
    
    // 少なくとも5つのタブが存在することを確認
    expect(inspectionTabs.length).toBeGreaterThanOrEqual(5);
    
    // 各タブのバッジスタイルを確認
    for (let i = 0; i < inspectionTabs.length; i++) {
      const tab = inspectionTabs[i];
      const badge = tab.locator('span').last(); // バッジ要素
      
      // バッジが色付きであることを確認（統一されたカラーパレット）
      const badgeClass = await badge.getAttribute('class');
      const hasColorClass = badgeClass?.includes('bg-blue-') || 
                           badgeClass?.includes('bg-yellow-') || 
                           badgeClass?.includes('bg-cyan-') || 
                           badgeClass?.includes('bg-green-') || 
                           badgeClass?.includes('bg-red-');
      
      expect(hasColorClass).toBeTruthy();
      
      // transition-all クラスが適用されていることを確認
      expect(badgeClass).toContain('transition-all');
      expect(badgeClass).toContain('duration-300');
    }
    
    // 出荷管理画面に移動
    await page.goto('http://localhost:3002/staff/shipping');
    
    // ページ読み込み完了を待機
    await page.waitForSelector('.intelligence-card');
    
    // 出荷管理のタブを確認
    const shippingTabs = await page.locator('nav[aria-label="Tabs"] button').all();
    
    // 少なくとも4つのタブが存在することを確認
    expect(shippingTabs.length).toBeGreaterThanOrEqual(4);
    
    // 両画面のタブスタイルが同じパターンであることを確認
    for (let i = 0; i < Math.min(inspectionTabs.length, shippingTabs.length); i++) {
      const inspectionTab = inspectionTabs[i];
      const shippingTab = shippingTabs[i];
      
      // 共通のクラス構造を持つことを確認
      const inspectionTabClass = await inspectionTab.getAttribute('class');
      const shippingTabClass = await shippingTab.getAttribute('class');
      
      // 共通の基本クラスが適用されていることを確認
      expect(inspectionTabClass).toContain('whitespace-nowrap');
      expect(inspectionTabClass).toContain('transition-all');
      expect(inspectionTabClass).toContain('duration-300');
      
      expect(shippingTabClass).toContain('whitespace-nowrap');
      expect(shippingTabClass).toContain('transition-all');
      expect(shippingTabClass).toContain('duration-300');
    }
  });

  test('タブクリック時のアクティブ状態変化が統一されている', async ({ page }) => {
    // 検品管理画面でタブクリックテスト
    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    const inspectionTabs = await page.locator('nav[aria-label="Tabs"] button').all();
    
    // 最初のタブ（全体）がアクティブであることを確認
    let firstTabBadge = inspectionTabs[0].locator('span').last();
    let firstBadgeClass = await firstTabBadge.getAttribute('class');
    expect(firstBadgeClass).toContain('bg-blue-800'); // アクティブ状態
    expect(firstBadgeClass).toContain('border-2'); // アクティブボーダー
    
    // 2番目のタブをクリック
    if (inspectionTabs.length > 1) {
      await inspectionTabs[1].click();
      await page.waitForTimeout(500); // アニメーション完了待機
      
      // 2番目のタブがアクティブになり、1番目が非アクティブになったことを確認
      const secondTabBadge = inspectionTabs[1].locator('span').last();
      const secondBadgeClass = await secondTabBadge.getAttribute('class');
      expect(secondBadgeClass).toContain('border-2'); // アクティブボーダー
      
      // 1番目のタブが非アクティブになったことを確認
      firstTabBadge = inspectionTabs[0].locator('span').last();
      firstBadgeClass = await firstTabBadge.getAttribute('class');
      expect(firstBadgeClass).toContain('border-blue-500'); // 非アクティブボーダー
      expect(firstBadgeClass).not.toContain('border-2'); // アクティブボーダーなし
    }
    
    // 出荷管理画面でも同様のテストを実行
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    const shippingTabs = await page.locator('nav[aria-label="Tabs"] button').all();
    
    // 同じアクティブ状態パターンを確認
    if (shippingTabs.length > 1) {
      const firstShippingTabBadge = shippingTabs[0].locator('span').last();
      const firstShippingBadgeClass = await firstShippingTabBadge.getAttribute('class');
      expect(firstShippingBadgeClass).toContain('border-2'); // アクティブボーダー
    }
  });

  test('カラーパレットの一貫性を確認', async ({ page }) => {
    // 検品管理画面の色設定を確認
    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    const inspectionTabs = await page.locator('nav[aria-label="Tabs"] button').all();
    
    // 検品管理の色マッピングを確認
    const expectedInspectionColors = ['blue', 'yellow', 'cyan', 'green', 'red'];
    
    for (let i = 0; i < Math.min(inspectionTabs.length, expectedInspectionColors.length); i++) {
      const tab = inspectionTabs[i];
      const badge = tab.locator('span').last();
      const badgeClass = await badge.getAttribute('class');
      const expectedColor = expectedInspectionColors[i];
      
      // 期待される色クラスが適用されていることを確認
      const hasExpectedColor = badgeClass?.includes(`bg-${expectedColor}-`);
      expect(hasExpectedColor).toBeTruthy();
    }
    
    // 出荷管理画面でも色の一貫性を確認
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    const shippingTabs = await page.locator('nav[aria-label="Tabs"] button').all();
    
    // 出荷管理の色マッピングを確認（出荷管理固有の色設定）
    const expectedShippingColors = ['blue', 'yellow', 'cyan', 'orange'];
    
    for (let i = 0; i < Math.min(shippingTabs.length, expectedShippingColors.length); i++) {
      const tab = shippingTabs[i];
      const badge = tab.locator('span').last();
      const badgeClass = await badge.getAttribute('class');
      const expectedColor = expectedShippingColors[i];
      
      // 期待される色クラスが適用されていることを確認
      const hasExpectedColor = badgeClass?.includes(`bg-${expectedColor}-`);
      expect(hasExpectedColor).toBeTruthy();
    }
  });

  test('レスポンシブ対応とアニメーションの統一性', async ({ page }) => {
    // デスクトップサイズでテスト
    await page.setViewportSize({ width: 1280, height: 720 });
    
    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    // タブがデスクトップで正しく表示されることを確認
    const inspectionTabsDesktop = await page.locator('nav[aria-label="Tabs"] button').all();
    expect(inspectionTabsDesktop.length).toBeGreaterThan(0);
    
    // モバイルサイズでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    
    // タブがモバイルでも正しく表示されることを確認
    const inspectionTabsMobile = await page.locator('nav[aria-label="Tabs"] button').all();
    expect(inspectionTabsMobile.length).toBe(inspectionTabsDesktop.length);
    
    // 出荷管理でも同様のレスポンシブ対応を確認
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    const shippingTabsMobile = await page.locator('nav[aria-label="Tabs"] button').all();
    expect(shippingTabsMobile.length).toBeGreaterThan(0);
  });
  
});
