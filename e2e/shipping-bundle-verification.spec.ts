import { test, expect } from '@playwright/test';

test.describe('出荷管理 同梱商品表示確認', () => {
  test('出荷管理画面で同梱商品が青い背景で表示されるか確認', async ({ page }) => {
    console.log('🔍 出荷管理画面の同梱商品表示を確認');

    // 出荷管理画面にアクセス
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // スクリーンショット
    await page.screenshot({
      path: 'shipping-bundle-check-1.png',
      fullPage: true
    });

    // 梱包待ちタブをクリック
    const workstationTab = page.locator('button:has-text("梱包待ち")').first();
    const tabCount = await workstationTab.count();
    console.log(`梱包待ちタブ数: ${tabCount}`);

    if (tabCount > 0) {
      await workstationTab.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'shipping-bundle-check-2-workstation.png',
        fullPage: true
      });
    }

    // 青い背景の要素を探す
    const blueBackgrounds = page.locator('.bg-blue-50, .bg-blue-100, [class*="bg-blue"]');
    const blueCount = await blueBackgrounds.count();
    console.log(`🔵 青い背景要素数: ${blueCount}`);

    // TESTカメラを探す
    const testCameraElements = page.locator('*:has-text("TESTカメラ")');
    const testCameraCount = await testCameraElements.count();
    console.log(`📦 TESTカメラ要素数: ${testCameraCount}`);

    // 各TESTカメラ要素の詳細を確認
    for (let i = 0; i < Math.min(testCameraCount, 5); i++) {
      const element = testCameraElements.nth(i);
      const text = await element.textContent();
      console.log(`TESTカメラ ${i + 1}: ${text?.slice(0, 100)}`);

      // 親要素のクラスを確認
      const parent = element.locator('..');
      const parentClass = await parent.getAttribute('class');
      console.log(`  親要素クラス: ${parentClass}`);

      // 青い背景かチェック
      const hasBlueBackground = parentClass?.includes('blue');
      console.log(`  青い背景: ${hasBlueBackground ? 'Yes' : 'No'}`);
    }

    // 同梱バッジを探す
    const bundleBadges = page.locator('*:has-text("同梱")');
    const bundleBadgeCount = await bundleBadges.count();
    console.log(`🏷️ 同梱バッジ数: ${bundleBadgeCount}`);

    // テーブル行を確認
    const tableRows = page.locator('tbody tr, .holo-row');
    const rowCount = await tableRows.count();
    console.log(`📊 テーブル行数: ${rowCount}`);

    // 各行のクラスを確認
    for (let i = 0; i < Math.min(rowCount, 10); i++) {
      const row = tableRows.nth(i);
      const rowClass = await row.getAttribute('class');
      const rowText = await row.textContent();

      if (rowText?.includes('TESTカメラ')) {
        console.log(`行 ${i + 1} (TESTカメラ): クラス="${rowClass}"`);
        const hasBlue = rowClass?.includes('blue');
        console.log(`  青い背景: ${hasBlue ? '✅' : '❌'}`);
      }
    }

    // 最終スクリーンショット
    await page.screenshot({
      path: 'shipping-bundle-check-final.png',
      fullPage: true
    });

    // アサーション
    if (testCameraCount > 0) {
      console.log(`\n📊 結果サマリー:`);
      console.log(`- TESTカメラ表示数: ${testCameraCount}`);
      console.log(`- 青い背景要素数: ${blueCount}`);
      console.log(`- 同梱バッジ数: ${bundleBadgeCount}`);

      if (blueCount === 0) {
        console.log('❌ 警告: 青い背景が表示されていません！');
      }
      if (bundleBadgeCount === 0) {
        console.log('❌ 警告: 同梱バッジが表示されていません！');
      }
    } else {
      console.log('⚠️ TESTカメラが表示されていません');
    }
  });
});