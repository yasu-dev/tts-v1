import { test, expect } from '@playwright/test';

test.describe('詳細同梱デバッグ', () => {
  test('同梱ボタンが表示されない原因を特定', async ({ page }) => {
    console.log('🔧 詳細同梱デバッグ開始');

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 梱包済みタブをクリック
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
    }

    // 商品データの詳細確認
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`📦 梱包済みタブ商品数: ${rowCount}`);

    for (let i = 0; i < Math.min(rowCount, 3); i++) {
      try {
        const productText = await rows.nth(i).locator('td:nth-child(2)').textContent() || '';
        const statusText = await rows.nth(i).locator('td:nth-child(4)').textContent() || '';
        const actionArea = await rows.nth(i).locator('td:nth-child(5)').textContent() || '';
        
        console.log(`\n📦 商品 ${i}:`);
        console.log(`   名前: "${productText}"`);
        console.log(`   ステータス: "${statusText}"`);
        console.log(`   アクション: "${actionArea}"`);
        
        // Nikon Z9またはテスト商品かチェック
        const isTestProduct = productText.includes('テスト商品');
        const isNikonZ9 = productText.includes('Nikon Z9');
        const isPacked = statusText.includes('packed') || statusText.includes('梱包済');
        
        console.log(`   テスト商品: ${isTestProduct}`);
        console.log(`   Nikon Z9: ${isNikonZ9}`);
        console.log(`   梱包済み: ${isPacked}`);
        
        if ((isTestProduct || isNikonZ9) && isPacked) {
          console.log(`✅ 同梱ボタン表示条件満たす商品: ${productText}`);
          
          // この商品の行で同梱ボタンを詳細確認
          const rowButtons = await rows.nth(i).locator('button').all();
          console.log(`   この行のボタン数: ${rowButtons.length}`);
          
          for (let j = 0; j < rowButtons.length; j++) {
            const buttonText = await rowButtons[j].textContent() || '';
            console.log(`   ボタン ${j}: "${buttonText}"`);
          }
        }
        
      } catch (e) {
        console.log(`❌ 商品 ${i}: 取得エラー`);
      }
    }

    // テスト用ボタンが表示されているか確認
    const testButtons = page.locator('button:has-text("🚨 テスト")');
    const testButtonCount = await testButtons.count();
    console.log(`\n🚨 テスト用ボタン数: ${testButtonCount}`);
    
    if (testButtonCount > 0) {
      console.log('✅ テスト用ボタンは表示されている');
    } else {
      console.log('❌ テスト用ボタンも表示されていない（基本的な問題）');
    }

    await page.screenshot({
      path: 'DETAILED-BUNDLE-DEBUG.png',
      fullPage: true
    });

    console.log('🔧 詳細同梱デバッグ完了');
  });
});


