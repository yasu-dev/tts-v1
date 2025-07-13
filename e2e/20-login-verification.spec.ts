import { test, expect } from '@playwright/test';

test.describe('ログイン機能の集中検証', () => {

  test('スタッフアカウントで正常にログインできること', async ({ page }) => {
    // ログインページにアクセス
    await page.goto('/login');
    
    // ページの主要な要素が表示されるのを待つ
    await expect(page.getByRole('heading', { name: 'THE WORLD DOOR' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('login-button')).toBeEnabled({ timeout: 30000 });

    // ログイン情報を入力
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');

    // ログインボタンをクリック
    await page.click('button[type="submit"]');

    // ダッシュボードへのリダイレクトを待機し、URLを検証
    await page.waitForURL('/staff/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL('/staff/dashboard');

    // ダッシュボードのタイトルが表示されることを確認して、ログイン成功を確実にする
    await expect(page.getByRole('heading', { name: 'スタッフダッシュボード' })).toBeVisible();

    console.log('✅ E2Eテスト: スタッフアカウントでのログインが正常に完了しました。');
  });
}); 