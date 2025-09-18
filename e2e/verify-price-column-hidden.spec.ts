import { test, expect } from '@playwright/test';

test.describe('購入価格列の表示確認', () => {
  test('セラー在庫管理で購入価格列が非表示になっていることを確認', async ({ page }) => {
    // セラー在庫管理ページを開く
    await page.goto('http://localhost:3002/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // ヘッダーの内容を取得
    const headers = await page.$$eval('.holo-table thead th', ths =>
      ths.map(th => th.textContent?.trim() || '')
    );

    console.log('セラー在庫管理のヘッダー:', headers);

    // 購入価格列が存在しないことを確認
    const hasPriceColumn = headers.includes('購入価格');
    console.log('購入価格列の存在:', hasPriceColumn ? 'あり❌' : 'なし✅');

    // テーブルのスクリーンショット
    const table = await page.$('.holo-table');
    if (table) {
      await table.screenshot({
        path: 'seller-inventory-no-price-column.png'
      });
    }

    // 詳細モーダルで購入価格が表示されることを確認
    const firstRow = await page.$('.holo-table tbody tr');
    if (firstRow) {
      // 詳細ボタンをクリック
      const detailButton = await firstRow.$('button:has-text("詳細")');
      if (detailButton) {
        await detailButton.click();

        // モーダルが開くのを待つ
        await page.waitForSelector('.intelligence-card.global', { timeout: 5000 });

        // モーダル内で購入価格が表示されているか確認
        const modalContent = await page.$eval('.intelligence-card.global', el => el.textContent || '');
        const hasPriceInModal = modalContent.includes('購入価格') || modalContent.includes('¥');

        console.log('詳細モーダルに価格情報:', hasPriceInModal ? 'あり✅' : 'なし');

        // モーダルのスクリーンショット
        await page.screenshot({
          path: 'seller-inventory-modal-with-price.png',
          fullPage: false
        });
      }
    }

    // アサーション
    expect(hasPriceColumn).toBe(false);
    expect(headers).not.toContain('購入価格');
    expect(headers).toContain('画像');
    expect(headers).toContain('商品名');
    expect(headers).toContain('SKU');
    expect(headers).toContain('カテゴリー');
    expect(headers).toContain('更新日');
    expect(headers).toContain('ステータス');
    expect(headers).toContain('操作');
  });
});