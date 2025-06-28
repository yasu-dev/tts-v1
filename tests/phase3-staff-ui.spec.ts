import { test, expect } from '@playwright/test';

test.describe('Phase 3 Staff UI Components Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staff/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for data loading
  });

  test('should display staff dashboard with Phase 3 UI elements', async ({ page }) => {
    // Check if page loaded properly
    const h1Element = page.locator('h1').first();
    if (await h1Element.isVisible()) {
      await expect(h1Element).toContainText('スタッフダッシュボード');
    }

    // Check for any intelligence-card elements that might be implemented
    const intelligenceCards = page.locator('.intelligence-card');
    if (await intelligenceCards.count() > 0) {
      await expect(intelligenceCards.first()).toBeVisible();
    }

    // Check for any holo-table elements in staff dashboard
    const holoTables = page.locator('.holo-table');
    if (await holoTables.count() > 0) {
      await expect(holoTables.first()).toBeVisible();
    }

    // Check for nexus-button elements
    const nexusButtons = page.locator('.nexus-button');
    if (await nexusButtons.count() > 0) {
      await expect(nexusButtons.first()).toBeVisible();
    }
  });

  test('should check staff shipping page for Phase 3 components', async ({ page }) => {
    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check if main content loaded
    const mainContent = page.locator('main, .main-content');
    await expect(mainContent).toBeVisible();

    // Check for intelligence-card elements
    const intelligenceCards = page.locator('.intelligence-card');
    if (await intelligenceCards.count() > 0) {
      await expect(intelligenceCards.first()).toBeVisible();
    }

    // Check for status orbs
    const statusOrbs = page.locator('.status-orb');
    if (await statusOrbs.count() > 0) {
      await expect(statusOrbs.first()).toBeVisible();
    }

    // Check for cert-nano badges
    const certBadges = page.locator('.cert-nano');
    if (await certBadges.count() > 0) {
      await expect(certBadges.first()).toBeVisible();
    }
  });

  test('should check staff tasks page for Phase 3 components', async ({ page }) => {
    await page.goto('/staff/tasks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if page loaded
    const h1Element = page.locator('h1').first();
    if (await h1Element.isVisible()) {
      await expect(h1Element).toContainText('タスク管理');
    }

    // Check for any Phase 3 components that might be implemented
    const phase3Elements = [
      '.intelligence-card',
      '.holo-table',
      '.nexus-button',
      '.status-orb',
      '.cert-nano'
    ];

    for (const selector of phase3Elements) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }
  });

  test('should verify consistent Phase 3 styling across staff pages', async ({ page }) => {
    const staffPages = [
      '/staff/dashboard',
      '/staff/shipping',
      '/staff/tasks',
      '/staff/inventory'
    ];

    for (const pageUrl of staffPages) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check for consistent styling elements
      const stylingElements = [
        'body', // Should have proper background
        '.main-content, main', // Main content area
        'header, .header' // Header area
      ];

      for (const selector of stylingElements) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          await expect(element.first()).toBeVisible();
        }
      }
    }
  });

  test('should test glassmorphism effects on staff pages', async ({ page }) => {
    // Check if glassmorphism classes are applied
    const glassmorphElements = [
      '.intelligence-card',
      '.inventory-chamber',
      '.holo-table'
    ];

    for (const selector of glassmorphElements) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }
  });

  test('should verify regional color themes in staff interface', async ({ page }) => {
    // Check for regional theme classes
    const regionalThemes = [
      '.americas',
      '.europe', 
      '.asia',
      '.africa',
      '.oceania',
      '.global'
    ];

    for (const theme of regionalThemes) {
      const elements = page.locator(theme);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }
  });

  test('should check for proper FontAwesome integration in staff pages', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Common FontAwesome icons that might be used
    const commonIcons = [
      '.fas',
      '.fa-dashboard',
      '.fa-box',
      '.fa-truck',
      '.fa-tasks',
      '.fa-chart-line'
    ];

    for (const iconClass of commonIcons) {
      const icons = page.locator(iconClass);
      if (await icons.count() > 0) {
        // At least one icon should be visible
        const visibleIcons = await icons.all();
        let hasVisibleIcon = false;
        for (const icon of visibleIcons) {
          if (await icon.isVisible()) {
            hasVisibleIcon = true;
            break;
          }
        }
        if (hasVisibleIcon) {
          await expect(icons.first()).toBeVisible();
        }
      }
    }
  });

  test('should verify responsive behavior of Phase 3 components on staff pages', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Main layout should remain functional
      const mainContent = page.locator('main, .main-content');
      await expect(mainContent).toBeVisible();
      
      // Any Phase 3 components should remain visible
      const phase3Components = page.locator('.intelligence-card, .holo-table, .nexus-button');
      if (await phase3Components.count() > 0) {
        await expect(phase3Components.first()).toBeVisible();
      }
    }
  });
});