import { test, expect } from '@playwright/test';

test.describe('同梱商品の背景色確認', () => {
  test('梱包待ちタブで同梱商品の背景色を確認', async ({ page }) => {
    console.log('🎨 同梱商品背景色確認開始');

    // 出荷管理ページへ移動
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // モーダルを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    console.log('\n=== 梱包待ちタブ確認 ===');
    
    // 梱包待ちタブをクリック
    const workstationTab = page.locator('button:has-text("梱包待ち")');
    if (await workstationTab.count() > 0) {
      await workstationTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ 梱包待ちタブクリック成功');
    }

    // テーブルの行を取得
    const tableRows = page.locator('tbody.holo-body tr.holo-row');
    const rowCount = await tableRows.count();
    console.log(`📦 表示された商品数: ${rowCount}件`);

    // 各行の背景色を確認
    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);
      
      // 商品名を取得
      const productName = await row.locator('.font-semibold').first().textContent();
      console.log(`\n商品 ${i + 1}: ${productName}`);
      
      // 背景色のスタイルを取得
      const backgroundColor = await row.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log(`  背景色: ${backgroundColor}`);
      
      // 同梱バッジの有無を確認
      const bundleBadge = row.locator('.bg-nexus-blue\\/20:has-text("同梱")');
      const hasBundleBadge = await bundleBadge.count() > 0;
      
      if (hasBundleBadge) {
        console.log(`  ✅ 同梱バッジあり`);
        
        // 同梱商品の背景色が青いかチェック
        const isBlueBackground = backgroundColor.includes('rgb(59, 130, 246)') || 
                                 backgroundColor.includes('rgba(59, 130, 246') ||
                                 backgroundColor.includes('blue');
        
        if (isBlueBackground) {
          console.log(`  🔵 青い背景色が適用されています！`);
        } else {
          console.log(`  ⚪ 通常の背景色です`);
        }
      }
      
      // 同梱関連のボタンを確認
      const bundlePackingBtn = row.locator('button:has-text("同梱梱包開始")');
      const hasBundleButton = await bundlePackingBtn.count() > 0;
      
      if (hasBundleButton) {
        console.log(`  📦 同梱梱包開始ボタンあり`);
      }
      
      // テスト商品メッセージを確認
      const bundleMessage = row.locator('span:has-text("同梱相手と一緒に処理されます")');
      const hasMessage = await bundleMessage.count() > 0;
      
      if (hasMessage) {
        console.log(`  📝 同梱メッセージあり`);
        
        // メッセージの背景色も確認
        const msgBgColor = await bundleMessage.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });
        console.log(`  メッセージ背景色: ${msgBgColor}`);
      }
    }

    // スクリーンショットを保存
    await page.screenshot({
      path: 'BUNDLE-BACKGROUND-CHECK.png',
      fullPage: true
    });
    
    console.log('\n=== 梱包済みタブ確認 ===');
    
    // 梱包済みタブをクリック
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ 梱包済みタブクリック成功');
    }

    // 梱包済みタブの行も確認
    const packedRows = page.locator('tbody.holo-body tr.holo-row');
    const packedCount = await packedRows.count();
    console.log(`📦 梱包済み商品数: ${packedCount}件`);

    for (let i = 0; i < Math.min(packedCount, 3); i++) {
      const row = packedRows.nth(i);
      const productName = await row.locator('.font-semibold').first().textContent();
      const backgroundColor = await row.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      console.log(`\n商品: ${productName}`);
      console.log(`  背景色: ${backgroundColor}`);
    }

    console.log('\n🎨 同梱商品背景色確認完了');
  });
});