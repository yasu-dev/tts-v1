import { test, expect } from '@playwright/test';

test.describe('パディング統一確認（簡潔版）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('🎯 パディング統一修正の最終確認', async ({ page }) => {
    console.log('🔍 パディング統一修正の最終確認を開始します...');
    
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // 修正内容の確認
    const maxWidthContainer = await page.locator('.max-w-6xl.mx-auto').count();
    const tableExists = await page.locator('table').count();
    const headerCount = await page.locator('thead th').count();
    const detailButtons = await page.locator('table tbody tr td:last-child button:has-text("詳細")').count();
    
    // 列幅指定の確認
    const widthSpecifiedHeaders = await page.locator('thead th[class*="w-["]').count();
    const widthSpecifiedCells = await page.locator('tbody tr:first-child td[class*="w-["]').count();
    
    console.log('🎯 パディング統一修正結果:');
    console.log(`  📐 max-w-6xl適用: ${maxWidthContainer > 0 ? '✅' : '❌'} (${maxWidthContainer}個)`);
    console.log(`  📊 テーブル表示: ${tableExists > 0 ? '✅' : '❌'} (${tableExists}個)`);
    console.log(`  📋 テーブル列数: ${headerCount}列 ${headerCount === 6 ? '✅' : '❌'}`);
    console.log(`  🎯 詳細ボタン: ${detailButtons}個 ${detailButtons > 0 ? '✅' : '❌'}`);
    console.log(`  📏 列幅指定(ヘッダー): ${widthSpecifiedHeaders}個 ${widthSpecifiedHeaders === 6 ? '✅' : '❌'}`);
    console.log(`  📏 列幅指定(セル): ${widthSpecifiedCells}個 ${widthSpecifiedCells === 6 ? '✅' : '❌'}`);
    
    // 最終判定
    const isSuccess = maxWidthContainer > 0 && tableExists > 0 && headerCount === 6 && 
                      widthSpecifiedHeaders === 6 && widthSpecifiedCells === 6;
    
    if (isSuccess) {
      console.log('🎊 パディング統一修正が完全に成功しました！');
      console.log('   - テーブルコンテナにmax-w-6xlが適用され、中央配置されています');
      console.log('   - 各列に幅指定が適用され、テーブル幅が最適化されています');
      console.log('   - 結果的に左右のパディングが他の画面と統一して見えるようになりました');
    } else {
      console.log('⚠️ 一部の修正が反映されていない可能性があります');
    }
    
    // 証拠スクリーンショット
    await page.screenshot({ 
      path: 'padding-unified-final-evidence.png',
      fullPage: true 
    });
    
    console.log('📸 パディング統一の最終証拠スクリーンショットを保存しました');
    
    expect(isSuccess).toBeTruthy();
  });
}); 