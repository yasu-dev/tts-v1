import { test, expect } from '@playwright/test';

test.describe('🔐 認証済み在庫管理UI確認', () => {
  
  test('🎯 ログイン後の在庫管理画面確認', async ({ page }) => {
    console.log('🌐 ログインプロセス開始...');
    
    // ログインページにアクセス
    await page.goto('http://localhost:3002/login', { timeout: 10000 });
    console.log('✅ ログインページアクセス完了');
    
    // セラーログインボタンをクリック（スタッフとして）
    const sellerButton = page.locator('[data-testid="seller-login"], button:has-text("セラー"), a:has-text("セラー")').first();
    if (await sellerButton.isVisible()) {
      await sellerButton.click();
      console.log('🔑 セラーログインボタンクリック');
    }
    
    // ログインボタンをクリック
    const loginButton = page.locator('button:has-text("ログイン"), [type="submit"]').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      console.log('🔑 ログインボタンクリック');
      await page.waitForTimeout(2000);
    }
    
    // ダッシュボードページに到達したかを確認
    const currentUrl = page.url();
    console.log('📍 現在のURL:', currentUrl);
    
    // 在庫管理ページに直接移動
    console.log('📦 在庫管理ページへ移動...');
    await page.goto('http://localhost:3002/staff/inventory', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // ページの内容を詳細に確認
    const pageContent = await page.content();
    console.log('📄 ページ内容の一部:', pageContent.substring(0, 500));
    
    // テーブル要素の確認
    const hasTable = pageContent.includes('<table');
    const hasTableTag = await page.locator('table').count();
    console.log('📊 <table>タグ存在（テキスト）:', hasTable);
    console.log('📊 <table>要素数（DOM）:', hasTableTag);
    
    // 修正されたスタイルの確認
    const hasNewTableStyle = pageContent.includes('bg-white') && pageContent.includes('rounded-xl');
    const hasOldTableStyle = pageContent.includes('intelligence-card') && pageContent.includes('holo-table');
    console.log('🎨 新スタイル（bg-white + rounded-xl）:', hasNewTableStyle);
    console.log('❌ 旧スタイル（intelligence-card + holo-table）:', hasOldTableStyle);
    
    // 操作列ボタンの確認
    const detailButtons = await page.locator('button:has-text("詳細")').count();
    const moveButtons = await page.locator('button:has-text("移動")').count();
    const qrButtons = await page.locator('button:has-text("QR")').count();
    console.log('🎯 詳細ボタン数:', detailButtons);
    console.log('↔️ 移動ボタン数:', moveButtons);
    console.log('📱 QRボタン数:', qrButtons);
    
    // 操作列の統合が成功しているかを確認
    if (detailButtons > 0 && moveButtons === 0 && qrButtons === 0) {
      console.log('🎉 操作列の統合が成功しています！詳細ボタンのみ表示');
    } else if (detailButtons > 0 && (moveButtons > 0 || qrButtons > 0)) {
      console.log('⚠️ 操作列がまだ統合されていません。複数のボタンが表示されています');
    } else {
      console.log('❌ テーブルまたはボタンが表示されていません');
    }
    
    // データローディング状態の確認
    const hasLoadingSpinner = await page.locator('.nexus-loading-spinner, [class*="loading"], [class*="spinner"]').count();
    console.log('⏳ ローディング表示:', hasLoadingSpinner > 0);
    
    // エラーメッセージの確認
    const hasErrorMessage = pageContent.includes('エラー') || pageContent.includes('error') || pageContent.includes('failed');
    console.log('❌ エラーメッセージ存在:', hasErrorMessage);
    
    // 商品データの確認
    const hasInventoryData = pageContent.includes('カメラ') || pageContent.includes('レンズ') || pageContent.includes('腕時計');
    console.log('📦 商品データ存在:', hasInventoryData);
    
    // 最終スクリーンショット
    await page.screenshot({ 
      path: 'authenticated-inventory-state.png',
      fullPage: true 
    });
    
    console.log('📸 認証済み状態のスクリーンショットを記録しました');
    
    // 結果サマリー
    if (hasTable && hasNewTableStyle && !hasOldTableStyle && detailButtons > 0) {
      console.log('🎊 在庫管理画面の修正が完全に反映されています！');
    } else {
      console.log('🔧 まだ修正が完全には反映されていません。要調査');
    }
  });
}); 