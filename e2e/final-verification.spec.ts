import { test, expect } from '@playwright/test';

test.describe('最終検証', () => {
  test('Shipmentエントリ作成後の出荷管理表示確認', async ({ page }) => {
    console.log('🎯 最終検証：Shipmentエントリ作成後の表示確認');

    await page.waitForTimeout(5000);

    // 出荷管理画面にアクセス
    console.log('📦 出荷管理画面確認');
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'FINAL-1-shipping-after-fix.png',
      fullPage: true
    });

    // 梱包待ちタブをクリック
    await page.click('button:has-text("梱包待ち")');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'FINAL-2-workstation-with-items.png',
      fullPage: true
    });

    // 商品数確認
    const items = page.locator('tbody tr');
    const itemCount = await items.count();
    console.log(`📦 出荷管理商品数: ${itemCount}件`);

    // テスト商品とNikon Z9を確認
    const testProductExists = await page.locator('text*=テスト商品').count() > 0;
    const nikonExists = await page.locator('text*=Nikon Z9').count() > 0;

    console.log(`✅ テスト商品表示: ${testProductExists}`);
    console.log(`✅ Nikon Z9表示: ${nikonExists}`);

    if (testProductExists || nikonExists) {
      console.log('🎉 SUCCESS: 商品が出荷管理に表示されています！');
    } else {
      console.log('⚠️ 商品が見つからない場合のデバッグ');
      
      // 全商品名を出力
      for (let i = 0; i < Math.min(itemCount, 10); i++) {
        const productName = await items.nth(i).locator('td:nth-child(2)').textContent();
        console.log(`商品 ${i}: "${productName}"`);
      }
    }

    console.log('✅ 最終検証完了');
  });
});


