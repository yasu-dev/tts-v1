import { test, expect } from '@playwright/test';

test.describe('横幅修正結果の検証', () => {
  test('スタッフ在庫管理の横幅が拡張され商品名・SKU・操作列が適切に表示されることを確認', async ({ page }) => {
    // スタッフ在庫管理ページを開く
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // 修正後の幅を測定
    const afterFixMeasurement = await page.evaluate(() => {
      const maxWidthContainer = document.querySelector('.max-w-6xl');
      const table = document.querySelector('.holo-table');
      const body = document.body;

      if (!maxWidthContainer || !table) return null;

      return {
        containerWidth: maxWidthContainer.getBoundingClientRect().width,
        tableWidth: table.getBoundingClientRect().width,
        bodyWidth: body.getBoundingClientRect().width,
        overflowing: (table as HTMLElement).scrollWidth > table.getBoundingClientRect().width
      };
    });

    console.log('=== 修正後の測定結果 ===');
    console.log(`コンテナ幅: ${afterFixMeasurement?.containerWidth}px`);
    console.log(`テーブル幅: ${afterFixMeasurement?.tableWidth}px`);
    console.log(`オーバーフロー: ${afterFixMeasurement?.overflowing ? 'あり' : 'なし'}`);

    // 各列の幅を確認
    const columnWidths = await page.$$eval('.holo-table thead th', headers =>
      headers.map(h => ({
        text: h.textContent?.trim() || '',
        width: h.getBoundingClientRect().width,
        overflow: (h as HTMLElement).scrollWidth > h.getBoundingClientRect().width
      }))
    );

    console.log('\n=== 列幅詳細 ===');
    columnWidths.forEach(col => {
      const status = col.overflow ? '❌切れてる' : '✅正常';
      console.log(`${col.text}: ${col.width.toFixed(1)}px ${status}`);
    });

    // 特定の列（商品名、SKU、操作）の確認
    const productNameCol = columnWidths.find(c => c.text === '商品名');
    const skuCol = columnWidths.find(c => c.text === 'SKU');
    const actionCol = columnWidths.find(c => c.text === '操作');

    console.log('\n=== 重要列の状態 ===');
    console.log(`商品名: ${productNameCol?.width.toFixed(1)}px (切れ: ${productNameCol?.overflow ? 'あり' : 'なし'})`);
    console.log(`SKU: ${skuCol?.width.toFixed(1)}px (切れ: ${skuCol?.overflow ? 'あり' : 'なし'})`);
    console.log(`操作: ${actionCol?.width.toFixed(1)}px (切れ: ${actionCol?.overflow ? 'あり' : 'なし'})`);

    // スクリーンショット
    const table = await page.$('.holo-table');
    if (table) {
      await table.screenshot({
        path: 'staff-inventory-fixed-width.png'
      });
    }

    // セラー在庫管理と比較
    await page.goto('http://localhost:3002/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    const sellerMeasurement = await page.evaluate(() => {
      const container = document.querySelector('.intelligence-card');
      const table = document.querySelector('.holo-table');

      if (!container || !table) return null;

      return {
        containerWidth: container.getBoundingClientRect().width,
        tableWidth: table.getBoundingClientRect().width
      };
    });

    console.log('\n=== セラー在庫管理との比較 ===');
    console.log(`スタッフコンテナ幅: ${afterFixMeasurement?.containerWidth}px`);
    console.log(`セラーコンテナ幅: ${sellerMeasurement?.containerWidth}px`);
    console.log(`統一度: ${Math.abs((afterFixMeasurement?.containerWidth || 0) - (sellerMeasurement?.containerWidth || 0)) < 50 ? '✅近い' : '❌差が大きい'}`);

    // アサーション
    expect(afterFixMeasurement?.containerWidth).toBeGreaterThan(896); // 元のmax-w-4xlより大きい
    expect(afterFixMeasurement?.overflowing).toBe(false); // オーバーフローしていない
    expect(productNameCol?.overflow).toBe(false); // 商品名が切れていない
    expect(skuCol?.overflow).toBe(false); // SKUが切れていない
    expect(actionCol?.overflow).toBe(false); // 操作が切れていない

    console.log('\n✅ すべての検証項目をクリア');
  });
});