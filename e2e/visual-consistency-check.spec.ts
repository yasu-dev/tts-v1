import { test, expect } from '@playwright/test';

test.describe('検品管理と出荷管理の視覚的統一性確認', () => {

  test('箱の形状とカード構造の統一性を確認', async ({ page }) => {
    // 検品管理画面に移動
    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForSelector('.intelligence-card');
    
    // 検品管理の箱構造を確認
    const inspectionCard = page.locator('.intelligence-card.global');
    await expect(inspectionCard).toBeVisible();
    
    // 検品管理のp-8構造を確認
    const inspectionPadding = inspectionCard.locator('> div.p-8');
    await expect(inspectionPadding).toBeVisible();
    
    // スクリーンショット撮影（検品管理）
    await page.screenshot({ 
      path: 'inspection-card-structure.png',
      clip: { x: 0, y: 200, width: 1200, height: 600 }
    });
    
    // 出荷管理画面に移動
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForSelector('.intelligence-card');
    
    // 出荷管理の箱構造を確認
    const shippingCard = page.locator('.intelligence-card.global');
    await expect(shippingCard).toBeVisible();
    
    // 出荷管理のp-8構造を確認
    const shippingPadding = shippingCard.locator('> div.p-8');
    await expect(shippingPadding).toBeVisible();
    
    // スクリーンショット撮影（出荷管理）
    await page.screenshot({ 
      path: 'shipping-card-structure.png',
      clip: { x: 0, y: 200, width: 1200, height: 600 }
    });
    
    // 両方のカードが同じクラスを使用していることを確認
    const inspectionClasses = await inspectionCard.getAttribute('class');
    const shippingClasses = await shippingCard.getAttribute('class');
    
    expect(inspectionClasses).toBe('intelligence-card global');
    expect(shippingClasses).toBe('intelligence-card global');
  });

  test('境界線とパディングの統一性を確認', async ({ page }) => {
    // 検品管理の境界線確認
    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForSelector('.intelligence-card');
    
    // フィルター部分の境界線確認
    const inspectionFilter = page.locator('.border-b.border-nexus-border').first();
    const inspectionFilterClass = await inspectionFilter.getAttribute('class');
    expect(inspectionFilterClass).toContain('border-nexus-border');
    expect(inspectionFilterClass).toContain('p-6');
    
    // タブ部分の境界線確認
    const inspectionTabBorder = page.locator('nav[aria-label="Tabs"]').locator('..');
    const inspectionTabClass = await inspectionTabBorder.getAttribute('class');
    expect(inspectionTabClass).toContain('border-nexus-border');
    
    // 出荷管理でも同様の確認
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForSelector('.intelligence-card');
    
    const shippingTabBorder = page.locator('nav[aria-label="Tabs"]').locator('..');
    const shippingTabClass = await shippingTabBorder.getAttribute('class');
    expect(shippingTabClass).toContain('border-nexus-border');
  });

  test('全体レイアウトとスペーシングの統一性', async ({ page }) => {
    // デスクトップサイズ設定
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // 検品管理画面のレイアウト確認
    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForSelector('.intelligence-card');
    
    // ページ全体の構造確認
    const inspectionLayout = page.locator('div.space-y-6.max-w-7xl.mx-auto');
    await expect(inspectionLayout).toBeVisible();
    
    // カード内のコンテンツ構造確認
    const inspectionCardContent = page.locator('.intelligence-card.global > div.p-8');
    await expect(inspectionCardContent).toBeVisible();
    
    // フィルター、タブ、テーブルの順序確認
    const filterSection = inspectionCardContent.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    const tabSection = inspectionCardContent.locator('nav[aria-label="Tabs"]');
    const tableSection = inspectionCardContent.locator('.overflow-x-auto');
    
    await expect(filterSection).toBeVisible();
    await expect(tabSection).toBeVisible();
    await expect(tableSection).toBeVisible();
    
    // 出荷管理でも同様の構造を確認
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForSelector('.intelligence-card');
    
    const shippingLayout = page.locator('div.space-y-6.max-w-7xl.mx-auto');
    await expect(shippingLayout).toBeVisible();
    
    const shippingCardContent = page.locator('.intelligence-card.global > div.p-8');
    await expect(shippingCardContent).toBeVisible();
    
    const shippingTabSection = shippingCardContent.locator('nav[aria-label="Tabs"]');
    const shippingTableSection = shippingCardContent.locator('.overflow-x-auto');
    
    await expect(shippingTabSection).toBeVisible();
    await expect(shippingTableSection).toBeVisible();
  });

  test('タブバッジの視覚的比較', async ({ page }) => {
    // 検品管理のタブバッジ確認
    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    // 各タブのバッジスタイルをチェック
    const inspectionTabs = await page.locator('nav[aria-label="Tabs"] button').all();
    
    for (let i = 0; i < inspectionTabs.length; i++) {
      const tab = inspectionTabs[i];
      const badge = tab.locator('span').last();
      const badgeClass = await badge.getAttribute('class');
      
      // 統一されたバッジスタイルの確認
      expect(badgeClass).toContain('inline-flex');
      expect(badgeClass).toContain('items-center');
      expect(badgeClass).toContain('px-2.5');
      expect(badgeClass).toContain('py-0.5');
      expect(badgeClass).toContain('rounded-full');
      expect(badgeClass).toContain('text-xs');
      expect(badgeClass).toContain('font-medium');
      expect(badgeClass).toContain('transition-all');
      expect(badgeClass).toContain('duration-300');
      
      // カラーパレットの確認
      const hasValidColor = badgeClass?.includes('bg-blue-') || 
                           badgeClass?.includes('bg-yellow-') || 
                           badgeClass?.includes('bg-cyan-') || 
                           badgeClass?.includes('bg-green-') || 
                           badgeClass?.includes('bg-red-');
      expect(hasValidColor).toBeTruthy();
    }
    
    // 出荷管理でも同様の確認
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    const shippingTabs = await page.locator('nav[aria-label="Tabs"] button').all();
    
    for (let i = 0; i < shippingTabs.length; i++) {
      const tab = shippingTabs[i];
      const badge = tab.locator('span').last();
      const badgeClass = await badge.getAttribute('class');
      
      // 同じ基本構造を持つことを確認
      expect(badgeClass).toContain('inline-flex');
      expect(badgeClass).toContain('transition-all');
      expect(badgeClass).toContain('duration-300');
    }
  });

  test('レスポンシブデザインの統一性', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-large' },
      { width: 1280, height: 800, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // 検品管理画面確認
      await page.goto('http://localhost:3002/staff/inspection');
      await page.waitForSelector('.intelligence-card');
      
      const inspectionCard = page.locator('.intelligence-card.global');
      await expect(inspectionCard).toBeVisible();
      
      // 出荷管理画面確認
      await page.goto('http://localhost:3002/staff/shipping');
      await page.waitForSelector('.intelligence-card');
      
      const shippingCard = page.locator('.intelligence-card.global');
      await expect(shippingCard).toBeVisible();
    }
  });

});
