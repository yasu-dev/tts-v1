import { test, expect } from '@playwright/test';

test.describe('モーダルスクロール位置テスト', () => {
  // セラー向けモーダルのテスト
  test.describe('セラー画面のモーダル', () => {
    test.beforeEach(async ({ page }) => {
      // ログイン
      await page.goto('http://localhost:3003/login');
      await page.fill('input[name="email"]', 'seller@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('在庫管理画面 - 商品詳細モーダルが最上部から表示される', async ({ page }) => {
      await page.goto('http://localhost:3003/inventory');
      await page.waitForLoadState('networkidle');
      
      // 詳細ボタンをクリック
      const detailButton = page.locator('button:has-text("詳細")').first();
      await detailButton.click();
      
      // モーダルが表示されるまで待機
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      
      // モーダル内のスクロール可能エリアを取得
      const scrollableArea = page.locator('[role="dialog"] .overflow-y-auto').first();
      
      // スクロール位置が0であることを確認
      const scrollTop = await scrollableArea.evaluate(el => el.scrollTop);
      expect(scrollTop).toBe(0);
      
      // モーダルの最上部にあるタイトルが見えることを確認
      const modalTitle = page.locator('[role="dialog"] h2').first();
      await expect(modalTitle).toBeVisible();
    });

    test('在庫管理画面 - 編集モーダルが最上部から表示される', async ({ page }) => {
      await page.goto('http://localhost:3003/inventory');
      await page.waitForLoadState('networkidle');
      
      // 編集ボタンをクリック
      const editButton = page.locator('button:has-text("編集")').first();
      await editButton.click();
      
      // モーダルが表示されるまで待機
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      
      // モーダル内のスクロール可能エリアを取得
      const scrollableArea = page.locator('[role="dialog"] .overflow-y-auto').first();
      
      // スクロール位置が0であることを確認
      const scrollTop = await scrollableArea.evaluate(el => el.scrollTop);
      expect(scrollTop).toBe(0);
    });

    test('納品管理画面 - 商品登録モーダルが最上部から表示される', async ({ page }) => {
      await page.goto('http://localhost:3003/delivery');
      await page.waitForLoadState('networkidle');
      
      // 商品登録ボタンをクリック
      const registerButton = page.locator('button:has-text("商品登録")').first();
      await registerButton.click();
      
      // モーダルが表示されるまで待機
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      
      // モーダル内のスクロール可能エリアを取得
      const scrollableArea = page.locator('[role="dialog"] .overflow-y-auto').first();
      
      // スクロール位置が0であることを確認
      const scrollTop = await scrollableArea.evaluate(el => el.scrollTop);
      expect(scrollTop).toBe(0);
    });
  });

  // スタッフ向けモーダルのテスト
  test.describe('スタッフ画面のモーダル', () => {
    test.beforeEach(async ({ page }) => {
      // ログイン
      await page.goto('http://localhost:3003/login');
      await page.fill('input[name="email"]', 'staff@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/staff/dashboard');
    });

    test('返品管理画面 - 詳細モーダルが最上部から表示される', async ({ page }) => {
      await page.goto('http://localhost:3003/staff/returns');
      await page.waitForLoadState('networkidle');
      
      // 詳細ボタンをクリック
      const detailButton = page.locator('button:has-text("詳細")').first();
      await detailButton.click();
      
      // モーダルが表示されるまで待機
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      
      // モーダル内のスクロール可能エリアを取得
      const scrollableArea = page.locator('[role="dialog"] .overflow-y-auto').first();
      
      // スクロール位置が0であることを確認
      const scrollTop = await scrollableArea.evaluate(el => el.scrollTop);
      expect(scrollTop).toBe(0);
    });

    test('ロケーション管理画面 - ロケーション詳細モーダルが最上部から表示される', async ({ page }) => {
      await page.goto('http://localhost:3003/staff/location');
      await page.waitForLoadState('networkidle');
      
      // ロケーションカードをクリック
      const locationCard = page.locator('.intelligence-card').first();
      await locationCard.click();
      
      // カスタムモーダルが表示されるまで待機
      await page.waitForSelector('.fixed.inset-0', { state: 'visible' });
      
      // モーダル内のスクロール可能エリアを取得
      const scrollableArea = page.locator('.overflow-y-auto[ref]').first();
      
      // スクロール位置が0であることを確認
      const scrollTop = await scrollableArea.evaluate(el => el.scrollTop);
      expect(scrollTop).toBe(0);
    });

    test('出荷管理画面 - 出荷詳細モーダルが最上部から表示される', async ({ page }) => {
      await page.goto('http://localhost:3003/staff/shipping');
      await page.waitForLoadState('networkidle');
      
      // 詳細ボタンをクリック
      const detailButton = page.locator('button:has-text("詳細")').first();
      await detailButton.click();
      
      // モーダルが表示されるまで待機
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      
      // モーダル内のスクロール可能エリアを取得
      const scrollableArea = page.locator('[role="dialog"] .overflow-y-auto').first();
      
      // スクロール位置が0であることを確認
      const scrollTop = await scrollableArea.evaluate(el => el.scrollTop);
      expect(scrollTop).toBe(0);
    });
  });

  // モーダルを再度開いた際のテスト
  test('モーダルを閉じて再度開いた際も最上部から表示される', async ({ page }) => {
    // ログイン
    await page.goto('http://localhost:3003/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    await page.goto('http://localhost:3003/inventory');
    await page.waitForLoadState('networkidle');
    
    // 1回目: モーダルを開く
    const detailButton = page.locator('button:has-text("詳細")').first();
    await detailButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    // モーダル内をスクロール
    const scrollableArea = page.locator('[role="dialog"] .overflow-y-auto').first();
    await scrollableArea.evaluate(el => el.scrollTop = 200);
    
    // モーダルを閉じる
    const closeButton = page.locator('[role="dialog"] button[aria-label="モーダルを閉じる"]');
    await closeButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
    
    // 2回目: 同じモーダルを再度開く
    await detailButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    // スクロール位置が0にリセットされていることを確認
    const newScrollTop = await scrollableArea.evaluate(el => el.scrollTop);
    expect(newScrollTop).toBe(0);
  });
}); 