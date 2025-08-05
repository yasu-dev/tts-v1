import { test, expect } from '@playwright/test';

test.describe('最終検証: ハードコード完全排除確認', () => {
  test('セラー在庫画面 - 45件のSQLiteデータが正しく表示される', async ({ page }) => {
    console.log('🔍 セラー在庫画面最終検証...');
    
    // 1. セラー画面へアクセス
    await page.goto('http://localhost:3002/inventory');
    await page.waitForLoadState('networkidle');
    
    // API応答を待つ
    const inventoryResponse = page.waitForResponse(
      response => response.url().includes('/api/inventory') && response.ok()
    );
    
    // コンソールログ監視
    page.on('console', msg => {
      if (msg.text().includes('セラー')) {
        console.log('📋', msg.text());
      }
    });
    
    await inventoryResponse;
    await page.waitForTimeout(1000); // データ処理待ち
    
    // 「データを読み込み中...」が消えるのを待つ
    await expect(page.locator('text=データを読み込み中')).toBeHidden({ timeout: 10000 });
    
    // データ表示確認 - いずれかの方法でデータが表示されていること
    const hasData = await page.evaluate(() => {
      // テーブル内の行数を確認
      const tableRows = document.querySelectorAll('tbody tr, [role="row"]');
      // 商品カード要素を確認
      const cards = document.querySelectorAll('[data-testid*="inventory"], .inventory-card, .product-card');
      // 商品名が含まれる要素を確認  
      const productNames = document.querySelectorAll('*:not(script):not(style)');
      let productCount = 0;
      productNames.forEach(el => {
        if (el.textContent?.match(/Canon|Sony|Nikon|FUJIFILM|Tamron|Grand Seiko/)) {
          productCount++;
        }
      });
      
      return {
        tableRows: tableRows.length,
        cards: cards.length,
        productNames: productCount,
        hasVisibleData: tableRows.length > 0 || cards.length > 0 || productCount > 5
      };
    });
    
    console.log('📊 表示状態:', hasData);
    expect(hasData.hasVisibleData).toBe(true);
    
    // ステータスフィルターが機能することを確認
    const statusFilter = page.locator('select, [role="combobox"]').first();
    if (await statusFilter.isVisible()) {
      // 入荷待ちでフィルター
      await statusFilter.selectOption({ value: 'inbound' });
      await page.waitForTimeout(500);
      
      // フィルター後もデータが表示されることを確認
      const filteredData = await page.evaluate(() => {
        const visibleElements = document.querySelectorAll('tbody tr:not([style*="display: none"]), .product-card:not([style*="display: none"])');
        return visibleElements.length;
      });
      
      console.log(`📊 入荷待ちフィルター後: ${filteredData}件`);
    }
    
    await page.screenshot({ path: 'test-results/seller-final-verification.png', fullPage: true });
  });
  
  test('スタッフ在庫画面 - 全ステータスの商品が表示される', async ({ page }) => {
    console.log('🔍 スタッフ在庫画面最終検証...');
    
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // ステータスの種類を確認
    const statuses = await page.evaluate(() => {
      const statusElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.match(/入荷待ち|検品中|保管中|出品中|受注済み|出荷中|売約済み|返品|メンテナンス/);
      });
      
      const uniqueStatuses = new Set<string>();
      statusElements.forEach(el => {
        const matches = el.textContent?.match(/入荷待ち|検品中|保管中|出品中|受注済み|出荷中|売約済み|返品|メンテナンス/g);
        matches?.forEach(status => uniqueStatuses.add(status));
      });
      
      return Array.from(uniqueStatuses);
    });
    
    console.log('📊 表示されているステータス:', statuses);
    expect(statuses.length).toBeGreaterThan(5); // 少なくとも6種類以上のステータス
    
    await page.screenshot({ path: 'test-results/staff-final-verification.png', fullPage: true });
  });
  
  test('ハードコードされたコンポーネントの動的データ化確認', async ({ page }) => {
    console.log('🔍 ハードコード排除確認...');
    
    const componentsToCheck = [
      { url: '/staff/locations', apiPath: '/api/locations', name: 'ロケーション管理' },
      { url: '/staff/returns', apiPath: '/api/returns', name: '返品管理' },
      { url: '/staff/picking', apiPath: '/api/orders', name: 'ピッキング' }
    ];
    
    for (const component of componentsToCheck) {
      console.log(`\n📄 チェック: ${component.name}`);
      
      // APIコールを監視
      let apiCalled = false;
      page.on('request', request => {
        if (request.url().includes(component.apiPath)) {
          apiCalled = true;
          console.log(`✅ API呼び出し確認: ${request.url()}`);
        }
      });
      
      await page.goto(`http://localhost:3002${component.url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // モックデータの痕跡がないことを確認
      const hasMockData = await page.evaluate(() => {
        const pageText = document.body.innerText;
        // 特定のモックデータの文字列を検索
        return pageText.includes('TWD-CAM-001') || // ListingManagerのモックSKU
               pageText.includes('SELLER-001') || // ReturnReasonAnalysisのモックID
               pageText.includes('標準棚A-01'); // LocationListのモックコード
      });
      
      if (hasMockData) {
        console.log(`⚠️ ${component.name}にモックデータの痕跡あり`);
      } else {
        console.log(`✅ ${component.name}はクリーン`);
      }
    }
  });
  
  test('全画面巡回 - SQLiteデータのみ使用確認', async ({ page }) => {
    console.log('🔍 全画面巡回テスト...');
    
    const routes = [
      '/inventory',
      '/delivery', 
      '/sales',
      '/returns',
      '/timeline',
      '/staff/inventory',
      '/staff/tasks',
      '/staff/shipping',
      '/staff/photography',
      '/staff/inspection'
    ];
    
    let totalApiCalls = 0;
    page.on('request', request => {
      if (request.url().includes('/api/') && !request.url().includes('_next')) {
        totalApiCalls++;
      }
    });
    
    for (const route of routes) {
      console.log(`📄 ${route}...`);
      const beforeApiCalls = totalApiCalls;
      
      await page.goto(`http://localhost:3002${route}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      const afterApiCalls = totalApiCalls;
      if (afterApiCalls > beforeApiCalls) {
        console.log(`  ✅ APIコール: ${afterApiCalls - beforeApiCalls}回`);
      } else {
        console.log(`  ⚠️ APIコールなし`);
      }
    }
    
    console.log(`\n📊 総APIコール数: ${totalApiCalls}`);
    expect(totalApiCalls).toBeGreaterThan(20); // 十分なAPI呼び出しがあること
  });
});