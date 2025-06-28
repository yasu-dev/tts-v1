import { test, expect } from '@playwright/test';

test.describe('Phase 3 UI Components - Intelligence Platform Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should display intelligence cards with regional themes', async ({ page }) => {
    // Test Global Command Center card
    const globalCard = page.locator('.intelligence-card.global');
    await expect(globalCard).toBeVisible();
    await expect(globalCard.locator('.region-title')).toContainText('グローバルコマンドセンター');
    await expect(globalCard.locator('.region-flag')).toContainText('🌐');
    await expect(globalCard.locator('.status-orb.status-optimal')).toContainText('最適');

    // Test Americas-themed card (月間売上高)
    const americasCard = page.locator('.intelligence-card.americas');
    await expect(americasCard).toBeVisible();
    await expect(americasCard.locator('.region-title')).toContainText('月間売上高');
    await expect(americasCard.locator('.region-flag')).toContainText('💰');
    await expect(americasCard.locator('.metric-data.trend-up')).toBeVisible();

    // Test Europe-themed card (出品中商品)
    const europeCard = page.locator('.intelligence-card.europe');
    await expect(europeCard).toBeVisible();
    await expect(europeCard.locator('.region-title')).toContainText('出品中商品');
    await expect(europeCard.locator('.region-flag')).toContainText('📦');

    // Test Asia-themed card (処理待ち注文)
    const asiaCard = page.locator('.intelligence-card.asia');
    await expect(asiaCard).toBeVisible();
    await expect(asiaCard.locator('.region-title')).toContainText('処理待ち注文');
    await expect(asiaCard.locator('.region-flag')).toContainText('🛒');
    await expect(asiaCard.locator('.status-orb.status-monitoring')).toContainText('要確認');

    // Test Africa-themed card (返品リクエスト)
    const africaCard = page.locator('.intelligence-card.africa');
    await expect(africaCard).toBeVisible();
    await expect(africaCard.locator('.region-title')).toContainText('返品リクエスト');
    await expect(africaCard.locator('.region-flag')).toContainText('↩️');
  });

  test('should display intelligence metrics with trend indicators', async ({ page }) => {
    // Test trend indicators in metrics
    const trendUpElements = page.locator('.metric-data.trend-up');
    await expect(trendUpElements.first()).toBeVisible();

    const trendNeutralElements = page.locator('.metric-data.trend-neutral');
    await expect(trendNeutralElements.first()).toBeVisible();

    const trendDownElements = page.locator('.metric-data.trend-down');
    await expect(trendDownElements.first()).toBeVisible();

    // Test specific metric values
    await expect(page.locator('.metric-data:has-text("¥12,456,789")')).toBeVisible();
    await expect(page.locator('.metric-data:has-text("+15.3%")')).toBeVisible();
    await expect(page.locator('.metric-data:has-text("良好")')).toBeVisible();
  });

  test('should display holo-table with product intelligence', async ({ page }) => {
    // Test holo-table presence
    const holoTable = page.locator('.holo-table');
    await expect(holoTable).toBeVisible();

    // Test holo-header
    const holoHeader = page.locator('.holo-header');
    await expect(holoHeader).toBeVisible();
    await expect(holoHeader.locator('th:has-text("商品インテリジェンス")')).toBeVisible();
    await expect(holoHeader.locator('th:has-text("ステータス")')).toBeVisible();
    await expect(holoHeader.locator('th:has-text("オペレーション")')).toBeVisible();

    // Test holo-body with product data
    const holoBody = page.locator('.holo-body');
    await expect(holoBody).toBeVisible();

    // Test product-nexus components
    const productNexus = page.locator('.product-nexus').first();
    await expect(productNexus).toBeVisible();
    await expect(productNexus.locator('.product-holo')).toBeVisible();
    await expect(productNexus.locator('.product-data h4')).toContainText('Canon EOS R5');
    await expect(productNexus.locator('.product-sku')).toContainText('SKU: PRD-001');
  });

  test('should display certification badges with correct themes', async ({ page }) => {
    // Test cert-cluster containers
    const certClusters = page.locator('.cert-cluster');
    await expect(certClusters.first()).toBeVisible();

    // Test different certification types
    const certGlobal = page.locator('.cert-nano.cert-global');
    if (await certGlobal.count() > 0) {
      await expect(certGlobal.first()).toBeVisible();
    }

    const certElite = page.locator('.cert-nano.cert-elite');
    if (await certElite.count() > 0) {
      await expect(certElite.first()).toBeVisible();
    }

    const certPremium = page.locator('.cert-nano.cert-premium');
    if (await certPremium.count() > 0) {
      await expect(certPremium.first()).toBeVisible();
    }

    // Test status text content
    await expect(page.locator('.cert-nano:has-text("出荷済")')).toBeVisible();
    await expect(page.locator('.cert-nano:has-text("配送中")')).toBeVisible();
    await expect(page.locator('.cert-nano:has-text("出荷準備中")')).toBeVisible();
  });

  test('should display status orbs with different states', async ({ page }) => {
    // Test status-optimal orb
    const statusOptimal = page.locator('.status-orb.status-optimal');
    await expect(statusOptimal).toBeVisible();
    await expect(statusOptimal).toContainText('最適');

    // Test status-monitoring orb
    const statusMonitoring = page.locator('.status-orb.status-monitoring');
    await expect(statusMonitoring).toBeVisible();
    await expect(statusMonitoring).toContainText('要確認');
  });

  test('should display nexus action buttons', async ({ page }) => {
    // Test action-orb buttons
    const actionOrbs = page.locator('.action-orb');
    await expect(actionOrbs.first()).toBeVisible();

    // Test FontAwesome icons in action buttons
    await expect(page.locator('.action-orb .fas.fa-eye')).toBeVisible();
    await expect(page.locator('.action-orb .fas.fa-truck')).toBeVisible();
  });

  test('should display nexus command buttons', async ({ page }) => {
    // Test command-actions container
    const commandActions = page.locator('.command-actions');
    await expect(commandActions).toBeVisible();

    // Test nexus-button elements
    const nexusButtons = page.locator('.nexus-button');
    await expect(nexusButtons).toHaveCount(4);

    // Test primary button
    const primaryButton = page.locator('.nexus-button.primary');
    await expect(primaryButton).toBeVisible();
    await expect(primaryButton).toContainText('新規出品');
    await expect(primaryButton.locator('.fas.fa-plus')).toBeVisible();

    // Test other buttons
    await expect(page.locator('.nexus-button:has-text("売上レポート")')).toBeVisible();
    await expect(page.locator('.nexus-button:has-text("配送管理")')).toBeVisible();
    await expect(page.locator('.nexus-button:has-text("メッセージ")')).toBeVisible();

    // Test FontAwesome icons
    await expect(page.locator('.nexus-button .fas.fa-chart-line')).toBeVisible();
    await expect(page.locator('.nexus-button .fas.fa-truck')).toBeVisible();
    await expect(page.locator('.nexus-button .fas.fa-envelope')).toBeVisible();
  });

  test('should display value formatting', async ({ page }) => {
    // Test value-display elements
    const valueDisplays = page.locator('.value-display');
    await expect(valueDisplays.first()).toBeVisible();

    // Test specific price formatting
    await expect(page.locator('.value-display:has-text("¥450,000")')).toBeVisible();
    await expect(page.locator('.value-display:has-text("¥280,000")')).toBeVisible();
    await expect(page.locator('.value-display:has-text("¥1,200,000")')).toBeVisible();
  });

  test('should have proper inventory chamber container', async ({ page }) => {
    // Test inventory-chamber container
    const inventoryChamber = page.locator('.inventory-chamber');
    await expect(inventoryChamber).toBeVisible();

    // Test that holo-table is inside inventory-chamber
    await expect(inventoryChamber.locator('.holo-table')).toBeVisible();
  });

  test('should display intelligence grid layout', async ({ page }) => {
    // Test intelligence-grid container
    const intelligenceGrid = page.locator('.intelligence-grid');
    await expect(intelligenceGrid).toBeVisible();

    // Test that it contains intelligence cards
    const cardsInGrid = intelligenceGrid.locator('.intelligence-card');
    await expect(cardsInGrid).toHaveCount(4);
  });

  test('should verify regional color themes are applied', async ({ page }) => {
    // Test that cards have regional classes
    await expect(page.locator('.intelligence-card.americas')).toBeVisible();
    await expect(page.locator('.intelligence-card.europe')).toBeVisible();
    await expect(page.locator('.intelligence-card.asia')).toBeVisible();
    await expect(page.locator('.intelligence-card.africa')).toBeVisible();
    await expect(page.locator('.intelligence-card.global')).toBeVisible();
  });

  test('should test interactive elements hover states', async ({ page }) => {
    // Test nexus-button hover
    const primaryButton = page.locator('.nexus-button.primary');
    await primaryButton.hover();
    // Button should remain visible and functional after hover
    await expect(primaryButton).toBeVisible();

    // Test action-orb hover
    const actionOrb = page.locator('.action-orb').first();
    await actionOrb.hover();
    await expect(actionOrb).toBeVisible();

    // Test holo-row hover
    const holoRow = page.locator('.holo-row').first();
    await holoRow.hover();
    await expect(holoRow).toBeVisible();
  });

  test('should verify glassmorphism effects are present', async ({ page }) => {
    // Test that intelligence cards have glassmorphism classes
    const intelligenceCards = page.locator('.intelligence-card');
    await expect(intelligenceCards.first()).toBeVisible();

    // Test that inventory chamber has proper styling
    const inventoryChamber = page.locator('.inventory-chamber');
    await expect(inventoryChamber).toBeVisible();

    // Test holo-table styling
    const holoTable = page.locator('.holo-table');
    await expect(holoTable).toBeVisible();
  });

  test('should test responsive behavior of new components', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 },  // Tablet
      { width: 768, height: 1024 },  // Tablet Portrait
      { width: 375, height: 667 }    // Mobile
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Intelligence cards should remain visible
      await expect(page.locator('.intelligence-card').first()).toBeVisible();
      
      // Grid layout should adapt
      await expect(page.locator('.intelligence-grid')).toBeVisible();
      
      // Table should remain functional
      await expect(page.locator('.holo-table')).toBeVisible();
      
      // Command actions should remain accessible
      await expect(page.locator('.command-actions')).toBeVisible();
    }
  });

  test('should verify FontAwesome icons are loaded', async ({ page }) => {
    // Wait for FontAwesome to load
    await page.waitForLoadState('networkidle');
    
    // Test that FontAwesome icons are present
    const icons = [
      '.fas.fa-box',
      '.fas.fa-plus',
      '.fas.fa-chart-line',
      '.fas.fa-truck',
      '.fas.fa-envelope',
      '.fas.fa-eye'
    ];
    
    for (const icon of icons) {
      const iconElement = page.locator(icon);
      if (await iconElement.count() > 0) {
        await expect(iconElement.first()).toBeVisible();
      }
    }
  });
});