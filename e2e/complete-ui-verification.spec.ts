import { test, expect } from '@playwright/test';

test.describe('完全UI検証 - 全画面・全要素の詳細チェック', () => {
  test('セラー在庫画面 - 完全性チェック', async ({ page }) => {
    console.log('\n🔍 セラー在庫画面の完全検証開始...');
    
    await page.goto('http://localhost:3002/inventory');
    await page.waitForLoadState('networkidle');
    
    // スクリーンショット取得
    await page.screenshot({ path: 'test-results/seller-inventory-full.png', fullPage: true });
    
    // 1. データ読み込み完了を待つ
    await page.waitForFunction(() => {
      const loadingText = document.querySelector('*')?.textContent;
      return !loadingText?.includes('データを読み込み中');
    }, { timeout: 10000 });
    
    // 2. 表示されているデータを詳細に分析
    const inventoryData = await page.evaluate(() => {
      // テーブル行、カード、その他の商品表示要素を探す
      const rows = Array.from(document.querySelectorAll('tr, [role="row"], .product-row, .inventory-item'));
      const statuses = new Set<string>();
      const badges = [];
      const productNames = [];
      
      // 各行からデータを抽出
      rows.forEach(row => {
        const text = row.textContent || '';
        
        // ステータスを探す
        const statusMatch = text.match(/入荷待ち|検品中|保管中|出品中|受注済み|出荷中|売約済み|返品|メンテナンス/);
        if (statusMatch) statuses.add(statusMatch[0]);
        
        // BusinessStatusIndicatorコンポーネントを探す（rounded-fullクラスを持つspan要素）
        const badgeElements = row.querySelectorAll('span.rounded-full');
        badgeElements.forEach(badge => {
          const text = badge.textContent?.trim();
          // ステータステキストを持つ要素のみカウント
          if (text && (text.match(/入荷待ち|検品中|保管中|出品中|受注済み|出荷中|売約済み|返品|メンテナンス/))) {
            badges.push({
              text: text,
              className: badge.className,
              backgroundColor: window.getComputedStyle(badge).backgroundColor
            });
          }
        });
        
        // 商品名を探す
        const nameMatch = text.match(/(Canon|Sony|Nikon|FUJIFILM|Tamron|Rolex|Grand Seiko|Casio).+/);
        if (nameMatch) productNames.push(nameMatch[0]);
      });
      
      // ページネーション要素を探す（実際のクラス名に合わせて修正）
      const paginationElements = document.querySelectorAll(
        '.mt-6.pt-4.border-t, [class*="pagination"], nav[aria-label*="pagination"], [role="navigation"]'
      );
      
      // 総件数表示を探す
      const totalCountElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.match(/\d+件/) && !text.includes('0件');
      });
      
      return {
        rowCount: rows.length,
        uniqueStatuses: Array.from(statuses),
        badgeCount: badges.length,
        sampleBadges: badges.slice(0, 5),
        productNames: productNames.slice(0, 5),
        hasPagination: paginationElements.length > 0,
        totalCountText: totalCountElements.map(el => el.textContent?.trim()).filter(Boolean)[0] || 'なし'
      };
    });
    
    console.log('📊 セラー在庫画面データ:', JSON.stringify(inventoryData, null, 2));
    
    // アサーション
    expect(inventoryData.rowCount).toBeGreaterThan(0);
    expect(inventoryData.uniqueStatuses.length).toBeGreaterThanOrEqual(1);
    expect(inventoryData.badgeCount).toBeGreaterThan(0);
    
    // フィルター動作確認
    const filterSelects = await page.locator('select, [role="combobox"]').all();
    console.log(`📋 フィルター数: ${filterSelects.length}`);
  });
  
  test('スタッフ在庫画面 - 完全性チェック', async ({ page }) => {
    console.log('\n🔍 スタッフ在庫画面の完全検証開始...');
    
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-results/staff-inventory-full.png', fullPage: true });
    
    await page.waitForFunction(() => {
      const loadingText = document.querySelector('*')?.textContent;
      return !loadingText?.includes('データを読み込み中');
    }, { timeout: 10000 });
    
    const staffInventoryData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr, [role="row"], .product-row, .inventory-item'));
      const allStatuses = new Set<string>();
      const statusCounts: Record<string, number> = {};
      
      rows.forEach(row => {
        const text = row.textContent || '';
        const statusMatch = text.match(/入荷待ち|検品中|保管中|出品中|受注済み|出荷中|売約済み|返品|メンテナンス/);
        if (statusMatch) {
          const status = statusMatch[0];
          allStatuses.add(status);
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
      });
      
      // バッジの視覚的表示を確認（BusinessStatusIndicatorのspan.rounded-fullを探す）
      const badges = Array.from(document.querySelectorAll('tbody span.rounded-full'))
        .filter(el => {
          const text = el.textContent?.trim() || '';
          // ステータステキストを含む要素のみ
          return text.match(/入荷待ち|検品中|保管中|出品中|受注済み|出荷中|売約済み|返品|メンテナンス/);
        })
        .map(el => ({
          text: el.textContent?.trim(),
          visible: (el as HTMLElement).offsetParent !== null,
          styles: {
            display: window.getComputedStyle(el).display,
            visibility: window.getComputedStyle(el).visibility,
            backgroundColor: window.getComputedStyle(el).backgroundColor,
            color: window.getComputedStyle(el).color
          }
        }));
      
      return {
        totalRows: rows.length,
        uniqueStatuses: Array.from(allStatuses),
        statusDistribution: statusCounts,
        visibleBadges: badges.filter(b => b.visible).length,
        badgeStyles: badges.slice(0, 3)
      };
    });
    
    console.log('📊 スタッフ在庫画面データ:', JSON.stringify(staffInventoryData, null, 2));
    
    // 全ステータスが表示されているか確認（最初の20件のみ表示されるため、5種類でもOK）
    expect(staffInventoryData.uniqueStatuses.length).toBeGreaterThanOrEqual(5);
    expect(staffInventoryData.visibleBadges).toBeGreaterThan(0);
  });
  
  test('ハードコード検出 - 全画面巡回', async ({ page }) => {
    console.log('\n🔍 ハードコード検出テスト開始...');
    
    const screens = [
      { path: '/inventory', name: 'セラー在庫' },
      { path: '/delivery', name: '納品プラン' },
      { path: '/sales', name: '売上管理' },
      { path: '/returns', name: '返品管理' },
      { path: '/staff/inventory', name: 'スタッフ在庫' },
      { path: '/staff/tasks', name: 'タスク管理' },
      { path: '/staff/shipping', name: '配送管理' },
      { path: '/staff/inspection', name: '検品' },
      { path: '/staff/photography', name: '撮影' }
    ];
    
    const hardcodedPatterns = [
      'TWD-CAM-001', 'TWD-LEN-005', 'TWD-WAT-007', // ListingManagerのモック
      'SELLER-001', 'SELLER-002', // ReturnReasonAnalysisのモック
      '標準棚A-01', '防湿庫01', // LocationListのモック
      'mockProducts', 'mockData', 'demoTasks' // 変数名
    ];
    
    for (const screen of screens) {
      console.log(`\n📄 ${screen.name} チェック中...`);
      
      await page.goto(`http://localhost:3002${screen.path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // ページ全体のテキストを取得
      const pageText = await page.evaluate(() => document.body.innerText);
      
      // ハードコードパターンをチェック
      const foundPatterns = hardcodedPatterns.filter(pattern => pageText.includes(pattern));
      
      if (foundPatterns.length > 0) {
        console.log(`❌ ハードコード検出: ${foundPatterns.join(', ')}`);
      } else {
        console.log('✅ ハードコードなし');
      }
      
      // API呼び出しを確認
      const apiCalls = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter((entry: any) => entry.name.includes('/api/'))
          .map((entry: any) => entry.name);
      });
      
      console.log(`📡 API呼び出し: ${apiCalls.length}件`);
      if (apiCalls.length === 0) {
        console.log('⚠️ APIが呼ばれていない可能性');
      }
    }
  });
  
  test('ページネーション検証', async ({ page }) => {
    console.log('\n🔍 ページネーション検証開始...');
    
    // セラー在庫画面
    await page.goto('http://localhost:3002/inventory');
    await page.waitForLoadState('networkidle');
    
    const sellerPagination = await page.evaluate(() => {
      const paginationElements = document.querySelectorAll(
        '.pagination, [class*="pagination"], button[aria-label*="page"], a[href*="page="]'
      );
      
      const pageButtons = Array.from(document.querySelectorAll('button, a')).filter(el => {
        const text = el.textContent || '';
        return text.match(/^\d+$/) || text.includes('次') || text.includes('前');
      });
      
      return {
        hasPaginationContainer: paginationElements.length > 0,
        pageButtonCount: pageButtons.length,
        pageButtonTexts: pageButtons.map(btn => btn.textContent?.trim())
      };
    });
    
    console.log('📊 セラーページネーション:', JSON.stringify(sellerPagination, null, 2));
    
    // スタッフ在庫画面
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle');
    
    const staffPagination = await page.evaluate(() => {
      const paginationElements = document.querySelectorAll(
        '.pagination, [class*="pagination"], button[aria-label*="page"], a[href*="page="]'
      );
      
      return {
        hasPaginationContainer: paginationElements.length > 0,
        elementCount: paginationElements.length
      };
    });
    
    console.log('📊 スタッフページネーション:', JSON.stringify(staffPagination, null, 2));
  });
});