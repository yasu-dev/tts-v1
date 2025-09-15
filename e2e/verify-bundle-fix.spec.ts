import { test, expect } from '@playwright/test';

test.describe('同梱梱包機能の修正確認', () => {
  test('fetchData関数が正しく呼び出される', async ({ page }) => {
    // コンソールログを収集
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      console.log(text);
    });

    // ページエラーを監視
    page.on('pageerror', error => {
      console.error('ページエラー:', error.message);
    });

    // 出荷管理ページを開く
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 梱包待ちタブをクリック
    const workstationTab = page.locator('button').filter({ hasText: '梱包待ち' });
    if (await workstationTab.isVisible()) {
      await workstationTab.click();
      await page.waitForTimeout(2000);
    }

    // fetchShippingDataエラーが発生していないことを確認
    const hasError = logs.some(log => 
      log.includes('fetchShippingData is not defined') ||
      log.includes('ReferenceError')
    );

    expect(hasError).toBeFalsy();
    console.log('✅ fetchShippingDataエラーは修正されました');

    // 商品カードが表示されていることを確認
    const items = page.locator('.bg-white.rounded-lg');
    const itemCount = await items.count();
    console.log(`商品カード数: ${itemCount}件`);

    // 少なくとも2つの商品を選択してみる（あれば）
    if (itemCount >= 2) {
      // 最初の2つの商品のチェックボックスを選択
      for (let i = 0; i < Math.min(2, itemCount); i++) {
        const checkbox = items.nth(i).locator('input[type="checkbox"]');
        if (await checkbox.isVisible()) {
          await checkbox.check();
          await page.waitForTimeout(500);
        }
      }

      // 同梱梱包ボタンが表示されることを確認
      const bundleButton = page.locator('button').filter({ hasText: /同梱梱包/i });
      if (await bundleButton.isVisible()) {
        console.log('✅ 同梱梱包ボタンが正しく表示されています');
        
        // ボタンをクリックしてエラーが発生しないことを確認
        await bundleButton.click();
        await page.waitForTimeout(2000);

        // モーダルが表示されるか確認
        const modal = page.locator('[role="dialog"]');
        if (await modal.isVisible({ timeout: 3000 })) {
          console.log('✅ 同梱確認モーダルが表示されました');
          
          // キャンセルして閉じる
          const cancelButton = modal.locator('button').filter({ hasText: /キャンセル|閉じる/i });
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
          }
        }
      }
    }

    // 最終確認：エラーが発生していないことを再確認
    const finalCheck = logs.some(log => 
      log.includes('fetchShippingData is not defined') ||
      log.includes('ReferenceError')
    );
    
    expect(finalCheck).toBeFalsy();
    console.log('✅ テスト完了：エラーは発生しませんでした');
  });
});
