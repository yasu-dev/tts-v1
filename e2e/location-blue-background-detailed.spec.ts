import { test, expect } from '@playwright/test';

test.describe('ロケーション画面の同梱商品青背景詳細テスト', () => {
  test('ピッキングリストで青背景が正しく表示されることを確認', async ({ page }) => {
    console.log('=== ロケーション画面詳細テスト開始 ===');

    await page.goto('http://localhost:3000/staff/location');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('📍 ロケーション画面にアクセス完了');

    // ピッキングリストビューに切り替え
    const shippingViewButton = page.locator('button:has-text("ピッキングリスト")');
    await expect(shippingViewButton).toBeVisible();
    await shippingViewButton.click();
    console.log('✅ ピッキングリストビューに切り替え完了');

    await page.waitForTimeout(3000); // ピッキングデータの読み込み待機

    // スクリーンショット撮影
    await page.screenshot({ path: 'e2e/screenshots/location-picking-view.png', fullPage: true });
    console.log('📸 ピッキングリスト表示のスクリーンショット保存');

    // 青背景の要素を詳細検索
    const blueElements = await page.locator('[class*="bg-blue"]').all();
    console.log(`🔍 青背景要素数: ${blueElements.length}件`);

    // 青背景要素の詳細情報を取得
    for (let i = 0; i < Math.min(blueElements.length, 10); i++) {
      const element = blueElements[i];
      const textContent = await element.textContent();
      const className = await element.getAttribute('class');
      console.log(`📦 青背景要素 ${i + 1}: "${textContent?.substring(0, 50)}..." - class: ${className}`);
    }

    // 同梱商品の具体的な要素を検索
    const bundleItems = await page.locator('[class*="bg-blue"]:has-text("XYZcamera"), [class*="bg-blue"]:has-text("テストカメラ"), [class*="bg-blue"]:has-text("camera")').all();
    console.log(`📷 同梱対象カメラ商品の青背景要素: ${bundleItems.length}件`);

    for (let i = 0; i < bundleItems.length; i++) {
      const item = bundleItems[i];
      const text = await item.textContent();
      console.log(`📷 カメラ商品 ${i + 1}: ${text?.substring(0, 100)}`);
    }

    // 同梱バッジも確認
    const bundleBadges = await page.locator(':has-text("同梱")').all();
    console.log(`🏷️ 同梱バッジ数: ${bundleBadges.length}件`);

    // 同梱情報の詳細表示部分を確認
    const bundleInfo = await page.locator(':has-text("追跡番号"), :has-text("同梱相手"), :has-text("BUNDLE")').all();
    console.log(`📋 同梱情報表示部分: ${bundleInfo.length}件`);

    console.log('\n=== 詳細テスト結果 ===');
    console.log(`総青背景要素: ${blueElements.length}件`);
    console.log(`カメラ商品青背景: ${bundleItems.length}件`);
    console.log(`同梱バッジ: ${bundleBadges.length}件`);
    console.log(`同梱情報: ${bundleInfo.length}件`);

    // 最終スクリーンショット
    await page.screenshot({ path: 'e2e/screenshots/location-final-check.png', fullPage: true });
    console.log('📸 最終確認スクリーンショット保存完了');
  });
});