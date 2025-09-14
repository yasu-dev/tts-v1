import { test, expect } from '@playwright/test';

test.describe('緊急ページ確認', () => {
  test('ページ基本状況と商品データ表示確認', async ({ page }) => {
    console.log('🚨 緊急ページ確認開始');

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // ページタイトルと基本情報
    const title = await page.title();
    console.log(`📄 ページタイトル: "${title}"`);

    // ページエラー確認
    const pageText = await page.locator('body').textContent();
    const hasError = pageText?.includes('Error') || pageText?.includes('エラー');
    const hasContent = pageText?.includes('出荷管理') || pageText?.includes('梱包');
    
    console.log(`❌ ページエラー: ${hasError}`);
    console.log(`📦 出荷コンテンツ: ${hasContent}`);

    // テーブル確認
    const tableExists = await page.locator('table').count() > 0;
    const tbodyExists = await page.locator('tbody').count() > 0;
    const rowCount = await page.locator('tbody tr').count();
    
    console.log(`📊 テーブル存在: ${tableExists}`);
    console.log(`📊 tbody存在: ${tbodyExists}`);
    console.log(`📊 行数: ${rowCount}`);

    // APIデータ確認
    const response = await page.request.get('http://localhost:3002/api/orders/shipping?page=1&limit=50&status=all');
    const apiData = await response.json();
    
    console.log(`📡 API Status: ${response.status()}`);
    console.log(`📦 API Items: ${apiData.items?.length || 0}`);

    if (apiData.items && apiData.items.length > 0) {
      console.log(`📦 API最初の商品: ${apiData.items[0].productName}`);
    }

    // タブ確認
    const allTabButton = page.locator('button:has-text("全て")');
    const workstationButton = page.locator('button:has-text("梱包待ち")');
    const packedButton = page.locator('button:has-text("梱包済み")');

    console.log(`🏷️ 全てタブ: ${await allTabButton.count()}`);
    console.log(`🏷️ 梱包待ちタブ: ${await workstationButton.count()}`);
    console.log(`🏷️ 梱包済みタブ: ${await packedButton.count()}`);

    // 全てタブをクリックして商品表示を確認
    if (await allTabButton.count() > 0) {
      await allTabButton.click();
      await page.waitForTimeout(2000);
      
      const allRowCount = await page.locator('tbody tr').count();
      console.log(`📦 全てタブ行数: ${allRowCount}`);
      
      if (allRowCount > 0) {
        const firstProductText = await page.locator('tbody tr:first-child td:nth-child(2)').textContent();
        console.log(`📦 全てタブ最初の商品: "${firstProductText}"`);
      }
    }

    await page.screenshot({
      path: 'EMERGENCY-PAGE-CHECK.png',
      fullPage: true
    });

    console.log('🚨 緊急ページ確認完了');
  });
});






















