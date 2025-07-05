import { test, expect } from '@playwright/test';

async function loginAsStaff(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'staff@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/staff\/dashboard$/, { timeout: 15000 });
}

test.describe('スタッフページテスト', () => {
  test('スタッフダッシュボードページが正しく表示される', async ({ page }) => {
    await loginAsStaff(page);
    
    // ダッシュボードの基本要素が表示されることを確認
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/staff\/dashboard$/);
  });

  test('在庫管理ページが正しく表示される', async ({ page }) => {
    await loginAsStaff(page);
    
    // 在庫管理ページに移動
    await page.goto('/staff/inventory');
    await expect(page).toHaveURL(/\/staff\/inventory$/);
    
    // ページが正しく表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('出品管理ページが正しく表示される', async ({ page }) => {
    await loginAsStaff(page);
    
    // 出品管理ページに移動
    await page.goto('/staff/listing');
    await expect(page).toHaveURL(/\/staff\/listing$/);
    
    // ページが正しく表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('ロケーション管理ページが正しく表示される', async ({ page }) => {
    await loginAsStaff(page);
    
    // ロケーション管理ページに移動
    await page.goto('/staff/location');
    await expect(page).toHaveURL(/\/staff\/location$/);
    
    // ページが正しく表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('ピッキングページが正しく表示される', async ({ page }) => {
    await loginAsStaff(page);
    
    // ピッキングページに移動
    await page.goto('/staff/picking');
    await expect(page).toHaveURL(/\/staff\/picking$/);
    
    // ページが正しく表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('配送管理ページが正しく表示される', async ({ page }) => {
    await loginAsStaff(page);
    
    // 配送管理ページに移動
    await page.goto('/staff/shipping');
    await expect(page).toHaveURL(/\/staff\/shipping$/);
    
    // ページが正しく表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('返品管理ページが正しく表示される', async ({ page }) => {
    await loginAsStaff(page);
    
    // 返品管理ページに移動
    await page.goto('/staff/returns');
    await expect(page).toHaveURL(/\/staff\/returns$/);
    
    // ページが正しく表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('タスク管理ページが正しく表示される', async ({ page }) => {
    await loginAsStaff(page);
    
    // タスク管理ページに移動
    await page.goto('/staff/tasks');
    await expect(page).toHaveURL(/\/staff\/tasks$/);
    
    // ページが正しく表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('検品ページが正しく表示される', async ({ page }) => {
    await loginAsStaff(page);
    
    // 検品ページに移動
    await page.goto('/staff/inspection');
    await expect(page).toHaveURL(/\/staff\/inspection$/);
    
    // ページが正しく表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('レポートページが正しく表示される', async ({ page }) => {
    await loginAsStaff(page);
    
    // レポートページに移動
    await page.goto('/staff/reports');
    await expect(page).toHaveURL(/\/staff\/reports$/);
    
    // ページが正しく表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });
}); 