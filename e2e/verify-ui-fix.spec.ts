import { test, expect } from '@playwright/test';

test.describe('🔍 セラー在庫管理画面の修正確認', () => {
  test('修正内容がUI画面に正しく反映されているかを確認', async ({ page }) => {
    console.log('🔍 UI修正確認テストを開始...');
    
    // セラーとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ダッシュボードに移動するまで待機
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    
    // 在庫管理画面に移動
    await page.goto('/inventory');
    await expect(page).toHaveURL(/\/inventory$/, { timeout: 10000 });
    
    // ページがロードされるまで待機
    await page.waitForSelector('select, table', { timeout: 15000 });
    
    console.log('📍 ページ読み込み完了');
    
    // 1. ステータスフィルターのオプション確認
    console.log('🔍 ステータスフィルターのオプションを確認...');
    
    const statusSelects = await page.locator('select').all();
    console.log(`発見されたセレクトボックス数: ${statusSelects.length}`);
    
    let statusSelect = null;
    for (let i = 0; i < statusSelects.length; i++) {
      const options = await statusSelects[i].locator('option').allTextContents();
      console.log(`セレクトボックス${i + 1}のオプション:`, options);
      
      if (options.some(opt => opt.includes('すべてのステータス'))) {
        statusSelect = statusSelects[i];
        console.log(`✅ ステータスフィルターを発見: セレクトボックス${i + 1}`);
        break;
      }
    }
    
    if (statusSelect) {
      const options = await statusSelect.locator('option').allTextContents();
      console.log('🔍 ステータスフィルターのオプション:', options);
      
      // 期待するオプション
      const expectedOptions = ['すべてのステータス', '入庫待ち', '検品中', '保管中', '出品中', '売約済み', 'メンテナンス'];
      
      for (const expectedOption of expectedOptions) {
        const exists = options.some(opt => opt.includes(expectedOption));
        console.log(`  ${expectedOption}: ${exists ? '✅ 存在' : '❌ 不存在'}`);
      }
      
      // メンテナンスオプションの存在確認
      const hasMaintenanceOption = options.some(opt => opt.includes('メンテナンス'));
      expect(hasMaintenanceOption, `メンテナンスオプションが見つかりません。実際のオプション: ${options.join(', ')}`).toBeTruthy();
      
    } else {
      console.log('❌ ステータスフィルターが見つかりません');
      
      // ページの全体構造を確認
      const pageHTML = await page.content();
      console.log('ページのHTMLサンプル:', pageHTML.substring(0, 1000));
    }
    
    // 2. テーブルの内容確認
    console.log('🔍 テーブルの内容を確認...');
    
    const tableRows = await page.locator('table tbody tr, .inventory-item').all();
    console.log(`テーブル行数: ${tableRows.length}`);
    
    if (tableRows.length > 0) {
      console.log('最初の5行のステータス:');
      for (let i = 0; i < Math.min(5, tableRows.length); i++) {
        const rowText = await tableRows[i].textContent();
        console.log(`  行${i + 1}: ${rowText}`);
      }
    } else {
      console.log('❌ テーブル行が見つかりません');
    }
    
    console.log('🎯 UI修正確認テスト完了');
  });
});