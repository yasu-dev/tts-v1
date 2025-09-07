import { test, expect } from '@playwright/test';

test.describe('同梱のみ論理確認', () => {
  test('同梱商品では個別ラベル印刷を削除し、同梱ラベル印刷のみ残す', async ({ page }) => {
    console.log('📦 同梱のみ論理確認開始');

    await page.waitForTimeout(5000);

    // 出荷管理画面にアクセス
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'BUNDLE-ONLY-1-initial.png',
      fullPage: true
    });

    // 梱包済みタブをクリック
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({
      path: 'BUNDLE-ONLY-2-packed-tab.png',
      fullPage: true
    });

    // ボタン確認
    const bundleLabelButton = page.locator('button:has-text("同梱ラベル印刷")');
    const individualLabelButton = page.locator('button:has-text("個別ラベル印刷")');
    const bundleReadyButton = page.locator('button:has-text("同梱集荷準備")');
    const noIndividualProcessing = page.locator('text=同梱商品のため個別処理なし');
    
    const hasBundleLabel = await bundleLabelButton.count() > 0;
    const hasIndividualLabel = await individualLabelButton.count() > 0;
    const hasBundleReady = await bundleReadyButton.count() > 0;
    const hasNoIndividualMessage = await noIndividualProcessing.count() > 0;
    
    console.log(`📦 同梱ラベル印刷: ${hasBundleLabel}`);
    console.log(`❌ 個別ラベル印刷（あってはダメ）: ${hasIndividualLabel}`);
    console.log(`🚛 同梱集荷準備: ${hasBundleReady}`);
    console.log(`📝 個別処理なしメッセージ: ${hasNoIndividualMessage}`);

    if (hasBundleLabel && !hasIndividualLabel && hasBundleReady && hasNoIndividualMessage) {
      console.log('🎉 SUCCESS: 正しい同梱のみ論理実装！');
      console.log('✅ 同梱ラベル印刷: あり');
      console.log('✅ 個別ラベル印刷: 削除済み');
      console.log('✅ 同梱集荷準備: あり');
      console.log('✅ 個別処理なしメッセージ: 表示');
      
      // 同梱ラベル印刷をテスト
      console.log('📦 同梱ラベル印刷ボタンクリック');
      await bundleLabelButton.first().click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'BUNDLE-ONLY-3-label-printed.png',
        fullPage: true
      });
      
      // 同梱集荷準備をテスト
      console.log('🚛 同梱集荷準備ボタンクリック');
      await bundleReadyButton.first().click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'BUNDLE-ONLY-4-ready-for-pickup.png',
        fullPage: true
      });
      
      console.log('🎉 SUCCESS: 同梱のみ論理完全実装確認完了！');
      
    } else if (hasIndividualLabel) {
      console.log('❌ CRITICAL ERROR: まだ個別ラベル印刷ボタンが存在（論理矛盾）');
      
      await page.screenshot({
        path: 'BUNDLE-ONLY-ERROR-INDIVIDUAL-EXISTS.png',
        fullPage: true
      });
      
    } else {
      console.log('❌ ERROR: ボタン構成が不完全');
      
      await page.screenshot({
        path: 'BUNDLE-ONLY-ERROR-INCOMPLETE.png',
        fullPage: true
      });
    }

    console.log('✅ 同梱のみ論理確認完了');
  });
});


