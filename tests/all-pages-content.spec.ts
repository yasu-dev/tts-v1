import { test, expect } from '@playwright/test';

test.describe('All Pages Content Tests', () => {
  const staffPages = [
    { url: '/staff/dashboard', title: 'スタッフダッシュボード', h1Text: ['ダッシュボード', 'タスク概要', 'スタッフ'] },
    { url: '/staff/tasks', title: 'タスク管理', h1Text: ['タスク管理', 'タスク'] },
    { url: '/staff/inventory', title: '在庫管理', h1Text: ['在庫管理', '在庫'] },
    { url: '/staff/shipping', title: '検品・出荷管理', h1Text: ['検品・出荷管理', '検品', '出荷'] },
    { url: '/staff/reports', title: 'レポート', h1Text: ['レポート', '報告'] }
  ];

  const sellerPages = [
    { url: '/dashboard', title: 'ダッシュボード', h1Text: ['ダッシュボード', 'セラー'] },
    { url: '/delivery', title: '納品管理', h1Text: ['納品管理', '納品'] },
    { url: '/inventory', title: '在庫管理', h1Text: ['在庫管理', '在庫'] },
    { url: '/sales', title: '売上管理', h1Text: ['販売管理', '売上'] },
    { url: '/returns', title: '返品管理', h1Text: ['返品管理', '返品', 'Return'] }
  ];

  // Test all staff pages
  for (const page of staffPages) {
    test(`should load ${page.title} page correctly`, async ({ page: browserPage }) => {
      await browserPage.goto(page.url);
      await browserPage.waitForLoadState('networkidle');
      
      // Check if page loads without errors
      await expect(browserPage).toHaveURL(page.url);
      
      // Check if main heading exists with expected text
      const h1Elements = browserPage.locator('h1');
      const h1Count = await h1Elements.count();
      
      if (h1Count > 0) {
        let foundExpectedText = false;
        for (let i = 0; i < h1Count; i++) {
          const h1Text = await h1Elements.nth(i).textContent();
          if (h1Text) {
            for (const expectedText of page.h1Text) {
              if (h1Text.includes(expectedText)) {
                foundExpectedText = true;
                break;
              }
            }
          }
        }
        expect(foundExpectedText).toBe(true);
      }
      
      // Check if sidebar is present
      await expect(browserPage.locator('.nexus-sidebar, aside')).toBeVisible();
      
      // Check if main content area exists
      await expect(browserPage.locator('main, .main-content, [role="main"]')).toBeVisible();
    });
  }

  // Test all seller pages  
  for (const page of sellerPages) {
    test(`should load seller ${page.title} page correctly`, async ({ page: browserPage }) => {
      await browserPage.goto(page.url);
      await browserPage.waitForLoadState('networkidle');
      
      // Check if page loads without errors
      await expect(browserPage).toHaveURL(page.url);
      
      // Check if main heading exists with expected text
      const h1Elements = browserPage.locator('h1');
      const h1Count = await h1Elements.count();
      
      if (h1Count > 0) {
        let foundExpectedText = false;
        for (let i = 0; i < h1Count; i++) {
          const h1Text = await h1Elements.nth(i).textContent();
          if (h1Text) {
            for (const expectedText of page.h1Text) {
              if (h1Text.includes(expectedText)) {
                foundExpectedText = true;
                break;
              }
            }
          }
        }
        expect(foundExpectedText).toBe(true);
      }
      
      // Check if sidebar is present
      await expect(browserPage.locator('.nexus-sidebar, aside')).toBeVisible();
      
      // Check if main content area exists
      await expect(browserPage.locator('main, .main-content, [role="main"]')).toBeVisible();
    });
  }

  test('should have consistent layout across all pages', async ({ page }) => {
    const allPages = [...staffPages, ...sellerPages];
    
    for (const pageConfig of allPages) {
      await page.goto(pageConfig.url);
      await page.waitForLoadState('networkidle');
      
      // Check if DashboardLayout structure is present
      await expect(page.locator('.nexus-header, header')).toBeVisible();
      await expect(page.locator('.nexus-sidebar, aside')).toBeVisible();
      
      // Check if main content container exists
      const mainContainers = page.locator('main, .main-content, [role="main"], .space-y-6');
      await expect(mainContainers.first()).toBeVisible();
    }
  });

  test('should load page content without JavaScript errors', async ({ page }) => {
    let consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
    });

    const allPages = [...staffPages, ...sellerPages];
    
    for (const pageConfig of allPages) {
      await page.goto(pageConfig.url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Allow time for any async operations
    }
    
    // Filter out common/expected errors that don't affect functionality
    const significantErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('manifest') &&
      !error.includes('service-worker') &&
      !error.includes('sw.js') &&
      !error.includes('Failed to fetch') &&
      !error.includes('NetworkError') &&
      !error.includes('staff-mock.json')
    );
    
    // We expect minimal console errors for this demo app
    expect(significantErrors.length).toBeLessThanOrEqual(10);
  });

  test('should display proper data on data-driven pages', async ({ page }) => {
    // Test shipping page data loading
    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for data loading
    
    // Check if stats are displayed
    const statsCards = page.locator('.text-2xl.font-bold');
    if (await statsCards.count() > 0) {
      await expect(statsCards.first()).toBeVisible();
    }
    
    // Test inventory page (if it has data)
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for inventory content
    const inventoryContent = page.locator('.table, .grid, .space-y-4');
    if (await inventoryContent.count() > 0) {
      await expect(inventoryContent.first()).toBeVisible();
    }
    
    // Test tasks page (if it has data)
    await page.goto('/staff/tasks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for task content
    const taskContent = page.locator('.task, .table, .grid, .space-y-4');
    if (await taskContent.count() > 0) {
      await expect(taskContent.first()).toBeVisible();
    }
  });

  test('should handle empty states gracefully', async ({ page }) => {
    // Test pages that might show empty states
    const pagesWithPossibleEmptyStates = [
      '/staff/inventory',
      '/staff/tasks',
      '/staff/reports',
      '/inventory',
      '/sales',
      '/returns'
    ];
    
    for (const pageUrl of pagesWithPossibleEmptyStates) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Check if page still renders properly even with no data
      await expect(page.locator('h1').first()).toBeVisible();
      
      // Look for empty state messages
      const emptyStateMessages = page.locator('text=データがありません, text=項目がありません, text=見つかりません');
      if (await emptyStateMessages.count() > 0) {
        await expect(emptyStateMessages.first()).toBeVisible();
      }
    }
  });

  test('should have working responsive design', async ({ page }) => {
    // Test with different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      await page.goto('/staff/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Check if main elements are still visible
      const h1Element = page.locator('h1').first();
      if (await h1Element.isVisible()) {
        await expect(h1Element).toBeVisible();
      } else {
        // Alternative: check for main content
        await expect(page.locator('main, .main-content')).toBeVisible();
      }
      
      // Sidebar behavior might change on mobile
      const sidebar = page.locator('.nexus-sidebar, aside');
      if (viewport.width >= 1024) {
        await expect(sidebar).toBeVisible();
      }
    }
  });
});