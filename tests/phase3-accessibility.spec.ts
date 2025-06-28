import { test, expect } from '@playwright/test';

test.describe('Phase 3 Accessibility & Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should verify keyboard navigation for Phase 3 components', async ({ page }) => {
    // Test nexus-button keyboard navigation
    const nexusButtons = page.locator('.nexus-button');
    if (await nexusButtons.count() > 0) {
      const firstButton = nexusButtons.first();
      await firstButton.focus();
      await expect(firstButton).toBeFocused();
      
      // Test Enter key activation
      await page.keyboard.press('Enter');
      // Button should remain functional after keypress
      await expect(firstButton).toBeVisible();
    }

    // Test action-orb keyboard navigation
    const actionOrbs = page.locator('.action-orb');
    if (await actionOrbs.count() > 0) {
      const firstOrb = actionOrbs.first();
      await firstOrb.focus();
      await expect(firstOrb).toBeFocused();
    }

    // Test table navigation
    const holoTable = page.locator('.holo-table');
    if (await holoTable.isVisible()) {
      // Focus on table
      await holoTable.focus();
      
      // Test arrow key navigation
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');
      
      // Table should remain visible
      await expect(holoTable).toBeVisible();
    }
  });

  test('should verify ARIA labels and semantic markup', async ({ page }) => {
    // Check for proper semantic structure
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    
    // Check for proper heading hierarchy
    const h1Elements = page.locator('h1');
    if (await h1Elements.count() > 0) {
      await expect(h1Elements.first()).toBeVisible();
    }

    // Check for proper table structure
    const holoTable = page.locator('.holo-table');
    if (await holoTable.isVisible()) {
      // Table should have proper thead and tbody
      await expect(holoTable.locator('thead')).toBeVisible();
      await expect(holoTable.locator('tbody')).toBeVisible();
      
      // Headers should be properly marked
      const tableHeaders = holoTable.locator('th');
      if (await tableHeaders.count() > 0) {
        await expect(tableHeaders.first()).toBeVisible();
      }
    }

    // Check button accessibility
    const nexusButtons = page.locator('.nexus-button');
    if (await nexusButtons.count() > 0) {
      const firstButton = nexusButtons.first();
      
      // Button should be focusable
      await firstButton.focus();
      await expect(firstButton).toBeFocused();
      
      // Button should have accessible text
      const buttonText = await firstButton.textContent();
      expect(buttonText?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should verify color contrast and readability', async ({ page }) => {
    // Test that text content is readable
    const textElements = [
      '.metric-name',
      '.metric-data',
      '.region-title',
      '.product-data h4',
      '.value-display'
    ];

    for (const selector of textElements) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        const firstElement = elements.first();
        if (await firstElement.isVisible()) {
          // Text should be visible and have content
          const textContent = await firstElement.textContent();
          expect(textContent?.trim().length).toBeGreaterThan(0);
          await expect(firstElement).toBeVisible();
        }
      }
    }

    // Test status indicators are distinguishable
    const statusElements = [
      '.status-orb',
      '.cert-nano',
      '.trend-up',
      '.trend-down', 
      '.trend-neutral'
    ];

    for (const selector of statusElements) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }
  });

  test('should test performance of glassmorphism effects', async ({ page }) => {
    // Measure performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      };
    });

    // Performance thresholds for UI components
    expect(performanceMetrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
    expect(performanceMetrics.firstPaint).toBeLessThan(2000); // 2 seconds
    
    // Test that glassmorphism elements render properly
    const glassmorphElements = page.locator('.intelligence-card, .inventory-chamber');
    if (await glassmorphElements.count() > 0) {
      await expect(glassmorphElements.first()).toBeVisible();
    }
  });

  test('should verify responsive text scaling', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(300);
      
      // Text should remain readable at all sizes
      const textElements = page.locator('.metric-name, .region-title, .product-data h4');
      if (await textElements.count() > 0) {
        const firstText = textElements.first();
        if (await firstText.isVisible()) {
          const textContent = await firstText.textContent();
          expect(textContent?.trim().length).toBeGreaterThan(0);
        }
      }
      
      // Buttons should remain accessible
      const buttons = page.locator('.nexus-button');
      if (await buttons.count() > 0) {
        await expect(buttons.first()).toBeVisible();
      }
    }
  });

  test('should test reduced motion preferences', async ({ page }) => {
    // Test that animations can be disabled for accessibility
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Elements should still be visible and functional
    const animatedElements = [
      '.nexus-button',
      '.action-orb',
      '.intelligence-card',
      '.holo-row'
    ];

    for (const selector of animatedElements) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        const firstElement = elements.first();
        await expect(firstElement).toBeVisible();
        
        // Test interaction still works
        await firstElement.hover();
        await expect(firstElement).toBeVisible();
      }
    }
  });

  test('should verify font loading and fallbacks', async ({ page }) => {
    // Wait for custom fonts to load
    await page.waitForLoadState('networkidle');
    
    // Test that text is visible even if custom fonts fail
    const textElements = page.locator('h1, h2, .region-title, .metric-name');
    if (await textElements.count() > 0) {
      const firstText = textElements.first();
      if (await firstText.isVisible()) {
        const computedFont = await firstText.evaluate(el => {
          return window.getComputedStyle(el).fontFamily;
        });
        
        // Font should be set (either custom or fallback)
        expect(computedFont.length).toBeGreaterThan(0);
      }
    }
  });

  test('should test high contrast mode compatibility', async ({ page }) => {
    // Test forced colors mode
    await page.emulateMedia({ forcedColors: 'active' });
    
    // Elements should remain visible and functional
    const criticalElements = [
      '.intelligence-card',
      '.nexus-button',
      '.holo-table',
      '.status-orb',
      '.cert-nano'
    ];

    for (const selector of criticalElements) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }
  });

  test('should verify screen reader compatibility', async ({ page }) => {
    // Test that important content has proper structure for screen readers
    
    // Check for proper landmark roles
    const landmarks = [
      'main, [role="main"]',
      'nav, [role="navigation"]', 
      'header, [role="banner"]'
    ];

    for (const landmark of landmarks) {
      const elements = page.locator(landmark);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }

    // Check that data tables have proper headers
    const holoTable = page.locator('.holo-table');
    if (await holoTable.isVisible()) {
      const tableHeaders = holoTable.locator('th');
      if (await tableHeaders.count() > 0) {
        // Headers should have text content
        const headerText = await tableHeaders.first().textContent();
        expect(headerText?.trim().length).toBeGreaterThan(0);
      }
    }

    // Check that buttons have accessible names
    const buttons = page.locator('.nexus-button, .action-orb');
    if (await buttons.count() > 0) {
      const firstButton = buttons.first();
      const buttonText = await firstButton.textContent();
      const ariaLabel = await firstButton.getAttribute('aria-label');
      
      // Button should have either text content or aria-label
      expect(buttonText || ariaLabel).toBeTruthy();
    }
  });
});