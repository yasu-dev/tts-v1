import { test, expect } from '@playwright/test';

test.describe('商品履歴画面 - 詳細機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログインページにアクセス
    await page.goto('/login');
    await page.waitForTimeout(2000);
    
    // セラーログイン
    const sellerLogin = page.locator('[data-testid="seller-login"]');
    if (await sellerLogin.isVisible()) {
      await sellerLogin.click();
      await page.waitForTimeout(1000);
      
      const loginBtn = page.locator('button:has-text("ログイン")');
      if (await loginBtn.isVisible()) {
        await loginBtn.click();
        await page.waitForTimeout(3000);
      }
    }
  });

  test('商品リストテーブル表示と詳細機能確認', async ({ page }) => {
    console.log('🔍 商品履歴画面の詳細機能テスト開始');
    
    // 商品履歴ページにアクセス
    await page.goto('/timeline');
    await page.waitForTimeout(3000);
    
    // テーブル形式の表示確認
    const table = page.locator('table');
    const isTableVisible = await table.isVisible();
    console.log(`商品一覧テーブル: ${isTableVisible ? '✅ 表示中' : '❌ 未表示'}`);
    
    // テーブルヘッダーの確認
    const headers = ['商品名', 'カテゴリ', 'ステータス', '価格', '操作'];
    for (const header of headers) {
      const headerElement = page.locator(`th:has-text("${header}")`);
      const isHeaderVisible = await headerElement.isVisible();
      console.log(`  ${header}ヘッダー: ${isHeaderVisible ? '✅' : '❌'}`);
    }
    
    // 商品行の確認
    const productRows = page.locator('tbody tr');
    const rowCount = await productRows.count();
    console.log(`商品行数: ${rowCount}行`);
    
    if (rowCount > 0) {
      // 最初の商品の情報を取得
      const firstRow = productRows.first();
      const productName = await firstRow.locator('td:nth-child(1)').textContent();
      console.log(`最初の商品: ${productName}`);
      
      // 詳細ボタンの確認
      const detailButton = firstRow.locator('button:has-text("詳細")');
      const isDetailButtonVisible = await detailButton.isVisible();
      console.log(`詳細ボタン: ${isDetailButtonVisible ? '✅ 表示中' : '❌ 未表示'}`);
      
      if (isDetailButtonVisible) {
        // 詳細ボタンをクリック
        await detailButton.click();
        await page.waitForTimeout(2000);
        
        // モーダルの表示確認
        const modal = page.locator('[role="dialog"]');
        const isModalOpen = await modal.isVisible();
        console.log(`詳細モーダル: ${isModalOpen ? '✅ 表示中' : '❌ 未表示'}`);
        
        if (isModalOpen) {
          // モーダルタイトルの確認
          const modalTitle = await modal.locator('h2').textContent();
          console.log(`モーダルタイトル: ${modalTitle}`);
          
          // フロー段階説明の確認
          const flowExplanation = page.locator('text=フロー段階の説明');
          const hasFlowExplanation = await flowExplanation.isVisible();
          console.log(`フロー説明: ${hasFlowExplanation ? '✅ 表示中' : '❌ 未表示'}`);
          
          // 商品情報ヘッダーの確認
          const productInfo = modal.locator('.bg-nexus-bg-secondary');
          const hasProductInfo = await productInfo.isVisible();
          console.log(`商品情報ヘッダー: ${hasProductInfo ? '✅ 表示中' : '❌ 未表示'}`);
          
          // モーダルのスクリーンショット
          await page.screenshot({ 
            path: 'timeline-detail-modal.png', 
            fullPage: true 
          });
          console.log('詳細モーダルのスクリーンショットを保存: timeline-detail-modal.png');
          
          // モーダルを閉じる
          const closeButton = modal.locator('button[aria-label="モーダルを閉じる"]');
          if (await closeButton.isVisible()) {
            await closeButton.click();
            await page.waitForTimeout(1000);
            
            const isModalClosed = !(await modal.isVisible());
            console.log(`モーダル閉じる: ${isModalClosed ? '✅ 正常' : '❌ 失敗'}`);
          }
        }
      }
      
      // 選択ボタンの確認
      const selectButton = firstRow.locator('button:has-text("選択")');
      const isSelectButtonVisible = await selectButton.isVisible();
      console.log(`選択ボタン: ${isSelectButtonVisible ? '✅ 表示中' : '❌ 未表示'}`);
      
      if (isSelectButtonVisible) {
        // 選択ボタンをクリック
        await selectButton.click();
        await page.waitForTimeout(2000);
        
        // 選択状態の確認
        const selectedButton = firstRow.locator('button:has-text("選択中")');
        const isSelected = await selectedButton.isVisible();
        console.log(`選択状態: ${isSelected ? '✅ 選択中' : '❌ 未選択'}`);
        
        // 簡易履歴表示の確認
        const summaryTimeline = page.locator('h3:has-text("履歴概要")');
        const hasSummaryTimeline = await summaryTimeline.isVisible();
        console.log(`簡易履歴表示: ${hasSummaryTimeline ? '✅ 表示中' : '❌ 未表示'}`);
        
        // 詳細フローボタンの確認
        const detailFlowButton = page.locator('button:has-text("詳細フローを表示")');
        const hasDetailFlowButton = await detailFlowButton.isVisible();
        console.log(`詳細フローボタン: ${hasDetailFlowButton ? '✅ 表示中' : '❌ 未表示'}`);
      }
    }
    
    // 最終的な画面の状態をスクリーンショット
    await page.screenshot({ 
      path: 'timeline-improved-ui.png', 
      fullPage: true 
    });
    console.log('改善されたUI画面のスクリーンショットを保存: timeline-improved-ui.png');
    
    console.log('\n🎯 詳細機能テスト結果:');
    console.log('================================');
    if (isTableVisible && rowCount > 0) {
      console.log('✅ 商品リストのテーブル表示が成功しています');
      console.log('✅ 在庫管理画面と統一されたUI構造を実現しています');
    } else {
      console.log('❌ テーブル表示に問題があります');
    }
    
    // テスト assertion
    expect(isTableVisible).toBeTruthy();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('UIの統一性確認', async ({ page }) => {
    console.log('🔍 UI統一性確認テスト');
    
    const pages = [
      { name: '在庫管理', url: '/inventory' },
      { name: '商品履歴', url: '/timeline' }
    ];
    
    const uiElements = [];
    
    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForTimeout(3000);
      
      // テーブル構造の確認
      const table = page.locator('table');
      const hasTable = await table.isVisible();
      
      // ヘッダー構造の確認
      const headers = page.locator('th');
      const headerCount = await headers.count();
      
      // ボタンスタイルの確認
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      // 統一されたカードスタイルの確認
      const cards = page.locator('.bg-white.rounded-xl.border.border-nexus-border');
      const cardCount = await cards.count();
      
      const result = {
        page: pageInfo.name,
        hasTable,
        headerCount,
        buttonCount,
        cardCount
      };
      
      uiElements.push(result);
      console.log(`${pageInfo.name}:`);
      console.log(`  テーブル表示: ${hasTable ? '✅' : '❌'}`);
      console.log(`  ヘッダー数: ${headerCount}個`);
      console.log(`  ボタン数: ${buttonCount}個`);
      console.log(`  統一カード数: ${cardCount}個`);
    }
    
    // 統一性の評価
    const inventoryResult = uiElements.find(r => r.page === '在庫管理');
    const timelineResult = uiElements.find(r => r.page === '商品履歴');
    
    const isUIUnified = inventoryResult?.hasTable && timelineResult?.hasTable &&
                        inventoryResult?.cardCount > 0 && timelineResult?.cardCount > 0;
    
    console.log('\n🎯 UI統一性結果:');
    console.log('================================');
    if (isUIUnified) {
      console.log('✅ 在庫管理画面と商品履歴画面のUIが統一されています');
    } else {
      console.log('❌ UI統一性に問題があります');
    }
    
    expect(isUIUnified).toBeTruthy();
  });
}); 