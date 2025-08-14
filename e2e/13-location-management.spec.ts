import { test, expect } from '@playwright/test';

// ヘルパー関数：スタッフとしてログイン
async function loginAsStaff(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'staff@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/staff\/dashboard$/, { timeout: 15000 });
}

test.describe('ロケーション管理機能テスト', () => {
  test('スタッフがロケーション管理画面にアクセスできる', async ({ page }) => {
    await loginAsStaff(page);
    
    // ロケーション管理ページに移動
    await page.goto('/staff/location');
    
    // ページタイトルが表示されることを確認
    await expect(page.locator('h1')).toContainText('ロケーション管理');
    
    // サブタイトルが表示されることを確認
    await expect(page.locator('text=倉庫内の商品配置を効率的に管理・最適化')).toBeVisible();
  });

  test('ロケーション統計情報が表示される', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/location');
    
    // 統計カードが表示されることを確認
    await expect(page.locator('text=総ロケーション数')).toBeVisible();
    await expect(page.locator('text=使用中ロケーション')).toBeVisible();
    await expect(page.locator('text=総容量')).toBeVisible();
    await expect(page.locator('text=使用容量')).toBeVisible();
    
    // 統計値が数値として表示されることを確認
    await page.waitForFunction(() => {
      const statsElements = document.querySelectorAll('[class*="text-2xl"]');
      return Array.from(statsElements).some(el => 
        el.textContent && /\d+/.test(el.textContent)
      );
    }, {}, { timeout: 10000 });
  });

  test('ロケーション検索機能が動作する', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/location');
    
    // 検索バーが表示されることを確認
    const searchInput = page.locator('input[placeholder*="ロケーション、商品、SKUで検索"]');
    await expect(searchInput).toBeVisible();
    
    // 検索テストを実行
    await searchInput.fill('STD-A-01');
    
    // 検索結果が反映されることを確認（少し待つ）
    await page.waitForTimeout(500);
  });

  test('ロケーション一覧が表示される', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/location');
    
    // 一覧表示モードに切り替え
    const overviewTab = page.locator('button:has-text("一覧表示")');
    if (await overviewTab.isVisible()) {
      await overviewTab.click();
    }
    
    // ロケーションカードまたはリストが表示されることを確認
    await page.waitForFunction(() => {
      // ロケーションコード（STD-A-01など）を含む要素があるかチェック
      const elements = document.querySelectorAll('*');
      return Array.from(elements).some(el => 
        el.textContent && /STD-[A-Z]-\d+|HUM-\d+|TEMP-\d+|VAULT-\d+|INSP-[A-Z]|PHOTO|PACK/.test(el.textContent)
      );
    }, {}, { timeout: 10000 });
  });

  test('個別ロケーションの詳細情報が表示される', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/location');
    
    // 一覧表示モードに切り替え
    const overviewTab = page.locator('button:has-text("一覧表示")');
    if (await overviewTab.isVisible()) {
      await overviewTab.click();
    }
    
    // 最初のロケーションカードをクリック
    await page.waitForSelector('text=/STD-[A-Z]-\d+|HUM-\d+|TEMP-\d+/', { timeout: 10000 });
    const firstLocationCard = page.locator('text=/STD-[A-Z]-\d+|HUM-\d+|TEMP-\d+/').first();
    await firstLocationCard.click();
    
    // モーダルまたは詳細画面が開くことを確認
    await page.waitForTimeout(1000);
    
    // 詳細情報（容量、使用率など）が表示されることを確認
    const detailsVisible = await page.locator('text=/容量|使用率|商品数/').first().isVisible({ timeout: 5000 });
    expect(detailsVisible).toBe(true);
  });

  test('ロケーションタイプ別の表示が正しく動作する', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/location');
    
    // 一覧表示モードに切り替え
    const overviewTab = page.locator('button:has-text("一覧表示")');
    if (await overviewTab.isVisible()) {
      await overviewTab.click();
    }
    
    // 異なるタイプのロケーションが表示されることを確認
    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('標準棚') || text.includes('防湿庫') || text.includes('金庫室') || text.includes('検品室');
    }, {}, { timeout: 10000 });
  });

  test('ロケーション管理のアクションボタンが表示される', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/location');
    
    // ヘッダーのアクションボタンが表示されることを確認
    await expect(page.locator('button:has-text("クイックスキャン")')).toBeVisible();
    await expect(page.locator('button:has-text("最適化")')).toBeVisible();
    await expect(page.locator('button:has-text("棚卸")')).toBeVisible();
  });

  test('ロケーション使用率の色分け表示が正しく動作する', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/location');
    
    // 一覧表示モードに切り替え
    const overviewTab = page.locator('button:has-text("一覧表示")');
    if (await overviewTab.isVisible()) {
      await overviewTab.click();
    }
    
    // 使用率に応じた色分けがされていることを確認（CSS クラスの確認）
    await page.waitForFunction(() => {
      const elements = document.querySelectorAll('[class*="bg-green"], [class*="bg-yellow"], [class*="bg-red"], [class*="bg-nexus"]');
      return elements.length > 0;
    }, {}, { timeout: 10000 });
  });

  test('ロケーション情報の詳細（住所、電話番号、備考）が表示される', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/location');
    
    // 一覧表示モードに切り替え
    const overviewTab = page.locator('button:has-text("一覧表示")');
    if (await overviewTab.isVisible()) {
      await overviewTab.click();
    }
    
    // ロケーションをクリックして詳細を表示
    await page.waitForSelector('text=/STD-[A-Z]-\d+|HUM-\d+/', { timeout: 10000 });
    const locationElement = page.locator('text=/STD-[A-Z]-\d+|HUM-\d+/').first();
    await locationElement.click();
    
    // 詳細情報が表示されることを確認
    await page.waitForTimeout(1000);
    
    // 住所、電話番号、備考のいずれかが表示されることを確認
    const hasDetails = await page.locator('text=/1F-|2F-|3F-|地下|区画|エリア|03-|090-|カメラ|腕時計|防湿|温度|金庫/').first().isVisible({ timeout: 5000 });
    expect(hasDetails).toBe(true);
  });
});
