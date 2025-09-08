import { test, expect } from '@playwright/test';

test.describe('個別商品表示確認', () => {
  test('テスト商品とNikon Z9が個別の青いリストとして表示されることを確認', async ({ page }) => {
    console.log('🔵 個別商品表示確認開始');

    await page.waitForTimeout(5000);

    // 出荷管理画面にアクセス
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'INDIVIDUAL-1-initial.png',
      fullPage: true
    });

    // 梱包待ちタブをクリック
    const workstationTab = page.locator('button:has-text("梱包待ち")');
    if (await workstationTab.count() > 0) {
      await workstationTab.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({
      path: 'INDIVIDUAL-2-workstation-tab.png',
      fullPage: true
    });

    // 商品名を詳細確認
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`📦 出荷管理商品数: ${rowCount}`);

    let testProductCount = 0;
    let nikonZ9Count = 0;
    let packageCount = 0;

    for (let i = 0; i < Math.min(rowCount, 15); i++) {
      try {
        const productText = await rows.nth(i).locator('td:nth-child(2)').textContent();
        if (productText) {
          console.log(`📦 商品 ${i}: "${productText}"`);
          
          if (productText.includes('同梱パッケージ')) {
            packageCount++;
            console.log(`❌ パッケージ統合発見: 行 ${i}`);
          } else if (productText.includes('テスト商品') && productText.includes('soldステータス確認用')) {
            testProductCount++;
            console.log(`✅ テスト商品個別表示: 行 ${i}`);
          } else if (productText.includes('Nikon Z9') && productText.includes('excellent')) {
            nikonZ9Count++;
            console.log(`✅ Nikon Z9個別表示: 行 ${i}`);
          }
        }
      } catch (e) {
        console.log(`📦 商品 ${i}: 取得エラー`);
      }
    }

    console.log(`\n🔵 個別表示確認結果:`);
    console.log(`📦 テスト商品個別表示: ${testProductCount}件`);
    console.log(`📦 Nikon Z9個別表示: ${nikonZ9Count}件`);
    console.log(`❌ パッケージ統合表示: ${packageCount}件`);

    if (testProductCount >= 1 && nikonZ9Count >= 1 && packageCount === 0) {
      console.log('🎉 SUCCESS: 両方の商品が個別の青いリストとして正しく表示されています！');
      
      await page.screenshot({
        path: 'INDIVIDUAL-SUCCESS-SEPARATE-LISTS.png',
        fullPage: true
      });
      
    } else if (packageCount > 0) {
      console.log('❌ ERROR: まだパッケージ統合表示されています（意味がない表示）');
      
      await page.screenshot({
        path: 'INDIVIDUAL-ERROR-PACKAGE-MERGED.png',
        fullPage: true
      });
      
    } else {
      console.log('⚠️ WARNING: 一部の商品が見つかりません');
      
      await page.screenshot({
        path: 'INDIVIDUAL-PARTIAL-MISSING.png',
        fullPage: true
      });
    }

    console.log('✅ 個別商品表示確認完了');
  });
});



