import { test, expect } from '@playwright/test';

test.describe('テーブル表示の確認', () => {
  test('スタッフ在庫管理テーブルの実際の表示を確認', async ({ page }) => {
    // スタッフ在庫管理ページを開く
    await page.goto('http://localhost:3002/staff/inventory');

    // テーブルが存在するまで待つ
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // テーブルまでスクロール
    await page.evaluate(() => {
      const table = document.querySelector('.holo-table');
      if (table) {
        table.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    });

    // スクロール後のスクリーンショット
    await page.screenshot({
      path: 'staff-inventory-table-view.png',
      fullPage: false
    });

    // テーブルのヘッダー情報を取得
    const headers = await page.$$eval('.holo-table thead th', ths =>
      ths.map(th => ({
        text: th.textContent?.trim() || '',
        width: th.getBoundingClientRect().width,
        visible: th.getBoundingClientRect().width > 0
      }))
    );

    console.log('=== テーブルヘッダー情報 ===');
    headers.forEach(h => {
      console.log(`${h.text}: ${h.width}px (${h.visible ? '表示' : '非表示'})`);
    });

    // テーブルのみのスクリーンショット
    const table = await page.$('.holo-table');
    if (table) {
      await table.screenshot({
        path: 'staff-inventory-table-only.png'
      });
    }

    // セラー在庫管理も確認
    await page.goto('http://localhost:3002/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    await page.evaluate(() => {
      const table = document.querySelector('.holo-table');
      if (table) {
        table.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    });

    await page.screenshot({
      path: 'seller-inventory-table-view.png',
      fullPage: false
    });

    const sellerTable = await page.$('.holo-table');
    if (sellerTable) {
      await sellerTable.screenshot({
        path: 'seller-inventory-table-only.png'
      });
    }

    // 両方のテーブルのサイズを比較
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    const staffTableSize = await page.$eval('.holo-table', el => {
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height
      };
    });

    await page.goto('http://localhost:3002/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    const sellerTableSize = await page.$eval('.holo-table', el => {
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height
      };
    });

    console.log('\n=== テーブルサイズ比較 ===');
    console.log('スタッフ在庫:', staffTableSize);
    console.log('セラー在庫:', sellerTableSize);
  });
});