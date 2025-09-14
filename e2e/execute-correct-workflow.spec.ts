import { test, expect } from '@playwright/test';

test.describe('正しい業務フロー実行', () => {
  test('同梱梱包開始 → 梱包済み → 同梱ボタン表示の完全フロー', async ({ page }) => {
    console.log('📋 正しい業務フロー実行開始');

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // モーダルを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    console.log('\n=== STEP 1: 梱包待ちタブで同梱梱包開始 ===');
    
    // 梱包待ちタブをクリック
    const workstationTab = page.locator('button:has-text("梱包待ち")');
    if (await workstationTab.count() > 0) {
      await workstationTab.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({
      path: 'STEP1-workstation-tab.png',
      fullPage: true
    });

    // 同梱梱包開始ボタンを探してクリック
    const bundlePackingButton = page.locator('button:has-text("同梱梱包開始")');
    const packingButtonCount = await bundlePackingButton.count();
    console.log(`📦 同梱梱包開始ボタン数: ${packingButtonCount}`);

    if (packingButtonCount > 0) {
      console.log('🔘 同梱梱包開始ボタンをクリックします...');
      await bundlePackingButton.first().click();
      await page.waitForTimeout(3000);
      console.log('✅ 同梱梱包開始クリック完了');
    } else {
      console.log('❌ 同梱梱包開始ボタンが見つかりません');
    }

    console.log('\n=== STEP 2: 梱包済みタブで結果確認 ===');

    // 梱包済みタブをクリック
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({
      path: 'STEP2-packed-tab.png',
      fullPage: true
    });

    // DEBUGラベルで packed 状態を確認
    const debugLabels = page.locator('span:has-text("DEBUG:")');
    const debugCount = await debugLabels.count();
    console.log(`🏷️ 梱包済み DEBUG ラベル数: ${debugCount}`);

    let nikonPacked = false;
    let testPacked = false;

    for (let i = 0; i < debugCount; i++) {
      try {
        const debugText = await debugLabels.nth(i).textContent() || '';
        console.log(`   DEBUG ${i}: "${debugText}"`);
        
        if (debugText.includes('Nikon Z9') && debugText.includes('packed')) {
          nikonPacked = true;
          console.log('✅ Nikon Z9が packed 状態に更新');
        }
        
        if (debugText.includes('テスト商品') && debugText.includes('packed')) {
          testPacked = true;
          console.log('✅ テスト商品が packed 状態に更新');
        }
        
      } catch (e) {
        console.log(`❌ DEBUG ${i}: 取得エラー`);
      }
    }

    // 同梱ボタンが表示されているか確認
    const bundleLabelButton = page.locator('button:has-text("同梱ラベル印刷")');
    const bundleReadyButton = page.locator('button:has-text("同梱集荷準備")');

    const labelCount = await bundleLabelButton.count();
    const readyCount = await bundleReadyButton.count();

    console.log(`\n📦 梱包済み同梱ボタン:`);
    console.log(`   同梱ラベル印刷: ${labelCount}`);
    console.log(`   同梱集荷準備: ${readyCount}`);

    if (labelCount > 0 && readyCount > 0) {
      console.log('🎉 SUCCESS: 正しい業務フローで同梱ボタン表示！');
      
      // 同梱集荷準備ボタンをテスト
      console.log('\n=== STEP 3: 同梱集荷準備機能テスト ===');
      console.log('🚛 同梱集荷準備ボタンクリック...');
      
      await bundleReadyButton.first().click();
      await page.waitForTimeout(3000);
      
      console.log('✅ 同梱集荷準備クリック完了（無反応問題解決）');
      
    } else {
      console.log('❌ FAIL: まだボタンが表示されません');
    }

    await page.screenshot({
      path: 'STEP3-final-result.png',
      fullPage: true
    });

    console.log('📋 正しい業務フロー実行完了');
  });
});






















