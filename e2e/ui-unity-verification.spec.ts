import { test, expect } from '@playwright/test';

test.describe('UIの統一性検証', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
  });

  test('基準UI：セラーの納品管理画面の確認', async ({ page }) => {
    await page.goto('http://localhost:3002/delivery');
    await page.waitForLoadState('networkidle');

    // 基準UIの仕様確認
    const mainContainer = page.locator('.intelligence-card.oceania').first();
    await expect(mainContainer).toBeVisible();

    const header = mainContainer.locator('div.p-6.border-b.border-gray-300').first();
    await expect(header).toBeVisible();

    const title = header.locator('h3.text-lg.font-medium.text-nexus-text-primary');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('納品プラン一覧');

    const filterSection = mainContainer.locator('div.p-6.border-b.border-gray-300').nth(1);
    await expect(filterSection).toBeVisible();
  });

  test('セラーの在庫管理画面の統一性確認', async ({ page }) => {
    await page.goto('http://localhost:3002/inventory');
    await page.waitForLoadState('networkidle');

    // 統一されたメインコンテナ
    const mainContainer = page.locator('.intelligence-card.oceania');
    await expect(mainContainer).toBeVisible();

    // ヘッダー部分の統一確認
    const header = mainContainer.locator('div.p-6.border-b.border-gray-300').first();
    await expect(header).toBeVisible();

    // タイトルフォントの統一確認
    const title = header.locator('h3.text-lg.font-medium.text-nexus-text-primary');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('商品一覧');

    // フィルター部分の統一確認
    const filterSection = mainContainer.locator('div.p-6.border-b.border-gray-300').nth(1);
    await expect(filterSection).toBeVisible();
  });

  test('セラーの返品管理画面の統一性確認', async ({ page }) => {
    await page.goto('http://localhost:3002/returns');
    await page.waitForLoadState('networkidle');

    // 統一されたメインコンテナ
    const mainContainer = page.locator('.intelligence-card.oceania');
    await expect(mainContainer).toBeVisible();

    // ヘッダー部分の統一確認
    const header = mainContainer.locator('div.p-6.border-b.border-gray-300').first();
    await expect(header).toBeVisible();

    // タイトルフォントの統一確認
    const title = header.locator('h3.text-lg.font-medium.text-nexus-text-primary');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('返品履歴');
  });

  test('スタッフの検品管理画面の統一性確認', async ({ page }) => {
    // スタッフログイン
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });

    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForLoadState('networkidle');

    // 統一されたメインコンテナ
    const mainContainer = page.locator('.intelligence-card.oceania');
    await expect(mainContainer).toBeVisible();

    // ヘッダー部分の統一確認
    const header = mainContainer.locator('div.p-6.border-b.border-gray-300').first();
    await expect(header).toBeVisible();

    // タイトルフォントの統一確認
    const title = header.locator('h3.text-lg.font-medium.text-nexus-text-primary');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('検品タスク管理');

    // フィルター部分の統一確認
    const filterSection = mainContainer.locator('div.p-6.border-b.border-gray-300').nth(1);
    await expect(filterSection).toBeVisible();
  });

  test('スタッフの在庫管理画面の統一性確認', async ({ page }) => {
    // スタッフログイン
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });

    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle');

    // 統一されたメインコンテナ
    const mainContainer = page.locator('.intelligence-card.oceania');
    await expect(mainContainer).toBeVisible();

    // ヘッダー部分の統一確認
    const header = mainContainer.locator('div.p-6.border-b.border-gray-300').first();
    await expect(header).toBeVisible();

    // タイトルフォントの統一確認
    const title = header.locator('h3.text-lg.font-medium.text-nexus-text-primary');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('商品管理');

    // フィルター部分の統一確認
    const filterSection = mainContainer.locator('div.p-6.border-b.border-gray-300').nth(1);
    await expect(filterSection).toBeVisible();
  });

  test('スタッフの返品管理画面の統一性確認', async ({ page }) => {
    // スタッフログイン
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });

    await page.goto('http://localhost:3002/staff/returns');
    await page.waitForLoadState('networkidle');

    // 統一されたメインコンテナ
    const mainContainer = page.locator('.intelligence-card.oceania');
    await expect(mainContainer).toBeVisible();

    // ヘッダー部分の統一確認
    const header = mainContainer.locator('div.p-6.border-b.border-gray-300').first();
    await expect(header).toBeVisible();

    // タイトルフォントの統一確認
    const title = header.locator('h3.text-lg.font-medium.text-nexus-text-primary');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('返品商品リスト');
  });

  test('全画面共通：統一性の最終確認', async ({ page }) => {
    const pages = [
      { url: 'http://localhost:3002/delivery', userType: 'seller', title: '納品プラン一覧' },
      { url: 'http://localhost:3002/inventory', userType: 'seller', title: '商品一覧' },
      { url: 'http://localhost:3002/returns', userType: 'seller', title: '返品履歴' }
    ];

    for (const pageInfo of pages) {
      // セラーログイン
      if (pageInfo.userType === 'seller') {
        await page.goto('http://localhost:3002/login');
        await page.fill('input[type="email"]', 'seller@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
      }

      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');

      // 統一性の確認
      const mainContainer = page.locator('.intelligence-card.oceania').first();
      await expect(mainContainer).toBeVisible({ timeout: 10000 });

      const header = mainContainer.locator('div.p-6.border-b.border-gray-300').first();
      await expect(header).toBeVisible();

      const title = header.locator('h3.text-lg.font-medium.text-nexus-text-primary');
      await expect(title).toBeVisible();
    }

    // スタッフ画面の確認
    const staffPages = [
      { url: 'http://localhost:3002/staff/inspection', title: '検品タスク管理' },
      { url: 'http://localhost:3002/staff/inventory', title: '商品管理' },
      { url: 'http://localhost:3002/staff/returns', title: '返品商品リスト' }
    ];

    // スタッフログイン
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });

    for (const pageInfo of staffPages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');

      const mainContainer = page.locator('.intelligence-card.oceania').first();
      await expect(mainContainer).toBeVisible({ timeout: 10000 });

      const header = mainContainer.locator('div.p-6.border-b.border-gray-300').first();
      await expect(header).toBeVisible();

      const title = header.locator('h3.text-lg.font-medium.text-nexus-text-primary');
      await expect(title).toBeVisible();
    }
  });
});
