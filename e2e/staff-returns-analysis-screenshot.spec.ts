import { test, expect } from '@playwright/test';

test.describe('スタッフ返品ページ - 返品理由分析タブ画面確認', () => {
  test('📸 返品理由分析タブの画面スクリーンショット', async ({ page }) => {
    console.log('🔐 ログインページに移動...');
    await page.goto('http://localhost:3002/login');
    
    // ログイン処理
    console.log('📝 ログイン情報を入力...');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    console.log('🚀 ログインボタンをクリック...');
    await page.click('button[type="submit"]');
    
    // ダッシュボードが表示されるまで待機
    await page.waitForURL('**/dashboard');
    console.log('✅ ダッシュボードに到達');
    
    // スタッフ返品ページに移動
    console.log('🎯 スタッフ返品ページに移動...');
    await page.goto('http://localhost:3002/staff/returns');
    
    // ページが完全に読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    
    // 返品理由分析タブをクリック
    console.log('🎯 返品理由分析タブをクリック...');
    const analysisTab = page.locator('button:has-text("返品理由分析")');
    await analysisTab.click();
    
    // タブコンテンツが完全に読み込まれるまで待機
    await page.waitForTimeout(2000);
    
    // 返品理由分析コンテンツが表示されることを確認
    await expect(page.locator('h2:has-text("返品理由分析")')).toBeVisible();
    
    console.log('📸 返品理由分析タブの画面をスクリーンショット撮影...');
    
    // フルページスクリーンショット
    await page.screenshot({ 
      path: 'staff-returns-analysis-tab-fullpage.png',
      fullPage: true 
    });
    
    // ビューポートスクリーンショット
    await page.screenshot({ 
      path: 'staff-returns-analysis-tab-viewport.png',
      fullPage: false 
    });
    
    console.log('✅ スクリーンショット撮影完了！');
  });
}); 