import { test, expect } from '@playwright/test';

test.describe('販売管理フィルター修正後の確認', () => {
  test('各ステータスフィルターの詳細確認', async ({ page }) => {
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
    const testCases = [
      { status: 'all', description: 'すべて' },
      { status: 'listing', description: '出品中' },
      { status: 'sold', description: '購入者決定' },
      { status: 'processing', description: '出荷準備中' },
      { status: 'shipped', description: '出荷済み' },
      { status: 'delivered', description: '到着済み' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n=== ${testCase.description}フィルターのテスト ===`);
      
      // フィルターを変更
      await statusFilter.selectOption(testCase.status);
      await page.waitForLoadState('networkidle');
      
      // データ行数を確認
      const dataRows = page.locator('tbody tr');
      const rowCount = await dataRows.count();
      console.log(`${testCase.description}のデータ行数:`, rowCount);
      
      if (rowCount > 0) {
        // 最初の行のステータスを確認
        const firstRowStatus = page.locator('tbody tr').first().locator('td').nth(2);
        const statusText = await firstRowStatus.textContent();
        console.log(`${testCase.description}の最初の行のステータス:`, statusText);
        
        // ステータスが期待通りかチェック
        if (testCase.status !== 'all') {
          // すべての行のステータスを確認
          const allStatuses = await page.locator('tbody tr td:nth-child(3)').allTextContents();
          console.log(`${testCase.description}の全ステータス:`, allStatuses);
          
          // 期待されるステータス名を確認
          const expectedStatusMap = {
            'listing': '出品中',
            'sold': '購入者決定',
            'processing': '出荷準備中',
            'shipped': '出荷済み',
            'delivered': '到着済み'
          };
          
          const expectedStatus = expectedStatusMap[testCase.status as keyof typeof expectedStatusMap];
          if (expectedStatus) {
            // すべての行が期待されるステータスかチェック
            const allMatch = allStatuses.every(status => status.includes(expectedStatus));
            console.log(`${testCase.description}のステータス一致:`, allMatch);
          }
        }
      }
      
      // エラーが発生していないことを確認
      const errorMessage = page.locator('text="エラー"');
      await expect(errorMessage).not.toBeVisible();
    }
    
    // 4. スクリーンショットを保存
    await page.screenshot({ path: 'test-results/sales-filter-detailed-test.png', fullPage: true });
  });

  test('フィルター切り替えの動作確認', async ({ page }) => {
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
    
    // 3. フィルターを順番に切り替えて動作確認
    const testSequence = ['all', 'listing', 'sold', 'processing', 'shipped', 'delivered', 'all'];
    
    for (let i = 0; i < testSequence.length; i++) {
      const status = testSequence[i];
      console.log(`\n--- フィルター切り替え ${i + 1}/${testSequence.length}: ${status} ---`);
      
      // フィルターを変更
      await statusFilter.selectOption(status);
      await page.waitForLoadState('networkidle');
      
      // データが更新されることを確認
      const dataRows = page.locator('tbody tr');
      const rowCount = await dataRows.count();
      console.log(`${status}フィルター後のデータ行数:`, rowCount);
      
      // ローディング状態が解消されていることを確認
      const loadingSpinner = page.locator('.loading-spinner, [data-testid="loading"]');
      await expect(loadingSpinner).not.toBeVisible();
    }
    
    // 4. スクリーンショットを保存
    await page.screenshot({ path: 'test-results/sales-filter-sequence-test.png', fullPage: true });
  });
});
