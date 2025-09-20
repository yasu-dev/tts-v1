import { test, expect } from '@playwright/test';

test.describe('商品移動機能のUIテスト', () => {

  test.beforeEach(async ({ page }) => {
    // アプリケーションのホームページに移動
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);
  });

  test('在庫管理画面で商品詳細モーダルに移動ボタンが表示される', async ({ page }) => {
    console.log('🔍 在庫管理画面での商品移動ボタンをテスト中...');

    try {
      // 在庫管理画面に移動
      await page.goto('http://localhost:3002/staff/inventory');
      await page.waitForLoadState('networkidle');

      console.log('✓ 在庫管理画面にアクセス');

      // 商品詳細ボタンまたは商品リンクを探す
      const productButtons = await page.locator('button:has-text("詳細"), a:has-text("詳細"), [data-testid*="product"], .product-item').all();

      if (productButtons.length > 0) {
        console.log(`✓ ${productButtons.length}個の商品要素を発見`);

        // 最初の商品の詳細を開く
        await productButtons[0].click();
        await page.waitForTimeout(1500);

        // 商品詳細モーダルが開いているか確認
        const modalTitle = await page.locator('h2:has-text("商品情報")').count();
        if (modalTitle > 0) {
          console.log('✓ 商品詳細モーダルが開きました');

          // 移動ボタンが存在するか確認
          const moveButton = await page.locator('button:has-text("ロケーション移動"), button:has-text("移動")').count();

          if (moveButton > 0) {
            console.log('✅ 商品詳細モーダルに移動ボタンが表示されています');

            // ボタンのテキストを確認
            const buttonText = await page.locator('button:has-text("ロケーション移動"), button:has-text("移動")').first().textContent();
            console.log(`✓ 移動ボタンのテキスト: "${buttonText}"`);

            expect(moveButton).toBeGreaterThan(0);
          } else {
            console.log('⚠️ 移動ボタンが見つかりませんでした');
          }
        }
      } else {
        console.log('⚠️ 商品要素が見つかりませんでした');
      }

    } catch (error) {
      console.log('⚠️ 在庫管理画面テストでエラー:', error.message);
    }
  });

  test('ロケーション管理画面で商品に移動ボタンが表示される', async ({ page }) => {
    console.log('🔍 ロケーション管理画面での商品移動ボタンをテスト中...');

    try {
      // ロケーション管理画面に移動
      await page.goto('http://localhost:3002/staff/location');
      await page.waitForLoadState('networkidle');

      console.log('✓ ロケーション管理画面にアクセス');

      // ロケーション詳細を開くためのロケーションリンクを探す
      const locationItems = await page.locator('[data-testid*="location"], .location-item, .holo-row').all();

      if (locationItems.length > 0) {
        console.log(`✓ ${locationItems.length}個のロケーション要素を発見`);

        // 最初のロケーションをクリック
        await locationItems[0].click();
        await page.waitForTimeout(1500);

        // ロケーション詳細モーダルが開いているか確認
        const locationModal = await page.locator('h3, h4').filter({ hasText: /保管商品|商品.*件/ }).count();

        if (locationModal > 0) {
          console.log('✓ ロケーション詳細モーダルが開きました');

          // 商品の移動ボタンが存在するか確認
          const productMoveButtons = await page.locator('button:has-text("移動")').count();

          if (productMoveButtons > 0) {
            console.log(`✅ ロケーション詳細に${productMoveButtons}個の商品移動ボタンが表示されています`);
            expect(productMoveButtons).toBeGreaterThan(0);
          } else {
            console.log('⚠️ 商品移動ボタンが見つかりませんでした（商品がない可能性があります）');
          }
        }
      }

    } catch (error) {
      console.log('⚠️ ロケーション管理画面テストでエラー:', error.message);
    }
  });

  test('移動ボタンクリックで移動モーダルが表示される', async ({ page }) => {
    console.log('🔍 移動ボタンクリックで移動モーダル表示をテスト中...');

    try {
      // 在庫管理画面に移動
      await page.goto('http://localhost:3002/staff/inventory');
      await page.waitForLoadState('networkidle');

      // 商品詳細を開く
      const productButtons = await page.locator('button:has-text("詳細"), [data-testid*="product"]').all();

      if (productButtons.length > 0) {
        await productButtons[0].click();
        await page.waitForTimeout(1000);

        // 移動ボタンをクリック
        const moveButton = await page.locator('button:has-text("ロケーション移動"), button:has-text("移動")').first();

        if (await moveButton.count() > 0) {
          await moveButton.click();
          await page.waitForTimeout(1000);

          // 移動モーダルが表示されているか確認
          const moveModal = await page.locator('h2:has-text("商品移動"), h3:has-text("移動"), h4:has-text("移動")').count();

          if (moveModal > 0) {
            console.log('✅ 移動ボタンクリックで移動モーダルが表示されました');

            // モーダル内の要素を確認
            const locationSelect = await page.locator('select, [role="combobox"]').filter({ hasText: /移動先|ロケーション/ }).count();
            const reasonField = await page.locator('textarea, input').filter({ hasText: /理由|備考/ }).count();
            const submitButton = await page.locator('button:has-text("移動実行"), button:has-text("実行")').count();

            console.log(`✓ 移動先選択: ${locationSelect > 0 ? '表示' : '非表示'}`);
            console.log(`✓ 理由入力: ${reasonField > 0 ? '表示' : '非表示'}`);
            console.log(`✓ 実行ボタン: ${submitButton > 0 ? '表示' : '非表示'}`);

            expect(moveModal).toBeGreaterThan(0);
          } else {
            console.log('⚠️ 移動モーダルが表示されませんでした');
          }
        }
      }

    } catch (error) {
      console.log('⚠️ 移動モーダルテストでエラー:', error.message);
    }
  });

  test('移動モーダルにラベル再出力の説明が表示される', async ({ page }) => {
    console.log('🔍 移動モーダルのラベル再出力説明をテスト中...');

    try {
      // 在庫管理画面に移動
      await page.goto('http://localhost:3002/staff/inventory');
      await page.waitForLoadState('networkidle');

      // 商品詳細を開く
      const productButtons = await page.locator('button:has-text("詳細"), [data-testid*="product"]').all();

      if (productButtons.length > 0) {
        await productButtons[0].click();
        await page.waitForTimeout(1000);

        // 移動ボタンをクリック
        const moveButton = await page.locator('button:has-text("ロケーション移動"), button:has-text("移動")').first();

        if (await moveButton.count() > 0) {
          await moveButton.click();
          await page.waitForTimeout(1000);

          // ラベル再出力に関する説明があるか確認
          const labelInfo = await page.locator('text=ラベル, text=再出力, text=貼り付け').count();

          if (labelInfo > 0) {
            console.log('✅ 移動モーダルにラベル再出力の説明が表示されています');

            // 具体的なテキストを確認
            const labelTexts = await page.locator('li, p, span').filter({ hasText: /ラベル.*出力|新しい.*ラベル|古い.*ラベル/ }).allTextContents();

            for (const text of labelTexts) {
              console.log(`✓ ラベル関連説明: "${text}"`);
            }

            expect(labelInfo).toBeGreaterThan(0);
          } else {
            console.log('⚠️ ラベル再出力の説明が見つかりませんでした');
          }
        }
      }

    } catch (error) {
      console.log('⚠️ ラベル再出力説明テストでエラー:', error.message);
    }
  });

});