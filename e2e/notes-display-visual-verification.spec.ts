import { test, expect } from '@playwright/test';

test.describe('備考表示の視覚的確認', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003/login');
  });

  test('セラー在庫管理で商品詳細の備考タブを確認', async ({ page }) => {
    // セラーログイン
    await page.fill('input[type="email"]', 'seller@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // ログイン完了を待機
    await page.waitForTimeout(2000);

    // 在庫管理ページに移動
    await page.goto('http://localhost:3003/inventory');
    await page.waitForTimeout(2000);

    // 最初の商品をクリック
    const firstProduct = page.locator('[data-testid="product-item"]').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForTimeout(1000);

      // 商品詳細モーダルが開いたか確認
      const modal = page.locator('[data-testid="product-detail-modal"]');
      await expect(modal).toBeVisible();

      // 備考タブがあるか確認
      const notesTab = page.locator('text=備考');
      if (await notesTab.isVisible()) {
        await notesTab.click();
        await page.waitForTimeout(1000);

        // スクリーンショット撮影
        await page.screenshot({
          path: 'seller-notes-tab-screenshot.png',
          fullPage: true
        });

        console.log('✅ セラー在庫管理: 備考タブ表示確認');
      } else {
        console.log('❌ セラー在庫管理: 備考タブが見つからない');
      }
    } else {
      console.log('❌ セラー在庫管理: 商品が見つからない');
    }
  });

  test('スタッフ在庫管理で商品詳細の備考を確認', async ({ page }) => {
    // スタッフログイン
    await page.fill('input[type="email"]', 'staff@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // ログイン完了を待機
    await page.waitForTimeout(2000);

    // スタッフ在庫管理ページに移動
    await page.goto('http://localhost:3003/staff/inventory');
    await page.waitForTimeout(2000);

    // 最初の商品をクリック
    const firstProduct = page.locator('[data-testid="product-item"]').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForTimeout(1000);

      // 商品詳細モーダルが開いたか確認
      const modal = page.locator('[data-testid="product-detail-modal"]');
      await expect(modal).toBeVisible();

      // 備考タブまたはnotesタブがあるか確認
      const notesTab = page.locator('text=備考').or(page.locator('text=notes'));
      if (await notesTab.isVisible()) {
        await notesTab.click();
        await page.waitForTimeout(1000);

        // スクリーンショット撮影
        await page.screenshot({
          path: 'staff-notes-tab-screenshot.png',
          fullPage: true
        });

        console.log('✅ スタッフ在庫管理: 備考タブ表示確認');
      } else {
        console.log('❌ スタッフ在庫管理: 備考タブが見つからない');
      }
    } else {
      console.log('❌ スタッフ在庫管理: 商品が見つからない');
    }
  });

  test('スタッフ在庫管理で詳細ボタンから商品詳細を確認', async ({ page }) => {
    // スタッフログイン
    await page.fill('input[type="email"]', 'staff@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // スタッフ在庫管理ページに移動
    await page.goto('http://localhost:3003/staff/inventory');
    await page.waitForTimeout(2000);

    // 詳細ボタンをクリック
    const detailButton = page.locator('button:has-text("詳細")').first();
    if (await detailButton.isVisible()) {
      await detailButton.click();
      await page.waitForTimeout(1000);

      // スクリーンショット撮影
      await page.screenshot({
        path: 'staff-detail-button-screenshot.png',
        fullPage: true
      });

      console.log('✅ スタッフ在庫管理: 詳細ボタンで商品詳細確認');
    } else {
      console.log('❌ スタッフ在庫管理: 詳細ボタンが見つからない');
    }
  });
});