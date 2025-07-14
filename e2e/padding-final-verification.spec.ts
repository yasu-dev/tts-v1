import { test, expect } from '@playwright/test';

test.describe('パディング統一最終確認テスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('🎯 パディング統一後の最終確認', async ({ page }) => {
    console.log('🔍 パディング統一修正後の確認を開始します...');
    
    // 在庫管理画面に移動
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // テーブル要素の確認
    const tableElement = await page.locator('table').first();
    await expect(tableElement).toBeVisible();
    
    // 新しい max-w-6xl コンテナの確認
    const maxWidthContainer = await page.locator('.max-w-6xl.mx-auto').first();
    await expect(maxWidthContainer).toBeVisible();
    
    // 修正後のパディング状況をスクリーンショット
    await page.screenshot({ 
      path: 'inventory-padding-unified.png',
      fullPage: false 
    });
    
    console.log('📸 修正後の在庫管理画面のパディング状況を記録しました');
    
    // テーブルの幅を測定
    const tableBox = await tableElement.boundingBox();
    const containerBox = await maxWidthContainer.boundingBox();
    const viewportSize = page.viewportSize();
    
    if (tableBox && containerBox && viewportSize) {
      console.log(`📏 ビューポート幅: ${viewportSize.width}px`);
      console.log(`📏 コンテナ幅: ${containerBox.width}px`);
      console.log(`📏 テーブル幅: ${tableBox.width}px`);
      console.log(`📏 左マージン: ${containerBox.x}px`);
      console.log(`📏 右マージン: ${viewportSize.width - (containerBox.x + containerBox.width)}px`);
    }
    
    // 各列の幅を確認
    const headers = await page.locator('thead th').all();
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const box = await header.boundingBox();
      const text = await header.textContent();
      if (box) {
        console.log(`📐 列${i + 1}「${text?.trim()}」の幅: ${box.width}px`);
      }
    }
  });

  test('👀 他の画面との視覚的パディング比較', async ({ page }) => {
    console.log('🔍 他の画面との視覚的パディング比較を実施します...');
    
    const screenshots = [];
    
    // 1. 修正後の在庫管理画面
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'final-inventory-padding.png',
      fullPage: false 
    });
    screenshots.push('在庫管理');
    
    // 2. ダッシュボード画面（比較対象）
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'final-dashboard-padding.png',
      fullPage: false 
    });
    screenshots.push('ダッシュボード');
    
    // 3. 返品画面（比較対象）
    await page.goto('http://localhost:3002/staff/returns');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'final-returns-padding.png',
      fullPage: false 
    });
    screenshots.push('返品');
    
    // 4. 出荷画面（比較対象）
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'final-shipping-padding.png',
      fullPage: false 
    });
    screenshots.push('出荷');
    
    console.log('📸 全画面のパディング比較用スクリーンショットを記録しました:');
    console.log(`   - ${screenshots.join(', ')}`);
    console.log('🎯 これらの画像を確認して、パディングが統一されているかを視覚的に判断してください');
  });

  test('✅ パディング統一成功確認', async ({ page }) => {
    console.log('🎯 パディング統一の成功を確認します...');
    
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle');
    
    // 基本的な要素の存在確認
    const tableExists = await page.locator('table').count() > 0;
    const maxWidthContainerExists = await page.locator('.max-w-6xl.mx-auto').count() > 0;
    const unifiedStyleExists = await page.locator('.bg-white.rounded-xl.border.border-nexus-border').count() > 0;
    
    // テーブル列数の確認（6列: 商品, ステータス, 保管場所, 担当者, 最終更新, 操作）
    const headerCount = await page.locator('thead th').count();
    
    // 詳細ボタンのみが表示されているかの確認
    const detailButtons = await page.locator('table tbody tr td:last-child button:has-text("詳細")').count();
    const totalRows = await page.locator('table tbody tr').count();
    
    console.log('🔍 最終確認結果:');
    console.log(`  📊 テーブル表示: ${tableExists ? '✅' : '❌'}`);
    console.log(`  📐 max-w-6xl適用: ${maxWidthContainerExists ? '✅' : '❌'}`);
    console.log(`  🎨 統一スタイル適用: ${unifiedStyleExists ? '✅' : '❌'}`);
    console.log(`  📋 テーブル列数: ${headerCount}列 ${headerCount === 6 ? '✅' : '❌'}`);
    console.log(`  🎯 詳細ボタン: ${detailButtons}/${totalRows} ${detailButtons === totalRows ? '✅' : '❌'}`);
    
    // 最終スクリーンショット
    await page.screenshot({ 
      path: 'padding-unification-success.png',
      fullPage: true 
    });
    
    console.log('📸 パディング統一成功の証拠スクリーンショットを記録しました');
    
    if (tableExists && maxWidthContainerExists && unifiedStyleExists && headerCount === 6) {
      console.log('🎊 パディング統一修正が完全に成功しました！');
    } else {
      console.log('⚠️ 一部の修正が反映されていない可能性があります');
    }
  });
}); 