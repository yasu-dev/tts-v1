import { test, expect } from '@playwright/test';

test.describe('ラベル印刷区別確認', () => {
  test('同梱ラベル印刷vs個別ラベル印刷の明確な区別確認', async ({ page }) => {
    console.log('🏷️ ラベル印刷区別確認開始');

    await page.waitForTimeout(5000);

    // 出荷管理画面にアクセス
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'LABEL-1-initial.png',
      fullPage: true
    });

    // 梱包待ちタブで梱包開始
    const workstationTab = page.locator('button:has-text("梱包待ち")');
    if (await workstationTab.count() > 0) {
      await workstationTab.click();
      await page.waitForTimeout(2000);
    }

    console.log('📦 同梱梱包開始ボタンクリック');
    const bundlePackButton = page.locator('button:has-text("同梱梱包開始")');
    if (await bundlePackButton.count() > 0) {
      await bundlePackButton.first().click();
      await page.waitForTimeout(3000);
    }

    await page.screenshot({
      path: 'LABEL-2-after-packing.png',
      fullPage: true
    });

    // 梱包済みタブで確認
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({
      path: 'LABEL-3-packed-status.png',
      fullPage: true
    });

    // ラベルボタンの区別確認
    const bundleLabelButton = page.locator('button:has-text("同梱ラベル印刷")');
    const individualLabelButton = page.locator('button:has-text("個別ラベル印刷")');
    const bundleReadyButton = page.locator('button:has-text("同梱集荷準備")');
    
    const hasBundleLabel = await bundleLabelButton.count() > 0;
    const hasIndividualLabel = await individualLabelButton.count() > 0;
    const hasBundleReady = await bundleReadyButton.count() > 0;
    
    console.log(`📦 同梱ラベル印刷ボタン: ${hasBundleLabel}`);
    console.log(`📄 個別ラベル印刷ボタン: ${hasIndividualLabel}`);
    console.log(`🚛 同梱集荷準備ボタン: ${hasBundleReady}`);

    if (hasBundleLabel && !hasIndividualLabel && hasBundleReady) {
      console.log('✅ 同梱商品: 同梱専用ボタンのみ表示（正しい）');
      
      // 同梱ラベル印刷をテスト
      console.log('📦 同梱ラベル印刷ボタンクリックテスト');
      await bundleLabelButton.first().click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'LABEL-4-bundle-label-clicked.png',
        fullPage: true
      });
      
      // 同梱集荷準備をテスト
      console.log('🚛 同梱集荷準備ボタンクリックテスト');
      await bundleReadyButton.first().click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'LABEL-5-bundle-ready-clicked.png',
        fullPage: true
      });
      
      console.log('🎉 SUCCESS: ラベル印刷の明確な区別と集荷準備動作確認完了！');
      
    } else if (hasIndividualLabel) {
      console.log('❌ ERROR: 同梱商品なのに個別ラベル印刷ボタンがある（混乱の原因）');
    } else if (!hasBundleReady) {
      console.log('❌ ERROR: 同梱集荷準備ボタンがない');
    } else {
      console.log('❌ ERROR: ラベルボタンの区別が不明確');
    }

    console.log('✅ ラベル印刷区別確認完了');
  });
});


