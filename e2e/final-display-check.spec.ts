import { test, expect } from '@playwright/test';

test.describe('最終表示確認', () => {
  test('全ての列が正しく表示されているか最終確認', async ({ page }) => {
    console.log('🎯 最終表示確認テスト');

    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('table', { timeout: 10000 });
    
    // 全ての列が見えているかチェック
    const headers = page.locator('th');
    const headerCount = await headers.count();
    
    console.log('📊 全列の表示状況:');
    let allColumnsVisible = true;
    const viewportWidth = page.viewportSize()?.width || 1280;
    
    for (let i = 0; i < headerCount; i++) {
      const header = headers.nth(i);
      const headerText = await header.textContent();
      const rect = await header.boundingBox();
      const rightEdge = (rect?.x || 0) + (rect?.width || 0);
      const isVisible = rightEdge <= viewportWidth;
      
      console.log(`  列${i+1} "${headerText?.trim()}": 幅=${rect?.width}px, 右端=${rightEdge}px, 表示=${isVisible ? '✅' : '❌'}`);
      
      if (!isVisible) {
        allColumnsVisible = false;
      }
    }
    
    console.log(`📊 全列表示状況: ${allColumnsVisible ? '✅ 全て表示' : '❌ 一部切れている'}`);
    
    // 商品名列の幅が十分に広くなったかチェック
    const productNameRect = await page.locator('th').filter({ hasText: '商品名' }).boundingBox();
    console.log('🏷️ 商品名列幅（最終）:', productNameRect?.width);
    expect(productNameRect?.width).toBeGreaterThanOrEqual(180); // 180px以上
    
    // SKU列の幅が適切になったかチェック
    const skuRect = await page.locator('th').filter({ hasText: 'SKU' }).boundingBox();
    console.log('🔢 SKU列幅（最終）:', skuRect?.width);
    expect(skuRect?.width).toBeGreaterThanOrEqual(150); // 150px以上
    
    // 操作列の幅が適切になったかチェック
    const operationRect = await page.locator('th').filter({ hasText: '操作' }).boundingBox();
    console.log('⚙️ 操作列幅（最終）:', operationRect?.width);
    expect(operationRect?.width).toBeGreaterThanOrEqual(90); // 90px以上
    
    // 全列がビューポート内に収まっていることを確認
    expect(allColumnsVisible).toBe(true);
    
    // 最終スクリーンショット
    await page.screenshot({ 
      path: 'staff-inventory-final-check.png',
      fullPage: true 
    });
    
    console.log('🎯 最終表示確認完了');
  });
  
  test('セラーとスタッフの見た目比較', async ({ page }) => {
    console.log('👥 セラーとスタッフの見た目最終比較');
    
    // セラー画面
    await page.goto('http://localhost:3002/inventory');
    await page.waitForSelector('table', { timeout: 10000 });
    await page.screenshot({ path: 'seller-inventory-final.png' });
    
    const sellerProductNameWidth = await page.locator('th').filter({ hasText: '商品名' }).boundingBox();
    const sellerSkuWidth = await page.locator('th').filter({ hasText: 'SKU' }).boundingBox();
    const sellerOperationWidth = await page.locator('th').filter({ hasText: '操作' }).boundingBox();
    
    // スタッフ画面
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('table', { timeout: 10000 });
    await page.screenshot({ path: 'staff-inventory-final.png' });
    
    const staffProductNameWidth = await page.locator('th').filter({ hasText: '商品名' }).boundingBox();
    const staffSkuWidth = await page.locator('th').filter({ hasText: 'SKU' }).boundingBox();
    const staffOperationWidth = await page.locator('th').filter({ hasText: '操作' }).boundingBox();
    
    console.log('📊 最終比較結果:');
    console.log('商品名列:');
    console.log(`  セラー: ${sellerProductNameWidth?.width}px`);
    console.log(`  スタッフ: ${staffProductNameWidth?.width}px`);
    console.log(`  差: ${Math.abs((sellerProductNameWidth?.width || 0) - (staffProductNameWidth?.width || 0))}px`);
    
    console.log('SKU列:');
    console.log(`  セラー: ${sellerSkuWidth?.width}px`);
    console.log(`  スタッフ: ${staffSkuWidth?.width}px`);
    console.log(`  差: ${Math.abs((sellerSkuWidth?.width || 0) - (staffSkuWidth?.width || 0))}px`);
    
    console.log('操作列:');
    console.log(`  セラー: ${sellerOperationWidth?.width}px`);
    console.log(`  スタッフ: ${staffOperationWidth?.width}px`);
    console.log(`  差: ${Math.abs((sellerOperationWidth?.width || 0) - (staffOperationWidth?.width || 0))}px`);
    
    console.log('👥 見た目比較完了');
  });
});

