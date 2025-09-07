import { test, expect } from '@playwright/test';

test.describe('ロケーション管理UI詳細デバッグ', () => {
  test('ロケーション管理画面の実際の状態確認', async ({ page }) => {
    console.log('🔍 ロケーション管理画面詳細デバッグ');

    // サーバー起動待機
    await page.waitForTimeout(3000);

    await page.goto('http://localhost:3002/staff/inventory?tab=location');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 初期画面をキャプチャ
    await page.screenshot({
      path: 'debug-location-initial.png',
      fullPage: true
    });

    // 出荷リストタブをクリック
    const tabs = page.locator('button');
    const tabCount = await tabs.count();
    console.log(`タブ数: ${tabCount}`);
    
    for (let i = 0; i < Math.min(tabCount, 10); i++) {
      const tabText = await tabs.nth(i).textContent();
      console.log(`タブ ${i}: "${tabText}"`);
    }

    // 出荷リストタブを探す
    const shippingTab = page.locator('button:has-text("出荷リスト"), button:has-text("出荷"), button:has-text("shipping")');
    const shippingTabCount = await shippingTab.count();
    console.log(`出荷リストタブ数: ${shippingTabCount}`);

    if (shippingTabCount > 0) {
      await shippingTab.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: 'debug-shipping-tab-clicked.png',
        fullPage: true
      });

      // 商品カードの詳細を確認
      const items = page.locator('[class*="holo-card"], .space-y-3 > div');
      const itemCount = await items.count();
      console.log(`商品カード数: ${itemCount}`);

      // チェックボックスの存在確認
      const checkboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();
      console.log(`チェックボックス数: ${checkboxCount}`);

      if (checkboxCount > 0) {
        // 最初のチェックボックスをクリック
        await checkboxes.first().click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({
          path: 'debug-checkbox-selected.png',
          fullPage: true
        });

        // 選択後のボタン状態確認
        const allButtons = page.locator('button');
        const buttonCount = await allButtons.count();
        console.log(`選択後ボタン数: ${buttonCount}`);

        // ボタンのdisabled状態を確認
        for (let i = 0; i < Math.min(buttonCount, 30); i++) {
          const button = allButtons.nth(i);
          const text = await button.textContent();
          const isDisabled = await button.getAttribute('disabled');
          if (text && text.includes('ピッキング')) {
            console.log(`ピッキングボタン ${i}: "${text}" (disabled: ${isDisabled !== null})`);
          }
        }

        await page.screenshot({
          path: 'debug-after-selection.png',
          fullPage: true
        });
      }

      // shippingDataの内容をログ出力
      const shippingDataLog = await page.evaluate(() => {
        const shippingData = (window as any).shippingData;
        console.log('shippingData:', shippingData);
        return shippingData;
      });
      console.log('フロントエンドshippingData:', shippingDataLog);

    } else {
      console.log('❌ 出荷リストタブが見つかりません');
      
      await page.screenshot({
        path: 'debug-no-shipping-tab.png',
        fullPage: true
      });
    }

    console.log('✅ ロケーション管理UIデバッグ完了');
  });
});



