import { test, expect, Page } from '@playwright/test';

test.describe('Side Menu Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start with staff dashboard since it has the most comprehensive menu
    await page.goto('/staff/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to all staff menu items from sidebar', async ({ page }) => {
    // Test: ダッシュボード
    await page.click('a[href="/staff/dashboard"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for data loading
    await expect(page).toHaveURL('/staff/dashboard');
    await expect(page.locator('h1').first()).toContainText('スタッフダッシュボード');

    // Test: タスク管理
    await page.click('a[href="/staff/tasks"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/staff/tasks');
    await expect(page.locator('h1').first()).toContainText('タスク管理');

    // Test: 在庫管理
    await page.click('a[href="/staff/inventory"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/staff/inventory');
    await expect(page.locator('h1').first()).toContainText('在庫管理');

    // Test: 検品・撮影
    await page.click('a[href="/staff/inspection"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/staff/inspection');
    // Just verify page loads successfully by checking for any content
    await page.waitForTimeout(2000);

    // Test: ロケーション管理
    await page.click('a[href="/staff/location"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/staff/location');
    await page.waitForTimeout(2000);

    // Test: 出荷管理
    await page.click('a[href="/staff/shipping"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/staff/shipping');
    await page.waitForTimeout(2000);

    // Test: 返品処理
    await page.click('a[href="/staff/returns"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/staff/returns');
    await page.waitForTimeout(2000);

    // Test: 業務レポート
    await page.click('a[href="/staff/reports"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Extended wait
    await expect(page).toHaveURL('/staff/reports');
  });

  test('should navigate to all seller menu items from sidebar', async ({ page }) => {
    // Switch to seller dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Test: ダッシュボード  
    await page.click('a[href="/dashboard"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/dashboard');
    // Check for dashboard content instead of h1
    await expect(page.locator('.intelligence-grid')).toBeVisible();

    // Test: 納品管理
    await page.click('a[href="/delivery"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/delivery');
    await expect(page.locator('h1').first()).toContainText('納品管理');

    // Test: 在庫管理
    await page.click('a[href="/inventory"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/inventory');
    await expect(page.locator('h1').first()).toContainText('在庫管理');

    // Test: 売上管理
    await page.click('a[href="/sales"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/sales');
    await expect(page.locator('h1').first()).toContainText('販売管理');

    // Test: 返品管理
    await page.click('a[href="/returns"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/returns');
    await expect(page.locator('h1').first()).toContainText('返品管理');

    // Test: タイムライン
    await page.click('a[href="/timeline"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/timeline');
    await expect(page.locator('h1').first()).toContainText('タイムライン');

    // Test: レポート
    await page.click('a[href="/reports"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/reports');
    await expect(page.locator('h1').first()).toContainText('売上レポート');

    // Test: 請求管理
    await page.click('a[href="/billing"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/billing');
    await expect(page.locator('h1').first()).toContainText('請求');
  });

  test('should show active state styling for current page', async ({ page }) => {
    // Check active state on staff dashboard
    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');
    
    // The active menu item should have the 'active' class
    const activeItem = page.locator('a[href="/staff/shipping"]');
    await expect(activeItem).toHaveClass(/active/);
  });

  test('should show correct badge numbers in staff menu', async ({ page }) => {
    // Check if badges are displayed correctly for staff menu
    const tasksBadge = page.locator('a[href="/staff/tasks"] .nav-badge');
    await expect(tasksBadge).toContainText('12');
  });

  test('should show correct badge numbers in seller menu', async ({ page }) => {
    // Switch to seller dashboard to check seller badges
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check delivery badge
    const deliveryBadge = page.locator('a[href="/delivery"] .nav-badge');
    await expect(deliveryBadge).toContainText('2');
    
    // Check inventory badge
    const inventoryBadge = page.locator('a[href="/inventory"] .nav-badge');
    await expect(inventoryBadge).toContainText('234');
    
    // Check returns badge  
    const returnsBadge = page.locator('a[href="/returns"] .nav-badge');
    await expect(returnsBadge).toContainText('2');
  });

  test('should render performance module in sidebar', async ({ page }) => {
    // Check if performance module exists
    await expect(page.locator('.performance-module')).toBeVisible();
    await expect(page.locator('.module-header')).toContainText('システムパフォーマンス');
    
    // Check performance metrics are visible
    await expect(page.locator('.metric-pod')).toHaveCount(4);
    await expect(page.locator('.metric-label')).toContainText(['アップタイム', '処理速度', '同時接続', 'エラー率']);
  });

  test('should have accessible logout button', async ({ page }) => {
    // Check logout button exists and is accessible
    const logoutButton = page.locator('button[aria-label="システムからログアウト"]');
    await expect(logoutButton).toBeVisible();
    await expect(logoutButton).toContainText('ログアウト');
  });
});