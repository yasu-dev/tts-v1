import { test, expect } from '@playwright/test';

test.describe('詳細デバッグテスト', () => {
  test('ステータス更新の詳細追跡', async ({ page }) => {
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForTimeout(5000);
    
    // コンソールログを記録
    page.on('console', msg => console.log('ブラウザ:', msg.text()));
    
    console.log('\n=== 初期状態確認 ===');
    
    // 全体タブでアイテム確認
    await page.click('button:has-text("全体")');
    await page.waitForTimeout(2000);
    
    const allRowsBefore = await page.locator('tbody tr').count();
    console.log('全体タブのアイテム数（初期）:', allRowsBefore);
    
    // 各ステータスのアイテム数確認
    const statuses = ['workstation', 'packed', 'ready_for_pickup'];
    for (const status of statuses) {
      const statusItems = page.locator(`span:has-text("${status === 'workstation' ? '梱包待ち' : status === 'packed' ? '梱包済み' : '集荷準備完了'}")`);
      const count = await statusItems.count();
      console.log(`${status}ステータス表示数:`, count);
    }
    
    console.log('\n=== 梱包済みタブ操作 ===');
    
    // 梱包済みタブをクリック
    await page.click('button:has-text("梱包済み")');
    await page.waitForTimeout(2000);
    
    const packedRowsBefore = await page.locator('tbody tr').count();
    console.log('梱包済みタブのアイテム数:', packedRowsBefore);
    
    if (packedRowsBefore > 0) {
      // アイテムのIDを取得
      const firstRow = page.locator('tbody tr').first();
      const itemText = await firstRow.textContent();
      console.log('対象アイテム:', itemText?.substring(0, 100));
      
      // 集荷エリアへ移動ボタンをクリック
      const moveButton = page.locator('button:has-text("集荷エリアへ移動")');
      if (await moveButton.isVisible()) {
        console.log('集荷エリアへ移動ボタンをクリック');
        await moveButton.click();
        await page.waitForTimeout(3000);
        
        console.log('\n=== 移動後の状態確認 ===');
        
        // 梱包済みタブの数確認
        const packedAfter = await page.locator('button:has-text("梱包済み") span').textContent();
        console.log('梱包済みタブ数（移動後）:', packedAfter);
        
        // 全体タブで実際のアイテム状態確認
        await page.click('button:has-text("全体")');
        await page.waitForTimeout(2000);
        
        const allRowsAfter = await page.locator('tbody tr').count();
        console.log('全体タブのアイテム数（移動後）:', allRowsAfter);
        
        // ready_for_pickupステータスのアイテムを探す
        for (let i = 0; i < Math.min(allRowsAfter, 6); i++) {
          const row = page.locator('tbody tr').nth(i);
          const rowText = await row.textContent();
          if (rowText?.includes('集荷準備完了')) {
            console.log(`✅ Row ${i}: ready_for_pickupアイテム発見`);
            console.log(rowText?.substring(0, 100));
          }
        }
        
        console.log('\n=== 集荷準備完了タブ確認 ===');
        
        // 集荷準備完了タブをクリック
        await page.click('button:has-text("集荷準備完了")');
        await page.waitForTimeout(2000);
        
        const readyRows = await page.locator('tbody tr').count();
        console.log('集荷準備完了タブのアイテム数:', readyRows);
      }
    }
  });
});
