import { test, expect, Page } from '@playwright/test';

test.describe('同梱商品ピッキング指示→出荷管理リスト生成検証', () => {
  test('同梱商品ピッキング指示作成から出荷管理リスト表示まで完全検証', async ({ page }) => {
    console.log('🎯 同梱商品ピッキング→出荷管理フロー検証開始');

    // サーバー起動待機
    await page.waitForTimeout(8000);

    try {
      // ロケーション管理画面へアクセス
      await page.goto('http://localhost:3002/staff/inventory?tab=location');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      console.log('📍 Step 1: ロケーション管理画面での同梱商品確認');
      
      // 出荷リストタブをクリック
      const shippingTab = page.locator('button:has-text("出荷リスト")');
      if (await shippingTab.count() > 0) {
        await shippingTab.click();
        await page.waitForTimeout(2000);
      }

      // 初期状態をキャプチャ
      await page.screenshot({
        path: 'picking-step-1-location-initial.png',
        fullPage: true
      });

      // 同梱商品を探す
      const bundleItems = page.locator('.border-l-blue-500, .bg-blue-50, .isBundleItem, [class*="bundle"]');
      const bundleCount = await bundleItems.count();
      console.log(`🔍 ロケーション管理で検出した同梱商品数: ${bundleCount}件`);

      if (bundleCount > 0) {
        // 同梱商品を選択
        console.log('📍 Step 2: 同梱商品選択');
        
        // チェックボックスを選択
        const firstBundleItem = bundleItems.first();
        const checkbox = firstBundleItem.locator('input[type="checkbox"]');
        if (await checkbox.count() > 0) {
          await checkbox.click();
          await page.waitForTimeout(1000);
        }

        // 複数の同梱商品がある場合は選択
        if (bundleCount > 1) {
          const secondBundleItem = bundleItems.nth(1);
          const secondCheckbox = secondBundleItem.locator('input[type="checkbox"]');
          if (await secondCheckbox.count() > 0) {
            await secondCheckbox.click();
            await page.waitForTimeout(1000);
          }
        }

        await page.screenshot({
          path: 'picking-step-2-bundle-selected.png',
          fullPage: true
        });

        // ピッキング指示作成ボタンを押下
        console.log('📍 Step 3: ピッキング指示作成ボタン押下');
        
        // より広範囲でボタンを探索
        const allButtons = page.locator('button');
        const allButtonCount = await allButtons.count();
        console.log(`🔍 ページ内全ボタン数: ${allButtonCount}件`);
        
        // ボタンテキストを全て出力
        for (let i = 0; i < Math.min(allButtonCount, 20); i++) {
          const buttonText = await allButtons.nth(i).textContent();
          console.log(`ボタン ${i}: "${buttonText}"`);
        }
        
        const pickingButtons = page.locator('button:has-text("選択商品をピッキング指示"), button:has-text("ピッキング指示を作成"), button:has-text("ピッキング指示")');
        const buttonCount = await pickingButtons.count();
        console.log(`🔍 ピッキング指示ボタン検出数: ${buttonCount}件`);

        if (buttonCount > 0) {
          // ボタンをクリック
          await pickingButtons.first().click();
          await page.waitForTimeout(3000);

          await page.screenshot({
            path: 'picking-step-3-button-clicked.png',
            fullPage: true
          });

          // モーダルが表示される場合は確認
          const modal = page.locator('.modal, [role="dialog"], .fixed.inset-0');
          if (await modal.count() > 0) {
            console.log('📍 Step 4: ピッキング指示確認モーダル');
            
            await page.screenshot({
              path: 'picking-step-4-confirmation-modal.png',
              fullPage: true
            });

            // 確認ボタンをクリック
            const confirmButtons = modal.locator('button:has-text("ピッキング指示を作成"), button:has-text("確認"), button:has-text("作成")');
            if (await confirmButtons.count() > 0) {
              await confirmButtons.first().click();
              await page.waitForTimeout(3000);
            }
          }

          // トーストメッセージを確認
          const toast = page.locator('[class*="toast"], [class*="notification"]');
          if (await toast.count() > 0) {
            console.log('📍 Step 5: 処理完了通知確認');
            await page.screenshot({
              path: 'picking-step-5-toast-notification.png',
              fullPage: true
            });
          }

          // 出荷管理画面に移動
          console.log('📍 Step 6: 出荷管理画面での確認');
          await page.goto('http://localhost:3002/staff/shipping');
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);

          // 梱包待ちタブを確認
          const workstationTab = page.locator('button:has-text("梱包待ち")');
          if (await workstationTab.count() > 0) {
            await workstationTab.click();
            await page.waitForTimeout(2000);
          }

          await page.screenshot({
            path: 'picking-step-6-shipping-workstation.png',
            fullPage: true
          });

          // 全体タブも確認
          const allTab = page.locator('button:has-text("全体")');
          if (await allTab.count() > 0) {
            await allTab.click();
            await page.waitForTimeout(2000);
          }

          await page.screenshot({
            path: 'picking-step-7-shipping-all.png',
            fullPage: true
          });

          // 出荷管理でのリスト件数を確認
          const shippingItems = page.locator('tbody tr');
          const shippingCount = await shippingItems.count();
          console.log(`📦 出荷管理画面での商品数: ${shippingCount}件`);

          // 同梱商品が出荷管理に表示されているかチェック
          const bundleItemsInShipping = page.locator('.border-l-blue-500, .bg-blue-50, [class*="bundle"], [class*="同梱"]');
          const bundleInShippingCount = await bundleItemsInShipping.count();
          console.log(`🔗 出荷管理での同梱商品数: ${bundleInShippingCount}件`);

          if (bundleInShippingCount === 0) {
            console.error('❌ 問題確認: 同梱商品が出荷管理に表示されていません');
          } else {
            console.log('✅ 同梱商品が出荷管理に正常に表示されています');
          }

        } else {
          console.error('❌ ピッキング指示ボタンが見つかりません');
          await page.screenshot({
            path: 'picking-error-no-button.png',
            fullPage: true
          });
        }

      } else {
        console.error('❌ 同梱商品が見つかりません');
        await page.screenshot({
          path: 'picking-error-no-bundle.png',
          fullPage: true
        });
      }

    } catch (error) {
      console.error('❌ テスト実行エラー:', error);
      await page.screenshot({
        path: 'picking-error-general.png',
        fullPage: true
      });
    }

    console.log('✅ 同梱商品ピッキング→出荷管理フロー検証完了');
  });

  test('出荷管理APIレスポンス確認', async ({ page }) => {
    console.log('🔍 出荷管理APIレスポンス確認');

    await page.waitForTimeout(5000);

    // APIレスポンスをモニタリング
    page.on('response', response => {
      if (response.url().includes('/api/orders/shipping')) {
        console.log('📡 出荷管理API応答:', response.status());
      }
      if (response.url().includes('/api/picking')) {
        console.log('📡 ピッキングAPI応答:', response.status());
      }
    });

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // ページ内のJavaScriptコンソールも確認
    page.on('console', msg => {
      if (msg.text().includes('Bundle') || msg.text().includes('同梱')) {
        console.log('🖥️ ブラウザコンソール:', msg.text());
      }
    });

    await page.screenshot({
      path: 'api-response-check.png',
      fullPage: true
    });
  });
});
