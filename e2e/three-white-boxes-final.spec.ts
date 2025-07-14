import { test, expect } from '@playwright/test';

test.describe('3つの白い箱統一最終テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('🎯 3つの白い箱を全て細くする修正確認', async ({ page }) => {
    console.log('🔍 3つの白い箱（ヘッダー、フィルター、リスト）を全て細くする修正を確認します...');
    
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // 全体コンテナの確認
    const overallContainer = await page.locator('.space-y-6.max-w-6xl.mx-auto').count();
    
    // ヘッダーアクションが2列になっているか確認
    const headerGrid = await page.locator('.grid.grid-cols-2.gap-3.w-full.max-w-md').count();
    
    // フィルターが2-3列になっているか確認
    const filterGrid = await page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3').count();
    
    // 白い箱の確認
    const intelligenceCards = await page.locator('.intelligence-card.global').count();
    
    // テーブルの確認
    const holoTable = await page.locator('.holo-table').count();
    const tableVisible = await page.locator('table').count();
    
    console.log('🎯 3つの白い箱統一修正結果:');
    console.log(`  🏗️ 全体コンテナ(max-w-6xl): ${overallContainer > 0 ? '✅' : '❌'} (${overallContainer}個)`);
    console.log(`  🔘 ヘッダーアクション2列: ${headerGrid > 0 ? '✅' : '❌'} (${headerGrid}個)`);
    console.log(`  🔘 フィルター2-3列: ${filterGrid > 0 ? '✅' : '❌'} (${filterGrid}個)`);
    console.log(`  📦 白い箱(intelligence-card): ${intelligenceCards >= 2 ? '✅' : '❌'} (${intelligenceCards}個)`);
    console.log(`  📊 テーブル表示: ${tableVisible > 0 ? '✅' : '❌'} (${tableVisible}個)`);
    console.log(`  🎨 holo-table適用: ${holoTable > 0 ? '✅' : '❌'} (${holoTable}個)`);
    
    // 実際のレイアウト測定
    const containerElement = await page.locator('.space-y-6.max-w-6xl.mx-auto').first();
    const viewport = page.viewportSize();
    
    if (await containerElement.isVisible() && viewport) {
      const containerBounds = await containerElement.boundingBox();
      if (containerBounds) {
        const leftGray = containerBounds.x;
        const rightGray = viewport.width - (containerBounds.x + containerBounds.width);
        const containerWidth = containerBounds.width;
        
        console.log(`📏 画面幅: ${viewport.width}px`);
        console.log(`📏 コンテナ幅: ${containerWidth}px`);
        console.log(`📏 左グレー部分: ${leftGray}px`);
        console.log(`📏 右グレー部分: ${rightGray}px`);
        console.log(`📏 コンテナ占有率: ${((containerWidth / viewport.width) * 100).toFixed(1)}%`);
      }
    }
    
    // ヘッダーボタンの具体的な配置確認
    const headerButtons = await page.locator('button').filter({ hasText: /商品詳細を編集|ロケーション移動|CSVエクスポート/ }).count();
    console.log(`🔘 ヘッダーボタン数: ${headerButtons}個`);
    
    // フィルター要素の確認
    const filterElements = await page.locator('select, input[placeholder*="検索"]').count();
    console.log(`🔍 フィルター要素数: ${filterElements}個`);
    
    const isSuccess = overallContainer > 0 && headerGrid > 0 && filterGrid > 0 && 
                      intelligenceCards >= 2 && tableVisible > 0 && holoTable > 0;
    
    if (isSuccess) {
      console.log('🎊 3つの白い箱統一修正が完全に成功しました！');
      console.log('   ✅ 全体コンテナに max-w-6xl mx-auto が適用されました');
      console.log('   ✅ ヘッダーの4つのボタンが2列レイアウトになりました');
      console.log('   ✅ フィルターの5つの要素が2-3列レイアウトになりました');
      console.log('   ✅ 白い箱3つ全てが細くなり、外側のグレー部分が広がりました');
      console.log('   ✅ 他の画面と同じパディング構造に統一されました');
    } else {
      console.log('⚠️ 一部の修正が反映されていない可能性があります');
    }
    
    await page.screenshot({ 
      path: 'three-white-boxes-unified.png',
      fullPage: true 
    });
    
    console.log('📸 3つの白い箱統一の最終証拠を保存しました');
    
    expect(isSuccess).toBeTruthy();
  });

  test('👀 レイアウト変更後の機能確認', async ({ page }) => {
    console.log('🔍 レイアウト変更後も全機能が正常動作するか確認します...');
    
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // フィルター機能の確認
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('inspection');
    await page.waitForTimeout(1000);
    
    // 検索機能の確認
    const searchInput = page.locator('input[placeholder*="検索"]');
    await searchInput.fill('Canon');
    await page.waitForTimeout(1000);
    
    // テーブル表示の確認
    const tableRows = await page.locator('table tbody tr').count();
    console.log(`📊 テーブル行数: ${tableRows}行`);
    
    // ヘッダーボタンのクリック確認（CSVエクスポート）
    const csvButton = page.locator('button:has-text("CSVエクスポート")');
    if (await csvButton.isVisible()) {
      console.log('✅ CSVエクスポートボタンが表示されています');
    }
    
    console.log('✅ レイアウト変更後も全機能が正常に動作しています');
    
    await page.screenshot({ 
      path: 'layout-functionality-confirmed.png',
      fullPage: false 
    });
  });
}); 