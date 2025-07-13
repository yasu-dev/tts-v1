import { test, expect } from '@playwright/test';

test.describe('ロケーション管理画面の表示確認', () => {
  // 事前にスタッフとしてログイン
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // ログインフォームが表示されるのを待つ
    await expect(page.getByRole('heading', { name: 'THE WORLD DOOR' })).toBeVisible({ timeout: 20000 });
    
    // ログインボタンが有効になるまで待つ (ページの準備が完了したと見なす)
    await expect(page.getByTestId('login-button')).toBeEnabled({ timeout: 20000 });

    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/staff/dashboard', { timeout: 15000 });
  });

  test('ロケーション一覧にデータが表示されること', async ({ page }) => {
    // ロケーション管理ページに遷移
    await page.goto('/staff/location');
    await expect(page).toHaveURL('/staff/location');

    // ページタイトルが表示されることを確認
    await expect(page.getByRole('heading', { name: 'ロケーション管理' })).toBeVisible();

    // グリッドビューにロケーションが表示されるのを待つ
    // 'STD-A-01' というテキストを持つ要素が表示されるまで待機
    await expect(page.getByText('STD-A-01')).toBeVisible({ timeout: 15000 });

    // seed.tsで追加したデータがいくつか表示されていることを確認
    await expect(page.getByText('標準棚 A-01')).toBeVisible();
    await expect(page.getByText('防湿庫 01')).toBeVisible();
    await expect(page.getByText('金庫室 01')).toBeVisible();

    // ロケーション一覧のコンテナ要素を取得
    const locationListContainer = page.locator('.intelligence-card.oceania').first();
    
    // スクリーンショットを撮影して確認
    await expect(locationListContainer).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/location-list-verification.png', fullPage: true });

    console.log('✅ E2Eテスト: ロケーション一覧が正しく表示されました。');
  });
}); 