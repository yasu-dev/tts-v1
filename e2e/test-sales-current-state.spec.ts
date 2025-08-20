import { test, expect } from '@playwright/test';

test.describe('販売管理画面の現在の状態確認', () => {
  test('現在の販売管理画面の構造確認', async ({ page }) => {
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
    
    // 4. ステータスフィルターの確認
    const statusFilter = page.locator('select').first();
    await expect(statusFilter).toBeVisible();
    
    // 5. 現在のステータスオプションを確認
    const options = await statusFilter.locator('option').allTextContents();
    console.log('現在のステータスオプション:', options);
    
    // 6. テーブルヘッダーの確認
    const tableHeaders = page.locator('thead th');
    const headerTexts = await tableHeaders.allTextContents();
    console.log('テーブルヘッダー:', headerTexts);
    
    // 7. データ行の確認
    const dataRows = page.locator('tbody tr');
    const rowCount = await dataRows.count();
    console.log('データ行数:', rowCount);
    
    if (rowCount > 0) {
      // 最初の行のステータスを確認
      const firstRowStatus = page.locator('tbody tr').first().locator('td').nth(2);
      const statusText = await firstRowStatus.textContent();
      console.log('最初の行のステータス:', statusText);
    }
    
    // 8. スクリーンショットを保存
    await page.screenshot({ path: 'test-results/sales-current-state.png', fullPage: true });
  });

  test('ステータスフィルターの動作確認', async ({ page }) => {
    // 1. ログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    
    // 2. 販売管理ページへ移動
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    // 3. ステータスフィルターを「出荷準備中」に変更
    const statusFilter = page.locator('select').first();
    await statusFilter.selectOption('processing');
    await page.waitForLoadState('networkidle');
    
    // 4. データが更新されることを確認
    const dataRows = page.locator('tbody tr');
    const rowCountAfterFilter = await dataRows.count();
    console.log('フィルター後のデータ行数:', rowCountAfterFilter);
    
    // 5. ステータスフィルターを「出荷済み」に変更
    await statusFilter.selectOption('shipped');
    await page.waitForLoadState('networkidle');
    
    // 6. データが更新されることを確認
    const rowCountAfterSecondFilter = await dataRows.count();
    console.log('2回目のフィルター後のデータ行数:', rowCountAfterSecondFilter);
    
    // 7. スクリーンショットを保存
    await page.screenshot({ path: 'test-results/sales-filter-test.png', fullPage: true });
  });
});
