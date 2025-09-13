import { test, expect } from '@playwright/test';

test('現在の画面状態の完全検証', async ({ page }) => {
  console.log('=== 現在の画面状態の完全検証 ===');

  // 検品管理画面に移動
  console.log('1. 検品管理画面に移動');
  await page.goto('/staff/inspection');
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: 'e2e/screenshots/current-inspection-list.png',
    fullPage: true
  });

  // 検品開始ボタンをクリック
  const inspectionButtons = await page.locator('button:has-text("検品開始")').all();
  if (inspectionButtons.length > 0) {
    console.log(`2. 検品開始ボタン発見: ${inspectionButtons.length}個`);
    await inspectionButtons[0].click();
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'e2e/screenshots/current-inspection-detail.png',
      fullPage: true
    });

    // 各ステップを順番に確認
    for (let stepNum = 1; stepNum <= 4; stepNum++) {
      console.log(`3. ステップ${stepNum}の状態確認`);

      // 現在のステップでスクリーンショット
      await page.screenshot({
        path: `e2e/screenshots/current-step-${stepNum}.png`,
        fullPage: true
      });

      // ★記号の検索
      const starElements = await page.locator('text=/[★⭐]/').all();
      if (starElements.length > 0) {
        console.log(`🎯 ステップ${stepNum}で★記号を${starElements.length}個発見!`);
        for (let i = 0; i < starElements.length; i++) {
          const text = await starElements[i].textContent();
          console.log(`   ★要素 ${i + 1}: "${text}"`);
        }
      }

      // プレミアム梱包要素の検索
      const premiumElements = await page.locator('text=/プレミアム.*梱包/').all();
      if (premiumElements.length > 0) {
        console.log(`📦 ステップ${stepNum}でプレミアム梱包を${premiumElements.length}個発見`);
        for (let i = 0; i < premiumElements.length; i++) {
          const text = await premiumElements[i].textContent();
          console.log(`   プレミアム梱包 ${i + 1}: "${text}"`);
        }
      }

      // 次のステップへ進む
      const nextButton = page.locator('button:has-text("次へ")');
      const isVisible = await nextButton.isVisible().catch(() => false);

      if (isVisible && stepNum < 4) {
        await nextButton.click();
        await page.waitForTimeout(2000);
      } else if (stepNum < 4) {
        console.log(`⚠️ ステップ${stepNum}で次へボタンが見つかりません`);

        // ステップインジケーターから直接移動を試す
        const stepIndicator = page.locator(`[data-step="${stepNum + 1}"], button:nth-of-type(${stepNum + 1})`);
        const stepExists = await stepIndicator.isVisible().catch(() => false);
        if (stepExists) {
          await stepIndicator.click();
          await page.waitForTimeout(2000);
        } else {
          break;
        }
      }
    }

    console.log('4. 全ステップスクリーンショット完了');

  } else {
    console.log('❌ 検品開始ボタンが見つかりません');
  }

  console.log('=== 現在の画面状態検証完了 ===');
  console.log('📸 生成されたスクリーンショット:');
  console.log('  - current-inspection-list.png (検品管理画面)');
  console.log('  - current-inspection-detail.png (検品詳細画面)');
  console.log('  - current-step-*.png (各ステップ画面)');

  await page.waitForTimeout(2000);
});