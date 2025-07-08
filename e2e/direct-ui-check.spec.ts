import { test, expect } from '@playwright/test';

test.describe('直接UI確認', () => {
  test('現在の画面状態を確認', async ({ page }) => {
    // 開発サーバーが起動しているか確認
    await page.goto('http://localhost:3001/staff/returns');
    
    // ページタイトルの確認
    const title = await page.title();
    console.log(`ページタイトル: ${title}`);
    
    // ページの基本的な読み込み確認
    await page.waitForLoadState('domcontentloaded');
    
    // サイドバーの確認（複数のセレクターを試行）
    const sidebarSelectors = [
      'nav',
      'aside',
      '[role="navigation"]',
      '.sidebar',
      '[class*="sidebar"]',
      '[class*="nav"]'
    ];
    
    let sidebarFound = false;
    for (const selector of sidebarSelectors) {
      const element = page.locator(selector).first();
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        console.log(`✓ サイドバー発見: ${selector}`);
        sidebarFound = true;
        
        // サイドバー内のボタンやリンクを確認
        const buttons = element.locator('button, a');
        const buttonCount = await buttons.count();
        console.log(`サイドバー内のボタン/リンク数: ${buttonCount}`);
        
        // 各ボタンのテキストとアイコンを確認
        for (let i = 0; i < Math.min(buttonCount, 10); i++) {
          const button = buttons.nth(i);
          const text = await button.textContent();
          const hasIcon = await button.locator('svg').count() > 0;
          console.log(`ボタン ${i + 1}: "${text}" - アイコン: ${hasIcon ? '有' : '無'}`);
        }
        break;
      }
    }
    
    if (!sidebarFound) {
      console.log('✗ サイドバーが見つかりません');
    }
    
    // メインコンテンツエリアの確認
    const mainContent = page.locator('main, [role="main"], .main-content').first();
    const hasMainContent = await mainContent.isVisible().catch(() => false);
    console.log(`メインコンテンツ: ${hasMainContent ? '有' : '無'}`);
    
    // intelligence-card要素の確認
    const cards = page.locator('.intelligence-card');
    const cardCount = await cards.count();
    console.log(`intelligence-card要素数: ${cardCount}`);
    
    if (cardCount > 0) {
      // 最初のカードの詳細確認
      const firstCard = cards.first();
      const cardHTML = await firstCard.innerHTML();
      console.log('最初のカードの内容:');
      console.log(cardHTML.substring(0, 200) + '...');
      
      // パディングクラスの確認
      const cardContent = firstCard.locator('> div').first();
      const className = await cardContent.getAttribute('class');
      console.log(`カードのクラス: ${className}`);
    }
    
    // 現在の画面のスクリーンショットを撮影
    await page.screenshot({ 
      path: 'test-results/current-screen-state.png',
      fullPage: true 
    });
    console.log('スクリーンショット保存: test-results/current-screen-state.png');
  });
  
  test('DOM構造の詳細確認', async ({ page }) => {
    await page.goto('http://localhost:3001/staff/returns');
    await page.waitForLoadState('domcontentloaded');
    
    // ページ全体のHTML構造の一部を出力
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('ページ構造の概要:');
    console.log(bodyHTML.substring(0, 500) + '...');
    
    // 特定のクラス名を持つ要素を検索
    const classesToCheck = [
      'intelligence-card',
      'sidebar',
      'nav',
      'menu',
      'button',
      'p-4',
      'p-6', 
      'p-8'
    ];
    
    for (const className of classesToCheck) {
      const elements = page.locator(`.${className}`);
      const count = await elements.count();
      console.log(`クラス "${className}": ${count}個の要素`);
    }
  });
}); 