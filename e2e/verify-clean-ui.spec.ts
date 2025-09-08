import { test, expect } from '@playwright/test';

test.describe('クリーンUI確認', () => {
  test('赤いテストボタンが削除され、同梱ボタンのみ表示', async ({ page }) => {
    console.log('🧹 クリーンUI確認開始');

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 梱包済みタブをクリック
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
    }

    // 赤いテストボタンが削除されているか確認
    const redTestButton = page.locator('button:has-text("🚨 テスト")');
    const redTestCount = await redTestButton.count();
    console.log(`❌ 赤いテストボタン数: ${redTestCount}`);
    
    if (redTestCount === 0) {
      console.log('✅ SUCCESS: 赤いテストボタンは削除済み');
    } else {
      console.log('❌ FAIL: 赤いテストボタンがまだ存在');
    }

    // 同梱ボタンが表示されているか確認
    const bundleLabelButton = page.locator('button:has-text("同梱ラベル印刷")');
    const bundleReadyButton = page.locator('button:has-text("同梱集荷準備")');
    const bundleMessage = page.locator('text=同梱相手と一緒に処理');
    
    const bundleLabelCount = await bundleLabelButton.count();
    const bundleReadyCount = await bundleReadyButton.count();
    const bundleMessageCount = await bundleMessage.count();
    
    console.log(`📦 同梱ラベル印刷ボタン数: ${bundleLabelCount}`);
    console.log(`🚛 同梱集荷準備ボタン数: ${bundleReadyCount}`);
    console.log(`🔗 同梱相手メッセージ数: ${bundleMessageCount}`);
    
    // テスト結果
    if (redTestCount === 0 && bundleLabelCount > 0 && bundleReadyCount > 0 && bundleMessageCount > 0) {
      console.log('🎉 SUCCESS: クリーンな同梱UI完成！');
    } else {
      console.log('❌ FAIL: UIに問題があります');
    }

    await page.screenshot({
      path: 'CLEAN-BUNDLE-UI.png',
      fullPage: true
    });

    console.log('🧹 クリーンUI確認完了');
  });
});


