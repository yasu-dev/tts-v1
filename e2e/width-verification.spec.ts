import { test, expect } from '@playwright/test';

test.describe('幅統一性確認', () => {
  test('全画面スクリーンショット比較', async ({ page }) => {
    // Dashboard
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/width-verification-dashboard.png', fullPage: true });

    // Inventory
    await page.goto('/inventory');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/width-verification-inventory.png', fullPage: true });

    // Sales
    await page.goto('/sales');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/width-verification-sales.png', fullPage: true });

    // Billing
    await page.goto('/billing');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/width-verification-billing.png', fullPage: true });
  });
});