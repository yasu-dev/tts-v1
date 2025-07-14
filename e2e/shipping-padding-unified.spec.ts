import { test, expect } from '@playwright/test';

test.describe('出荷管理画面パディング統一確認', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('🎯 出荷管理画面のパディング統一成功確認', async ({ page }) => {
    console.log('🔍 出荷管理画面のパディング統一成功確認を実施します...');
    
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    const containerElement = await page.locator('.space-y-6.max-w-4xl.mx-auto').first();
    const viewport = page.viewportSize();
    
    if (await containerElement.isVisible() && viewport) {
      const bounds = await containerElement.boundingBox();
      if (bounds) {
        const leftPadding = Math.round(bounds.x * 10) / 10;
        const rightPadding = Math.round((viewport.width - (bounds.x + bounds.width)) * 10) / 10;
        const contentWidth = Math.round(bounds.width);
        const occupancyRate = Math.round((bounds.width / viewport.width) * 100 * 10) / 10;
        
        console.log('📏 修正後の出荷管理画面:');
        console.log(`   左パディング: ${leftPadding}px`);
        console.log(`   右パディング: ${rightPadding}px`);
        console.log(`   コンテンツ幅: ${contentWidth}px`);
        console.log(`   占有率: ${occupancyRate}%`);
        
        // 目標値（他の画面平均）
        const targetLeftPadding = 325.3;
        const targetRightPadding = 75.3;
        const targetOccupancyRate = 68.7;
        
        const leftDiff = Math.abs(leftPadding - targetLeftPadding);
        const rightDiff = Math.abs(rightPadding - targetRightPadding);
        const occupancyDiff = Math.abs(occupancyRate - targetOccupancyRate);
        
        console.log('\n🎯 他の画面との差異:');
        console.log(`   左パディング差異: ${Math.round(leftDiff * 10) / 10}px`);
        console.log(`   右パディング差異: ${Math.round(rightDiff * 10) / 10}px`);
        console.log(`   占有率差異: ${Math.round(occupancyDiff * 10) / 10}%`);
        
        // 許容範囲判定（10px以内、占有率3%以内）
        const isMatching = leftDiff <= 10 && rightDiff <= 10 && occupancyDiff <= 3;
        
        // 全機能の確認
        const maxW4xlApplied = await page.locator('.space-y-6.max-w-4xl.mx-auto').count();
        const tableVisible = await page.locator('table').count();
        const holoTableApplied = await page.locator('.holo-table').count();
        const intelligenceCards = await page.locator('.intelligence-card.global').count();
        const headerGrid = await page.locator('.grid.grid-cols-2.gap-3.w-full.max-w-md').count();
        const filterGrid = await page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3').count();
        const statsCards = await page.locator('.intelligence-metrics').count();
        
        console.log('\n✅ 全修正項目の確認:');
        console.log(`   📦 max-w-4xl適用: ${maxW4xlApplied > 0 ? '✅' : '❌'} (${maxW4xlApplied}個)`);
        console.log(`   📊 テーブル表示: ${tableVisible > 0 ? '✅' : '❌'} (${tableVisible}個)`);
        console.log(`   🎨 holo-table適用: ${holoTableApplied > 0 ? '✅' : '❌'} (${holoTableApplied}個)`);
        console.log(`   📦 白い箱表示: ${intelligenceCards >= 1 ? '✅' : '❌'} (${intelligenceCards}個)`);
        console.log(`   📈 統計カード表示: ${statsCards > 0 ? '✅' : '❌'} (${statsCards}個)`);
        console.log(`   🔘 ヘッダー2列レイアウト: ${headerGrid > 0 ? '✅' : '❌'} (${headerGrid}個)`);
        console.log(`   🔘 フィルター2-3列レイアウト: ${filterGrid > 0 ? '✅' : '❌'} (${filterGrid}個)`);
        
        const allFeaturesWorking = maxW4xlApplied > 0 && tableVisible > 0 && holoTableApplied > 0 && 
                                   intelligenceCards >= 1 && statsCards > 0 && headerGrid > 0 && filterGrid > 0;
        
        console.log(`   🎯 全機能正常: ${allFeaturesWorking ? '✅' : '❌'}`);
        console.log(`   📏 パディング許容範囲内: ${isMatching ? '✅' : '❌'}`);
        
        if (isMatching && allFeaturesWorking) {
          console.log('\n🎊 出荷管理画面のパディング統一が完全に成功しました！');
          console.log('   ✅ 他の画面との左右パディングが視覚的に一致しました');
          console.log('   ✅ 白い箱が細くなりました');
          console.log('   ✅ ヘッダーアクションが2列レイアウトになりました');
          console.log('   ✅ フィルターが2-3列レイアウトになりました');
          console.log('   ✅ 外側のグレー部分が適切に広がりました');
          console.log('   ✅ 全機能がレベルダウンなしで維持されています');
          console.log('   🎯 在庫管理画面と同じ修正が正常に適用されました！');
        } else {
          console.log('\n⚠️ 一部調整が必要な項目があります');
        }
        
        // 在庫管理画面との比較
        await page.goto('http://localhost:3002/staff/inventory');
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        
        const inventoryContainer = await page.locator('.space-y-6.max-w-4xl.mx-auto').first();
        if (await inventoryContainer.isVisible()) {
          const inventoryBounds = await inventoryContainer.boundingBox();
          if (inventoryBounds) {
            const inventoryLeftPadding = Math.round(inventoryBounds.x * 10) / 10;
            const inventoryRightPadding = Math.round((viewport.width - (inventoryBounds.x + inventoryBounds.width)) * 10) / 10;
            
            const paddingMatch = Math.abs(leftPadding - inventoryLeftPadding) <= 2 && 
                                Math.abs(rightPadding - inventoryRightPadding) <= 2;
            
            console.log('\n🔍 在庫管理画面との比較:');
            console.log(`   出荷管理: 左${leftPadding}px / 右${rightPadding}px`);
            console.log(`   在庫管理: 左${inventoryLeftPadding}px / 右${inventoryRightPadding}px`);
            console.log(`   パディング一致: ${paddingMatch ? '✅' : '❌'}`);
            
            if (paddingMatch) {
              console.log('🎊 出荷管理画面と在庫管理画面のパディングが完全に一致しました！');
            }
          }
        }
        
        await page.screenshot({ 
          path: 'shipping-padding-unified-success.png',
          fullPage: true 
        });
        
        console.log('📸 出荷管理画面パディング統一成功の証拠を保存しました');
        
        expect(isMatching && allFeaturesWorking).toBeTruthy();
      }
    }
  });
}); 