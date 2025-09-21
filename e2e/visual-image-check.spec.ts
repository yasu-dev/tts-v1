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
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => Array.from(document.querySelectorAll('table img')).some((img: any) => img.naturalWidth > 0), null, { timeout: 15000 });
    const inv = await hasLoadedImages(page, 'table');
    expect(inv.loaded).toBeGreaterThanOrEqual(1);

    // 納品
    await page.goto('/delivery');
    await expect(page).toHaveURL(/\/delivery$/);
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => Array.from(document.querySelectorAll('table img')).some((img: any) => img.naturalWidth > 0), null, { timeout: 15000 });
    const del = await hasLoadedImages(page, 'table');
    expect(del.loaded).toBeGreaterThanOrEqual(1);

    // 売上
    await page.goto('/sales');
    await expect(page).toHaveURL(/\/sales$/);
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => Array.from(document.querySelectorAll('table img')).some((img: any) => img.naturalWidth > 0), null, { timeout: 15000 });
    const sales = await hasLoadedImages(page, 'table');
    expect(sales.loaded).toBeGreaterThanOrEqual(1);
  });
});