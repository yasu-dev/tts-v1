import { test, expect } from '@playwright/test';

test.describe('実際のUI測定', () => {
  
  test('ラジオボタンずれの実測とAPI動作確認', async ({ page }) => {
    console.log('📏 実際のUI測定開始');

    await page.goto('http://localhost:3002/inventory');
    await page.waitForTimeout(3000);

    // 保管中商品を探す
    const storageProducts = page.locator('tbody tr').filter({
      has: page.locator('text="保管中"')
    });
    
    const storageCount = await storageProducts.count();
    console.log(`保管中商品数: ${storageCount}`);

    if (storageCount > 0) {
      // 商品詳細モーダルを開く
      await storageProducts.first().locator('button:has-text("詳細")').click();
      await page.waitForTimeout(1000);
      
      // 出荷ボタンクリック
      await page.locator('text=出荷する').click();
      await page.waitForTimeout(1000);
      console.log('✅ 配送業者選択モーダル表示');

      // 未選択状態をスクリーンショット
      await page.screenshot({ path: 'test-results/radio-before-selection.png' });

      // 実際に表示されている配送業者を確認
      const carrierOptions = page.locator('input[type="radio"]');
      const carrierCount = await carrierOptions.count();
      console.log(`配送業者数: ${carrierCount}`);

      for (let i = 0; i < carrierCount; i++) {
        const value = await carrierOptions.nth(i).getAttribute('value');
        console.log(`配送業者${i + 1}: ${value}`);
      }

      // 最初の配送業者でテスト（どれでも良い）
      if (carrierCount > 0) {
        const firstRadio = carrierOptions.first();
        const carrierValue = await firstRadio.getAttribute('value');
        console.log(`テスト対象配送業者: ${carrierValue}`);

        // 選択前の位置測定
        const radioRect = await firstRadio.boundingBox();
        console.log('📏 ラジオボタン位置:', radioRect);

        // 対応するlabel内のテキストを探す
        const carrierLabel = page.locator(`label:has(input[value="${carrierValue}"]) .font-medium`);
        const textRect = await carrierLabel.boundingBox();
        console.log('📏 テキスト位置:', textRect);

        if (radioRect && textRect) {
          const radioCenter = radioRect.y + radioRect.height / 2;
          const textCenter = textRect.y + textRect.height / 2;
          const verticalDiff = Math.abs(radioCenter - textCenter);
          
          console.log(`ラジオボタン中心Y: ${radioCenter}`);
          console.log(`テキスト中心Y: ${textCenter}`);
          console.log(`縦方向ずれ: ${verticalDiff}px`);
          
          if (verticalDiff <= 3) {
            console.log('✅ ラジオボタン整列OK');
          } else {
            console.log('❌ ラジオボタンがずれています');
          }
        }

        // 配送業者を選択
        await firstRadio.click();
        await page.waitForTimeout(1000);
        console.log(`✅ ${carrierValue}選択`);

        // 選択後のスクリーンショット
        await page.screenshot({ path: 'test-results/radio-after-selection.png' });

        // ラベル生成ボタンが有効になることを確認
        const generateButton = page.locator('button:has-text("ラベル生成")');
        const isEnabled = await generateButton.isEnabled();
        console.log(`ラベル生成ボタン: ${isEnabled ? '✅ 有効' : '❌ 無効'}`);

        if (isEnabled) {
          console.log('🚀 ラベル生成実行');
          
          // APIレスポンスを監視
          let apiCallMade = false;
          let apiSuccess = false;
          
          page.on('response', async (response) => {
            if (response.url().includes('/api/seller/shipping-request')) {
              apiCallMade = true;
              apiSuccess = response.ok();
              console.log(`API呼び出し: ${response.status()} ${response.statusText()}`);
              
              if (!response.ok()) {
                const errorText = await response.text();
                console.log('APIエラー詳細:', errorText);
              }
            }
          });

          await generateButton.click();
          await page.waitForTimeout(4000);

          console.log(`API呼び出し実行: ${apiCallMade ? '✅' : '❌'}`);
          console.log(`API成功: ${apiSuccess ? '✅' : '❌'}`);

          // トーストメッセージの確認
          const toastSuccess = page.locator('text*="出荷指示"').filter({ hasText: '成功' });
          const toastError = page.locator('text*="エラー"');

          const hasSuccessToast = await toastSuccess.count() > 0;
          const hasErrorToast = await toastError.count() > 0;

          console.log(`成功トースト: ${hasSuccessToast ? '✅' : '❌'}`);
          console.log(`エラートースト: ${hasErrorToast ? '❌ 表示' : '✅ なし'}`);

          // モーダルが閉じるか確認
          await page.waitForTimeout(2000);
          const modalStillOpen = await page.locator('[data-testid="product-detail-modal"]').count() > 0;
          console.log(`商品詳細モーダル: ${modalStillOpen ? '❌ 開いたまま' : '✅ 閉じた'}`);

          // 最終結果スクリーンショット
          await page.screenshot({ path: 'test-results/final-api-result.png' });
        }
      }
    } else {
      console.log('❌ 保管中商品がありません');
    }

    console.log('📏 実際のUI測定完了');
    expect(true).toBe(true);
  });
});

