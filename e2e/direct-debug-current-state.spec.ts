import { test, expect } from '@playwright/test';

test.describe('直接デバッグ確認', () => {
  test('現在のボタン構造を完全分析', async ({ page }) => {
    console.log('🔧 直接デバッグ確認開始');

    await page.waitForTimeout(5000);

    // 出荷管理画面にアクセス
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'DEBUG-1-initial-state.png',
      fullPage: true
    });

    // 梱包済みタブをクリック
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({
      path: 'DEBUG-2-packed-tab.png',
      fullPage: true
    });

    // すべてのボタンを調査
    const allButtons = await page.locator('button').all();
    console.log(`🔧 ページ内全ボタン数: ${allButtons.length}`);
    
    for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
      const buttonText = await allButtons[i].textContent();
      console.log(`🔧 ボタン ${i}: "${buttonText}"`);
    }

    // 商品行を調査
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`📦 商品行数: ${rowCount}`);

    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      const productText = await rows.nth(i).locator('td:nth-child(2)').textContent();
      const actionText = await rows.nth(i).locator('td:nth-child(5)').textContent() || '';
      console.log(`📦 商品 ${i}: "${productText}"`);
      console.log(`🎯 アクション ${i}: "${actionText}"`);
    }

    // 具体的なボタンを探す
    const bundleLabelButtons = await page.locator('text=同梱ラベル印刷').all();
    const bundleReadyButtons = await page.locator('text=同梱集荷準備').all();
    const testProductMessages = await page.locator('text=同梱相手と一緒に処理').all();
    
    console.log(`🔧 同梱ラベル印刷ボタン数: ${bundleLabelButtons.length}`);
    console.log(`🔧 同梱集荷準備ボタン数: ${bundleReadyButtons.length}`);
    console.log(`🔧 同梱相手メッセージ数: ${testProductMessages.length}`);

    // DOMの状態をダンプ
    const bodyHTML = await page.locator('body').innerHTML();
    console.log(`🔧 DOM内容（同梱ラベル印刷検索）: ${bodyHTML.includes('同梱ラベル印刷')}`);
    console.log(`🔧 DOM内容（同梱集荷準備検索）: ${bodyHTML.includes('同梱集荷準備')}`);

    await page.screenshot({
      path: 'DEBUG-3-final-analysis.png',
      fullPage: true
    });

    console.log('🔧 直接デバッグ確認完了');
  });
});


