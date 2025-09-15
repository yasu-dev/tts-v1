import { test, expect } from '@playwright/test';

test.describe('ステータス表示一致性確認', () => {

  test('セラー在庫管理: プルダウンとバッジの表示一致確認', async ({ page }) => {
    // セラー在庫管理ページへ移動
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    // フィルタープルダウンを開く
    const statusFilter = page.locator('select').filter({ hasText: 'ステータス' }).or(
      page.getByRole('combobox').filter({ hasText: 'ステータス' })
    ).or(
      page.locator('[data-testid="status-filter"]')
    ).or(
      page.locator('select').first()
    );

    console.log('🔍 セラー在庫管理 - ステータスフィルター確認');

    // プルダウンの選択肢を取得
    const filterOptions = await page.locator('select option, [role="option"]').allTextContents();
    console.log('📋 プルダウン選択肢:', filterOptions);

    // ページ上のステータスバッジを取得
    await page.waitForTimeout(2000);
    const statusBadges = await page.locator('[class*="bg-"], .status-badge, [data-testid*="status"]').allTextContents();
    const uniqueBadges = [...new Set(statusBadges.filter(text => text.trim().length > 0))];
    console.log('🏷️ 表示されているステータスバッジ:', uniqueBadges);

    // 一致性を確認
    console.log('\n=== セラー在庫管理 ステータス一致性分析 ===');
    uniqueBadges.forEach(badge => {
      const isInFilter = filterOptions.some(option =>
        option.includes(badge) || badge.includes(option.replace('すべて', '').trim())
      );
      console.log(`${badge}: ${isInFilter ? '✅ 一致' : '❌ 不一致'}`);
    });
  });

  test('スタッフ在庫管理: プルダウンとバッジの表示一致確認', async ({ page }) => {
    // スタッフ在庫管理ページへ移動
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');

    console.log('🔍 スタッフ在庫管理 - ステータスフィルター確認');

    // プルダウンの選択肢を取得
    const filterOptions = await page.locator('select option, [role="option"]').allTextContents();
    console.log('📋 プルダウン選択肢:', filterOptions);

    // ページ上のステータスバッジを取得
    await page.waitForTimeout(2000);
    const statusBadges = await page.locator('[class*="bg-"], .status-badge, [data-testid*="status"]').allTextContents();
    const uniqueBadges = [...new Set(statusBadges.filter(text => text.trim().length > 0))];
    console.log('🏷️ 表示されているステータスバッジ:', uniqueBadges);

    // 一致性を確認
    console.log('\n=== スタッフ在庫管理 ステータス一致性分析 ===');
    uniqueBadges.forEach(badge => {
      const isInFilter = filterOptions.some(option =>
        option.includes(badge) || badge.includes(option.replace('すべて', '').trim())
      );
      console.log(`${badge}: ${isInFilter ? '✅ 一致' : '❌ 不一致'}`);
    });
  });

  test('セラー販売管理: プルダウンとバッジの表示一致確認', async ({ page }) => {
    // セラー販売管理ページへ移動
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');

    console.log('🔍 セラー販売管理 - ステータスフィルター確認');

    // プルダウンの選択肢を取得
    const filterOptions = await page.locator('select option, [role="option"]').allTextContents();
    console.log('📋 プルダウン選択肢:', filterOptions);

    // ページ上のステータスバッジを取得
    await page.waitForTimeout(2000);
    const statusBadges = await page.locator('[class*="bg-"], .status-badge, [data-testid*="status"]').allTextContents();
    const uniqueBadges = [...new Set(statusBadges.filter(text => text.trim().length > 0))];
    console.log('🏷️ 表示されているステータスバッジ:', uniqueBadges);

    // 一致性を確認
    console.log('\n=== セラー販売管理 ステータス一致性分析 ===');
    uniqueBadges.forEach(badge => {
      const isInFilter = filterOptions.some(option =>
        option.includes(badge) || badge.includes(option.replace('すべて', '').trim())
      );
      console.log(`${badge}: ${isInFilter ? '✅ 一致' : '❌ 不一致'}`);
    });
  });

  test('スタッフ検品管理: ステータス表示確認', async ({ page }) => {
    // スタッフ検品管理ページへ移動
    await page.goto('/staff/inspection');
    await page.waitForLoadState('networkidle');

    console.log('🔍 スタッフ検品管理 - ステータス表示確認');

    // プルダウンの選択肢を取得（もしあれば）
    const filterOptions = await page.locator('select option, [role="option"]').allTextContents();
    console.log('📋 プルダウン選択肢:', filterOptions);

    // ページ上のステータスバッジを取得
    await page.waitForTimeout(2000);
    const statusBadges = await page.locator('[class*="bg-"], .status-badge, [data-testid*="status"]').allTextContents();
    const uniqueBadges = [...new Set(statusBadges.filter(text => text.trim().length > 0))];
    console.log('🏷️ 表示されているステータスバッジ:', uniqueBadges);

    // 一致性を確認
    console.log('\n=== スタッフ検品管理 ステータス一致性分析 ===');
    uniqueBadges.forEach(badge => {
      const isInFilter = filterOptions.some(option =>
        option.includes(badge) || badge.includes(option.replace('すべて', '').trim())
      );
      console.log(`${badge}: ${isInFilter ? '✅ 一致' : '❌ 不一致'}`);
    });
  });

  test('商品詳細モーダル: ステータス表示確認', async ({ page }) => {
    // セラー在庫管理から商品詳細を開く
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    // 最初の商品をクリック
    const firstProduct = page.locator('tr').nth(1);
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForTimeout(1000);

      // モーダル内のステータス表示を確認
      const modalStatuses = await page.locator('.modal [class*="bg-"], .modal .status-badge').allTextContents();
      console.log('🏷️ モーダル内ステータス表示:', modalStatuses);
    }
  });

  test('ステータス統合レポート', async ({ page }) => {
    console.log('\n📊 ========== ステータス表示統合レポート ==========\n');

    const pages = [
      { url: '/inventory', name: 'セラー在庫管理' },
      { url: '/staff/inventory', name: 'スタッフ在庫管理' },
      { url: '/sales', name: 'セラー販売管理' },
      { url: '/staff/inspection', name: 'スタッフ検品管理' }
    ];

    const allStatuses = new Set<string>();
    const pageStatuses: { [key: string]: { filters: string[], badges: string[] } } = {};

    for (const pageInfo of pages) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const filterOptions = await page.locator('select option, [role="option"]').allTextContents();
        const cleanFilters = filterOptions.filter(opt => opt.trim().length > 0 && opt !== 'すべて');

        const statusBadges = await page.locator('[class*="bg-"], .status-badge, [data-testid*="status"]').allTextContents();
        const cleanBadges = [...new Set(statusBadges.filter(text => text.trim().length > 0))];

        pageStatuses[pageInfo.name] = {
          filters: cleanFilters,
          badges: cleanBadges
        };

        cleanFilters.forEach(status => allStatuses.add(status));
        cleanBadges.forEach(status => allStatuses.add(status));

        console.log(`📄 ${pageInfo.name}:`);
        console.log(`   フィルター: ${cleanFilters.join(', ')}`);
        console.log(`   バッジ: ${cleanBadges.join(', ')}\n`);

      } catch (error) {
        console.log(`❌ ${pageInfo.name}: アクセスエラー`);
      }
    }

    console.log('🔍 全ステータス一覧:');
    Array.from(allStatuses).sort().forEach(status => {
      console.log(`   - ${status}`);
    });

    console.log('\n❗ 不一致検出:');
    Object.entries(pageStatuses).forEach(([pageName, data]) => {
      const mismatches = data.badges.filter(badge =>
        !data.filters.some(filter => filter.includes(badge) || badge.includes(filter))
      );
      if (mismatches.length > 0) {
        console.log(`   ${pageName}: ${mismatches.join(', ')}`);
      }
    });
  });
});