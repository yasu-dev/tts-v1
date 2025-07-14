import { test, expect } from '@playwright/test';

test.describe('スタッフ返品ページ - 返品理由分析タブ遷移確認', () => {
  test('🎯 返品理由分析タブへの遷移テスト', async ({ page }) => {
    
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
    
    // スタッフ返品ページに直接移動
    console.log('🎯 スタッフ返品ページに移動...');
    await page.goto('http://localhost:3002/staff/returns');
    
    // ページが完全に読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    
    // 返品処理のタイトルが表示されることを確認
    console.log('🔍 返品処理ページの表示確認...');
    await expect(page.locator('h1')).toContainText('返品処理');
    
    // タブナビゲーションが表示されることを確認
    console.log('📋 タブナビゲーションの確認...');
    await expect(page.locator('nav').nth(1)).toBeVisible();
    
    // 返品理由分析タブが存在することを確認
    console.log('🔍 返品理由分析タブの存在確認...');
    const analysisTab = page.locator('button:has-text("返品理由分析")');
    await expect(analysisTab).toBeVisible();
    
    // 返品理由分析タブをクリック
    console.log('🎯 返品理由分析タブをクリック...');
    await analysisTab.click();
    
    // タブがアクティブになることを確認
    console.log('✅ タブのアクティブ状態確認...');
    await expect(analysisTab).toHaveClass(/border-nexus-blue text-nexus-blue/);
    
    // 返品理由分析の内容が表示されることを確認
    console.log('📊 返品理由分析コンテンツの確認...');
    await expect(page.locator('h2:has-text("返品理由分析")')).toBeVisible();
    
    // 統計情報が表示されることを確認
    console.log('📈 統計情報の表示確認...');
    await expect(page.locator('text=総返品数').first()).toBeVisible();
    await expect(page.locator('text=返品率').first()).toBeVisible();
    await expect(page.locator('text=改善必要項目').first()).toBeVisible();
    
    // グラフエリアが表示されることを確認
    console.log('📊 グラフエリアの確認...');
    await expect(page.locator('text=返品理由内訳')).toBeVisible();
    await expect(page.locator('text=月別返品推移')).toBeVisible();
    
    // カテゴリー別返品率が表示されることを確認
    console.log('📋 カテゴリー別返品率の確認...');
    await expect(page.locator('text=カテゴリー別返品率')).toBeVisible();
    
    // 改善提案が表示されることを確認
    console.log('💡 改善提案の確認...');
    await expect(page.locator('text=改善提案')).toBeVisible();
    
    // 少し待機してUIの安定を確認
    await page.waitForTimeout(2000);
    
    console.log('🎉 返品理由分析タブへの遷移テスト完了！');
    
    // 最終確認のスクリーンショット
    await page.screenshot({ 
      path: 'staff-returns-analysis-tab-final.png',
      fullPage: true 
    });
  });
}); 