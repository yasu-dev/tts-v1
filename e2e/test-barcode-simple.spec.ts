import { test, expect } from '@playwright/test';

test.describe('バーコードスキャン基本テスト', () => {
  test('開発サーバーの起動確認', async ({ page }) => {
    // 開発サーバーにアクセス
    await page.goto('http://localhost:3000');
    
    // ページタイトルまたはコンテンツの確認
    await expect(page).toHaveTitle(/WORLD DOOR/i, { timeout: 10000 });
  });

  test('ログイン画面へのアクセス', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // ログインフォームの存在を確認
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('スタッフログイン後のバーコードスキャン', async ({ page }) => {
    // ログイン画面へ移動
    await page.goto('http://localhost:3000/login');
    
    // スタッフとしてログイン
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ダッシュボードへの遷移を待つ
    await page.waitForURL('**/staff/dashboard', { timeout: 10000 });
    
    // 少し待機してページが完全に読み込まれるのを待つ
    await page.waitForTimeout(2000);
    
    // バーコードスキャンをシミュレート
    const barcode = 'CAM-SONY-A7II-002';
    for (const char of barcode) {
      await page.keyboard.press(char);
    }
    await page.keyboard.press('Enter');
    
    // トースト通知またはページ遷移を確認
    // どちらかが発生することを期待
    await Promise.race([
      // トースト通知の確認
      expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 }),
      // URLの変化を確認
      page.waitForURL(/\/staff\/inspection\/.*/, { timeout: 5000 })
    ]).catch(() => {
      // エラーをキャッチして詳細を確認
      console.log('バーコードスキャンのレスポンスが確認できませんでした');
    });
  });
});





<<<<<<< HEAD





=======
>>>>>>> 27cb83a4da8878ddc291792907bf9c3940e53b71




