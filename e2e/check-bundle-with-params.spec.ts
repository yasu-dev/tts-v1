import { test, expect } from '@playwright/test';

test.describe('同梱商品の背景色確認（特定商品）', () => {
  test('特定の同梱商品を含むページで背景色を確認', async ({ page }) => {
    console.log('🎨 同梱商品背景色確認開始（特定商品）');

    // Nikon Z9を含む出荷管理ページへ移動
    await page.goto('http://localhost:3002/staff/shipping?status=workstation&includeProductId=cmfdouvvw000tmku1yam3gnke');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // モーダルを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    console.log('\n=== 梱包待ちタブで同梱商品確認 ===');
    
    // テーブルの行を取得
    const tableRows = page.locator('tbody.holo-body tr.holo-row');
    const rowCount = await tableRows.count();
    console.log(`📦 表示された商品数: ${rowCount}件`);

    let bundleCount = 0;
    let blueBackgroundCount = 0;

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
      
      // classNameを確認
      const className = await row.getAttribute('class');
      console.log(`  クラス: ${className}`);
      
      // 同梱バッジの有無を確認
      const bundleBadge = row.locator('.bg-nexus-blue\\/20:has-text("同梱")');
      const hasBundleBadge = await bundleBadge.count() > 0;
      
      if (hasBundleBadge) {
        bundleCount++;
        console.log(`  ✅ 同梱バッジあり`);
      }
      
      // 青い背景色かチェック（bg-blue-50クラス）
      if (className && className.includes('bg-blue-50')) {
        blueBackgroundCount++;
        console.log(`  🔵 青い背景クラスが適用されています！`);
      }
      
      // 同梱グループ情報を確認
      const bundleGroupText = await row.locator('text=同梱グループ').count();
      if (bundleGroupText > 0) {
        const bundleId = await row.locator('.text-xs:has-text("同梱グループ")').textContent();
        console.log(`  📎 ${bundleId}`);
      }
      
      // Nikon Z9やFujifilm X-T5の場合は特別に確認
      if (productName && (productName.includes('Nikon Z9') || productName.includes('Fujifilm X-T5'))) {
        console.log(`  🎯 同梱対象商品です！`);
        
        // この商品は青い背景になっているべき
        if (!className?.includes('bg-blue-50')) {
          console.log(`  ❌ 警告: 同梱商品なのに青い背景が適用されていません`);
        }
      }
    }

    // 統計を表示
    console.log(`\n📊 統計:`);
    console.log(`  - 総商品数: ${rowCount}`);
    console.log(`  - 同梱バッジ付き: ${bundleCount}`);
    console.log(`  - 青い背景: ${blueBackgroundCount}`);
    
    // スクリーンショットを保存
    await page.screenshot({
      path: 'BUNDLE-PARAMS-CHECK.png',
      fullPage: true
    });

    // 結果の検証
    if (bundleCount > 0 && bundleCount === blueBackgroundCount) {
      console.log('\n✅ SUCCESS: 同梱商品に青い背景が正しく適用されています！');
    } else if (bundleCount === 0) {
      console.log('\n⚠️ 同梱商品が見つかりませんでした');
    } else {
      console.log('\n❌ 同梱商品の背景色が正しく適用されていません');
    }

    console.log('\n🎨 同梱商品背景色確認完了（特定商品）');
  });
});