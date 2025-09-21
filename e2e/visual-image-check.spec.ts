import { test, expect } from '@playwright/test';

test.describe('目視画像表示確認', () => {
  test('スタッフ在庫管理ページの画像を目視確認', async ({ page }) => {
    // スタッフとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/staff\/inventory$/, { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // 画像要素数を確認
    const totalImages = await page.locator('img').count();
    const base64Images = await page.locator('img[src^="data:image/"]').count();
    const apiImages = await page.locator('img[src*="/api/images/"]').count();
    
    console.log(`スタッフ在庫管理 - 総画像: ${totalImages}, Base64: ${base64Images}, API: ${apiImages}`);
    
    // ここで手動確認のため一時停止
    await page.pause();
  });

  test('セラー在庫管理ページの画像を目視確認', async ({ page }) => {
    // セラーとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/delivery$/, { timeout: 15000 });
    
    // 在庫管理ページに移動
    await page.goto('/inventory');
    await page.waitForTimeout(3000);
    
    // 画像要素数を確認
    const totalImages = await page.locator('img').count();
    const base64Images = await page.locator('img[src^="data:image/"]').count();
    const apiImages = await page.locator('img[src*="/api/images/"]').count();
    
    console.log(`セラー在庫管理 - 総画像: ${totalImages}, Base64: ${base64Images}, API: ${apiImages}`);
    
    // ここで手動確認のため一時停止
    await page.pause();
  });

  test('納品管理ページの画像を目視確認', async ({ page }) => {
    // セラーとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/delivery$/, { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // 画像要素数を確認
    const totalImages = await page.locator('img').count();
    const base64Images = await page.locator('img[src^="data:image/"]').count();
    const apiImages = await page.locator('img[src*="/api/images/"]').count();
    
    console.log(`納品管理 - 総画像: ${totalImages}, Base64: ${base64Images}, API: ${apiImages}`);
    
    // ここで手動確認のため一時停止
    await page.pause();
  });
});
