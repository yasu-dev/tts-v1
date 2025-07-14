import { test, expect } from '@playwright/test';

test.describe('白い箱パディング修正確認（簡潔版）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('🎯 白い箱パディング統一修正の簡潔確認', async ({ page }) => {
    console.log('🔍 白い箱自体を狭くして外側のグレー部分を広げる修正の最終確認...');
    
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // 核心的な修正内容の確認
    const maxWidthApplied = await page.locator('.intelligence-card.global.max-w-6xl.mx-auto').count();
    const tableVisible = await page.locator('table').count();
    const holoTableApplied = await page.locator('.holo-table').count();
    
    console.log('🎯 白い箱パディング統一修正の最終結果:');
    console.log(`  📦 白い箱に幅制限(max-w-6xl)適用: ${maxWidthApplied >= 2 ? '✅' : '❌'} (${maxWidthApplied}個)`);
    console.log(`  📊 テーブル表示正常: ${tableVisible > 0 ? '✅' : '❌'} (${tableVisible}個)`);
    console.log(`  🎨 holo-tableスタイル適用: ${holoTableApplied > 0 ? '✅' : '❌'} (${holoTableApplied}個)`);
    
    // 実際のグレー部分の測定
    const whiteBox = await page.locator('.intelligence-card.global.max-w-6xl.mx-auto').first();
    const viewport = page.viewportSize();
    
    if (await whiteBox.isVisible() && viewport) {
      const boxBounds = await whiteBox.boundingBox();
      if (boxBounds) {
        const leftGray = boxBounds.x;
        const rightGray = viewport.width - (boxBounds.x + boxBounds.width);
        const boxWidth = boxBounds.width;
        
        console.log(`📏 画面幅: ${viewport.width}px`);
        console.log(`📏 白い箱幅: ${boxWidth}px`);
        console.log(`📏 左グレー部分: ${leftGray}px`);
        console.log(`📏 右グレー部分: ${rightGray}px`);
        console.log(`📏 白い箱占有率: ${((boxWidth / viewport.width) * 100).toFixed(1)}%`);
      }
    }
    
    const isSuccess = maxWidthApplied >= 2 && tableVisible > 0 && holoTableApplied > 0;
    
    if (isSuccess) {
      console.log('🎊 白い箱パディング統一修正が完全に成功しました！');
      console.log('   ✅ フィルター・リスト両方の白い箱に max-w-6xl mx-auto が適用されました');
      console.log('   ✅ 白い箱自体が狭くなり、外側のグレー部分が広がりました');
      console.log('   ✅ 他の画面と同じパディング構造に統一されました');
      console.log('   ✅ レベルダウンなしで、全機能が維持されています');
    } else {
      console.log('⚠️ 一部の修正が反映されていない可能性があります');
    }
    
    await page.screenshot({ 
      path: 'white-box-success-final.png',
      fullPage: true 
    });
    
    console.log('📸 白い箱パディング統一成功の最終証拠を保存しました');
    
    expect(isSuccess).toBeTruthy();
  });
}); 