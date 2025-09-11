import { test, expect } from '@playwright/test';

test.describe('安定版状態確認', () => {
  test('現在の安定版で同梱商品とボタン状況確認', async ({ page }) => {
    console.log('📋 安定版状態確認開始');

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // モーダルを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // 梱包済みタブをクリック
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
    }

    // 現在の同梱ボタン状況
    const bundleLabelButton = page.locator('button:has-text("同梱ラベル印刷")');
    const bundleReadyButton = page.locator('button:has-text("同梱集荷準備")');
    const individualLabelButton = page.locator('button:has-text("個別ラベル印刷")');

    const bundleLabelCount = await bundleLabelButton.count();
    const bundleReadyCount = await bundleReadyButton.count();
    const individualCount = await individualLabelButton.count();

    console.log(`📦 安定版状態:`);
    console.log(`   同梱ラベル印刷: ${bundleLabelCount}`);
    console.log(`   同梱集荷準備: ${bundleReadyCount}`);
    console.log(`   個別ラベル印刷: ${individualCount}`);

    // 梱包待ちタブも確認
    const workstationTab = page.locator('button:has-text("梱包待ち")');
    if (await workstationTab.count() > 0) {
      await workstationTab.click();
      await page.waitForTimeout(2000);
    }

    const bundlePackingButton = page.locator('button:has-text("同梱梱包開始")');
    const packingCount = await bundlePackingButton.count();
    console.log(`📦 梱包待ち 同梱梱包開始: ${packingCount}`);

    await page.screenshot({
      path: 'STABLE-STATE-CHECK.png',
      fullPage: true
    });

    console.log('📋 安定版状態確認完了');
  });
});















