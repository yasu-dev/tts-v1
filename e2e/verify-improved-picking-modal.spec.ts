import { test, expect } from '@playwright/test';

test.describe('改善されたピッキング確認モーダルの確認', () => {
  test('ラベル照合に適した視認性の高いUIが表示されることを確認', async ({ page }) => {
    // ロケーション管理ページを開く
    await page.goto('http://localhost:3002/staff/location');
    await page.waitForSelector('.intelligence-card', { timeout: 10000 });

    // ピッキングリストビューに切り替え
    const shippingTab = await page.$('button:has-text("ピッキングリスト")');
    if (shippingTab) {
      await shippingTab.click();
      await page.waitForTimeout(2000);
    }

    // 商品を選択してピッキング完了モーダルを開く
    const firstCheckbox = await page.$('.holo-card input[type="checkbox"]');
    if (firstCheckbox) {
      await firstCheckbox.click();
      await page.waitForTimeout(500);

      // ピッキング完了ボタンをクリック
      const pickingButton = await page.$('button:has-text("選択商品をピッキング完了")');
      if (pickingButton) {
        await pickingButton.click();
        await page.waitForTimeout(1000);

        // モーダルが開いたことを確認
        const modal = await page.$('.fixed.inset-0');
        expect(modal).toBeTruthy();

        console.log('=== ピッキング確認モーダル UI要素確認 ===');

        // 商品カード形式の確認
        const productCards = await page.$$('.space-y-4 > div[class*="relative"]');
        console.log(`商品カード数: ${productCards.length}`);

        if (productCards.length > 0) {
          // 各カードの要素を確認
          for (let i = 0; i < productCards.length; i++) {
            const card = productCards[i];

            // 商品番号バッジの確認
            const numberBadge = await card.$('.absolute.-top-2.-left-2');
            const badgeText = numberBadge ? await numberBadge.textContent() : null;
            console.log(`カード${i + 1} 番号バッジ: ${badgeText}`);

            // チェックボックスが不要（作業負荷軽減のため削除済み）であることを確認
            const checkbox = await card.$('input[type="checkbox"]');
            console.log(`カード${i + 1} チェックボックス（不要のため削除済み）: ${checkbox ? 'あり（要修正）' : '削除済み✓'}`);
            expect(checkbox).toBeNull();

            // 商品名の表示確認
            const productName = await card.$('h3');
            const nameText = productName ? await productName.textContent() : null;
            console.log(`カード${i + 1} 商品名: ${nameText}`);

            // 管理番号セクションの確認
            const managementNumberSection = await card.$('.bg-yellow-100');
            if (managementNumberSection) {
              const labelText = await managementNumberSection.$eval('.text-yellow-800', el => el.textContent);
              const numberText = await managementNumberSection.$eval('.font-mono', el => el.textContent);
              console.log(`カード${i + 1} ラベル: ${labelText}`);
              console.log(`カード${i + 1} 管理番号: ${numberText}`);
            }

            // 同梱商品の特別表示確認
            const bundleBadge = await card.$('span:has-text("同梱対象商品")');
            if (bundleBadge) {
              console.log(`カード${i + 1} 同梱商品バッジ: あり`);
            }
          }
        }

        // ラベル照合作業説明の確認
        const instructionSection = await page.$('.bg-amber-50');
        if (instructionSection) {
          const instructionTitle = await instructionSection.$eval('h4', el => el.textContent);
          console.log(`作業説明タイトル: ${instructionTitle}`);

          const steps = await instructionSection.$$('ol li');
          console.log(`確認手順ステップ数: ${steps.length}`);

          for (let i = 0; i < steps.length; i++) {
            const stepText = await steps[i].textContent();
            console.log(`ステップ${i + 1}: ${stepText}`);
          }
        }

        // スクリーンショット撮影
        await page.screenshot({
          path: 'improved-picking-modal.png',
          fullPage: false
        });

        // 基本的なアサーション
        expect(productCards.length).toBeGreaterThan(0);

        // 重要な要素の存在確認
        const hasNumberBadges = await page.$$('.absolute.-top-2.-left-2').then(badges => badges.length > 0);
        const hasNoCheckboxes = await page.$$('input[type="checkbox"]').then(boxes => boxes.length === 0);
        const hasManagementNumbers = await page.$$('.bg-yellow-100').then(sections => sections.length > 0);
        const hasInstructions = await page.$('.bg-amber-50').then(section => section !== null);

        expect(hasNumberBadges).toBe(true);
        expect(hasNoCheckboxes).toBe(true); // チェックボックスは作業負荷軽減のため削除
        expect(hasManagementNumbers).toBe(true);
        expect(hasInstructions).toBe(true);

        console.log('✅ 改善されたピッキング確認モーダルUIが正常に表示されています');

        // モーダルを閉じる
        const closeButton = await page.$('button:has-text("キャンセル")');
        if (closeButton) {
          await closeButton.click();
        }
      }
    }
  });

  test('視認性の高い表示要素が機能することを確認', async ({ page }) => {
    await page.goto('http://localhost:3002/staff/location');
    await page.waitForSelector('.intelligence-card', { timeout: 10000 });

    // ピッキングリストビューに切り替え
    const shippingTab = await page.$('button:has-text("ピッキングリスト")');
    if (shippingTab) {
      await shippingTab.click();
      await page.waitForTimeout(2000);
    }

    // 複数商品を選択
    const checkboxes = await page.$$('.holo-card input[type="checkbox"]');
    if (checkboxes.length >= 2) {
      await checkboxes[0].click();
      await checkboxes[1].click();
      await page.waitForTimeout(500);

      // ピッキング完了ボタンをクリック
      const pickingButton = await page.$('button:has-text("選択商品をピッキング完了")');
      if (pickingButton) {
        await pickingButton.click();
        await page.waitForTimeout(1000);

        // 複数商品が適切に区別されて表示されているか確認
        const productCards = await page.$$('.space-y-4 > div[class*="relative"]');
        console.log(`複数商品表示確認: ${productCards.length}枚のカード`);

        // 各カードが視覚的に区別されているか確認
        let hasDistinctColors = false;
        let hasNumberBadges = false;

        for (let i = 0; i < productCards.length; i++) {
          const card = productCards[i];

          // 背景色の違いを確認（同梱商品は青、通常商品は白）
          const cardClass = await card.getAttribute('class');
          if (cardClass && (cardClass.includes('bg-blue-50') || cardClass.includes('bg-white'))) {
            hasDistinctColors = true;
          }

          // 番号バッジの確認
          const numberBadge = await card.$('.absolute.-top-2.-left-2');
          if (numberBadge) {
            hasNumberBadges = true;
            const badgeText = await numberBadge.textContent();
            expect(badgeText).toBe(String(i + 1));
          }

          // チェックボックスが削除されていることを確認（作業負荷軽減のため）
          const checkbox = await card.$('input[type="checkbox"]');
          console.log(`カード${i + 1} チェックボックス: ${checkbox ? '存在（要修正）' : '削除済み✓'}`);
          expect(checkbox).toBeNull();
        }

        expect(hasDistinctColors).toBe(true);
        expect(hasNumberBadges).toBe(true);

        console.log('✅ 複数商品の視覚的区別と機能が正常に動作しています');

        // モーダルを閉じる
        const closeButton = await page.$('button:has-text("キャンセル")');
        if (closeButton) {
          await closeButton.click();
        }
      }
    }
  });
});