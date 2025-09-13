import { test, expect } from '@playwright/test';

test('★アイコンの徹底調査', async ({ page }) => {
  console.log('=== ★アイコンの徹底調査開始 ===');

  // 検品管理画面から開始
  await page.goto('/staff/inspection');
  await page.waitForTimeout(3000);

  // 全体のスクリーンショット
  await page.screenshot({ path: 'e2e/screenshots/star-deep-initial.png', fullPage: true });

  // すべてのテキスト要素をチェック
  const allElements = await page.locator('*').all();
  console.log(`🔍 全要素数: ${allElements.length}`);

  let starFound = 0;
  for (let i = 0; i < allElements.length; i++) {
    try {
      const element = allElements[i];
      const text = await element.textContent();

      if (text && (text.includes('★') || text.includes('⭐'))) {
        starFound++;
        console.log(`🎯 ★発見 ${starFound}: "${text}"`);

        // 要素をハイライト
        await element.evaluate(el => {
          el.style.border = '3px solid red';
          el.style.backgroundColor = 'yellow';
        });
      }
    } catch (e) {
      // 要素が無効になった場合はスキップ
      continue;
    }
  }

  console.log(`📊 ★合計発見数: ${starFound}`);

  // 検品開始ボタンをクリックして詳細画面へ
  const startButtons = page.locator('text=検品開始');
  const buttonCount = await startButtons.count();

  if (buttonCount > 0) {
    console.log('✅ 検品詳細画面に進行');
    await startButtons.first().click();
    await page.waitForTimeout(3000);

    // 詳細画面でも再度調査
    await page.screenshot({ path: 'e2e/screenshots/star-deep-detail.png', fullPage: true });

    const detailElements = await page.locator('*').all();
    let detailStarFound = 0;

    for (let i = 0; i < detailElements.length; i++) {
      try {
        const element = detailElements[i];
        const text = await element.textContent();

        if (text && (text.includes('★') || text.includes('⭐'))) {
          detailStarFound++;
          console.log(`🎯 詳細画面★発見 ${detailStarFound}: "${text}"`);

          // 要素をハイライト
          await element.evaluate(el => {
            el.style.border = '5px solid blue';
            el.style.backgroundColor = 'lime';
          });
        }
      } catch (e) {
        continue;
      }
    }

    console.log(`📊 詳細画面★合計発見数: ${detailStarFound}`);

    // ステップ進行テスト
    let currentStepNum = 1;
    while (currentStepNum <= 5) {
      console.log(`🔄 ステップ ${currentStepNum} で★調査`);

      await page.screenshot({
        path: `e2e/screenshots/star-deep-step-${currentStepNum}.png`,
        fullPage: true
      });

      // 次へボタンを探してクリック
      const nextButton = page.locator('button:has-text("次へ")').first();
      const isVisible = await nextButton.isVisible().catch(() => false);

      if (isVisible) {
        console.log(`➡️ ステップ ${currentStepNum} → ${currentStepNum + 1}`);
        await nextButton.click();
        await page.waitForTimeout(2000);
        currentStepNum++;
      } else {
        console.log(`⏸️ ステップ ${currentStepNum} で終了`);
        break;
      }
    }
  }

  // 最終ハイライトスクリーンショット
  await page.screenshot({ path: 'e2e/screenshots/star-deep-final.png', fullPage: true });

  console.log('=== ★アイコン徹底調査完了 ===');
  console.log('📸 生成されたスクリーンショット:');
  console.log('  - star-deep-initial.png (初期画面)');
  console.log('  - star-deep-detail.png (詳細画面)');
  console.log('  - star-deep-step-*.png (各ステップ)');
  console.log('  - star-deep-final.png (最終状態)');

  await page.waitForTimeout(3000);
});