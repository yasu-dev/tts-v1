import { test, expect } from '@playwright/test';

test.describe('ステータスフィルターとバッジの不一致確認', () => {

  test('セラー在庫管理: ステータスフィルター特定', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    console.log('🔍 セラー在庫管理ページで正確なステータスフィルターを特定');

    // ステータスフィルター要素を複数の方法で探す
    await page.waitForTimeout(3000);

    // 可能性のあるセレクター
    const selectors = [
      'select[data-testid="status-filter"]',
      'select:has-text("ステータス")',
      'select:has-text("すべて")',
      'select:has-text("出品中")',
      'div[role="combobox"]',
      '.select-container select',
      '[data-filter="status"] select',
      'select',
    ];

    for (const selector of selectors) {
      try {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          console.log(`✅ セレクター ${selector}: ${count}個見つかりました`);
          const options = await element.first().locator('option').allTextContents();
          console.log(`   選択肢: ${options.join(', ')}`);
        }
      } catch (e) {
        console.log(`❌ セレクター ${selector}: 見つかりませんでした`);
      }
    }

    // ページ上のステータスバッジを特定
    const statusElements = await page.locator('td:has-text("出品中"), td:has-text("配送中"), td:has-text("保管作業中"), td:has-text("購入者決定"), td:has-text("入庫待ち"), td:has-text("キャンセル")').allTextContents();
    console.log('🏷️ 実際のステータス表示:', [...new Set(statusElements)]);
  });

  test('セラー販売管理: ステータスフィルター特定', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');

    console.log('🔍 セラー販売管理ページで正確なステータスフィルターを特定');

    await page.waitForTimeout(3000);

    // 可能性のあるセレクター
    const selectors = [
      'select[data-testid="status-filter"]',
      'select:has-text("ステータス")',
      'select:has-text("すべて")',
      'div[role="combobox"]',
      'select',
    ];

    for (const selector of selectors) {
      try {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          console.log(`✅ セレクター ${selector}: ${count}個見つかりました`);
          const options = await element.first().locator('option').allTextContents();
          console.log(`   選択肢: ${options.join(', ')}`);
        }
      } catch (e) {
        console.log(`❌ セレクター ${selector}: 見つかりませんでした`);
      }
    }

    // ページ上のステータスバッジを特定
    const statusElements = await page.locator('td:has-text("出品中"), td:has-text("配送中"), td:has-text("配送完了"), td:has-text("購入者決定"), td:has-text("出荷準備中")').allTextContents();
    console.log('🏷️ 実際のステータス表示:', [...new Set(statusElements)]);
  });

  test('スタッフ在庫管理: ステータスフィルター特定', async ({ page }) => {
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');

    console.log('🔍 スタッフ在庫管理ページで正確なステータスフィルターを特定');

    await page.waitForTimeout(3000);

    // 可能性のあるセレクター
    const selectors = [
      'select[data-testid="status-filter"]',
      'select:has-text("ステータス")',
      'select:has-text("すべて")',
      'div[role="combobox"]',
      'select',
    ];

    for (const selector of selectors) {
      try {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          console.log(`✅ セレクター ${selector}: ${count}個見つかりました`);
          const options = await element.first().locator('option').allTextContents();
          console.log(`   選択肢: ${options.join(', ')}`);
        }
      } catch (e) {
        console.log(`❌ セレクター ${selector}: 見つかりませんでした`);
      }
    }

    // ページ上のステータスバッジを特定
    const statusElements = await page.locator('td:has-text("出品中"), td:has-text("配送中"), td:has-text("保管作業中"), td:has-text("購入者決定"), td:has-text("入庫待ち"), td:has-text("作業台")').allTextContents();
    console.log('🏷️ 実際のステータス表示:', [...new Set(statusElements)]);
  });

  test('実際の不一致確認: セラー在庫管理', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('\n=== セラー在庫管理: 実際の不一致確認 ===');

    // ステータスフィルターを探す
    const statusFilter = page.locator('select').filter({ hasText: 'すべて' });
    if (await statusFilter.count() > 0) {
      const filterOptions = await statusFilter.locator('option').allTextContents();
      console.log('📋 フィルター選択肢:', filterOptions.filter(opt => opt.trim() && opt !== 'すべて'));
    }

    // 実際のバッジ表示
    const badgeTexts = [
      await page.locator('text=出品中').count() > 0 ? '出品中' : null,
      await page.locator('text=配送中').count() > 0 ? '配送中' : null,
      await page.locator('text=保管作業中').count() > 0 ? '保管作業中' : null,
      await page.locator('text=購入者決定').count() > 0 ? '購入者決定' : null,
      await page.locator('text=入庫待ち').count() > 0 ? '入庫待ち' : null,
      await page.locator('text=キャンセル').count() > 0 ? 'キャンセル' : null,
    ].filter(Boolean);

    console.log('🏷️ 実際のバッジ表示:', badgeTexts);

    // 不一致チェック
    const filterOptions = await statusFilter.locator('option').allTextContents();
    badgeTexts.forEach(badge => {
      const found = filterOptions.some(option => option.includes(badge));
      console.log(`${badge}: ${found ? '✅ 一致' : '❌ 不一致'}`);
    });
  });

  test('実際の不一致確認: セラー販売管理', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('\n=== セラー販売管理: 実際の不一致確認 ===');

    // ステータスフィルターを探す
    const statusFilter = page.locator('select').filter({ hasText: 'すべて' });
    if (await statusFilter.count() > 0) {
      const filterOptions = await statusFilter.locator('option').allTextContents();
      console.log('📋 フィルター選択肢:', filterOptions.filter(opt => opt.trim() && opt !== 'すべて'));
    }

    // 実際のバッジ表示
    const badgeTexts = [
      await page.locator('text=出品中').count() > 0 ? '出品中' : null,
      await page.locator('text=配送中').count() > 0 ? '配送中' : null,
      await page.locator('text=配送完了').count() > 0 ? '配送完了' : null,
      await page.locator('text=購入者決定').count() > 0 ? '購入者決定' : null,
      await page.locator('text=出荷準備中').count() > 0 ? '出荷準備中' : null,
    ].filter(Boolean);

    console.log('🏷️ 実際のバッジ表示:', badgeTexts);

    // 不一致チェック
    const filterOptions = await statusFilter.locator('option').allTextContents();
    badgeTexts.forEach(badge => {
      const found = filterOptions.some(option => option.includes(badge));
      console.log(`${badge}: ${found ? '✅ 一致' : '❌ 不一致'}`);
    });
  });
});