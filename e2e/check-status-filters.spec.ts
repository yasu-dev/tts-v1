import { test, expect } from '@playwright/test';

test.describe('各画面のステータスフィルター確認', () => {
  test.beforeEach(async ({ page }) => {
    // ローカル開発サーバーにアクセス
    await page.goto('http://localhost:3000');

    // ログイン処理
    await page.fill('input[name="email"]', 'test-user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('納品管理画面のステータス確認', async ({ page }) => {
    await page.goto('http://localhost:3000/delivery');
    await page.waitForLoadState('networkidle');

    // フィルタードロップダウンをクリック
    const filterDropdown = page.locator('select').filter({ hasText: 'すべてのステータス' }).first();
    if (await filterDropdown.count() === 0) {
      const dropdown = page.locator('button', { hasText: 'すべてのステータス' }).first();
      await dropdown.click();
    }

    // ドロップダウンのオプションを取得
    const options = await page.locator('option, [role="option"], .dropdown-item').allTextContents();
    console.log('納品管理のステータスオプション:', options);

    // テーブル内のバッジを確認
    const badges = await page.locator('[class*="bg-"][class*="text-"]').allTextContents();
    const uniqueBadges = [...new Set(badges.filter(b => b.trim()))];
    console.log('納品管理画面のバッジ:', uniqueBadges);
  });

  test('セラー在庫管理画面のステータス確認', async ({ page }) => {
    await page.goto('http://localhost:3000/inventory');
    await page.waitForLoadState('networkidle');

    // フィルタードロップダウンを確認
    const filterDropdown = page.locator('select').filter({ hasText: 'すべてのステータス' }).first();
    if (await filterDropdown.count() === 0) {
      const dropdown = page.locator('button', { hasText: 'すべてのステータス' }).first();
      await dropdown.click();
    }

    // ドロップダウンのオプションを取得
    const options = await page.locator('option, [role="option"], .dropdown-item').allTextContents();
    console.log('セラー在庫管理のステータスオプション:', options);

    // テーブル内のバッジを確認
    const badges = await page.locator('[class*="bg-"][class*="text-"]').allTextContents();
    const uniqueBadges = [...new Set(badges.filter(b => b.trim()))];
    console.log('セラー在庫管理画面のバッジ:', uniqueBadges);
  });

  test('販売管理画面のステータス確認', async ({ page }) => {
    await page.goto('http://localhost:3000/sales');
    await page.waitForLoadState('networkidle');

    // フィルタードロップダウンを確認
    const filterDropdown = page.locator('select').filter({ hasText: 'すべて' }).first();
    if (await filterDropdown.count() === 0) {
      const dropdown = page.locator('button', { hasText: 'すべて' }).first();
      await dropdown.click();
    }

    // ドロップダウンのオプションを取得
    const options = await page.locator('option, [role="option"], .dropdown-item').allTextContents();
    console.log('販売管理のステータスオプション:', options);

    // テーブル内のバッジを確認
    const badges = await page.locator('[class*="bg-"][class*="text-"]').allTextContents();
    const uniqueBadges = [...new Set(badges.filter(b => b.trim()))];
    console.log('販売管理画面のバッジ:', uniqueBadges);
  });

  test('スタッフ在庫管理画面のステータス確認', async ({ page }) => {
    await page.goto('http://localhost:3000/staff/inventory');
    await page.waitForLoadState('networkidle');

    // フィルタードロップダウンを確認
    const filterDropdown = page.locator('select').first();
    if (await filterDropdown.count() > 0) {
      const options = await filterDropdown.locator('option').allTextContents();
      console.log('スタッフ在庫管理のステータスオプション:', options);
    }

    // テーブル内のバッジを確認
    const badges = await page.locator('[class*="bg-"][class*="text-"]').allTextContents();
    const uniqueBadges = [...new Set(badges.filter(b => b.trim()))];
    console.log('スタッフ在庫管理画面のバッジ:', uniqueBadges);
  });

  test('検品管理画面のステータス確認', async ({ page }) => {
    await page.goto('http://localhost:3000/staff/inspection');
    await page.waitForLoadState('networkidle');

    // フィルタードロップダウンを確認
    const filterDropdown = page.locator('select').filter({ hasText: 'すべてのステータス' }).first();
    if (await filterDropdown.count() === 0) {
      const dropdown = page.locator('button', { hasText: 'すべてのステータス' }).first();
      await dropdown.click();
    }

    // ドロップダウンのオプションを取得
    const options = await page.locator('option, [role="option"], .dropdown-item').allTextContents();
    console.log('検品管理のステータスオプション:', options);

    // テーブル内のバッジを確認
    const badges = await page.locator('[class*="bg-"][class*="text-"]').allTextContents();
    const uniqueBadges = [...new Set(badges.filter(b => b.trim()))];
    console.log('検品管理画面のバッジ:', uniqueBadges);
  });

  test('出荷管理画面のステータス確認', async ({ page }) => {
    await page.goto('http://localhost:3000/staff/shipping');
    await page.waitForLoadState('networkidle');

    // タブを確認
    const tabs = await page.locator('button').filter({ hasText: /全体|梱包待ち|梱包済み|集荷準備完了/ }).allTextContents();
    console.log('出荷管理のタブ:', tabs);

    // テーブル内のバッジを確認
    const badges = await page.locator('[class*="bg-"][class*="text-"]').allTextContents();
    const uniqueBadges = [...new Set(badges.filter(b => b.trim()))];
    console.log('出荷管理画面のバッジ:', uniqueBadges);
  });
});