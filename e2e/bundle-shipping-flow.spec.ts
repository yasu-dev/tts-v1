import { test, expect, Page } from '@playwright/test';

// 同梱商品処理の完全E2Eフロー
test.describe('同梱商品出荷管理フロー', () => {
  test('同梱商品A、Bの梱包開始→梱包→ラベル印刷→集荷エリア移動', async ({ page }) => {
    console.log('🎬 同梱商品出荷管理E2Eテスト開始');

    // Step 1: スタッフとしてログイン
    await page.goto('http://localhost:3002/login');
    await page.fill('input[name="username"]', 'staff');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Step 2: 出荷管理画面へ移動
    console.log('📦 出荷管理画面へ移動');
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 梱包待ちタブをクリック
    await page.click('button:has-text("梱包待ち")');
    await page.waitForTimeout(1000);

    // Step 3: 初期状態 - 同梱商品A、Bが色づいて表示されている状態
    console.log('📸 1. 同梱商品A、B表示状態をキャプチャ');
    await page.screenshot({
      path: 'bundle-step-1-initial-display.png',
      fullPage: true
    });

    // 同梱商品を探す
    const bundleItems = await page.locator('.border-l-blue-500, .bg-blue-50').count();
    console.log(`🔍 同梱商品検出数: ${bundleItems}件`);

    // 同梱商品を選択
    const firstBundleItem = page.locator('.border-l-blue-500, .bg-blue-50').first();
    const secondBundleItem = page.locator('.border-l-blue-500, .bg-blue-50').nth(1);
    
    // チェックボックスをクリック
    await firstBundleItem.locator('input[type="checkbox"]').click();
    if (bundleItems > 1) {
      await secondBundleItem.locator('input[type="checkbox"]').click();
    }
    await page.waitForTimeout(500);

    // Step 4: 梱包開始処理
    console.log('📦 2. 梱包開始処理');
    // 同梱梱包開始ボタンをクリック
    const packingButton = page.locator('button:has-text("梱包開始"), button:has-text("同梱梱包開始"), button:has-text("梱包開始(同梱)")');
    await packingButton.first().click();
    await page.waitForTimeout(1000);

    // 梱包開始後の状態をキャプチャ
    await page.screenshot({
      path: 'bundle-step-2-packing-started.png',
      fullPage: true
    });

    // 梱包確認モーダルが表示されていれば確認
    const confirmModal = page.locator('.modal, [role="dialog"]');
    if (await confirmModal.count() > 0) {
      await page.click('button:has-text("確認"), button:has-text("梱包開始"), button:has-text("開始")');
      await page.waitForTimeout(1000);
    }

    // Step 5: 梱包処理中の状態
    console.log('📦 3. 梱包処理中');
    await page.screenshot({
      path: 'bundle-step-3-packing-process.png',
      fullPage: true
    });

    // 梱包完了まで待機（モーダルがある場合は閉じる）
    const packingModal = page.locator('.modal, [role="dialog"]');
    if (await packingModal.count() > 0) {
      const closeButton = packingModal.locator('button:has-text("完了"), button:has-text("閉じる"), button:has-text("×")');
      if (await closeButton.count() > 0) {
        await closeButton.click();
        await page.waitForTimeout(1000);
      }
    }

    // Step 6: 梱包済みタブに移動
    console.log('📦 4. 梱包済み状態確認');
    await page.click('button:has-text("梱包済み")');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'bundle-step-4-packed-status.png',
      fullPage: true
    });

    // Step 7: 同梱ラベル印刷
    console.log('🖨️ 5. 同梱ラベル印刷');
    const labelButton = page.locator('button:has-text("ラベル印刷"), button:has-text("同梱ラベル印刷")');
    if (await labelButton.count() > 0) {
      await labelButton.first().click();
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'bundle-step-5-label-printing.png',
        fullPage: true
      });
    }

    // Step 8: 集荷エリアへ移動
    console.log('🚚 6. 集荷エリアへ移動');
    const shipButton = page.locator('button:has-text("集荷エリアへ移動"), button:has-text("出荷")');
    if (await shipButton.count() > 0) {
      await shipButton.first().click();
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'bundle-step-6-shipping-area.png',
        fullPage: true
      });
    }

    // Step 9: 集荷準備完了タブで確認
    console.log('✅ 7. 集荷準備完了状態確認');
    await page.click('button:has-text("集荷準備完了")');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'bundle-step-7-ready-for-pickup.png',
      fullPage: true
    });

    console.log('🎉 同梱商品出荷管理E2Eテスト完了');
  });
});
