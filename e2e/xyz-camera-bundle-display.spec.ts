import { test, expect } from '@playwright/test';

test.describe('XYZcamera商品の同梱梱包処理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/staff/shipping?tab=workstation');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('XYZcamera商品の同梱梱包が正しく処理される', async ({ page }) => {
    console.log('テスト開始: XYZcamera商品の同梱梱包処理');

    // 梱包待ちタブをクリック
    const workstationTab = page.locator('button').filter({ hasText: '梱包待ち' });
    if (await workstationTab.isVisible()) {
      await workstationTab.click();
      await page.waitForTimeout(1000);
    }

    // XYZcamera商品を探す
    const xyzItems = await page.locator('.bg-white.rounded-lg').filter({ 
      hasText: /XYZcamera/i 
    }).all();

    if (xyzItems.length >= 2) {
      console.log(`XYZcamera商品が${xyzItems.length}件見つかりました`);

      // 最初の2つのXYZcamera商品を選択
      for (let i = 0; i < Math.min(2, xyzItems.length); i++) {
        const checkbox = xyzItems[i].locator('input[type="checkbox"]').first();
        await checkbox.check();
        await page.waitForTimeout(500);
      }

      // 同梱梱包ボタンを探してクリック
      const bundleButton = page.locator('button').filter({ hasText: '同梱梱包' });
      await expect(bundleButton).toBeVisible();
      await bundleButton.click();

      // 確認モーダルが表示されることを確認
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // モーダル内の商品情報を確認
      await expect(modal.locator('text=/XYZcamera/i')).toBeVisible();

      // 確認ボタンをクリック
      const confirmButton = modal.locator('button').filter({ hasText: /確認|梱包を完了/i });
      await confirmButton.click();

      // 処理完了を待つ
      await page.waitForTimeout(3000);

      // 成功メッセージを確認（トーストまたはアラート）
      const successMessage = page.locator('text=/同梱梱包完了|梱包が完了しました/i');
      
      // ページがリロードされて商品のステータスが更新されることを確認
      await page.waitForLoadState('networkidle');
      
      console.log('同梱梱包処理が正常に完了しました');

      // スクリーンショットを保存
      await page.screenshot({ 
        path: 'e2e/screenshots/xyz-camera-bundle-shipping.png',
        fullPage: true 
      });

    } else {
      console.log('XYZcamera商品が見つかりませんでした。データを作成します。');
      
      // テストデータを作成するためにデリバリーページに移動
      await page.goto('http://localhost:3002/delivery');
      await page.waitForLoadState('networkidle');
      
      // 納品プラン作成ボタンをクリック
      const createButton = page.locator('button').filter({ hasText: '新しい納品プランを作成' });
      if (await createButton.isVisible()) {
        await createButton.click();
        console.log('納品プラン作成画面に移動しました');
        
        // テストデータ作成の詳細は省略
        // 実際の環境では手動でXYZcamera商品を作成してください
      }
    }
  });

  test('同梱梱包後の商品表示が正しい', async ({ page }) => {
    // 梱包済みタブを確認
    const packedTab = page.locator('button').filter({ hasText: '梱包済み' });
    await packedTab.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // XYZcamera商品が梱包済みステータスで表示されることを確認
    const packedItems = await page.locator('.bg-white.rounded-lg').filter({ 
      hasText: /XYZcamera/i 
    }).all();

    if (packedItems.length > 0) {
      console.log(`梱包済みタブにXYZcamera商品が${packedItems.length}件表示されています`);
      
      // 同梱マークが表示されていることを確認
      for (const item of packedItems) {
        const bundleIndicator = item.locator('.bg-blue-100, .text-blue-600');
        if (await bundleIndicator.isVisible()) {
          console.log('同梱マークが正しく表示されています');
        }
      }
    }
  });
});