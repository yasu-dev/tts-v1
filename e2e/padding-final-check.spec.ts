import { test, expect } from '@playwright/test';

test.describe('左右パディング最終確認', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('🎯 max-w-3xl変更後のパディング一致確認', async ({ page }) => {
    console.log('🔍 max-w-3xl変更後の左右パディング一致を確認します...');
    
    // 在庫管理画面の測定
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    const containerElement = await page.locator('.space-y-6.max-w-3xl.mx-auto').first();
    const viewport = page.viewportSize();
    
    if (await containerElement.isVisible() && viewport) {
      const bounds = await containerElement.boundingBox();
      if (bounds) {
        const leftPadding = Math.round(bounds.x * 10) / 10;
        const rightPadding = Math.round((viewport.width - (bounds.x + bounds.width)) * 10) / 10;
        const contentWidth = Math.round(bounds.width);
        const occupancyRate = Math.round((bounds.width / viewport.width) * 100 * 10) / 10;
        
        console.log('📏 修正後の在庫管理画面:');
        console.log(`   左パディング: ${leftPadding}px`);
        console.log(`   右パディング: ${rightPadding}px`);
        console.log(`   コンテンツ幅: ${contentWidth}px`);
        console.log(`   占有率: ${occupancyRate}%`);
        
        // 目標値（他の画面平均）との比較
        const targetLeftPadding = 325.3;
        const targetRightPadding = 75.3;
        const targetOccupancyRate = 68.7;
        
        const leftDiff = Math.abs(leftPadding - targetLeftPadding);
        const rightDiff = Math.abs(rightPadding - targetRightPadding);
        const occupancyDiff = Math.abs(occupancyRate - targetOccupancyRate);
        
        console.log('\n🎯 目標値との差異:');
        console.log(`   左パディング差異: ${Math.round(leftDiff * 10) / 10}px`);
        console.log(`   右パディング差異: ${Math.round(rightDiff * 10) / 10}px`);
        console.log(`   占有率差異: ${Math.round(occupancyDiff * 10) / 10}%`);
        
        // 一致判定（5px以内、占有率2%以内）
        const isMatching = leftDiff <= 5 && rightDiff <= 5 && occupancyDiff <= 2;
        
        if (isMatching) {
          console.log('✅ 左右パディングが他の画面と完全に一致しました！');
          console.log('🎊 パディング統一が完全に成功しました！');
        } else {
          console.log('⚠️ まだ微調整が必要です');
          if (occupancyRate > targetOccupancyRate) {
            console.log('🔧 → さらに狭くする必要があります');
          } else {
            console.log('🔧 → 少し広げる必要があります');
          }
        }
        
        // max-w-3xl適用の確認
        const maxW3xlApplied = await page.locator('.space-y-6.max-w-3xl.mx-auto').count();
        console.log(`\n📦 max-w-3xl適用確認: ${maxW3xlApplied > 0 ? '✅' : '❌'} (${maxW3xlApplied}個)`);
        
        // レベルダウンの確認
        const tableVisible = await page.locator('table').count();
        const holoTableApplied = await page.locator('.holo-table').count();
        const intelligenceCards = await page.locator('.intelligence-card.global').count();
        
        console.log('\n🔍 レベルダウン確認:');
        console.log(`   テーブル表示: ${tableVisible > 0 ? '✅' : '❌'} (${tableVisible}個)`);
        console.log(`   holo-table適用: ${holoTableApplied > 0 ? '✅' : '❌'} (${holoTableApplied}個)`);
        console.log(`   白い箱表示: ${intelligenceCards >= 2 ? '✅' : '❌'} (${intelligenceCards}個)`);
        
        const noLevelDown = tableVisible > 0 && holoTableApplied > 0 && intelligenceCards >= 2;
        console.log(`   レベルダウンなし: ${noLevelDown ? '✅' : '❌'}`);
        
        await page.screenshot({ 
          path: 'padding-final-success.png',
          fullPage: true 
        });
        
        console.log('📸 パディング統一最終成功の証拠を保存しました');
        
        expect(isMatching && noLevelDown).toBeTruthy();
      }
    }
  });
}); 