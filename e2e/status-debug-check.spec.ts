import { test, expect } from '@playwright/test';

test.describe('ステータスデバッグ確認', () => {
  test('DEBUGラベルで実際のステータス確認', async ({ page }) => {
    console.log('🔍 ステータスデバッグ確認開始');

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // モーダルを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    const tabs = ['梱包待ち', '梱包済み'];
    
    for (const tabName of tabs) {
      console.log(`\n=== ${tabName} タブ DEBUGステータス確認 ===`);
      
      const tab = page.locator(`button:has-text("${tabName}")`);
      if (await tab.count() > 0) {
        await tab.click();
        await page.waitForTimeout(2000);
      }

      // DEBUGラベルを探す
      const debugLabels = page.locator('span:has-text("DEBUG:")');
      const debugCount = await debugLabels.count();
      console.log(`🏷️ ${tabName} DEBUG ラベル数: ${debugCount}`);

      for (let i = 0; i < debugCount; i++) {
        try {
          const debugText = await debugLabels.nth(i).textContent() || '';
          console.log(`   DEBUG ${i}: "${debugText}"`);
          
          if (debugText.includes('Nikon Z9')) {
            console.log(`🎯 Nikon Z9 ステータス発見: ${debugText}`);
          }
          
          if (debugText.includes('テスト商品')) {
            console.log(`🎯 テスト商品 ステータス発見: ${debugText}`);
          }
          
        } catch (e) {
          console.log(`❌ DEBUG ${i}: 取得エラー`);
        }
      }

      // 同梱ボタンも確認
      const bundleButtons = page.locator('button:has-text("同梱")');
      const bundleButtonCount = await bundleButtons.count();
      console.log(`📦 ${tabName} 同梱ボタン数: ${bundleButtonCount}`);
      
      for (let i = 0; i < bundleButtonCount; i++) {
        const buttonText = await bundleButtons.nth(i).textContent() || '';
        console.log(`   同梱ボタン ${i}: "${buttonText}"`);
      }

      await page.screenshot({
        path: `STATUS-DEBUG-${tabName}.png`,
        fullPage: true
      });
    }

    console.log('🔍 ステータスデバッグ確認完了');
  });
});























