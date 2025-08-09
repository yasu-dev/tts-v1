import { test, expect } from '@playwright/test';

test.describe('セラー販売管理統合テスト', () => {
  test('注文管理機能の統合確認', async ({ page }) => {
    // 1. ログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    
    // 2. 販売管理ページへ移動
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    // 3. 注文管理テーブルの確認
    const tableCard = page.locator('.intelligence-card');
    await expect(tableCard).toBeVisible();
    
    // 4. ヘッダーテキストの確認（統合されたテーブル）
    const header = page.locator('h3:has-text("注文管理")');
    await expect(header).toBeVisible();
    
    // 5. ラベルステータス列の存在確認
    const labelColumn = page.locator('th:has-text("ラベル")');
    await expect(labelColumn).toBeVisible();
    
    // 6. アクション列の存在確認
    const actionColumn = page.locator('th:has-text("アクション")');
    await expect(actionColumn).toBeVisible();
  });

  test('ラベル生成機能の動作確認', async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    
    // 販売管理ページへ移動
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    // ラベル生成ボタンを探す
    const labelButton = page.locator('button:has-text("ラベル生成")').first();
    const buttonCount = await labelButton.count();
    
    if (buttonCount > 0) {
      // ラベル生成ボタンをクリック
      await labelButton.click();
      
      // モーダルが表示されることを確認
      const modal = page.locator('text="配送ラベル生成"');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // 配送業者選択フィールドの存在確認
      const carrierSelect = page.locator('select, [role="combobox"]').first();
      await expect(carrierSelect).toBeVisible();
      
      // FedExを選択
      await carrierSelect.selectOption('fedex');
      
      // ボタンテキストが「ラベル生成」になることを確認
      const generateButton = page.locator('button:has-text("ラベル生成")').last();
      await expect(generateButton).toBeVisible();
      
      // キャンセルボタンでモーダルを閉じる
      await page.locator('button:has-text("キャンセル")').click();
      await expect(modal).not.toBeVisible();
    }
  });

  test('外部サイト遷移の確認', async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    
    // 販売管理ページへ移動
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    const labelButton = page.locator('button:has-text("ラベル生成")').first();
    const buttonCount = await labelButton.count();
    
    if (buttonCount > 0) {
      // ラベル生成ボタンをクリック
      await labelButton.click();
      
      // モーダルが表示されることを確認
      await page.waitForSelector('text="配送ラベル生成"');
      
      // ヤマト運輸を選択（外部サイト）
      const carrierSelect = page.locator('select, [role="combobox"]').first();
      await carrierSelect.selectOption('yamato');
      
      // ボタンテキストが「外部サイトへ」になることを確認
      const externalButton = page.locator('button:has-text("外部サイトへ")');
      await expect(externalButton).toBeVisible();
      
      // 外部サイトへボタンをクリック（新しいタブで開く）
      // 注：実際の外部サイトへの遷移はブロックされる可能性があるため、
      // ボタンが機能することのみ確認
      await externalButton.click();
      
      // トーストメッセージが表示されることを確認
      const toast = page.locator('text="外部サイトを開きました"');
      await expect(toast).toBeVisible({ timeout: 5000 });
      
      // アップロードモーダルが表示されることを確認
      await page.waitForTimeout(1500);
      const uploadModal = page.locator('text="配送伝票アップロード"');
      await expect(uploadModal).toBeVisible({ timeout: 5000 });
    }
  });
});
