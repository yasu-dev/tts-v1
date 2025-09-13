import { test, expect } from '@playwright/test';

test('プレミアム梱包リクエストの★を特定', async ({ page }) => {
  console.log('=== プレミアム梱包リクエストの★特定 ===');

  // 検品詳細画面に移動
  await page.goto('/staff/inspection/cmfhxjm9r000k10em7ew565by?step=3');
  await page.waitForTimeout(4000);

  // 全体のスクリーンショット
  await page.screenshot({
    path: 'e2e/screenshots/premium-star-initial.png',
    fullPage: true
  });

  // ⭐を含む要素を探す
  const starElements = await page.locator('text=/⭐|★/').all();
  console.log(`🔍 ⭐/★を含む要素を${starElements.length}個発見`);

  for (let i = 0; i < starElements.length; i++) {
    const element = starElements[i];
    const text = await element.textContent();
    const boundingBox = await element.boundingBox();

    console.log(`📍 ⭐要素 ${i + 1}: "${text}"`);
    console.log(`   位置: x=${boundingBox?.x}, y=${boundingBox?.y}`);

    // ⭐を含む要素をハイライト
    await element.evaluate(el => {
      el.style.border = '3px solid red';
      el.style.backgroundColor = 'yellow';
      el.style.zIndex = '9999';
    });
  }

  // プレミアム梱包を含む要素を探す
  const premiumElements = await page.locator('text=/プレミアム梱包/').all();
  console.log(`📦 プレミアム梱包要素を${premiumElements.length}個発見`);

  for (let i = 0; i < premiumElements.length; i++) {
    const element = premiumElements[i];
    const text = await element.textContent();
    console.log(`📦 プレミアム梱包要素 ${i + 1}: "${text}"`);

    // プレミアム梱包要素をハイライト
    await element.evaluate(el => {
      el.style.border = '3px solid blue';
      el.style.backgroundColor = 'lightblue';
      el.style.zIndex = '9998';
    });
  }

  // ハイライト後のスクリーンショット
  await page.screenshot({
    path: 'e2e/screenshots/premium-star-highlighted.png',
    fullPage: true
  });

  // 親要素を探す
  for (let i = 0; i < starElements.length; i++) {
    const element = starElements[i];
    const parent = element.locator('..').first();
    const parentText = await parent.textContent();
    console.log(`👆 ⭐要素 ${i + 1} の親要素: "${parentText}"`);
  }

  console.log('=== プレミアム梱包リクエストの★特定完了 ===');
  await page.waitForTimeout(3000);
});