import { test, expect } from '@playwright/test';

test.describe('同梱商品検索', () => {
  test('テスト商品とNikon Z9を全タブで探す', async ({ page }) => {
    console.log('🔍 同梱商品検索開始');

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // モーダルを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    const tabs = ['全て', '梱包待ち', '梱包済み', '集荷準備完了'];
    
    for (const tabName of tabs) {
      console.log(`\n=== ${tabName} タブ検索 ===`);
      
      const tab = page.locator(`button:has-text("${tabName}")`);
      if (await tab.count() > 0) {
        await tab.click();
        await page.waitForTimeout(2000);
      }

      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      console.log(`📦 ${tabName} タブ行数: ${rowCount}`);

      let foundTestProduct = false;
      let foundNikonZ9 = false;

      for (let i = 0; i < rowCount; i++) {
        try {
          const productText = await rows.nth(i).locator('td:nth-child(2)').textContent() || '';
          
          if (productText.includes('テスト商品') && productText.includes('sold')) {
            foundTestProduct = true;
            console.log(`✅ ${tabName}: テスト商品 - soldステータス確認用 発見`);
            console.log(`   詳細: "${productText}"`);
          }
          
          if (productText.includes('Nikon Z9') && productText.includes('excellent')) {
            foundNikonZ9 = true;
            console.log(`✅ ${tabName}: Nikon Z9 - excellent 発見`);
            console.log(`   詳細: "${productText}"`);
          }
          
        } catch (e) {
          // エラー無視
        }
      }

      console.log(`📊 ${tabName} 検索結果:`);
      console.log(`   テスト商品: ${foundTestProduct}`);
      console.log(`   Nikon Z9: ${foundNikonZ9}`);
      
      if (foundTestProduct || foundNikonZ9) {
        await page.screenshot({
          path: `BUNDLE-PRODUCTS-${tabName}.png`,
          fullPage: true
        });
      }
    }

    console.log('🔍 同梱商品検索完了');
  });
});


