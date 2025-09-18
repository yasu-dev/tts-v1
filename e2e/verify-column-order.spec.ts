import { test, expect } from '@playwright/test';

test.describe('列の並び順確認', () => {
  test('スタッフ在庫管理の列順が「更新日」「ステータス」「操作」になっていることを確認', async ({ page }) => {
    // スタッフ在庫管理ページを開く
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // ヘッダーの内容を取得
    const headers = await page.$$eval('.holo-table thead th', ths =>
      ths.map(th => th.textContent?.trim() || '')
    );

    console.log('スタッフ在庫管理のヘッダー:', headers);

    // 最後の3列を確認
    const lastThreeColumns = headers.slice(-3);
    console.log('最後の3列:', lastThreeColumns);

    // テーブルのスクリーンショット
    const table = await page.$('.holo-table');
    if (table) {
      await table.screenshot({
        path: 'staff-inventory-column-order.png'
      });
    }

    // アサーション - 正しい順序になっているか
    expect(lastThreeColumns[0]).toBe('更新日');
    expect(lastThreeColumns[1]).toBe('ステータス');
    expect(lastThreeColumns[2]).toBe('操作');

    // 全体の順序も確認
    const expectedOrder = [
      '画像',
      '商品名',
      'SKU',
      'カテゴリー',
      'セラー名',
      '保管場所',
      '更新日',
      'ステータス',
      '操作'
    ];

    expect(headers).toEqual(expectedOrder);

    console.log('✅ 列の順序が正しく設定されています');
  });
});