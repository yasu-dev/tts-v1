import { test, expect } from '@playwright/test';

test.describe('ログイン機能テスト', () => {
  test('セラーとしてログインできる', async ({ page }) => {
    // ログインページにアクセス
    await page.goto('/login');
    
    // セラーの認証情報を入力
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // ログインボタンをクリック
    await page.click('button[type="submit"]');
    
    // ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/dashboard$/);
    
    // ダッシュボードの要素が表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('スタッフとしてログインできる', async ({ page }) => {
    // ログインページにアクセス
    await page.goto('/login');
    
    // スタッフの認証情報を入力
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // ログインボタンをクリック
    await page.click('button[type="submit"]');
    
    // スタッフダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/staff\/dashboard$/);
    
    // ダッシュボードの要素が表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('無効な認証情報でエラーメッセージが表示される', async ({ page }) => {
    // ログインページにアクセス
    await page.goto('/login');
    
    // 無効な認証情報を入力
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // ログインボタンをクリック
    await page.click('button[type="submit"]');
    
    // エラーメッセージが表示されることを確認
    await expect(page.getByText('ログインに失敗しました')).toBeVisible({ timeout: 10000 });
    
    // ログインページに留まることを確認
    await expect(page).toHaveURL(/\/login$/);
  });
}); 