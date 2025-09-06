import { test, expect } from '@playwright/test';

test.describe('商品詳細モーダル詳細デバッグ', () => {
  
  test('モーダル内容の詳細確認', async ({ page }) => {
    console.log('🧪 商品詳細モーダルの詳細デバッグ開始');

    await page.goto('http://localhost:3002/inventory');
    await page.waitForTimeout(3000);

    // 商品行を取得
    const productRows = page.locator('tbody tr');
    const rowCount = await productRows.count();
    console.log(`商品行数: ${rowCount}`);

    if (rowCount > 0) {
      // 各商品のステータスを確認
      for (let i = 0; i < Math.min(3, rowCount); i++) {
        const row = productRows.nth(i);
        const productName = await row.locator('td').first().textContent();
        const statusElements = row.locator('td');
        const statusCount = await statusElements.count();
        
        console.log(`商品${i + 1}: ${productName}`);
        console.log(`  列数: ${statusCount}`);
        
        // 各列の内容を確認
        for (let j = 0; j < statusCount; j++) {
          const cellText = await statusElements.nth(j).textContent();
          console.log(`  列${j + 1}: ${cellText?.trim()}`);
        }
      }

      // 保管中の商品を明示的に探す
      const storageProducts = page.locator('tbody tr').filter({
        has: page.locator('text="保管中"')
      });
      const storageCount = await storageProducts.count();
      console.log(`保管中商品数: ${storageCount}`);

      if (storageCount > 0) {
        console.log('保管中商品を発見！詳細モーダルを開きます');
        const firstStorageProduct = storageProducts.first();
        const detailButton = firstStorageProduct.locator('button:has-text("詳細")');
        await detailButton.click();
        
        await page.waitForTimeout(1000);

        // モーダルの全内容をダンプ
        const modalContent = await page.locator('[data-testid="product-detail-modal"]').textContent();
        console.log('=== モーダル内容 ===');
        console.log(modalContent);
        console.log('=== モーダル内容終了 ===');

        // 商品ステータスを確認
        const statusIndicator = page.locator('.bg-green-100, .bg-blue-100, .bg-yellow-100, .bg-red-100');
        const statusText = await statusIndicator.textContent();
        console.log(`商品ステータスインジケーター: ${statusText}`);

        // ボタン要素をすべて確認
        const allButtons = page.locator('button');
        const buttonCount = await allButtons.count();
        console.log(`モーダル内ボタン数: ${buttonCount}`);
        
        for (let i = 0; i < buttonCount; i++) {
          const buttonText = await allButtons.nth(i).textContent();
          console.log(`  ボタン${i + 1}: "${buttonText?.trim()}"`);
        }

        // 出荷するボタンを様々なパターンで検索
        const shippingButtons = [
          page.locator('button:has-text("出荷する")'),
          page.locator('button:has-text("出荷")'),
          page.locator('button').filter({ hasText: '出荷' }),
          page.locator('[class*="TruckIcon"]').locator('..'),
        ];

        for (let i = 0; i < shippingButtons.length; i++) {
          const count = await shippingButtons[i].count();
          console.log(`出荷ボタン検索パターン${i + 1}: ${count}個`);
        }

      } else {
        console.log('❌ 保管中商品が見つかりません');
        
        // すべての商品のステータスを確認
        console.log('=== 全商品ステータス確認 ===');
        for (let i = 0; i < Math.min(5, rowCount); i++) {
          const row = productRows.nth(i);
          const allText = await row.textContent();
          console.log(`商品${i + 1}: ${allText?.trim()}`);
        }
      }
    }

    await page.screenshot({ path: 'test-results/modal-debug.png', fullPage: true });
    expect(true).toBe(true);
  });
});


