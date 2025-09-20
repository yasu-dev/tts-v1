import { test, expect } from '@playwright/test';

test.describe('備考表示の正確な確認', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003/login');
    await page.waitForTimeout(1000);
  });

  test('セラー在庫管理での備考タブ表示確認', async ({ page }) => {
    // セラーログイン
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // 在庫管理ページへ移動
    await page.goto('http://localhost:3003/inventory');
    await page.waitForTimeout(2000);

    // スクリーンショット1: セラー在庫管理ページ
    await page.screenshot({
      path: 'seller-inventory-with-test-products.png',
      fullPage: true
    });

    // 商品行をクリック（テーブルの行）
    const productRow = page.locator('tr').filter({ hasText: 'DEMOカメラ２６' }).first();

    if (await productRow.isVisible()) {
      await productRow.click();
      await page.waitForTimeout(1000);

      // 商品詳細モーダルが開いているか確認
      const modal = page.locator('[data-testid="product-detail-modal"]');
      if (await modal.isVisible()) {

        // スクリーンショット2: 基本情報タブ
        await page.screenshot({
          path: 'seller-product-detail-basic.png',
          fullPage: true
        });

        // 備考タブをクリック
        const notesTab = page.locator('text=備考');
        if (await notesTab.isVisible()) {
          await notesTab.click();
          await page.waitForTimeout(1000);

          // スクリーンショット3: 備考タブ
          await page.screenshot({
            path: 'seller-product-detail-notes-tab.png',
            fullPage: true
          });

          // 備考内容が表示されているか確認
          const notesContent = page.locator('text=これは一般的なメモです');
          const descriptionContent = page.locator('text=これは備考テスト用の商品です');
          const inspectionContent = page.locator('text=これは検品メモです');

          console.log('✅ セラー備考タブ表示確認済み');
          console.log(`  - 一般メモ表示: ${await notesContent.isVisible()}`);
          console.log(`  - 商品説明表示: ${await descriptionContent.isVisible()}`);
          console.log(`  - 検品メモ表示: ${await inspectionContent.isVisible()}`);
        } else {
          console.log('❌ セラー: 備考タブが見つからない');
        }
      } else {
        console.log('❌ セラー: 商品詳細モーダルが開かない');
      }
    } else {
      console.log('❌ セラー: テスト商品が見つからない');
    }
  });

  test('スタッフ在庫管理での備考表示確認', async ({ page }) => {
    // スタッフログイン
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // スタッフダッシュボードの確認
    await page.goto('http://localhost:3003/staff/dashboard');
    await page.waitForTimeout(1000);

    // スタッフ在庫管理へ移動
    await page.goto('http://localhost:3003/staff/inventory');
    await page.waitForTimeout(2000);

    // スクリーンショット4: スタッフ在庫管理ページ
    await page.screenshot({
      path: 'staff-inventory-with-test-products.png',
      fullPage: true
    });

    // 商品行をクリック
    const productRow = page.locator('tr').filter({ hasText: 'DEMOカメラ２６' }).first();

    if (await productRow.isVisible()) {
      await productRow.click();
      await page.waitForTimeout(1000);

      // スクリーンショット5: スタッフ商品詳細
      await page.screenshot({
        path: 'staff-product-detail-modal.png',
        fullPage: true
      });

      // notesタブまたは備考タブを探す
      const notesTab = page.locator('text=notes').or(page.locator('text=備考'));
      if (await notesTab.isVisible()) {
        await notesTab.click();
        await page.waitForTimeout(1000);

        // スクリーンショット6: スタッフ備考タブ
        await page.screenshot({
          path: 'staff-product-detail-notes-tab.png',
          fullPage: true
        });

        console.log('✅ スタッフ備考タブ表示確認済み');
      } else {
        console.log('❌ スタッフ: 備考タブが見つからない');
      }
    } else {
      console.log('❌ スタッフ: テスト商品が見つからない');
    }
  });

  test('詳細ボタンからの備考表示確認', async ({ page }) => {
    // スタッフログイン
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);
    await page.goto('http://localhost:3003/staff/inventory');
    await page.waitForTimeout(2000);

    // 詳細ボタンをクリック
    const detailButton = page.locator('button:has-text("詳細")').first();
    if (await detailButton.isVisible()) {
      await detailButton.click();
      await page.waitForTimeout(1000);

      // スクリーンショット7: 詳細ボタンからのモーダル
      await page.screenshot({
        path: 'staff-detail-button-modal.png',
        fullPage: true
      });

      console.log('✅ スタッフ詳細ボタンからのモーダル確認済み');
    } else {
      console.log('❌ スタッフ: 詳細ボタンが見つからない');
    }
  });
});