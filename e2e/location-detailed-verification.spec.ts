import { test, expect } from '@playwright/test';

test.describe('ロケーション画面詳細検証', () => {
  test('ピッキングデータと青背景表示の詳細確認', async ({ page }) => {
    console.log('=== ロケーション画面詳細検証開始 ===');

    // ページアクセス
    await page.goto('http://localhost:3000/staff/location');
    await page.waitForLoadState('networkidle');

    console.log('📍 ロケーション画面にアクセス完了');

    // ピッキングリストビューに切り替え
    const shippingViewButton = page.locator('button:has-text("ピッキングリスト")');
    await expect(shippingViewButton).toBeVisible();
    await shippingViewButton.click();
    console.log('✅ ピッキングリストビューに切り替え');

    // APIレスポンス待機（長めに設定）
    await page.waitForTimeout(5000);
    console.log('⏳ ピッキングデータ読み込み待機完了');

    // ページ内容を確認
    const pageContent = await page.textContent('body');
    console.log(`📄 ページに "テストカメラ" が含まれているか: ${pageContent.includes('テストカメラ')}`);
    console.log(`📄 ページに "XYZcamera" が含まれているか: ${pageContent.includes('XYZcamera')}`);
    console.log(`📄 ページに "同梱" が含まれているか: ${pageContent.includes('同梱')}`);
    console.log(`📄 ページに "ピッキング待ち" が含まれているか: ${pageContent.includes('ピッキング待ち')}`);

    // ロケーション一覧を確認
    const locationItems = await page.locator('[class*="holo-card"]').all();
    console.log(`📍 表示されているロケーション数: ${locationItems.length}`);

    // 各ロケーションの内容を確認
    for (let i = 0; i < Math.min(locationItems.length, 5); i++) {
      const location = locationItems[i];
      const locationText = await location.textContent();
      console.log(`📍 ロケーション ${i + 1}: ${locationText?.substring(0, 200)}`);

      // 青背景要素があるかチェック
      const blueElementsInLocation = await location.locator('[class*="bg-blue"]').count();
      if (blueElementsInLocation > 0) {
        console.log(`🔵 ロケーション ${i + 1} に青背景要素 ${blueElementsInLocation}件 発見`);
      }
    }

    // 具体的に同梱商品を探す
    const bundleItems = await page.locator(':has-text("テストカメラ"), :has-text("XYZcamera"), :has-text("camera")').all();
    console.log(`📷 カメラ関連商品の要素数: ${bundleItems.length}`);

    for (let i = 0; i < bundleItems.length; i++) {
      const item = bundleItems[i];
      const itemText = await item.textContent();
      const bgStyle = await item.getAttribute('style');
      const className = await item.getAttribute('class');
      console.log(`📷 カメラ商品 ${i + 1}:`);
      console.log(`   テキスト: ${itemText?.substring(0, 100)}`);
      console.log(`   style: ${bgStyle}`);
      console.log(`   class: ${className}`);
    }

    // 最終スクリーンショット（長いページでも全体を撮影）
    await page.screenshot({
      path: 'e2e/screenshots/location-detailed-verification.png',
      fullPage: true
    });
    console.log('📸 詳細検証スクリーンショット保存完了');

    // コンソールログも確認
    page.on('console', msg => {
      if (msg.text().includes('camera') || msg.text().includes('同梱') || msg.text().includes('bundle')) {
        console.log(`🔍 ブラウザコンソール: ${msg.text()}`);
      }
    });

    console.log('✅ 詳細検証完了');
  });
});