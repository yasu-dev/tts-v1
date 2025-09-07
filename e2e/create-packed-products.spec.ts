import { test, expect } from '@playwright/test';

test.describe('梱包済み商品作成', () => {
  test('テスト商品とNikon Z9を梱包開始で packed 状態にする', async ({ page }) => {
    console.log('📦 梱包済み商品作成開始');

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 梱包待ちタブをクリック
    const workstationTab = page.locator('button:has-text("梱包待ち")');
    if (await workstationTab.count() > 0) {
      await workstationTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ 梱包待ちタブクリック');
    }

    await page.screenshot({
      path: 'WORKSTATION-TAB-BEFORE.png',
      fullPage: true
    });

    // 梱包待ち商品を確認
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`📦 梱包待ち商品数: ${rowCount}`);

    // テスト商品とNikon Z9を探す
    let testProductFound = false;
    let nikonZ9Found = false;

    for (let i = 0; i < rowCount; i++) {
      const productText = await rows.nth(i).locator('td:nth-child(2)').textContent() || '';
      console.log(`📦 商品 ${i}: "${productText}"`);
      
      if (productText.includes('テスト商品') || productText.includes('Nikon Z9')) {
        console.log(`🎯 対象商品発見: ${productText}`);
        
        // 梱包開始ボタンを探す
        const packingButtons = rows.nth(i).locator('button:has-text("梱包開始"), button:has-text("同梱梱包開始")');
        const buttonCount = await packingButtons.count();
        
        if (buttonCount > 0) {
          console.log(`🔘 梱包開始ボタン発見、クリックします: ${productText}`);
          await packingButtons.first().click();
          await page.waitForTimeout(1000);
          
          if (productText.includes('テスト商品')) testProductFound = true;
          if (productText.includes('Nikon Z9')) nikonZ9Found = true;
        } else {
          console.log(`❌ 梱包開始ボタンなし: ${productText}`);
        }
      }
    }

    console.log(`📊 処理結果:`);
    console.log(`   テスト商品処理: ${testProductFound}`);
    console.log(`   Nikon Z9処理: ${nikonZ9Found}`);

    // 梱包済みタブに移動して確認
    await page.waitForTimeout(2000);
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ 梱包済みタブクリック');
    }

    const packedRows = page.locator('tbody tr');
    const packedCount = await packedRows.count();
    console.log(`📦 梱包済み商品数: ${packedCount}`);

    if (packedCount > 0) {
      for (let i = 0; i < Math.min(packedCount, 3); i++) {
        const productText = await packedRows.nth(i).locator('td:nth-child(2)').textContent() || '';
        console.log(`📦 梱包済み商品 ${i}: "${productText}"`);
      }
    }

    await page.screenshot({
      path: 'PACKED-TAB-AFTER.png',
      fullPage: true
    });

    console.log('📦 梱包済み商品作成完了');
  });
});

