import { test, expect } from '@playwright/test';

test.describe('緊急データ確認', () => {
  test('商品データが存在するか確認', async ({ page }) => {
    console.log('🚨 緊急データ確認開始');

    // まずAPIを直接確認
    const apiResponse = await page.request.get('http://localhost:3002/api/orders/shipping?page=1&limit=50&status=all');
    const apiData = await apiResponse.json();
    
    console.log(`📡 API Response Status: ${apiResponse.status()}`);
    console.log(`📦 API Data Items: ${apiData.items?.length || 0}`);
    
    if (apiData.items && apiData.items.length > 0) {
      console.log('✅ APIデータは存在');
      console.log(`📦 最初の商品: ${apiData.items[0].productName}`);
      console.log(`📦 2番目の商品: ${apiData.items[1]?.productName || 'なし'}`);
    } else {
      console.log('❌ APIデータが空');
    }

    // ページアクセス
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForTimeout(5000);

    // データ読み込み状況確認
    const loadingText = await page.locator('text=読み込み').count();
    const errorText = await page.locator('text=エラー').count();
    const emptyText = await page.locator('text=データがありません').count();
    
    console.log(`⏳ 読み込み表示: ${loadingText}`);
    console.log(`❌ エラー表示: ${errorText}`);
    console.log(`📭 空データ表示: ${emptyText}`);

    // テーブル内容確認
    const tableBody = page.locator('tbody');
    const hasTableBody = await tableBody.count() > 0;
    console.log(`📊 テーブル本体: ${hasTableBody}`);
    
    if (hasTableBody) {
      const rowCount = await page.locator('tbody tr').count();
      console.log(`📦 テーブル行数: ${rowCount}`);
    }

    await page.screenshot({
      path: 'EMERGENCY-DATA-CHECK.png',
      fullPage: true
    });

    console.log('🚨 緊急データ確認完了');
  });
});


