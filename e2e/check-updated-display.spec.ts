import { test, expect } from '@playwright/test';

test.describe('修正後の表示確認', () => {
  test('修正後のスタッフ在庫管理の表示を確認', async ({ page }) => {
    console.log('✅ 修正後の表示を確認');

    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('table', { timeout: 10000 });
    
    // 更新日列が完全に見えているかチェック
    const updateDateHeaders = page.locator('th').filter({ hasText: '更新日' });
    const updateDateRect = await updateDateHeaders.boundingBox();
    console.log('📅 更新日列の位置（修正後）:', updateDateRect);
    
    // 操作列が完全に見えているかチェック  
    const operationHeaders = page.locator('th').filter({ hasText: '操作' });
    const operationRect = await operationHeaders.boundingBox();
    console.log('⚙️ 操作列の位置（修正後）:', operationRect);
    
    // ビューポート内に収まっているかチェック
    const viewportWidth = page.viewportSize()?.width || 1280;
    const isUpdateDateInViewport = (updateDateRect?.x || 0) + (updateDateRect?.width || 0) <= viewportWidth;
    const isOperationInViewport = (operationRect?.x || 0) + (operationRect?.width || 0) <= viewportWidth;
    
    console.log('📊 ビューポート内収まり状況:');
    console.log(`  更新日: ${isUpdateDateInViewport ? '✅ 表示中' : '❌ 切れている'}`);
    console.log(`  操作: ${isOperationInViewport ? '✅ 表示中' : '❌ 切れている'}`);
    
    // 各列の新しい幅を確認
    const headers = page.locator('th');
    const headerCount = await headers.count();
    
    console.log('📏 修正後の各列幅:');
    let totalWidth = 0;
    for (let i = 0; i < headerCount; i++) {
      const header = headers.nth(i);
      const headerText = await header.textContent();
      const rect = await header.boundingBox();
      console.log(`  列${i+1} "${headerText?.trim()}": ${rect?.width}px`);
      totalWidth += rect?.width || 0;
    }
    console.log('📏 修正後の全列合計幅:', totalWidth);
    
    // 商品名列の幅が200px近くになっているか確認
    const productNameRect = await page.locator('th').filter({ hasText: '商品名' }).boundingBox();
    console.log('🏷️ 商品名列幅（修正後）:', productNameRect?.width);
    expect(productNameRect?.width).toBeGreaterThan(180); // 180px以上であることを確認
    
    // スクリーンショットを保存
    await page.screenshot({ 
      path: 'staff-inventory-fixed-display.png',
      fullPage: true 
    });
    
    console.log('✅ 修正後の表示確認完了');
  });
});

