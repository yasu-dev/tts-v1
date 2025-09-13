import { test, expect } from '@playwright/test';

test('★アイコンの残存箇所を特定', async ({ page }) => {
  console.log('=== ★アイコンの残存箇所特定テスト ===');

  // 検品詳細画面に移動
  console.log('✅ 検品詳細画面に移動して★を探す');
  await page.goto('/staff/inspection/cmfhxjm9r000k10em7ew565by');
  await page.waitForTimeout(4000);

  // 全体のスクリーンショット
  await page.screenshot({ path: 'e2e/screenshots/star-hunt-initial.png', fullPage: true });

  // ★を含むテキストを探す
  const starElements = await page.locator('text=/★/').all();
  console.log(`🔍 ★を含む要素を${starElements.length}個発見`);

  for (let i = 0; i < starElements.length; i++) {
    const element = starElements[i];
    const text = await element.textContent();
    const boundingBox = await element.boundingBox();

    console.log(`📍 ★要素 ${i + 1}: "${text}"`);
    console.log(`   位置: x=${boundingBox?.x}, y=${boundingBox?.y}`);

    // ★を含む要素をハイライト
    await element.evaluate(el => {
      el.style.border = '3px solid red';
      el.style.backgroundColor = 'yellow';
    });
  }

  // ハイライト後のスクリーンショット
  await page.screenshot({ path: 'e2e/screenshots/star-hunt-highlighted.png', fullPage: true });

  // ★写真撮影を含む要素を特定で探す
  const photoElements = await page.locator('text=/★.*写真/').all();
  console.log(`📷 ★写真撮影を含む要素を${photoElements.length}個発見`);

  for (let i = 0; i < photoElements.length; i++) {
    const element = photoElements[i];
    const text = await element.textContent();
    console.log(`📸 写真関連★要素 ${i + 1}: "${text}"`);
  }

  // 進行ステップ系の要素も探す
  const stepElements = await page.locator('[class*="step"], [class*="progress"], [class*="workflow"]').all();
  console.log(`🔄 ステップ関連要素を${stepElements.length}個発見`);

  for (let i = 0; i < stepElements.length; i++) {
    const element = stepElements[i];
    const text = await element.textContent();
    if (text && text.includes('★')) {
      console.log(`🎯 ★を含むステップ要素: "${text}"`);
      await element.evaluate(el => {
        el.style.border = '5px solid blue';
      });
    }
  }

  // 最終スクリーンショット
  await page.screenshot({ path: 'e2e/screenshots/star-hunt-final.png', fullPage: true });

  console.log('=== ★アイコン特定完了 ===');
  console.log('📸 生成されたスクリーンショット:');
  console.log('  - star-hunt-initial.png (初期状態)');
  console.log('  - star-hunt-highlighted.png (★要素ハイライト)');
  console.log('  - star-hunt-final.png (最終状態)');

  // 確認用に5秒待機
  await page.waitForTimeout(5000);
});