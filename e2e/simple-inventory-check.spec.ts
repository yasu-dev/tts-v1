import { test, expect } from '@playwright/test';

test.describe('📋 在庫管理UI確認', () => {
  
  test('🚀 基本アクセステスト', async ({ page }) => {
    console.log('🌐 アプリケーションアクセス開始...');
    
    // まずアプリケーションにアクセス
    await page.goto('http://localhost:3002', { timeout: 10000 });
    console.log('✅ トップページアクセス完了');
    
    // ログインページに移動
    await page.goto('http://localhost:3002/login', { timeout: 10000 });
    console.log('✅ ログインページアクセス完了');
    
    // ページのタイトルを確認
    const title = await page.title();
    console.log('📄 ページタイトル:', title);
    
    // ページ本体が表示されているか確認
    const body = await page.locator('body').isVisible();
    console.log('📄 ページ本体表示:', body);
    
    // 実際のページ内容を確認
    const content = await page.content();
    const hasLoginForm = content.includes('type="password"') || content.includes('login') || content.includes('ログイン');
    console.log('🔐 ログインフォーム存在:', hasLoginForm);
    
    if (hasLoginForm) {
      console.log('✅ ログインページが正常に表示されています！');
      
      // 在庫管理ページに直接アクセス試行
      await page.goto('http://localhost:3002/staff/inventory', { timeout: 10000 });
      
      const inventoryPageContent = await page.content();
      const hasInventoryContent = inventoryPageContent.includes('在庫') || inventoryPageContent.includes('inventory');
      console.log('📦 在庫管理ページ内容存在:', hasInventoryContent);
      
      if (hasInventoryContent) {
        console.log('🎯 在庫管理ページアクセス成功！');
        
        // 修正したテーブルが存在するかを確認
        const hasTable = inventoryPageContent.includes('<table');
        const hasNewStyle = inventoryPageContent.includes('bg-white') && inventoryPageContent.includes('rounded-xl');
        const hasOldStyle = inventoryPageContent.includes('intelligence-card') || inventoryPageContent.includes('holo-table');
        
        console.log('📊 テーブル存在:', hasTable);
        console.log('🎨 新スタイル適用:', hasNewStyle);
        console.log('❌ 旧スタイル残存:', hasOldStyle);
        
        if (hasNewStyle && !hasOldStyle) {
          console.log('🎉 在庫管理画面の修正が正常に反映されています！');
        } else {
          console.log('⚠️ 修正の反映に問題がある可能性があります');
        }
      }
    }
    
    // スクリーンショットを撮影
    await page.screenshot({ 
      path: 'current-app-state.png',
      fullPage: true 
    });
    
    console.log('📸 現在の状態をスクリーンショットで記録しました');
  });
}); 