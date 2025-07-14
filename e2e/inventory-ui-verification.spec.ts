import { test, expect } from '@playwright/test';

test.describe('在庫管理画面UI検証', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('在庫管理画面の操作列確認', async ({ page }) => {
    // サイドメニューから在庫管理に移動
    await page.click('text=在庫管理');
    await page.waitForURL('**/staff/inventory');
    await page.waitForTimeout(2000);

    // 現在の画面状態をスクリーンショット
    await page.screenshot({ 
      path: 'current-inventory-ui-state.png',
      fullPage: true 
    });

    // テーブルが表示されているか確認
    const table = await page.locator('table');
    const isTableVisible = await table.isVisible();
    console.log('📊 テーブル表示状況:', isTableVisible);

    if (isTableVisible) {
      // テーブルヘッダーの確認
      const headers = await page.locator('th').allTextContents();
      console.log('📋 テーブルヘッダー:', headers);

      // 操作列の内容確認
      const actionButtons = await page.locator('td:last-child button').allTextContents();
      console.log('🔧 操作ボタン:', actionButtons);

      // 操作列のボタン数を確認
      const firstRowActionButtons = await page.locator('tr:nth-child(1) td:last-child button').count();
      console.log('🎯 最初の行の操作ボタン数:', firstRowActionButtons);

      // 各ボタンの詳細確認
      for (let i = 0; i < firstRowActionButtons; i++) {
        const buttonText = await page.locator(`tr:nth-child(1) td:last-child button:nth-child(${i + 1})`).textContent();
        console.log(`🔹 ボタン${i + 1}:`, buttonText);
      }
    }

    // Card Viewの確認
    const cardView = await page.locator('.intelligence-card.asia');
    const isCardVisible = await cardView.isVisible();
    console.log('🃏 Card View表示状況:', isCardVisible);

    if (isCardVisible) {
      const cardCount = await cardView.count();
      console.log('📦 カード数:', cardCount);

      if (cardCount > 0) {
        // 最初のカードの操作ボタン確認
        const cardButtons = await page.locator('.intelligence-card.asia:first-child .flex:last-child button').allTextContents();
        console.log('🎴 カード操作ボタン:', cardButtons);
      }
    }

    // View Mode切り替えボタンの確認
    const viewModeButtons = await page.locator('button').filter({ hasText: /table|card/i }).count();
    console.log('👁️ ビューモード切り替えボタン数:', viewModeButtons);

    // 実際に表示されているコンポーネントのHTML構造を取得
    const tableHTML = isTableVisible ? await table.innerHTML() : 'テーブル非表示';
    console.log('🏗️ テーブルHTML構造 (最初の100文字):', tableHTML.substring(0, 100));
  });

  test('在庫管理画面のファイル確認', async ({ page }) => {
    // 開発者ツールでNetworkタブを有効にして、実際に読み込まれているファイルを確認
    await page.route('**/*', (route) => {
      console.log('📁 読み込まれたファイル:', route.request().url());
      route.continue();
    });

    await page.click('text=在庫管理');
    await page.waitForURL('**/staff/inventory');
    await page.waitForTimeout(3000);

    // ページソースを確認
    const pageContent = await page.content();
    const hasTableView = pageContent.includes('Table View');
    const hasCardView = pageContent.includes('Card View');
    const hasNexusButton = pageContent.includes('NexusButton');
    
    console.log('🔍 ページ内容確認:');
    console.log('  - Table View含有:', hasTableView);
    console.log('  - Card View含有:', hasCardView);
    console.log('  - NexusButton含有:', hasNexusButton);

    // 実際のコンポーネント名を確認
    const reactComponents = pageContent.match(/data-testid="[^"]*"/g) || [];
    console.log('⚛️ React コンポーネント:', reactComponents);
  });
}); 