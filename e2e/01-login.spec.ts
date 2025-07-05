import { test, expect } from '@playwright/test';

test.describe('ログイン画面テスト', () => {
  test('ログイン画面が正しく表示される', async ({ page }) => {
    // ログインページにアクセス
    await page.goto('/login');
    
    // ページタイトルの確認
    await expect(page).toHaveTitle(/THE WORLD DOOR/);
    
    // メインタイトルの確認（h2要素を指定）
    await expect(page.getByRole('heading', { name: 'THE WORLD DOOR' })).toBeVisible();
    await expect(page.getByText('フルフィルメントサービス')).toBeVisible();
    
    // フォーム要素の確認
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワード')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
    
    // テスト用ログイン情報の表示確認
    await expect(page.getByText('テスト用ログイン情報')).toBeVisible();
    await expect(page.getByText('seller@example.com / password123')).toBeVisible();
    await expect(page.getByText('staff@example.com / password123')).toBeVisible();
  });

  test('ルートページからログインページにリダイレクトされる', async ({ page }) => {
    // ルートページにアクセス
    await page.goto('/');
    
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/login$/);
    
    // ログイン画面の要素が表示されることを確認（h2要素を指定）
    await expect(page.getByRole('heading', { name: 'THE WORLD DOOR' })).toBeVisible();
  });
}); 