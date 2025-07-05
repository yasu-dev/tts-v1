import { test, expect } from '@playwright/test';

async function loginAsSeller(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
}

test.describe('セラーページテスト', () => {
  test('ダッシュボードページが正しく表示される', async ({ page }) => {
    await loginAsSeller(page);
    
    // ダッシュボードの基本要素が表示されることを確認
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('納品プランページが正しく表示される', async ({ page }) => {
    await loginAsSeller(page);
    
    // 納品プランページに移動
    await page.goto('/delivery-plan');
    await expect(page).toHaveURL(/\/delivery-plan$/);
    
    // ページが正しく表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('在庫ページが正しく表示される', async ({ page }) => {
    await loginAsSeller(page);
    
    // 在庫ページに移動
    await page.goto('/inventory');
    await expect(page).toHaveURL(/\/inventory$/);
    
    // ページが正しく表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('売上ページが正しく表示される', async ({ page }) => {
    await loginAsSeller(page);
    
    // 売上ページに移動
    await page.goto('/sales');
    await expect(page).toHaveURL(/\/sales$/);
    
    // ページが正しく表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('レポートページが正しく表示される', async ({ page }) => {
    await loginAsSeller(page);
    
    // レポートページに移動
    await page.goto('/reports');
    await expect(page).toHaveURL(/\/reports$/);
    
    // ページが正しく表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('設定ページが正しく表示される', async ({ page }) => {
    await loginAsSeller(page);
    
    // 設定ページに移動
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings$/);
    
    // ページが正しく表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });
}); 