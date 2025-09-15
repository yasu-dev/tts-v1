import { test, expect } from '@playwright/test';

test.describe('各画面のバッジとプルダウン一致確認', () => {
  test.beforeEach(async ({ page }) => {
    // ローカル開発サーバーにアクセス
    await page.goto('http://localhost:3002');

    // ログイン処理
    await page.fill('input[name="email"]', 'demo-seller@example.com');
    await page.fill('input[name="password"]', 'demo');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/delivery');
  });

  test('納品管理画面: バッジとプルダウンの一致確認', async ({ page }) => {
    await page.goto('http://localhost:3002/delivery');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('=== 納品管理画面の確認 ===');

    // プルダウンのオプションを取得
    const dropdown = page.locator('select').first();
    if (await dropdown.count() > 0) {
      const options = await dropdown.locator('option').allTextContents();
      console.log('納品管理 プルダウンオプション:', options.filter(o => o.trim()));
    }

    // バッジを取得
    const badges = await page.locator('[class*="bg-"][class*="text-"]').filter({ hasText: /出荷準備中|出荷済み|キャンセル|配送中|配送完了/ }).allTextContents();
    const uniqueBadges = [...new Set(badges.filter(b => b.trim()))];
    console.log('納品管理 バッジ:', uniqueBadges);
  });

  test('セラー在庫管理画面: バッジとプルダウンの一致確認', async ({ page }) => {
    await page.goto('http://localhost:3002/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('=== セラー在庫管理画面の確認 ===');

    // プルダウンのオプションを取得
    const dropdown = page.locator('select').first();
    if (await dropdown.count() > 0) {
      const options = await dropdown.locator('option').allTextContents();
      console.log('セラー在庫管理 プルダウンオプション:', options.filter(o => o.trim()));
    }

    // バッジを取得
    const badges = await page.locator('[class*="bg-"][class*="text-"]').filter({ hasText: /入庫待ち|保管作業中|保管中|出品中|購入者決定|キャンセル|返品|保留中|出荷済み|配送中/ }).allTextContents();
    const uniqueBadges = [...new Set(badges.filter(b => b.trim()))];
    console.log('セラー在庫管理 バッジ:', uniqueBadges);
  });

  test('スタッフ在庫管理画面: バッジとプルダウンの一致確認', async ({ page }) => {
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('=== スタッフ在庫管理画面の確認 ===');

    // プルダウンのオプションを取得（ステータスフィルター）
    const statusDropdown = page.locator('select[data-testid="status-filter"], select').filter({ hasText: /すべてのステータス/ }).first();
    if (await statusDropdown.count() > 0) {
      const options = await statusDropdown.locator('option').allTextContents();
      console.log('スタッフ在庫管理 ステータスプルダウンオプション:', options.filter(o => o.trim()));
    }

    // バッジを取得
    const badges = await page.locator('[class*="bg-"][class*="text-"]').filter({ hasText: /配送中|出荷済み|入庫待ち|保管作業中|保管中|出品中|購入者決定|キャンセル|返品|保留中/ }).allTextContents();
    const uniqueBadges = [...new Set(badges.filter(b => b.trim()))];
    console.log('スタッフ在庫管理 バッジ:', uniqueBadges);
  });

  test('販売管理画面: バッジとプルダウンの一致確認', async ({ page }) => {
    await page.goto('http://localhost:3002/sales');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('=== 販売管理画面の確認 ===');

    // プルダウンのオプションを取得
    const dropdown = page.locator('select').first();
    if (await dropdown.count() > 0) {
      const options = await dropdown.locator('option').allTextContents();
      console.log('販売管理 プルダウンオプション:', options.filter(o => o.trim()));
    }

    // バッジを取得
    const badges = await page.locator('[class*="bg-"][class*="text-"]').filter({ hasText: /出品中|購入者決定|出荷準備中|出荷済み|配送完了|配送中/ }).allTextContents();
    const uniqueBadges = [...new Set(badges.filter(b => b.trim()))];
    console.log('販売管理 バッジ:', uniqueBadges);
  });

  test('検品管理画面: バッジとプルダウン/タブの一致確認', async ({ page }) => {
    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('=== 検品管理画面の確認 ===');

    // プルダウンのオプションを取得
    const dropdown = page.locator('select').first();
    if (await dropdown.count() > 0) {
      const options = await dropdown.locator('option').allTextContents();
      console.log('検品管理 プルダウンオプション:', options.filter(o => o.trim()));
    }

    // タブを取得
    const tabs = await page.locator('button').filter({ hasText: /全体|入庫待ち|保管作業中|完了|梱包完了|保留中/ }).allTextContents();
    console.log('検品管理 タブ:', tabs.filter(t => t.trim()));

    // バッジを取得
    const badges = await page.locator('[class*="bg-"][class*="text-"]').filter({ hasText: /入庫待ち|保管作業中|梱包完了|保管中|完了/ }).allTextContents();
    const uniqueBadges = [...new Set(badges.filter(b => b.trim()))];
    console.log('検品管理 バッジ:', uniqueBadges);
  });

  test('出荷管理画面: バッジとタブの一致確認', async ({ page }) => {
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('=== 出荷管理画面の確認 ===');

    // タブを取得
    const tabs = await page.locator('button').filter({ hasText: /全体|梱包待ち|梱包済み|集荷準備完了/ }).allTextContents();
    console.log('出荷管理 タブ:', tabs.filter(t => t.trim()));

    // バッジを取得
    const badges = await page.locator('[class*="bg-"][class*="text-"]').filter({ hasText: /梱包待ち|梱包済み|集荷準備完了/ }).allTextContents();
    const uniqueBadges = [...new Set(badges.filter(b => b.trim()))];
    console.log('出荷管理 バッジ:', uniqueBadges);
  });
});