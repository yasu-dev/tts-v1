import { test, expect } from '@playwright/test';

test.describe('同梱データデバッグ', () => {
  test('APIから同梱商品データを詳細確認', async ({ page }) => {
    console.log('📦 同梱データデバッグ開始');

    // APIを直接確認
    const response = await page.request.get('http://localhost:3002/api/orders/shipping?page=1&limit=50&status=all');
    const apiData = await response.json();
    
    console.log(`📡 API Status: ${response.status()}`);
    console.log(`📦 API Items: ${apiData.items?.length || 0}`);

    if (apiData.items && apiData.items.length > 0) {
      // 同梱商品を探す
      const bundleProducts = apiData.items.filter(item => 
        item.productName?.includes('テスト商品') || item.productName?.includes('Nikon Z9')
      );
      
      console.log(`🔍 同梱対象商品: ${bundleProducts.length}件`);
      
      bundleProducts.forEach((item, index) => {
        console.log(`\n📦 同梱商品 ${index}:`);
        console.log(`   商品名: "${item.productName}"`);
        console.log(`   ステータス: "${item.status}"`);
        console.log(`   bundleId: "${item.bundleId || 'なし'}"`);
        console.log(`   isBundled: ${item.isBundled || false}`);
        console.log(`   isBundle: ${item.isBundle || false}`);
        console.log(`   ID: ${item.id}`);
      });
    }

    // フロントエンドの商品表示確認
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // モーダルを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // 全てタブで商品確認
    const allTab = page.locator('button:has-text("全て")');
    if (await allTab.count() > 0) {
      await allTab.click();
      await page.waitForTimeout(2000);
    }

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`\n📦 フロントエンド商品数: ${rowCount}`);

    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      try {
        const productText = await rows.nth(i).locator('td:nth-child(2)').textContent() || '';
        
        if (productText.includes('テスト商品') || productText.includes('Nikon Z9')) {
          console.log(`\n🎯 フロントエンド同梱商品 ${i}:`);
          console.log(`   表示名: "${productText}"`);
          
          const actionCell = rows.nth(i).locator('td:nth-child(5)');
          const buttonTexts = await actionCell.locator('button').allTextContents();
          console.log(`   ボタン: [${buttonTexts.join(', ')}]`);
        }
        
      } catch (e) {
        console.log(`❌ 商品 ${i}: データ取得エラー`);
      }
    }

    await page.screenshot({
      path: 'BUNDLE-DATA-DEBUG.png',
      fullPage: true
    });

    console.log('📦 同梱データデバッグ完了');
  });
});



















