import { test, expect } from '@playwright/test';

test.describe('梱包済み商品デバッグ', () => {
  test('梱包済みタブの商品データ確認', async ({ page }) => {
    console.log('🔍 梱包済み商品データ確認開始');

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 梱包済みタブをクリック
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
    }

    // テーブル行を詳細確認
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`📦 梱包済みタブ行数: ${rowCount}`);

    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      try {
        const productCell = rows.nth(i).locator('td:nth-child(2)');
        const statusCell = rows.nth(i).locator('td:nth-child(4)');
        const actionCell = rows.nth(i).locator('td:nth-child(5)');
        
        const productText = await productCell.textContent() || '';
        const statusText = await statusCell.textContent() || '';
        const actionText = await actionCell.textContent() || '';
        
        console.log(`\n📦 商品 ${i}:`);
        console.log(`   商品名: "${productText}"`);
        console.log(`   ステータス: "${statusText}"`);
        console.log(`   アクション: "${actionText}"`);
        
        const isNikonZ9 = productText.includes('Nikon Z9');
        const isTestProduct = productText.includes('テスト商品');
        const isPacked = statusText.toLowerCase().includes('packed') || statusText.includes('梱包済');
        
        console.log(`   Nikon Z9: ${isNikonZ9}`);
        console.log(`   テスト商品: ${isTestProduct}`);
        console.log(`   梱包済み: ${isPacked}`);
        
        if (isNikonZ9 && isPacked) {
          console.log(`🎯 Nikon Z9が梱包済み状態 → 同梱ボタン表示されるはず`);
          
          // この行の具体的なボタンを確認
          const buttonTexts = await actionCell.locator('button').allTextContents();
          console.log(`   実際のボタン: ${buttonTexts.join(', ')}`);
        }
        
        if (isTestProduct) {
          console.log(`🎯 テスト商品発見 → 同梱メッセージ表示されるはず`);
        }
        
      } catch (e) {
        console.log(`❌ 商品 ${i}: データ取得エラー`);
      }
    }

    await page.screenshot({
      path: 'PACKED-PRODUCTS-DEBUG.png',
      fullPage: true
    });

    console.log('🔍 梱包済み商品データ確認完了');
  });
});

