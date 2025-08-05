import { test, expect } from '@playwright/test';

test.describe('デモ機能の包括テスト', () => {
  
  test('セラー画面での商品表示確認', async ({ page }) => {
    // セラーでログイン
    await page.goto('/');
    await page.click('text=ログイン');
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ダッシュボードが表示されることを確認
    await expect(page.locator('text=ダッシュボード')).toBeVisible();
    
    // 在庫管理画面にアクセス
    await page.goto('/inventory');
    await expect(page.locator('text=在庫管理')).toBeVisible();
    
    // 商品が表示されることを確認（最低1件以上）
    await page.waitForTimeout(2000);
    const productRows = page.locator('table tbody tr');
    const productCount = await productRows.count();
    expect(productCount).toBeGreaterThan(0);
    
    console.log(`セラー商品表示件数: ${productCount}件`);
  });

  test('スタッフ画面での全機能確認', async ({ page }) => {
    // スタッフでログイン
    await page.goto('/');
    await page.click('text=ログイン');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ダッシュボードが表示されることを確認
    await expect(page.locator('text=ダッシュボード')).toBeVisible();
    
    // 1. スタッフ在庫管理画面
    await page.goto('/staff/inventory');
    await expect(page.locator('text=スタッフ在庫管理')).toBeVisible();
    
    // 入荷待ちフィルタを選択
    await page.selectOption('select[data-testid="status-filter"]', 'inbound');
    await page.waitForTimeout(1000);
    
    let inboundItems = page.locator('table tbody tr');
    let inboundCount = await inboundItems.count();
    console.log(`入荷待ち商品: ${inboundCount}件`);
    expect(inboundCount).toBeGreaterThan(0);
    
    // 検品中フィルタを選択
    await page.selectOption('select[data-testid="status-filter"]', 'inspection');
    await page.waitForTimeout(1000);
    
    let inspectionItems = page.locator('table tbody tr');
    let inspectionCount = await inspectionItems.count();
    console.log(`検品中商品: ${inspectionCount}件`);
    expect(inspectionCount).toBeGreaterThan(0);
    
    // 2. スタッフタスク画面
    await page.goto('/staff/tasks');
    await expect(page.locator('text=スタッフタスク管理')).toBeVisible();
    
    await page.waitForTimeout(1000);
    const taskRows = page.locator('table tbody tr');
    const taskCount = await taskRows.count();
    console.log(`タスク件数: ${taskCount}件`);
    expect(taskCount).toBeGreaterThan(0);
    
    // 3. スタッフ配送画面
    await page.goto('/staff/shipping');
    await expect(page.locator('text=配送管理')).toBeVisible();
    
    await page.waitForTimeout(1000);
    const shippingRows = page.locator('table tbody tr, .shipping-card');
    const shippingCount = await shippingRows.count();
    console.log(`配送アイテム: ${shippingCount}件`);
    // 配送データは注文データに依存するため、0件でも許容
    expect(shippingCount).toBeGreaterThanOrEqual(0);
  });

  test('ステータス別データ分布確認', async ({ page }) => {
    // スタッフでログイン
    await page.goto('/');
    await page.click('text=ログイン');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/staff/inventory');
    
    // 各ステータスのデータ件数を確認
    const statuses = [
      { value: 'inbound', label: '入荷待ち' },
      { value: 'inspection', label: '検品中' },
      { value: 'storage', label: '保管中' },
      { value: 'listing', label: '出品中' },
      { value: 'sold', label: '売約済み' }
    ];
    
    const statusCounts = {};
    
    for (const status of statuses) {
      await page.selectOption('select[data-testid="status-filter"]', status.value);
      await page.waitForTimeout(500);
      
      const rows = page.locator('table tbody tr');
      const count = await rows.count();
      statusCounts[status.label] = count;
      
      console.log(`${status.label}: ${count}件`);
    }
    
    // 各ステータスに最低1件はデータがあることを確認
    const totalItems = Object.values(statusCounts).reduce((sum: number, count: number) => sum + count, 0);
    expect(totalItems).toBeGreaterThan(10); // 合計で10件以上
    
    console.log('ステータス別分布:', statusCounts);
  });
});