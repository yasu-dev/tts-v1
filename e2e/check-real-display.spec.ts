import { test, expect } from '@playwright/test';

test.describe('実際の表示確認', () => {
  test('ブラウザで実際の表示を確認', async ({ page }) => {
    console.log('👀 実際のブラウザ表示を確認');

    // スタッフ在庫管理画面を開く
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('table', { timeout: 10000 });
    
    // 更新日列が見えているかチェック
    const updateDateHeaders = page.locator('th').filter({ hasText: '更新日' });
    const isUpdateDateVisible = await updateDateHeaders.isVisible();
    console.log('📅 更新日ヘッダーが見えているか:', isUpdateDateVisible);
    
    if (isUpdateDateVisible) {
      const updateDateRect = await updateDateHeaders.boundingBox();
      console.log('📏 更新日列の位置:', updateDateRect);
    }
    
    // テーブル全体の幅を確認
    const table = page.locator('table').first();
    const tableRect = await table.boundingBox();
    console.log('📏 テーブル全体の幅:', tableRect?.width);
    
    // ビューポートの幅を確認
    const viewportSize = page.viewportSize();
    console.log('📏 ビューポート幅:', viewportSize?.width);
    
    // 各列の幅を再確認
    const headers = page.locator('th');
    const headerCount = await headers.count();
    
    let totalWidth = 0;
    for (let i = 0; i < headerCount; i++) {
      const header = headers.nth(i);
      const headerText = await header.textContent();
      const rect = await header.boundingBox();
      console.log(`📏 列${i+1} "${headerText?.trim()}": ${rect?.width}px`);
      totalWidth += rect?.width || 0;
    }
    console.log('📏 全列の合計幅:', totalWidth);
    
    // スクリーンショットを保存
    await page.screenshot({ 
      path: 'current-staff-inventory-display.png',
      fullPage: true 
    });
    
    console.log('👀 実際の表示確認完了');
  });
});

