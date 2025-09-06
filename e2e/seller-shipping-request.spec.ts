import { test, expect } from '@playwright/test';

test.describe('セラー商品出荷指示機能', () => {
  test.beforeEach(async ({ page }) => {
    // セラーとしてログイン
    await page.goto('http://localhost:3002/auth/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('保管中商品の出荷指示フロー', async ({ page }) => {
    console.log('🧪 Test: セラー商品出荷指示フロー開始');

    // 1. セラー在庫管理画面に移動
    await page.goto('http://localhost:3002/inventory');
    await expect(page.locator('h1')).toContainText('在庫管理');
    console.log('✅ 在庫管理画面表示確認');

    // 2. 保管中商品をフィルター
    await page.selectOption('select[data-testid="status-filter"]', 'storage');
    await page.waitForTimeout(2000);
    console.log('✅ 保管中商品フィルター適用');

    // 3. 保管中商品の存在確認
    const storageProducts = page.locator('tbody tr').filter({
      has: page.locator('text="保管中"')
    });
    await expect(storageProducts).toHaveCountGreaterThan(0);
    console.log('✅ 保管中商品存在確認');

    // 4. 最初の保管中商品の詳細モーダルを開く
    const firstProduct = storageProducts.first();
    const productName = await firstProduct.locator('td:first-child').textContent();
    console.log(`📦 テスト対象商品: ${productName}`);
    
    await firstProduct.locator('button:has-text("詳細")').click();
    await page.waitForSelector('[data-testid="product-detail-modal"]');
    console.log('✅ 商品詳細モーダル表示確認');

    // 5. 出荷するボタンの存在確認
    const shippingButton = page.locator('button:has-text("出荷する")');
    await expect(shippingButton).toBeVisible();
    console.log('✅ 出荷するボタン表示確認');

    // 6. 出荷するボタンをクリック
    await shippingButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ 出荷ボタン押下');

    // 7. CarrierSelectionModalの表示確認
    await expect(page.locator('text="配送業者選択"')).toBeVisible();
    console.log('✅ 配送業者選択モーダル表示確認');

    // 8. 配送業者を選択（FedExを選択）
    const fedexOption = page.locator('text="FedEx"').first();
    await fedexOption.click();
    console.log('✅ FedEx配送業者選択');

    // 9. 配送サービスが表示されることを確認
    await expect(page.locator('text="配送サービス"')).toBeVisible();
    console.log('✅ 配送サービス選択肢表示確認');

    // 10. ラベル生成ボタンをクリック
    const generateButton = page.locator('button:has-text("ラベル生成")');
    await expect(generateButton).toBeEnabled();
    await generateButton.click();
    console.log('✅ ラベル生成ボタン押下');

    // 11. 成功メッセージの確認
    await expect(page.locator('text="出荷指示を正常に送信しました"')).toBeVisible();
    console.log('✅ 成功メッセージ表示確認');

    // 12. モーダルが閉じることを確認
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="product-detail-modal"]')).not.toBeVisible();
    console.log('✅ モーダルクローズ確認');

    console.log('🎉 セラー商品出荷指示フロー完了');
  });

  test('出荷後のピッキング待ち状態確認', async ({ page }) => {
    console.log('🧪 Test: ピッキング待ち状態確認開始');

    // スタッフとして再ログイン
    await page.goto('http://localhost:3002/auth/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // ピッキングページに移動
    await page.goto('http://localhost:3002/staff/picking');
    await expect(page.locator('h1')).toContainText('ピッキング管理');
    console.log('✅ ピッキング管理画面表示確認');

    // ピッキング待ちタスクの存在確認
    const pendingTasks = page.locator('text="ピッキング待ち"');
    await expect(pendingTasks).toHaveCountGreaterThan(0);
    console.log('✅ ピッキング待ちタスク存在確認');

    console.log('🎉 ピッキング待ち状態確認完了');
  });

  test('権限チェック - 保管中以外の商品', async ({ page }) => {
    console.log('🧪 Test: 権限チェック開始');

    await page.goto('http://localhost:3002/inventory');

    // 保管中以外のステータスを選択
    await page.selectOption('select[data-testid="status-filter"]', 'all');
    await page.waitForTimeout(1000);

    // 保管中以外の商品を探す
    const nonStorageProduct = page.locator('tbody tr').filter({
      has: page.locator('td').filter({ hasNotText: '保管中' }).first()
    }).first();

    if (await nonStorageProduct.count() > 0) {
      await nonStorageProduct.locator('button:has-text("詳細")').click();
      await page.waitForSelector('[data-testid="product-detail-modal"]');

      // 出荷するボタンが表示されないことを確認
      await expect(page.locator('button:has-text("出荷する")')).not.toBeVisible();
      console.log('✅ 保管中以外の商品では出荷ボタン非表示確認');
    }

    console.log('🎉 権限チェック完了');
  });
});

