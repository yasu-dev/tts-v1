import { test, expect } from '@playwright/test';

test.describe('現在の表示状態を確認', () => {
  test('スタッフ在庫管理とセラー在庫管理の現在の表示', async ({ page }) => {
    // スタッフ在庫管理ページ
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // スタッフのスクリーンショット
    await page.screenshot({
      path: 'current-staff-inventory.png',
      fullPage: false
    });

    // セラー在庫管理ページ
    await page.goto('http://localhost:3002/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // セラーのスクリーンショット
    await page.screenshot({
      path: 'current-seller-inventory.png',
      fullPage: false
    });

    // 両方を並べて確認するため、スタッフに戻る
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // テーブル全体の幅を確認
    const tableInfo = await page.$eval('.holo-table', el => {
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        scrollWidth: (el as HTMLElement).scrollWidth,
        overflowing: (el as HTMLElement).scrollWidth > rect.width
      };
    });

    console.log('テーブル情報:', tableInfo);

    // 各列の実際の表示幅を確認
    const columnInfo = await page.$$eval('.holo-table thead th', headers =>
      headers.map(h => ({
        text: h.textContent?.trim() || '',
        width: h.getBoundingClientRect().width,
        computedWidth: window.getComputedStyle(h).width,
        overflow: (h as HTMLElement).scrollWidth > h.getBoundingClientRect().width,
        scrollWidth: (h as HTMLElement).scrollWidth
      }))
    );

    console.log('=== 現在の列幅 ===');
    columnInfo.forEach(col => {
      console.log(`${col.text}: 幅=${col.width}px, スタイル=${col.computedWidth}, オーバーフロー=${col.overflow ? 'あり' : 'なし'}`);
    });

    // ステータス、更新日、操作の列を特に確認
    const statusCol = columnInfo.find(c => c.text === 'ステータス');
    const updateCol = columnInfo.find(c => c.text === '更新日');
    const actionCol = columnInfo.find(c => c.text === '操作');

    console.log('\n=== 問題の列の詳細 ===');
    console.log('ステータス列:', statusCol);
    console.log('更新日列:', updateCol);
    console.log('操作列:', actionCol);

    // 切れているかチェック
    if (statusCol?.overflow || updateCol?.overflow || actionCol?.overflow) {
      console.log('\n❌ テキストが切れています！');
    } else {
      console.log('\n✅ テキストは正常に表示されています');
    }

    // 最終確認スクリーンショット
    await page.screenshot({
      path: 'final-check-display.png',
      fullPage: false
    });
  });
});