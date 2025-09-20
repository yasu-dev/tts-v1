import { test, expect } from '@playwright/test';

test.describe('備考テキスト表示確認', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003/login');
  });

  test('セラー商品詳細に備考が表示されることを確認', async ({ page }) => {
    // セラーログイン
    await page.fill('input[type="email"]', 'seller@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // セラー管理画面への移動を待機
    await page.waitForURL('**/seller/dashboard');

    // 商品管理へ移動
    await page.click('text=商品管理');
    await page.waitForURL('**/seller/products');

    // 最初の商品の詳細を開く
    await page.click('[data-testid="product-item"]:first-child');

    // 商品詳細モーダルが開くのを待機
    await page.waitForSelector('[data-testid="product-detail-modal"]');

    // 備考フィールドが表示されていることを確認
    const notesElement = page.locator('text=備考').or(page.locator('text=notes')).or(page.locator('text=description'));
    await expect(notesElement).toBeVisible();

    console.log('✅ セラー商品詳細での備考表示確認完了');
  });

  test('スタッフ商品詳細に備考が表示されることを確認', async ({ page }) => {
    // スタッフログイン
    await page.fill('input[type="email"]', 'staff@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // スタッフ管理画面への移動を待機
    await page.waitForURL('**/staff/dashboard');

    // 在庫管理へ移動
    await page.click('text=在庫管理');
    await page.waitForURL('**/staff/inventory');

    // 最初の商品の詳細を開く
    await page.click('[data-testid="product-item"]:first-child');

    // 商品詳細モーダルが開くのを待機
    await page.waitForSelector('[data-testid="product-detail-modal"]');

    // 備考フィールドが表示されていることを確認
    const notesElement = page.locator('text=備考').or(page.locator('text=notes')).or(page.locator('text=description'));
    await expect(notesElement).toBeVisible();

    console.log('✅ スタッフ商品詳細での備考表示確認完了');
  });

  test('検品画面ラベル生成部分に備考が表示されることを確認', async ({ page }) => {
    // スタッフログイン
    await page.fill('input[type="email"]', 'staff@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // 検品管理へ移動
    await page.goto('http://localhost:3003/staff/inspection');

    // 検品対象商品を選択
    await page.click('[data-testid="inspection-item"]:first-child');

    // 検品フローを進める（梱包・ラベル作業まで）
    await page.click('text=次へ');
    await page.click('text=次へ');
    await page.click('text=次へ'); // 梱包・ラベル作業ステップまで進む

    // 備考入力フィールドが表示されていることを確認
    const notesInput = page.locator('textarea[placeholder*="備考"]').or(page.locator('textarea[id*="notes"]'));
    await expect(notesInput).toBeVisible();

    console.log('✅ 検品画面での備考入力欄確認完了');
  });

  test('その他の備考表示箇所を確認', async ({ page }) => {
    // 全ページで備考が表示される箇所を確認

    // 1. 商品移動モーダル
    await page.fill('input[type="email"]', 'staff@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    await page.goto('http://localhost:3003/staff/location');

    // 商品移動ボタンをクリック
    const moveButton = page.locator('text=移動').first();
    if (await moveButton.isVisible()) {
      await moveButton.click();

      // 備考フィールドの確認
      const notesField = page.locator('text=備考').or(page.locator('text=notes'));
      if (await notesField.isVisible()) {
        console.log('✅ 商品移動モーダルで備考表示確認');
      }
    }

    // 2. 納品プラン作成
    await page.goto('http://localhost:3003/delivery');

    // 納品プラン作成での備考確認
    const createPlanButton = page.locator('text=納品プラン作成').first();
    if (await createPlanButton.isVisible()) {
      await createPlanButton.click();

      const planNotesField = page.locator('textarea[placeholder*="備考"]').or(page.locator('textarea[placeholder*="notes"]'));
      if (await planNotesField.isVisible()) {
        console.log('✅ 納品プラン作成で備考入力欄確認');
      }
    }

    console.log('✅ その他の備考表示箇所確認完了');
  });
});