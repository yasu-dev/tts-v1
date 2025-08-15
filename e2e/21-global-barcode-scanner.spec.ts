import { test, expect } from '@playwright/test';

test.describe('グローバルバーコードスキャン機能', () => {
  test.beforeEach(async ({ page }) => {
    // スタッフダッシュボードにアクセス（ログイン済み前提）
    await page.goto('/staff/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('商品バーコードスキャンで棚保管画面へ遷移', async ({ page }) => {
    // バーコードスキャンをシミュレート（高速キー入力）
    const barcode = 'CAM-SONY-A7II-002';
    
    // バーコードリーダーの高速入力をシミュレート
    for (const char of barcode) {
      await page.keyboard.press(char);
    }
    await page.keyboard.press('Enter');

    // トースト通知の確認
    await expect(page.locator('[role="alert"]')).toContainText('商品スキャン成功');

    // 棚保管画面への遷移を確認
    await page.waitForURL(/\/staff\/inspection\/.*\?step=4/, { timeout: 5000 });
    
    // 棚保管タブがアクティブか確認
    const storageTab = page.locator('button:has-text("棚保管")').first();
    await expect(storageTab).toHaveClass(/bg-blue-50/);
    
    // 棚番号入力フィールドにフォーカスがあることを確認
    const locationInput = page.locator('input[placeholder*="棚番号"]');
    await expect(locationInput).toBeFocused();
  });

  test('棚保管の確認ダイアログフロー', async ({ page }) => {
    // 直接棚保管画面へ移動
    await page.goto('/staff/inspection/test-product-001?step=4');
    await page.waitForLoadState('networkidle');

    // 棚番号を入力
    const locationInput = page.locator('input[placeholder*="棚番号"]');
    await locationInput.fill('A-01-001');
    
    // 確認ボタンをクリック
    await page.locator('button:has-text("保管場所を確認")').click();

    // 確認ダイアログが表示されることを確認
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    // ダイアログの内容を確認
    await expect(dialog).toContainText('重要：商品を確実に保管してください');
    await expect(dialog).toContainText('実際に商品を棚に配置しましたか？');
    
    // 3択のボタンが存在することを確認
    await expect(dialog.locator('button:has-text("はい、保管しました")')).toBeVisible();
    await expect(dialog.locator('button:has-text("スキャンをやり直す")')).toBeVisible();
    await expect(dialog.locator('button:has-text("処理を中止する")')).toBeVisible();
  });

  test('確認ダイアログ - はい、保管しました', async ({ page }) => {
    // 直接棚保管画面へ移動
    await page.goto('/staff/inspection/test-product-001?step=4');
    await page.waitForLoadState('networkidle');

    // 棚番号を入力
    const locationInput = page.locator('input[placeholder*="棚番号"]');
    await locationInput.fill('A-01-001');
    
    // 確認ボタンをクリック
    await page.locator('button:has-text("保管場所を確認")').click();

    // ダイアログで「はい、保管しました」をクリック
    await page.locator('button:has-text("はい、保管しました")').click();

    // 成功メッセージの確認
    await expect(page.locator('[role="alert"]')).toContainText('保管完了');
    
    // 検品一覧画面へ戻ることを確認
    await page.waitForURL('/staff/inspection', { timeout: 5000 });
  });

  test('確認ダイアログ - スキャンをやり直す', async ({ page }) => {
    // 直接棚保管画面へ移動
    await page.goto('/staff/inspection/test-product-001?step=4');
    await page.waitForLoadState('networkidle');

    // 棚番号を入力
    const locationInput = page.locator('input[placeholder*="棚番号"]');
    await locationInput.fill('A-01-001');
    
    // 確認ボタンをクリック
    await page.locator('button:has-text("保管場所を確認")').click();

    // ダイアログで「スキャンをやり直す」をクリック
    await page.locator('button:has-text("スキャンをやり直す")').click();

    // ダイアログが閉じることを確認
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // 入力フィールドがクリアされていることを確認
    await expect(locationInput).toHaveValue('');
    
    // 入力フィールドにフォーカスが戻ることを確認
    await expect(locationInput).toBeFocused();
    
    // 通知メッセージの確認
    await expect(page.locator('[role="alert"]')).toContainText('スキャンをやり直してください');
  });

  test('確認ダイアログ - 処理を中止する', async ({ page }) => {
    // 直接棚保管画面へ移動
    await page.goto('/staff/inspection/test-product-001?step=4');
    await page.waitForLoadState('networkidle');

    // 棚番号を入力
    const locationInput = page.locator('input[placeholder*="棚番号"]');
    await locationInput.fill('A-01-001');
    
    // 確認ボタンをクリック
    await page.locator('button:has-text("保管場所を確認")').click();

    // ダイアログで「処理を中止する」をクリック
    await page.locator('button:has-text("処理を中止する")').click();

    // ダイアログが閉じることを確認
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // 警告メッセージの確認
    await expect(page.locator('[role="alert"]')).toContainText('保管処理を中止しました');
    
    // 画面に留まることを確認（遷移しない）
    await expect(page).toHaveURL(/\/staff\/inspection\/.*\?step=4/);
  });

  test('未ログイン状態からのバーコードスキャン', async ({ page }) => {
    // ログアウト状態をシミュレート
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // バーコードスキャンをシミュレート（ログイン画面では無効）
    const barcode = 'CAM-SONY-A7II-002';
    for (const char of barcode) {
      await page.keyboard.press(char);
    }
    await page.keyboard.press('Enter');
    
    // ログイン画面に留まることを確認（バーコードスキャンが無効）
    await expect(page).toHaveURL('/login');
  });
});








