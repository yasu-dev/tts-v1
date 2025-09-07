import { test, expect } from '@playwright/test';

test.describe('梱包済み状態確認', () => {
  test('テスト商品が packed 状態になったか確認', async ({ page }) => {
    console.log('📦 梱包済み状態確認開始');

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // モーダルダイアログを閉じる
    const modalCloseBtn = page.locator('button:has-text("閉じる"), button:has-text("×"), button[aria-label="閉じる"]');
    const modalCount = await modalCloseBtn.count();
    if (modalCount > 0) {
      console.log('📱 モーダルダイアログを閉じます');
      await modalCloseBtn.first().click();
      await page.waitForTimeout(1000);
    }

    // Escapeキーでモーダルを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // 梱包済みタブをクリック
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ 梱包済みタブクリック成功');
    }

    await page.screenshot({
      path: 'PACKED-STATE-CHECK.png',
      fullPage: true
    });

    // 梱包済み商品を確認
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`📦 梱包済み商品数: ${rowCount}`);

    let testProductPacked = false;
    let nikonZ9Packed = false;

    for (let i = 0; i < rowCount; i++) {
      try {
        const productText = await rows.nth(i).locator('td:nth-child(2)').textContent() || '';
        const statusText = await rows.nth(i).locator('td:nth-child(4)').textContent() || '';
        
        console.log(`📦 商品 ${i}: "${productText}" - ステータス: "${statusText}"`);
        
        if (productText.includes('テスト商品')) {
          testProductPacked = true;
          console.log('✅ テスト商品が梱包済みタブに表示');
        }
        
        if (productText.includes('Nikon Z9')) {
          nikonZ9Packed = true;
          console.log('✅ Nikon Z9が梱包済みタブに表示');
        }
        
      } catch (e) {
        console.log(`❌ 商品 ${i}: データ取得エラー`);
      }
    }

    console.log(`\n📊 最終結果:`);
    console.log(`   テスト商品の梱包済み状態: ${testProductPacked}`);
    console.log(`   Nikon Z9の梱包済み状態: ${nikonZ9Packed}`);

    if (testProductPacked || nikonZ9Packed) {
      console.log('🎉 SUCCESS: 梱包済み商品が確認できました');
    } else {
      console.log('❌ FAIL: 梱包済み商品が見つかりません');
    }

    console.log('📦 梱包済み状態確認完了');
  });
});

