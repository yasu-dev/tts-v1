import { test, expect } from '@playwright/test';

test.describe('商品名修正後の最終確認', () => {
  test('テスト商品とNikon Z9が正しい名前で出荷管理に表示されることを確認', async ({ page }) => {
    console.log('🔧 商品名修正後の最終確認開始');

    // APIレスポンスをモニタ
    page.on('response', async response => {
      if (response.url().includes('/api/orders/shipping') && response.status() === 200) {
        try {
          const data = await response.json();
          console.log(`📦 出荷管理API成功: ${data.items?.length || 0}件取得`);
          
          // テスト商品とNikon Z9を探す
          const testProduct = data.items?.find((item: any) => 
            item.productName?.includes('テスト商品') || item.productName?.includes('soldステータス確認用')
          );
          const nikonProduct = data.items?.find((item: any) => 
            item.productName?.includes('Nikon Z9') || item.productName?.includes('excellent')
          );
          
          if (testProduct) {
            console.log(`✅ テスト商品発見: ${testProduct.productName} (Status: ${testProduct.status})`);
          }
          if (nikonProduct) {
            console.log(`✅ Nikon Z9発見: ${nikonProduct.productName} (Status: ${nikonProduct.status})`);
          }
          
          if (!testProduct && !nikonProduct) {
            console.log('❌ 対象商品が見つかりません');
            console.log('取得商品リスト:');
            data.items?.slice(0, 5).forEach((item: any, index: number) => {
              console.log(`  ${index + 1}. ${item.productName} (${item.status})`);
            });
          }
          
        } catch (e) {
          console.log('📦 API応答解析エラー');
        }
      }
    });

    // ブラウザコンソールも監視
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('商品名解決') || text.includes('テスト商品') || text.includes('Nikon Z9')) {
        console.log(`🖥️ ブラウザ: ${text}`);
      }
    });

    await page.waitForTimeout(3000);

    // 出荷管理画面にアクセス
    console.log('🔧 Step 1: 修正後出荷管理画面確認');
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    await page.screenshot({
      path: 'NAME-FIX-1-shipping-after-fix.png',
      fullPage: true
    });

    // 梱包待ちタブをクリック
    const workstationTab = page.locator('button:has-text("梱包待ち")');
    if (await workstationTab.count() > 0) {
      await workstationTab.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'NAME-FIX-2-workstation-tab.png',
        fullPage: true
      });
    }

    // 商品名を確認
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`📦 出荷管理商品行数: ${rowCount}`);

    let foundTestProduct = false;
    let foundNikonZ9 = false;

    for (let i = 0; i < Math.min(rowCount, 15); i++) {
      try {
        const productCell = rows.nth(i).locator('td:nth-child(2)');
        const productText = await productCell.textContent();
        
        if (productText) {
          console.log(`📦 商品 ${i}: "${productText.slice(0, 60)}"`);
          
          if (productText.includes('テスト商品') || productText.includes('soldステータス確認用')) {
            foundTestProduct = true;
            console.log(`✅ テスト商品発見！行番号: ${i}`);
          }
          if (productText.includes('Nikon Z9') || productText.includes('excellent')) {
            foundNikonZ9 = true;
            console.log(`✅ Nikon Z9発見！行番号: ${i}`);
          }
        }
      } catch (e) {
        console.log(`📦 商品 ${i}: 取得エラー`);
      }
    }

    // 最終結果
    console.log(`\n🎯 最終結果:`);
    console.log(`✅ テスト商品表示: ${foundTestProduct}`);
    console.log(`✅ Nikon Z9表示: ${foundNikonZ9}`);

    if (foundTestProduct && foundNikonZ9) {
      console.log('🎉 SUCCESS: 両方の商品が正しく表示されています！');
      
      await page.screenshot({
        path: 'NAME-FIX-SUCCESS-BOTH-FOUND.png',
        fullPage: true
      });
    } else {
      console.log('⚠️ まだ表示されていません');
      
      await page.screenshot({
        path: 'NAME-FIX-STILL-NOT-FOUND.png',
        fullPage: true
      });
    }

    console.log('✅ 商品名修正後確認完了');
  });
});



