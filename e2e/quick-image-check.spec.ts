import { test, expect } from '@playwright/test';

test.describe('簡易画像表示確認', () => {
  test('スタッフ在庫管理ページの画像表示状況を確認', async ({ page }) => {
    // スタッフとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // スタッフ在庫管理ページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/staff\/inventory$/, { timeout: 15000 });
    
    // ページ読み込み完了まで少し待機
    await page.waitForTimeout(5000);
    
    // ページのスクリーンショットを撮影
    await page.screenshot({ 
      path: 'test-results/fixed-staff-inventory.png',
      fullPage: true 
    });
    
    // 画像要素の数を確認
    const totalImages = await page.locator('img').count();
    console.log(`総画像要素数: ${totalImages}`);
    
    // Base64画像の数を確認
    const base64Images = await page.locator('img[src^="data:image/"]').count();
    console.log(`Base64画像数: ${base64Images}`);
    
    // API画像の数を確認
    const apiImages = await page.locator('img[src*="/api/images/"]').count();
    console.log(`API画像数: ${apiImages}`);
    
    // ロゴ以外の商品画像があることを確認
    const productImages = await page.locator('img[src^="data:image/"], img[src*="/api/images/"]').count();
    console.log(`商品画像数: ${productImages}`);
    
    // 画像が表示されていることを期待
    expect(productImages).toBeGreaterThan(0);
  });

  test('セラー在庫管理ページの画像表示状況を確認', async ({ page }) => {
    // セラーとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 納品管理ページにリダイレクト
    await expect(page).toHaveURL(/\/delivery$/, { timeout: 15000 });
    
    // 在庫管理ページに移動
    await page.goto('/inventory');
    await page.waitForTimeout(5000);
    
    // ページのスクリーンショットを撮影
    await page.screenshot({ 
      path: 'test-results/fixed-seller-inventory.png',
      fullPage: true 
    });
    
    // 画像要素の数を確認
    const totalImages = await page.locator('img').count();
    console.log(`総画像要素数: ${totalImages}`);
    
    // Base64画像の数を確認
    const base64Images = await page.locator('img[src^="data:image/"]').count();
    console.log(`Base64画像数: ${base64Images}`);
    
    // API画像の数を確認
    const apiImages = await page.locator('img[src*="/api/images/"]').count();
    console.log(`API画像数: ${apiImages}`);
    
    // ロゴ以外の商品画像があることを確認
    const productImages = await page.locator('img[src^="data:image/"], img[src*="/api/images/"]').count();
    console.log(`商品画像数: ${productImages}`);
  });
});
