import { test, expect } from '@playwright/test';

async function loginAsSeller(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/delivery$/, { timeout: 15000 });
}

const hasLoadedImages = async (page: any, selector: string) => {
  const results = await page.$$eval(`${selector} img`, imgs => imgs.map(img => ({
    src: img.getAttribute('src') || '',
    nw: (img as HTMLImageElement).naturalWidth,
    isData: (img.getAttribute('src') || '').startsWith('data:'),
  })));
  const loaded = results.filter(r => r.nw && r.nw > 0);
  return { total: results.length, loaded: loaded.length, dataCount: results.filter(r => r.isData).length };
};

test.describe('一覧画像の可視確認', () => {
  test('在庫・納品・売上の画像が表示される', async ({ page }) => {
    await loginAsSeller(page);

    // 在庫
    await page.goto('/inventory');
    await expect(page).toHaveURL(/\/inventory$/);
    const inv = await hasLoadedImages(page, 'table');
    expect(inv.loaded).toBeGreaterThanOrEqual(1);

    // 納品
    await page.goto('/delivery');
    await expect(page).toHaveURL(/\/delivery$/);
    const del = await hasLoadedImages(page, 'table');
    expect(del.loaded).toBeGreaterThanOrEqual(1);

    // 売上
    await page.goto('/sales');
    await expect(page).toHaveURL(/\/sales$/);
    const sales = await hasLoadedImages(page, 'table');
    expect(sales.loaded).toBeGreaterThanOrEqual(1);
  });
});

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
