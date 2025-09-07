import { test, expect } from '@playwright/test';

test.describe('アイテムステータスデバッグ', () => {
  test('実際のitem.statusを詳細確認', async ({ page }) => {
    console.log('🔍 アイテムステータスデバッグ開始');

    // コンソールログをキャッチ
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('🎯')) {
        console.log(`ブラウザログ: ${msg.text()}`);
      }
    });

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // モーダルを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // 梱包済みタブをクリック
    const packedTab = page.locator('button:has-text("梱包済み")');
    if (await packedTab.count() > 0) {
      await packedTab.click();
      await page.waitForTimeout(2000);
    }

    // テーブル行の詳細確認
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`📦 梱包済みタブ行数: ${rowCount}`);

    for (let i = 0; i < Math.min(rowCount, 3); i++) {
      try {
        const productText = await rows.nth(i).locator('td:nth-child(2)').textContent() || '';
        const statusText = await rows.nth(i).locator('td:nth-child(4)').textContent() || '';
        
        console.log(`\n🎯 商品 ${i}:`);
        console.log(`   商品名: "${productText}"`);  
        console.log(`   表示ステータス: "${statusText}"`);
        
        if (productText.includes('Nikon Z9') || productText.includes('テスト商品')) {
          console.log(`📍 対象商品発見: ${productText}`);
          
          // この商品のボタンを詳細確認
          const actionCell = rows.nth(i).locator('td:nth-child(5)');
          const allButtons = await actionCell.locator('button').allTextContents();
          console.log(`   ボタン: [${allButtons.join(', ')}]`);
          
          // APIから実際のステータスを推測
          if (statusText.toLowerCase().includes('packed') || statusText.includes('梱包済')) {
            console.log(`   ✅ このアイテムは 'packed' 状態のはず`);
            console.log(`   期待ボタン: [同梱ラベル印刷, 同梱集荷準備]`);
          } else if (statusText.toLowerCase().includes('workstation') || statusText.includes('梱包待')) {
            console.log(`   ✅ このアイテムは 'workstation/picked' 状態のはず`);  
            console.log(`   期待ボタン: [同梱梱包開始]`);
          } else {
            console.log(`   ❓ 不明なステータス: "${statusText}"`);
          }
        }
        
      } catch (e) {
        console.log(`❌ 商品 ${i}: データ取得エラー`);
      }
    }

    await page.screenshot({
      path: 'STATUS-DEBUG.png',
      fullPage: true
    });

    console.log('🔍 アイテムステータスデバッグ完了');
  });
});

