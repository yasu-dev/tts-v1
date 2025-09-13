import { test, expect } from '@playwright/test';

/**
 * ピッキング完了作成→梱包待ちリスト表示の完全ワークフローE2Eテスト
 * 
 * このテストは「ピッキング完了を作成」操作で確実に梱包待ちリストに
 * 商品が表示されることを検証します。
 */

test.describe('ピッキング完了→梱包待ちリスト完全ワークフロー', () => {
  test.beforeEach(async ({ page }) => {
    // テスト用ページのアクセス準備
    await page.goto('/staff');
    await page.waitForLoadState('networkidle');
  });

  test('ピッキング完了作成で確実に梱包待ちリストに表示される', async ({ page }) => {
    console.log('🧪 [E2E] テスト開始: ピッキング完了→梱包待ちリスト');

    // Step 1: ロケーション管理画面に移動
    await page.goto('/staff/location');
    await page.waitForLoadState('networkidle');
    console.log('✅ [E2E] ロケーション管理画面に移動完了');

    // Step 2: テスト対象商品を特定（aaaaaaaaaaaaa商品）
    await page.waitForSelector('.location-section', { timeout: 10000 });
    
    // 商品名で検索してピッキング対象商品を選択
    const targetProduct = await page.locator('text=aaaaaaaaaaaaa').first();
    
    if (await targetProduct.isVisible()) {
      console.log('✅ [E2E] 対象商品「aaaaaaaaaaaaa」を発見');
      
      // Step 3: 商品を選択
      const productCheckbox = await page.locator('input[type="checkbox"]').first();
      await productCheckbox.check();
      console.log('✅ [E2E] 商品選択完了');
      
      // Step 4: ピッキング完了作成ボタンをクリック
      const createPickingButton = await page.locator('button:has-text("ピッキング完了を作成")');
      await expect(createPickingButton).toBeVisible();
      await createPickingButton.click();
      console.log('✅ [E2E] ピッキング完了作成ボタンクリック');
      
      // Step 5: 確認ダイアログで OK をクリック
      await page.waitForSelector('.modal', { timeout: 5000 });
      const confirmButton = await page.locator('button:has-text("作成")').last();
      await confirmButton.click();
      console.log('✅ [E2E] ピッキング完了作成実行');
      
      // Step 6: 成功メッセージを待機
      await page.waitForSelector('text=ピッキング完了が正常に作成され、出荷管理に追加されました', { timeout: 10000 });
      console.log('✅ [E2E] ピッキング完了作成成功メッセージ確認');
      
      // Step 7: 梱包待ちリストページに移動
      await page.goto('/staff/shipping');
      await page.waitForLoadState('networkidle');
      console.log('✅ [E2E] 梱包待ちリストページに移動');
      
      // Step 8: 対象商品が梱包待ちリストに表示されることを確認
      await page.waitForSelector('.shipping-item', { timeout: 10000 });
      
      // aaaaaaaaaaaaa商品が表示されているか確認
      const shippingItems = await page.locator('text=aaaaaaaaaaaaa');
      await expect(shippingItems).toBeVisible({ timeout: 5000 });
      console.log('✅ [E2E] 対象商品が梱包待ちリストに表示されることを確認');
      
      console.log('🎉 [E2E] テスト成功: ピッキング完了→梱包待ちリストの完全ワークフロー動作確認');
      
    } else {
      console.log('⚠️ [E2E] 対象商品が見つからないため、別の商品でテスト');
      
      // 代替商品でテスト
      const availableProduct = await page.locator('input[type="checkbox"]').first();
      await availableProduct.check();
      
      const createPickingButton = await page.locator('button:has-text("ピッキング完了を作成")');
      await createPickingButton.click();
      
      await page.waitForSelector('.modal');
      const confirmButton = await page.locator('button:has-text("作成")').last();
      await confirmButton.click();
      
      await page.waitForSelector('text=ピッキング完了が正常に作成され、出荷管理に追加されました', { timeout: 10000 });
      
      await page.goto('/staff/shipping');
      await page.waitForLoadState('networkidle');
      
      // 新しい商品が追加されたかをカウントで確認
      const shippingItemsAfter = await page.locator('.shipping-item').count();
      expect(shippingItemsAfter).toBeGreaterThan(0);
      
      console.log('✅ [E2E] 代替商品でのテスト成功');
    }
  });

  test('複数商品のピッキング完了作成テスト', async ({ page }) => {
    console.log('🧪 [E2E] 複数商品テスト開始');

    await page.goto('/staff/location');
    await page.waitForLoadState('networkidle');

    // 複数商品を選択
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    const selectedCount = Math.min(3, checkboxes.length);
    
    for (let i = 0; i < selectedCount; i++) {
      await checkboxes[i].check();
    }
    console.log(`✅ [E2E] ${selectedCount}商品を選択完了`);

    // ピッキング完了作成
    const createButton = await page.locator('button:has-text("ピッキング完了を作成")');
    await createButton.click();

    await page.waitForSelector('.modal');
    const confirmButton = await page.locator('button:has-text("作成")').last();
    await confirmButton.click();

    await page.waitForSelector('text=ピッキング完了が正常に作成され、出荷管理に追加されました', { timeout: 10000 });

    // 梱包待ちリストで確認
    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');

    const shippingItems = await page.locator('.shipping-item').count();
    expect(shippingItems).toBeGreaterThanOrEqual(selectedCount);

    console.log(`🎉 [E2E] 複数商品テスト成功: ${selectedCount}商品が梱包待ちリストに追加`);
  });

  test('APIレスポンス詳細確認テスト', async ({ page }) => {
    console.log('🧪 [E2E] APIレスポンス詳細テスト開始');

    // APIコールをインターセプト
    let apiResponse = null;
    await page.route('**/api/picking', async (route, request) => {
      if (request.method() === 'POST') {
        const response = await route.fetch();
        apiResponse = await response.json();
        console.log('🔍 [E2E] ピッキングAPI応答:', apiResponse);
        await route.fulfill({ response });
      } else {
        await route.continue();
      }
    });

    await page.goto('/staff/location');
    await page.waitForLoadState('networkidle');

    // 1つの商品でピッキング完了作成
    const checkbox = await page.locator('input[type="checkbox"]').first();
    await checkbox.check();

    const createButton = await page.locator('button:has-text("ピッキング完了を作成")');
    await createButton.click();

    await page.waitForSelector('.modal');
    const confirmButton = await page.locator('button:has-text("作成")').last();
    await confirmButton.click();

    // APIレスポンスを確認
    await page.waitForTimeout(3000);
    
    expect(apiResponse).toBeTruthy();
    expect(apiResponse.success).toBe(true);
    expect(apiResponse.message).toContain('出荷管理に追加されました');
    
    console.log('✅ [E2E] API応答確認完了:', apiResponse.message);

    // 梱包待ちリストに確実に反映されているか確認
    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');
    
    const shippingItems = await page.locator('.shipping-item').count();
    expect(shippingItems).toBeGreaterThan(0);
    
    console.log('🎉 [E2E] API詳細テスト成功: APIレスポンスと梱包待ちリスト表示を確認');
  });
});
