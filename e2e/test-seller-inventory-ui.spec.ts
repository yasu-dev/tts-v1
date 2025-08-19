import { test, expect } from '@playwright/test';

test.describe('セラー在庫管理UI修正テスト', () => {
  test('在庫管理画面のレイアウト確認', async ({ page }) => {
    // 1. ログイン
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    
    // 2. 在庫管理ページへ移動
    await page.goto('http://localhost:3000/inventory');
    await page.waitForLoadState('networkidle');
    
    // 3. UnifiedPageHeaderが存在することを確認（独立した箱として）
    const pageHeader = page.locator('h1:has-text("在庫管理")');
    await expect(pageHeader).toBeVisible();
    
    // 4. 統合された商品一覧カードが存在することを確認
    const unifiedCard = page.locator('div.bg-white.rounded-xl.border.border-nexus-border').nth(-1);
    await expect(unifiedCard).toBeVisible();
    
    // 一覧上部タイトル削除済み - タイトル部分のテストをスキップ
    
    // 6. 件数表示が存在することを確認
    const countText = page.locator('text=/\\d+件の商品を表示/');
    await expect(countText).toBeVisible();
    
    // 7. フィルター・検索部分が統合されていることを確認
    const statusFilter = page.locator('label:has-text("ステータス")').locator('..').locator('select, [role="combobox"]');
    const categoryFilter = page.locator('label:has-text("カテゴリー")').locator('..').locator('select, [role="combobox"]');
    const searchInput = page.locator('label:has-text("検索")').locator('..').locator('input');
    
    await expect(statusFilter).toBeVisible();
    await expect(categoryFilter).toBeVisible();
    await expect(searchInput).toBeVisible();
    
    // 8. 独立したフィルター・検索タイトルが存在しないことを確認
    const filterTitle = page.locator('h3:has-text("フィルター・検索")');
    await expect(filterTitle).not.toBeVisible();
    
    // 9. テーブルが存在することを確認
    const inventoryTable = page.locator('table[data-testid="inventory-table"]');
    await expect(inventoryTable).toBeVisible();
  });
  
  test('フィルター機能の動作確認', async ({ page }) => {
    // ログインと在庫管理ページへの移動
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    
    await page.goto('http://localhost:3000/inventory');
    await page.waitForLoadState('networkidle');
    
    // ステータスフィルターのテスト
    const statusFilter = page.locator('label:has-text("ステータス")').locator('..').locator('select, [role="combobox"]');
    await statusFilter.selectOption('storage');
    
    // フィルター適用後のテーブル更新を確認
    await page.waitForTimeout(1000);
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    
    // 何らかの結果が表示されるか、"データがありません"メッセージが表示される
    if (rowCount > 0) {
      const firstRow = tableRows.first();
      await expect(firstRow).toBeVisible();
    } else {
      const noDataMessage = page.locator('text=/商品データがありません|検索条件に一致する商品がありません/');
      await expect(noDataMessage).toBeVisible();
    }
  });
  
  test('検索機能の動作確認', async ({ page }) => {
    // ログインと在庫管理ページへの移動
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    
    await page.goto('http://localhost:3000/inventory');
    await page.waitForLoadState('networkidle');
    
    // 検索機能のテスト
    const searchInput = page.locator('label:has-text("検索")').locator('..').locator('input');
    await searchInput.fill('カメラ');
    
    // 検索適用後のテーブル更新を確認
    await page.waitForTimeout(1000);
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    
    // 何らかの結果が表示されるか、"データがありません"メッセージが表示される
    if (rowCount > 0) {
      const firstRow = tableRows.first();
      await expect(firstRow).toBeVisible();
    } else {
      const noDataMessage = page.locator('text=/商品データがありません|検索条件に一致する商品がありません/');
      await expect(noDataMessage).toBeVisible();
    }
    
    // 検索をクリア
    await searchInput.clear();
    await page.waitForTimeout(1000);
  });
  
  test('レスポンシブデザインの確認', async ({ page }) => {
    // モバイル画面サイズでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    
    await page.goto('http://localhost:3000/inventory');
    await page.waitForLoadState('networkidle');
    
    // フィルターが縦並び（grid-cols-1）になることを確認
    const filterGrid = page.locator('div.grid.grid-cols-1.md\\:grid-cols-3.gap-4');
    await expect(filterGrid).toBeVisible();
    
    // テーブルが横スクロール可能になることを確認
    const tableContainer = page.locator('div.overflow-x-auto');
    await expect(tableContainer).toBeVisible();
    
    // デスクトップサイズに戻す
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
  });
});

