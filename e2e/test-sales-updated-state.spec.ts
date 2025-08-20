import { test, expect } from '@playwright/test';

test.describe('販売管理画面の修正後確認', () => {
  test('新しいステータスオプションの確認', async ({ page }) => {
    // 1. ログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    
    // 2. 販売管理ページへ移動
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    // 3. ステータスフィルターの確認
    const statusFilter = page.locator('select').first();
    await expect(statusFilter).toBeVisible();
    
    // 4. 新しいステータスオプションを確認
    const options = await statusFilter.locator('option').allTextContents();
    console.log('修正後のステータスオプション:', options);
    
    // 5. 期待されるオプションの確認
    const expectedOptions = ['すべて', '出品中', '購入者決定', '出荷準備中', '出荷済み', '到着済み'];
    for (const expected of expectedOptions) {
      expect(options).toContain(expected);
    }
    
    // 6. スクリーンショットを保存
    await page.screenshot({ path: 'test-results/sales-updated-options.png', fullPage: true });
  });

  test('各ステータスフィルターの動作確認', async ({ page }) => {
    // 1. ログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    
    // 2. 販売管理ページへ移動
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    const statusFilter = page.locator('select').first();
    
    // 3. 各ステータスでフィルタリングをテスト
    const testStatuses = ['listing', 'sold', 'processing', 'shipped', 'delivered'];
    
    for (const status of testStatuses) {
      console.log(`テスト中: ${status}ステータス`);
      
      // フィルターを変更
      await statusFilter.selectOption(status);
      await page.waitForLoadState('networkidle');
      
      // データが更新されることを確認
      const dataRows = page.locator('tbody tr');
      const rowCount = await dataRows.count();
      console.log(`${status}フィルター後のデータ行数:`, rowCount);
      
      // エラーが発生していないことを確認
      const errorMessage = page.locator('text="エラー"');
      await expect(errorMessage).not.toBeVisible();
    }
    
    // 4. スクリーンショットを保存
    await page.screenshot({ path: 'test-results/sales-all-filters.png', fullPage: true });
  });

  test('既存機能の動作確認', async ({ page }) => {
    // 1. ログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    
    // 2. 販売管理ページへ移動
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    // 3. ページタイトルの確認
    const pageTitle = page.locator('h1:has-text("販売管理")');
    await expect(pageTitle).toBeVisible();
    
    // 4. テーブルヘッダーの確認
    const tableHeaders = page.locator('thead th');
    const headerTexts = await tableHeaders.allTextContents();
    console.log('テーブルヘッダー:', headerTexts);
    
    // 5. 期待されるヘッダーの確認
    const expectedHeaders = ['商品', '金額', 'ステータス', 'ラベル', '注文日', '操作'];
    for (const expected of expectedHeaders) {
      expect(headerTexts).toContain(expected);
    }
    
    // 6. データ行の確認
    const dataRows = page.locator('tbody tr');
    const rowCount = await dataRows.count();
    console.log('データ行数:', rowCount);
    
    // 7. スクリーンショットを保存
    await page.screenshot({ path: 'test-results/sales-existing-functionality.png', fullPage: true });
  });
});
