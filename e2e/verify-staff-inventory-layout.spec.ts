import { test, expect } from '@playwright/test';

test.describe('スタッフ在庫管理レイアウト検証', () => {
  test('スタッフ在庫管理とセラー在庫管理の表示確認', async ({ page }) => {
    // スタッフ在庫管理ページを開く
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // テーブルヘッダーの確認
    const staffHeaders = await page.$$eval('.holo-table thead th', headers =>
      headers.map(h => h.textContent?.trim() || '')
    );

    console.log('スタッフ在庫管理のヘッダー:', staffHeaders);

    // スタッフ在庫管理のスクリーンショット
    await page.screenshot({
      path: 'staff-inventory-layout-fixed.png',
      fullPage: false
    });

    // セラー在庫管理ページを開く
    await page.goto('http://localhost:3002/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    const sellerHeaders = await page.$$eval('.holo-table thead th', headers =>
      headers.map(h => h.textContent?.trim() || '')
    );

    console.log('セラー在庫管理のヘッダー:', sellerHeaders);

    // セラー在庫管理のスクリーンショット
    await page.screenshot({
      path: 'seller-inventory-layout-fixed.png',
      fullPage: false
    });

    // 比較用の両方のスクリーンショット
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // テーブルの横幅確認
    const staffTableWidth = await page.$eval('.holo-table', el => {
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        scrollWidth: (el as HTMLElement).scrollWidth,
        overflowing: (el as HTMLElement).scrollWidth > rect.width
      };
    });

    console.log('スタッフテーブルの幅情報:', staffTableWidth);

    // 各列の幅を確認
    const staffColumnWidths = await page.$$eval('.holo-table thead th', headers =>
      headers.map(h => {
        const rect = h.getBoundingClientRect();
        return {
          text: h.textContent?.trim() || '',
          width: rect.width,
          style: window.getComputedStyle(h).width
        };
      })
    );

    console.log('スタッフ各列の幅:', staffColumnWidths);

    // ステータス、更新日、操作の列が切れていないか確認
    const statusColumn = staffColumnWidths.find(c => c.text === 'ステータス');
    const updateColumn = staffColumnWidths.find(c => c.text === '更新日');
    const actionColumn = staffColumnWidths.find(c => c.text === '操作');

    console.log('重要な列の幅:');
    console.log('- ステータス:', statusColumn);
    console.log('- 更新日:', updateColumn);
    console.log('- 操作:', actionColumn);

    // 最終的な比較スクリーンショット
    await page.screenshot({
      path: 'staff-inventory-final-check.png',
      fullPage: false
    });

    // アサーション
    expect(staffHeaders).toContain('ステータス');
    expect(staffHeaders).toContain('更新日');
    expect(staffHeaders).toContain('操作');

    // 列が切れていないことを確認
    expect(statusColumn?.width).toBeGreaterThan(80);
    expect(updateColumn?.width).toBeGreaterThan(70);
    expect(actionColumn?.width).toBeGreaterThan(60);
  });
});