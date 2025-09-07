import { test, expect } from '@playwright/test';

test.describe('正しい業務フロー確認', () => {
  test('梱包待ち→梱包済みの正しい業務フロー検証', async ({ page }) => {
    console.log('📋 正しい業務フロー検証開始');

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // モーダルを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    console.log('\n=== 梱包待ちタブ検証 ===');
    
    // 梱包待ちタブをクリック
    const workstationTab = page.locator('button:has-text("梱包待ち")');
    if (await workstationTab.count() > 0) {
      await workstationTab.click();
      await page.waitForTimeout(2000);
    }

    // 梱包待ちでの表示確認
    const bundlePackingButton = page.locator('button:has-text("同梱梱包開始")');
    const bundleLabelButton = page.locator('button:has-text("同梱ラベル印刷")');
    const bundleReadyButton = page.locator('button:has-text("同梱集荷準備")');

    const packingCount = await bundlePackingButton.count();
    const labelCount = await bundleLabelButton.count();
    const readyCount = await bundleReadyButton.count();

    console.log(`📦 梱包待ちタブ:`);
    console.log(`   同梱梱包開始: ${packingCount} (期待: 1以上)`);
    console.log(`   同梱ラベル印刷: ${labelCount} (期待: 0)`);
    console.log(`   同梱集荷準備: ${readyCount} (期待: 0)`);

    const workstationCorrect = packingCount > 0 && labelCount === 0 && readyCount === 0;
    
    if (workstationCorrect) {
      console.log('✅ 梱包待ちタブ: 正しい業務フロー');
    } else {
      console.log('❌ 梱包待ちタブ: 業務フロー違反');
    }

    await page.screenshot({
      path: 'WORKSTATION-WORKFLOW.png',
      fullPage: true
    });

    console.log('\n=== 梱包済みタブ検証 ===');

    // 梱包済みタブをクリック
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
    }

    // 梱包済みでの表示確認
    const packedPackingButton = page.locator('button:has-text("同梱梱包開始")');
    const packedLabelButton = page.locator('button:has-text("同梱ラベル印刷")');
    const packedReadyButton = page.locator('button:has-text("同梱集荷準備")');

    const packedPackingCount = await packedPackingButton.count();
    const packedLabelCount = await packedLabelButton.count();
    const packedReadyCount = await packedReadyButton.count();

    console.log(`📦 梱包済みタブ:`);
    console.log(`   同梱梱包開始: ${packedPackingCount} (期待: 0)`);
    console.log(`   同梱ラベル印刷: ${packedLabelCount} (期待: 1以上)`);
    console.log(`   同梱集荷準備: ${packedReadyCount} (期待: 1以上)`);

    const packedCorrect = packedPackingCount === 0 && packedLabelCount > 0 && packedReadyCount > 0;
    
    if (packedCorrect) {
      console.log('✅ 梱包済みタブ: 正しい業務フロー');
    } else {
      console.log('❌ 梱包済みタブ: 業務フロー違反');
    }

    await page.screenshot({
      path: 'PACKED-WORKFLOW.png',
      fullPage: true
    });

    // ボタンクリック機能テスト
    if (packedReadyCount > 0) {
      console.log('\n=== 同梱集荷準備ボタン機能テスト ===');
      console.log('🚛 同梱集荷準備ボタンをクリックします...');
      
      await packedReadyButton.first().click();
      await page.waitForTimeout(3000);
      
      console.log('✅ 同梱集荷準備ボタンクリック完了（エラーなし）');
    }

    // 最終結果
    const overallSuccess = workstationCorrect && packedCorrect;
    
    console.log(`\n🏆 最終結果:`);
    if (overallSuccess) {
      console.log('✅ 完璧な業務フロー実装！');
      console.log('✅ 梱包待ち: 同梱梱包開始のみ');
      console.log('✅ 梱包済み: 同梱ラベル印刷 + 同梱集荷準備');
    } else {
      console.log('❌ 業務フロー改善が必要');
    }

    console.log('📋 正しい業務フロー検証完了');
  });
});

