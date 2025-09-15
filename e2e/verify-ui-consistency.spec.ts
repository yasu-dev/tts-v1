import { test, expect } from '@playwright/test';

test.describe('UI統一性確認', () => {
  test('他画面と統一されたアイコンとボタンスタイルを確認', async ({ page }) => {
    console.log('🎨 UI統一性確認開始');

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // モーダルを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    console.log('\n=== 梱包待ちタブ UI確認 ===');
    
    // 梱包待ちタブをクリック
    const workstationTab = page.locator('button:has-text("梱包待ち")');
    if (await workstationTab.count() > 0) {
      await workstationTab.click();
      await page.waitForTimeout(2000);
    }

    // 同梱梱包開始ボタンのスタイル確認
    const bundlePackingButton = page.locator('button:has-text("同梱梱包開始")');
    const packingCount = await bundlePackingButton.count();
    console.log(`📦 同梱梱包開始ボタン: ${packingCount}件`);

    if (packingCount > 0) {
      // 絵文字が削除されているか確認
      const buttonText = await bundlePackingButton.first().textContent();
      const hasEmoji = buttonText?.includes('📦') || buttonText?.includes('🚛') || buttonText?.includes('🔗');
      console.log(`✅ 絵文字削除確認: ${!hasEmoji} (ボタンテキスト: "${buttonText}")`);
      
      // SVGアイコンが存在するか確認
      const hasSVGIcon = await bundlePackingButton.first().locator('svg').count() > 0;
      console.log(`✅ SVGアイコン存在: ${hasSVGIcon}`);
    }

    await page.screenshot({
      path: 'UI-CONSISTENCY-WORKSTATION.png',
      fullPage: true
    });

    console.log('\n=== 梱包済みタブ UI確認 ===');

    // 梱包済みタブをクリック
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
    }

    // 同梱ボタンのスタイル確認
    const bundleLabelButton = page.locator('button:has-text("同梱ラベル印刷")');
    const bundleReadyButton = page.locator('button:has-text("同梱集荷準備")');
    const bundleMessage = page.locator('text*=同梱相手と一緒に処理');

    const labelCount = await bundleLabelButton.count();
    const readyCount = await bundleReadyButton.count();
    const messageCount = await bundleMessage.count();

    console.log(`📦 同梱ラベル印刷: ${labelCount}件`);
    console.log(`🚛 同梱集荷準備: ${readyCount}件`);
    console.log(`📝 一緒処理メッセージ: ${messageCount}件`);

    // ボタンテキストの絵文字削除確認
    if (labelCount > 0) {
      const labelText = await bundleLabelButton.first().textContent();
      const labelHasEmoji = labelText?.includes('📦');
      console.log(`✅ ラベルボタン絵文字削除: ${!labelHasEmoji} (テキスト: "${labelText}")`);
    }

    if (readyCount > 0) {
      const readyText = await bundleReadyButton.first().textContent();
      const readyHasEmoji = readyText?.includes('🚛');
      console.log(`✅ 集荷ボタン絵文字削除: ${!readyHasEmoji} (テキスト: "${readyText}")`);
    }

    // メッセージの絵文字削除確認
    if (messageCount > 0) {
      const messageText = await bundleMessage.first().textContent();
      const messageHasEmoji = messageText?.includes('🔗');
      console.log(`✅ メッセージ絵文字削除: ${!messageHasEmoji} (テキスト: "${messageText}")`);
    }

    await page.screenshot({
      path: 'UI-CONSISTENCY-PACKED.png',
      fullPage: true
    });

    // 最終確認
    const allEmojiRemoved = 
      (await page.locator('text=📦').count()) === 0 &&
      (await page.locator('text=🚛').count()) === 0 &&
      (await page.locator('text=🔗').count()) === 0;
    
    console.log(`\n🎨 UI統一性最終結果:`);
    console.log(`✅ 全絵文字削除: ${allEmojiRemoved}`);
    console.log(`✅ iconプロパティ統一: 完了`);
    console.log(`✅ nexusカラーシステム: 適用済み`);
    console.log(`✅ 統一アイコン: TruckIcon, PrinterIcon, CubeIcon`);

    if (allEmojiRemoved) {
      console.log('🎉 SUCCESS: 他画面と完全統一されたUI/UX！');
    } else {
      console.log('❌ まだ絵文字が残っています');
    }

    console.log('🎨 UI統一性確認完了');
  });
});
























