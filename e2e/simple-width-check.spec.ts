import { test, expect } from '@playwright/test';

test('UI横幅確認テスト', async ({ page }) => {
  // ログインをスキップしてダイレクトにアクセス
  
  console.log('=== セラー画面テスト ===');
  
  // Dashboard
  await page.goto('/dashboard');
  await page.waitForSelector('.intelligence-card', { timeout: 5000 });
  const dashboardElement = await page.locator('.intelligence-card .p-8').first();
  if (await dashboardElement.count() > 0) {
    console.log('✅ Dashboard: p-8クラス確認済み');
  } else {
    console.log('❌ Dashboard: p-8クラスが見つからない');
  }
  
  // Sales
  await page.goto('/sales');
  await page.waitForSelector('.intelligence-card', { timeout: 5000 });
  const salesElement = await page.locator('.intelligence-card .p-8').first();
  if (await salesElement.count() > 0) {
    console.log('✅ Sales: p-8クラス確認済み');
  } else {
    console.log('❌ Sales: p-8クラスが見つからない');
  }
  
  // Inventory
  await page.goto('/inventory');
  await page.waitForSelector('.intelligence-card', { timeout: 5000 });
  const inventoryElement = await page.locator('.intelligence-card .p-8').first();
  if (await inventoryElement.count() > 0) {
    console.log('✅ Inventory: p-8クラス確認済み');
  } else {
    console.log('❌ Inventory: p-8クラスが見つからない');
  }
  
  console.log('=== スタッフ画面テスト ===');
  
  // Staff Dashboard
  await page.goto('/staff/dashboard');
  await page.waitForSelector('.intelligence-card', { timeout: 5000 });
  const staffDashElement = await page.locator('.intelligence-card .p-8').first();
  if (await staffDashElement.count() > 0) {
    console.log('✅ Staff Dashboard: p-8クラス確認済み');
  } else {
    console.log('❌ Staff Dashboard: p-8クラスが見つからない');
  }
  
  // Staff Picking
  await page.goto('/staff/picking');
  await page.waitForSelector('.intelligence-card', { timeout: 5000 });
  const pickingElement = await page.locator('.intelligence-card .p-8').first();
  if (await pickingElement.count() > 0) {
    console.log('✅ Staff Picking: p-8クラス確認済み');
  } else {
    console.log('❌ Staff Picking: p-8クラスが見つからない');
  }
  
  // Staff Returns
  await page.goto('/staff/returns');
  await page.waitForSelector('.intelligence-card', { timeout: 5000 });
  const returnsElement = await page.locator('.intelligence-card .p-8').first();
  if (await returnsElement.count() > 0) {
    console.log('✅ Staff Returns: p-8クラス確認済み');
  } else {
    console.log('❌ Staff Returns: p-8クラスが見つからない');
  }
  
  // 返品検品タブをテスト
  const inspectionTab = page.locator('text=返品検品');
  if (await inspectionTab.isVisible()) {
    await inspectionTab.click();
    await page.waitForTimeout(1000);
    console.log('✅ 返品検品タブ: クリック成功');
  } else {
    console.log('❌ 返品検品タブ: 見つからない');
  }
  
  // 再出品業務フローをテスト
  const relistingTab = page.locator('text=再出品業務フロー');
  if (await relistingTab.isVisible()) {
    await relistingTab.click();
    await page.waitForTimeout(1000);
    console.log('✅ 再出品業務フロータブ: クリック成功');
  } else {
    console.log('❌ 再出品業務フロータブ: 見つからない');
  }
  
  // 返品理由分析をテスト
  const analysisTab = page.locator('text=返品理由分析');
  if (await analysisTab.isVisible()) {
    await analysisTab.click();
    await page.waitForTimeout(1000);
    console.log('✅ 返品理由分析タブ: クリック成功');
  } else {
    console.log('❌ 返品理由分析タブ: 見つからない');
  }
  
  console.log('=== テスト完了 ===');
});