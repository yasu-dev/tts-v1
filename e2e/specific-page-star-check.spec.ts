import { test, expect } from '@playwright/test';

test('特定ページでの★記号調査', async ({ page }) => {
  console.log('=== 特定ページでの★記号調査 ===');

  // URLから特定の検品詳細画面に移動（スクリーンショットのURL参考）
  await page.goto('/staff/inspection/cmfhxjm9r000k10em7ew565by?step=3');
  await page.waitForTimeout(5000);

  // 全体のスクリーンショット
  await page.screenshot({
    path: 'e2e/screenshots/specific-page-initial.png',
    fullPage: true
  });

  console.log('✅ ページロード完了');

  // すべての要素のテキストコンテンツを調べる
  const allElements = await page.locator('*').all();
  console.log(`🔍 全要素数: ${allElements.length}`);

  let foundStarElements = [];

  for (let i = 0; i < allElements.length; i++) {
    try {
      const element = allElements[i];
      const text = await element.textContent();

      if (text && (text.includes('★') || text.includes('⭐'))) {
        const tagName = await element.evaluate(el => el.tagName);
        const className = await element.getAttribute('class');
        const boundingBox = await element.boundingBox();

        foundStarElements.push({
          index: i,
          text: text,
          tagName: tagName,
          className: className,
          position: boundingBox
        });

        console.log(`🎯 ★要素発見 ${foundStarElements.length}:`);
        console.log(`   テキスト: "${text}"`);
        console.log(`   タグ: ${tagName}`);
        console.log(`   クラス: ${className}`);
        console.log(`   位置: x=${boundingBox?.x}, y=${boundingBox?.y}`);

        // ハイライト表示
        await element.evaluate(el => {
          el.style.border = '3px solid red';
          el.style.backgroundColor = 'yellow';
          el.style.zIndex = '9999';
        });
      }
    } catch (error) {
      // 要素が無効になった場合はスキップ
      continue;
    }
  }

  // innerHTMLを調べて★が含まれているか確認
  const bodyHTML = await page.locator('body').innerHTML();
  const starInHTML = bodyHTML.match(/[★⭐]/g);

  if (starInHTML) {
    console.log(`📝 HTML内の★記号: ${starInHTML.length}個`);
    console.log(`   記号: ${starInHTML.join(', ')}`);
  }

  console.log(`📊 総★発見数: ${foundStarElements.length}`);

  if (foundStarElements.length === 0) {
    console.log('ℹ️ このページでは★記号が見つかりませんでした');

    // プレミアム梱包関連の要素を確認
    const premiumElements = await page.locator('text=/プレミアム.*梱包/').all();
    console.log(`📦 プレミアム梱包要素: ${premiumElements.length}個`);

    for (let i = 0; i < premiumElements.length; i++) {
      const element = premiumElements[i];
      const text = await element.textContent();
      console.log(`📦 プレミアム梱包 ${i + 1}: "${text}"`);
    }
  }

  // 最終スクリーンショット
  await page.screenshot({
    path: 'e2e/screenshots/specific-page-final.png',
    fullPage: true
  });

  console.log('=== 特定ページ★記号調査完了 ===');
  await page.waitForTimeout(3000);
});