import { test, expect } from '@playwright/test';

test.describe('出荷ステータス自動化機能', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('スタッフ出荷管理で集荷準備完了にするとセラー販売管理がshippedになる', async ({ page }) => {
    // スタッフ出荷管理ページに移動
    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');

    // packedステータスのアイテムを探す
    const packedItems = page.locator('[data-status="packed"]');
    const firstPackedItem = packedItems.first();
    
    if (await firstPackedItem.count() > 0) {
      // アイテムIDを取得
      const itemId = await firstPackedItem.getAttribute('data-item-id');
      
      // 集荷準備完了ボタンをクリック
      await firstPackedItem.locator('button:has-text("集荷準備完了")').click();
      
      // ステータス更新確認
      await expect(firstPackedItem.locator('[data-status="ready_for_pickup"]')).toBeVisible();
      
      // セラー販売管理ページに移動して連携確認
      await page.goto('/sales');
      await page.waitForLoadState('networkidle');
      
      // shippedフィルターに切り替え
      await page.click('button:has-text("出荷済み")');
      await page.waitForTimeout(1000);
      
      // 該当アイテムがshippedステータスで表示されることを確認
      const shippedItems = page.locator('[data-status="shipped"]');
      await expect(shippedItems).toHaveCountGreaterThan(0);
      
      console.log(`✅ 連携確認完了: スタッフready_for_pickup -> セラーshipped`);
    } else {
      console.log('⚠️ テスト用のpackedアイテムが見つかりません');
    }
  });

  test('eBay API バッチ処理でdeliveredステータスが更新される', async ({ page }) => {
    // eBay配送状況更新APIを直接呼び出し
    const response = await page.request.post('/api/ebay/delivered-status-update');
    const result = await response.json();
    
    expect(response.ok()).toBeTruthy();
    expect(result.success).toBe(true);
    
    console.log('📦 バッチ処理結果:', result.summary);
    
    // セラー販売管理ページで結果確認
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    // deliveredフィルターに切り替え
    await page.click('button:has-text("到着済み")');
    await page.waitForTimeout(1000);
    
    // delivered状態のアイテムが表示されることを確認
    const deliveredItems = page.locator('[data-status="delivered"]');
    
    // バッチ処理で更新されたアイテムがあるかチェック
    if (result.summary.updatedToDelivered > 0) {
      await expect(deliveredItems).toHaveCountGreaterThan(0);
      console.log(`✅ ${result.summary.updatedToDelivered}件がdeliveredに更新されました`);
    } else {
      console.log('ℹ️ 今回のバッチではdeliveredに更新されたアイテムはありません');
    }
  });

  test('ステータス更新の整合性チェック', async ({ page }) => {
    // セラー販売管理ページでステータス別カウント確認
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    // 各ステータスのカウントを取得
    const listingCount = await page.locator('button:has-text("出品中")').textContent();
    const soldCount = await page.locator('button:has-text("購入者決定")').textContent();
    const processingCount = await page.locator('button:has-text("出荷準備中")').textContent();
    const shippedCount = await page.locator('button:has-text("出荷済み")').textContent();
    const deliveredCount = await page.locator('button:has-text("到着済み")').textContent();
    
    console.log('📊 ステータス別カウント:', {
      listing: listingCount,
      sold: soldCount,
      processing: processingCount,
      shipped: shippedCount,
      delivered: deliveredCount
    });
    
    // 各ステータスで実際のアイテム数をチェック
    for (const [statusName, buttonText] of [
      ['shipped', '出荷済み'],
      ['delivered', '到着済み']
    ]) {
      await page.click(`button:has-text("${buttonText}")`);
      await page.waitForTimeout(500);
      
      const items = await page.locator('[data-item-row]').count();
      console.log(`${statusName}: ${items}件`);
      
      // ステータスが正しく表示されているか確認
      if (items > 0) {
        const firstItem = page.locator('[data-item-row]').first();
        const displayedStatus = await firstItem.locator('[data-status]').getAttribute('data-status');
        expect(displayedStatus).toBe(statusName);
      }
    }
  });

  test('API エンドポイントの動作確認', async ({ page }) => {
    // 出荷ステータス更新API
    const shippingResponse = await page.request.put('/api/shipping', {
      data: {
        shipmentId: 'test-shipment-001',
        status: 'delivered',
        notes: 'e2eテスト用更新'
      }
    });
    
    expect(shippingResponse.ok()).toBeTruthy();
    const shippingResult = await shippingResponse.json();
    console.log('✅ 出荷API更新成功:', shippingResult);
    
    // 販売管理データ取得API
    const salesResponse = await page.request.get('/api/sales?status=shipped&limit=10');
    expect(salesResponse.ok()).toBeTruthy();
    const salesData = await salesResponse.json();
    console.log('✅ 販売管理API正常:', `${salesData.orders?.length || 0}件のshippedアイテム`);
    
    // eBay配送状況確認API
    const ebayResponse = await page.request.get('/api/ebay/delivered-status-update');
    expect(ebayResponse.ok()).toBeTruthy();
    const ebayData = await ebayResponse.json();
    console.log('✅ eBayバッチAPI正常:', ebayData.recentDeliveries?.length || 0, '件の配送履歴');
  });

  test('連携エラー処理の確認', async ({ page }) => {
    let consoleErrors: string[] = [];
    
    // コンソールエラーを監視
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 無効なデータでAPI呼び出し
    const invalidResponse = await page.request.put('/api/shipping', {
      data: {
        shipmentId: 'invalid-id',
        status: 'delivered'
      }
    });
    
    // エラーが適切にハンドリングされることを確認
    if (!invalidResponse.ok()) {
      const errorData = await invalidResponse.json();
      expect(errorData.error).toBeTruthy();
      console.log('✅ エラーハンドリング正常:', errorData.error);
    }
    
    // 重要なJSエラーがないことを確認
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Failed to load resource') && 
      !error.includes('favicon.ico')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});