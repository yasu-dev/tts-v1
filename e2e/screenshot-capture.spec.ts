import { test, expect } from '@playwright/test';

test.describe('修正画面スクリーンショット撮影', () => {
  test('修正された全画面のスクリーンショット', async ({ page }) => {
    const screenshots = [];
    
    // 返品処理ページ（横幅修正の対象）
    await page.goto('http://localhost:3001/staff/returns');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/修正後-返品処理ページ.png',
      fullPage: true 
    });
    screenshots.push('返品処理ページ');
    console.log('✓ 返品処理ページのスクリーンショット撮影完了');

    // スタッフダッシュボード（アイコン修正の確認）
    await page.goto('http://localhost:3001/staff/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/修正後-スタッフダッシュボード.png',
      fullPage: true 
    });
    screenshots.push('スタッフダッシュボード');
    console.log('✓ スタッフダッシュボードのスクリーンショット撮影完了');

    // 在庫管理ページ
    await page.goto('http://localhost:3001/staff/inventory');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/修正後-在庫管理ページ.png',
      fullPage: true 
    });
    screenshots.push('在庫管理ページ');
    console.log('✓ 在庫管理ページのスクリーンショット撮影完了');

    // タスク管理ページ
    await page.goto('http://localhost:3001/staff/tasks');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/修正後-タスク管理ページ.png',
      fullPage: true 
    });
    screenshots.push('タスク管理ページ');
    console.log('✓ タスク管理ページのスクリーンショット撮影完了');

    console.log('\n=== 修正後画面スクリーンショット撮影完了 ===');
    console.log('撮影した画面:');
    screenshots.forEach((screen, index) => {
      console.log(`${index + 1}. ${screen}`);
    });
    console.log('\nファイル保存場所: test-results/ フォルダ');
  });

  test('アイコン表示の詳細確認', async ({ page }) => {
    await page.goto('http://localhost:3001/staff/dashboard');
    await page.waitForLoadState('networkidle');
    
    // サイドバーを特定
    const sidebar = page.locator('aside, nav').first();
    
    // サイドバーのクローズアップスクリーンショット
    await sidebar.screenshot({ 
      path: 'test-results/修正後-サイドバー詳細.png'
    });
    console.log('✓ サイドバーの詳細スクリーンショット撮影完了');
    
    // 各メニュー項目のアイコン確認
    const menuButtons = sidebar.locator('button, a');
    const menuCount = await menuButtons.count();
    
    console.log('\n=== アイコン表示確認結果 ===');
    for (let i = 0; i < menuCount; i++) {
      const button = menuButtons.nth(i);
      const text = await button.textContent();
      const iconCount = await button.locator('svg').count();
      const hasIcon = iconCount > 0;
      
      console.log(`${i + 1}. ${text?.trim()}: ${hasIcon ? '✓ アイコン表示' : '✗ アイコンなし'} (SVG数: ${iconCount})`);
    }
  });

  test('横幅統一の詳細確認', async ({ page }) => {
    await page.goto('http://localhost:3001/staff/returns');
    await page.waitForLoadState('networkidle');
    
    // intelligence-card要素の詳細確認
    const cards = page.locator('.intelligence-card');
    const cardCount = await cards.count();
    
    console.log('\n=== 横幅統一確認結果 ===');
    console.log(`intelligence-card要素数: ${cardCount}`);
    
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      const cardContent = card.locator('> div').first();
      const className = await cardContent.getAttribute('class');
      
      // パディングクラスの確認
      const hasPadding8 = className?.includes('p-8') || false;
      const hasPadding6 = className?.includes('p-6') || false;
      const hasPadding4 = className?.includes('p-4') || false;
      
      let paddingStatus = '';
      if (hasPadding8) paddingStatus = '✓ p-8 (統一済み)';
      else if (hasPadding6) paddingStatus = '⚠ p-6 (要修正)';
      else if (hasPadding4) paddingStatus = '⚠ p-4 (要修正)';
      else paddingStatus = '? 不明';
      
      console.log(`Card ${i + 1}: ${paddingStatus}`);
      console.log(`  クラス: ${className}`);
    }
    
    // メインコンテンツエリアのスクリーンショット
    const mainContent = page.locator('main, [role="main"]').first();
    await mainContent.screenshot({ 
      path: 'test-results/修正後-メインコンテンツ.png'
    });
    console.log('✓ メインコンテンツのスクリーンショット撮影完了');
  });
}); 