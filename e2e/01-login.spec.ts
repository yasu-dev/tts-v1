import { test, expect } from '@playwright/test';

test.describe('ログイン画面テスト', () => {
  test('ログイン画面が正しく表示される', async ({ page }) => {
    // ログインページにアクセス
    await page.goto('/login');
    
    // ページタイトルの確認
    await expect(page).toHaveTitle(/THE WORLD DOOR/);
    
    // メインロゴの確認（画像として表示）
    await expect(page.getByAltText('Fulfilment by THE WORLD DOOR')).toBeVisible();
    
    // フォーム要素の確認
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワード')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
    
    // ログイン状態保持チェックボックスの確認
    await expect(page.getByText('ログイン状態を保持する')).toBeVisible();
    
    // パスワード忘れボタンの確認
    await expect(page.getByRole('button', { name: 'パスワードをお忘れですか？' })).toBeVisible();
  });

  test('ルートページからログインページにリダイレクトされる', async ({ page }) => {
    // ルートページにアクセス
    await page.goto('/');
    
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/login$/);
    
    // ログイン画面の要素が表示されることを確認（ロゴ画像を指定）
    await expect(page.getByAltText('Fulfilment by THE WORLD DOOR')).toBeVisible();
  });
}); 