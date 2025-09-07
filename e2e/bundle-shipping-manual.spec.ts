import { test, expect, Page } from '@playwright/test';

// 手動での同梱商品処理フロー画面キャプチャ
test.describe('同梱商品出荷管理画面キャプチャ', () => {
  test('出荷管理画面での同梱商品表示確認', async ({ page }) => {
    console.log('📸 同梱商品表示画面キャプチャ開始');

    // 直接出荷管理画面へアクセス（認証なし）
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 初期画面キャプチャ
    console.log('📸 1. 出荷管理画面初期表示');
    await page.screenshot({
      path: 'shipping-bundle-step-1-initial.png',
      fullPage: true
    });

    // 梱包待ちタブをクリック
    const workstationTab = page.locator('button:has-text("梱包待ち")');
    if (await workstationTab.count() > 0) {
      await workstationTab.click();
      await page.waitForTimeout(2000);
      
      console.log('📸 2. 梱包待ちタブ - 同梱商品表示');
      await page.screenshot({
        path: 'shipping-bundle-step-2-workstation-tab.png',
        fullPage: true
      });
    }

    // 梱包済みタブをクリック
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
      
      console.log('📸 3. 梱包済みタブ');
      await page.screenshot({
        path: 'shipping-bundle-step-3-packed-tab.png',
        fullPage: true
      });
    }

    // 集荷準備完了タブをクリック
    const readyTab = page.locator('button:has-text("集荷準備完了")');
    if (await readyTab.count() > 0) {
      await readyTab.click();
      await page.waitForTimeout(2000);
      
      console.log('📸 4. 集荷準備完了タブ');
      await page.screenshot({
        path: 'shipping-bundle-step-4-ready-tab.png',
        fullPage: true
      });
    }

    // 全体タブに戻る
    const allTab = page.locator('button:has-text("全体")');
    if (await allTab.count() > 0) {
      await allTab.click();
      await page.waitForTimeout(2000);
      
      console.log('📸 5. 全体タブ - 全商品表示');
      await page.screenshot({
        path: 'shipping-bundle-step-5-all-items.png',
        fullPage: true
      });
    }

    console.log('✅ 画面キャプチャ完了');
  });

  test('同梱商品の詳細表示確認', async ({ page }) => {
    console.log('🔍 同梱商品詳細表示確認');

    // 出荷管理画面へアクセス
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 梱包待ちタブをクリック
    const workstationTab = page.locator('button:has-text("梱包待ち")');
    if (await workstationTab.count() > 0) {
      await workstationTab.click();
      await page.waitForTimeout(2000);
    }

    // 同梱商品（青い境界線のあるアイテム）を探す
    const bundleItems = page.locator('.border-l-blue-500, .bg-blue-50, .border-l-4.border-l-blue-400');
    const bundleCount = await bundleItems.count();
    
    console.log(`🔍 同梱商品検出数: ${bundleCount}件`);

    if (bundleCount > 0) {
      // 最初の同梱商品をクリックして詳細を表示
      await bundleItems.first().click();
      await page.waitForTimeout(1000);
      
      console.log('📸 6. 同梱商品詳細表示');
      await page.screenshot({
        path: 'shipping-bundle-step-6-detail-expanded.png',
        fullPage: true
      });

      // 詳細を閉じる
      const toggleButton = page.locator('button:has-text("詳細を隠す")');
      if (await toggleButton.count() > 0) {
        await toggleButton.click();
        await page.waitForTimeout(1000);
      }
    }

    // 同梱商品のアクションボタンを確認
    const packingButtons = page.locator('button:has-text("梱包開始"), button:has-text("同梱梱包開始"), button:has-text("梱包開始(同梱)")');
    const buttonCount = await packingButtons.count();
    
    console.log(`🔍 梱包ボタン検出数: ${buttonCount}件`);

    if (buttonCount > 0) {
      // ボタンがハイライトされた状態で画面キャプチャ
      await packingButtons.first().hover();
      await page.waitForTimeout(500);
      
      console.log('📸 7. 梱包ボタンフォーカス状態');
      await page.screenshot({
        path: 'shipping-bundle-step-7-button-focus.png',
        fullPage: true
      });
    }

    console.log('✅ 詳細表示確認完了');
  });
});



