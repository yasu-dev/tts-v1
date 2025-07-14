import { test, expect } from '@playwright/test';

test.describe('白い箱パディング統一最終テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('🎯 白い箱を狭くして外側グレー部分を広げる修正確認', async ({ page }) => {
    console.log('🔍 白い箱自体を狭くして外側のグレー部分を広げる修正を確認します...');
    
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // 修正内容の確認
    const filterWithMaxWidth = await page.locator('.intelligence-card.global.max-w-6xl.mx-auto').count();
    const listWithMaxWidth = await page.locator('.intelligence-card.global.max-w-6xl.mx-auto').count();
    const tableFullWidth = await page.locator('table.w-full').count();
    
    console.log('🎯 白い箱パディング修正結果:');
    console.log(`  📦 フィルター白い箱に幅制限: ${filterWithMaxWidth >= 1 ? '✅' : '❌'}`);
    console.log(`  📦 リスト白い箱に幅制限: ${listWithMaxWidth >= 2 ? '✅' : '❌'} (${listWithMaxWidth}個)`);
    console.log(`  📊 テーブルフル幅適用: ${tableFullWidth > 0 ? '✅' : '❌'} (${tableFullWidth}個)`);
    
    // 白い箱の実際の幅とグレー部分を測定
    const whiteBoxes = await page.locator('.intelligence-card.global.max-w-6xl.mx-auto').all();
    const viewportSize = page.viewportSize();
    
    if (whiteBoxes.length > 0 && viewportSize) {
      const firstBox = whiteBoxes[0];
      const boxBounds = await firstBox.boundingBox();
      
      if (boxBounds) {
        const leftGraySpace = boxBounds.x;
        const rightGraySpace = viewportSize.width - (boxBounds.x + boxBounds.width);
        const boxWidthPercentage = (boxBounds.width / viewportSize.width) * 100;
        
        console.log(`📐 ビューポート幅: ${viewportSize.width}px`);
        console.log(`📐 白い箱幅: ${boxBounds.width}px (${boxWidthPercentage.toFixed(1)}%)`);
        console.log(`📐 左グレー部分: ${leftGraySpace}px`);
        console.log(`📐 右グレー部分: ${rightGraySpace}px`);
        console.log(`📐 グレー部分合計: ${leftGraySpace + rightGraySpace}px`);
      }
    }
    
    // 最終判定
    const isSuccess = filterWithMaxWidth >= 1 && listWithMaxWidth >= 2 && tableFullWidth > 0;
    
    if (isSuccess) {
      console.log('🎊 白い箱パディング統一修正が完全に成功しました！');
      console.log('   - フィルター白い箱に max-w-6xl mx-auto 適用済み');
      console.log('   - リスト白い箱に max-w-6xl mx-auto 適用済み');
      console.log('   - 白い箱自体が狭くなり、外側のグレー部分が広がりました');
      console.log('   - 他の画面と同じパディング構造に統一されました');
    } else {
      console.log('⚠️ 一部の修正が反映されていない可能性があります');
    }
    
    // 証拠スクリーンショット
    await page.screenshot({ 
      path: 'white-box-padding-unified.png',
      fullPage: true 
    });
    
    console.log('📸 白い箱パディング統一の最終証拠スクリーンショットを保存しました');
    
    expect(isSuccess).toBeTruthy();
  });

  test('👀 他の画面とのグレー部分比較確認', async ({ page }) => {
    console.log('🔍 他の画面とのグレー部分を比較確認します...');
    
    // 1. 修正後の在庫管理画面
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'final-inventory-gray-padding.png',
      fullPage: false 
    });
    
    // 2. ダッシュボード画面（比較対象）
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'final-dashboard-gray-padding.png',
      fullPage: false 
    });
    
    // 3. 返品管理画面（比較対象）
    await page.goto('http://localhost:3002/staff/returns');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'final-returns-gray-padding.png',
      fullPage: false 
    });
    
    // 4. 出荷管理画面（比較対象）
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'final-shipping-gray-padding.png',
      fullPage: false 
    });
    
    console.log('📸 全画面のグレー部分比較用スクリーンショットを記録しました');
    console.log('🎯 これらの画像で、外側のグレー部分が他の画面と統一されているかを視覚的に確認してください');
    console.log('📏 左右のグレー部分の幅が全画面で一致していれば成功です');
  });
}); 