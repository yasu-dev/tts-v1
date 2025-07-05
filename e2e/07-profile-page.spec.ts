import { test, expect } from '@playwright/test';

async function loginAsSeller(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
}

async function loginAsStaff(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'staff@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/staff\/dashboard$/, { timeout: 15000 });
}

test.describe('プロフィールページテスト', () => {
  test('セラー: プロフィールページが正しく表示される', async ({ page }) => {
    await loginAsSeller(page);
    
    // 直接プロフィールページにアクセス
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile$/);
    
    // プロフィールページの基本要素が表示されることを確認
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText('プロフィール設定')).toBeVisible({ timeout: 10000 });
  });

  test('スタッフ: プロフィールページが正しく表示される', async ({ page }) => {
    await loginAsStaff(page);
    
    // 直接プロフィールページにアクセス
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile$/);
    
    // プロフィールページの基本要素が表示されることを確認
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText('プロフィール設定')).toBeVisible({ timeout: 10000 });
  });

  test('プロフィール編集機能が動作する', async ({ page }) => {
    await loginAsSeller(page);
    
    // プロフィールページにアクセス
    await page.goto('/profile');
    
    // 編集ボタンをクリック
    await page.click('button:has-text("編集")');
    
    // 編集モードになることを確認
    await expect(page.locator('input[value*="鈴木"]')).toBeVisible({ timeout: 5000 });
    
    // 保存ボタンが表示されることを確認
    await expect(page.getByText('保存')).toBeVisible();
  });

  test('パスワード変更モーダルが表示される', async ({ page }) => {
    await loginAsSeller(page);
    
    // プロフィールページにアクセス
    await page.goto('/profile');
    
    // パスワード変更ボタンをクリック
    await page.click('button:has-text("変更")');
    
    // パスワード変更モーダルが表示されることを確認
    await expect(page.getByText('パスワード変更')).toBeVisible({ timeout: 5000 });
  });
}); 