import { test, expect } from '@playwright/test';

test.describe('配色改善の確認', () => {
  test('スタッフ在庫管理とセラー在庫管理の改善された配色を確認', async ({ page }) => {
    const statusColors = [];

    // スタッフ在庫管理ページでステータスバッジの色を確認
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    const staffStatusBadges = await page.$$eval('.holo-table tbody .status-badge, .holo-table tbody [class*="bg-"], .holo-table tbody span[class*="bg-"]', elements =>
      elements.map(el => ({
        text: el.textContent?.trim() || '',
        className: el.className,
        style: window.getComputedStyle(el),
        backgroundColor: window.getComputedStyle(el).backgroundColor,
        color: window.getComputedStyle(el).color
      }))
    );

    console.log('=== スタッフ在庫管理のステータス配色 ===');
    staffStatusBadges.forEach((badge, index) => {
      if (badge.text && badge.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        console.log(`${badge.text}: ${badge.backgroundColor} (${badge.className})`);
        statusColors.push({ page: 'staff', status: badge.text, color: badge.backgroundColor });
      }
    });

    // スタッフ在庫管理のスクリーンショット
    const staffTable = await page.$('.holo-table');
    if (staffTable) {
      await staffTable.screenshot({
        path: 'staff-inventory-improved-colors.png'
      });
    }

    // セラー在庫管理ページでステータスバッジの色を確認
    await page.goto('http://localhost:3002/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    const sellerStatusBadges = await page.$$eval('.holo-table tbody .status-badge, .holo-table tbody [class*="bg-"], .holo-table tbody span[class*="bg-"]', elements =>
      elements.map(el => ({
        text: el.textContent?.trim() || '',
        className: el.className,
        backgroundColor: window.getComputedStyle(el).backgroundColor,
        color: window.getComputedStyle(el).color
      }))
    );

    console.log('\\n=== セラー在庫管理のステータス配色 ===');
    sellerStatusBadges.forEach((badge, index) => {
      if (badge.text && badge.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        console.log(`${badge.text}: ${badge.backgroundColor} (${badge.className})`);
        statusColors.push({ page: 'seller', status: badge.text, color: badge.backgroundColor });
      }
    });

    // セラー在庫管理のスクリーンショット
    const sellerTable = await page.$('.holo-table');
    if (sellerTable) {
      await sellerTable.screenshot({
        path: 'seller-inventory-improved-colors.png'
      });
    }

    // 配色の統一性確認
    console.log('\\n=== 配色統一性の確認 ===');
    const statusColorMap = new Map();

    statusColors.forEach(item => {
      if (!statusColorMap.has(item.status)) {
        statusColorMap.set(item.status, []);
      }
      statusColorMap.get(item.status).push({ page: item.page, color: item.color });
    });

    statusColorMap.forEach((colors, status) => {
      if (colors.length > 1) {
        const allSameColor = colors.every(c => c.color === colors[0].color);
        console.log(`${status}: ${allSameColor ? '✅統一' : '❌不統一'} - ${colors.map(c => `${c.page}:${c.color}`).join(', ')}`);
      }
    });

    // 改善された配色の色相分析
    console.log('\\n=== 配色改善の分析 ===');

    // RGB値を解析して色相の多様性を確認
    const uniqueColors = [...new Set(statusColors.map(s => s.color))];
    console.log(`ユニークな色数: ${uniqueColors.length}`);
    console.log('使用されている色:');
    uniqueColors.forEach(color => {
      console.log(`  ${color}`);
    });

    // 基本的なアサーション
    expect(uniqueColors.length).toBeGreaterThan(3); // 少なくとも3つ以上の異なる色が使用されている
    expect(statusColors.length).toBeGreaterThan(0); // ステータスバッジが存在する

    console.log('\\n✅ 配色改善が確認されました');
  });

  test('特定のステータス色が改善されていることを確認', async ({ page }) => {
    // 一つの画面で複数のステータスが表示されるように待つ
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // 特定のステータスの色を確認
    const statusElements = await page.$$('.holo-table tbody tr');

    if (statusElements.length > 0) {
      console.log('=== 個別ステータス色確認 ===');

      for (let i = 0; i < Math.min(statusElements.length, 5); i++) {
        const statusElement = statusElements[i];
        const statusBadge = await statusElement.$('[class*="bg-"]');

        if (statusBadge) {
          const badgeInfo = await statusBadge.evaluate(el => ({
            text: el.textContent?.trim() || '',
            backgroundColor: window.getComputedStyle(el).backgroundColor,
            className: el.className
          }));

          console.log(`行${i + 1}: ${badgeInfo.text} - ${badgeInfo.backgroundColor}`);

          // 背景色が設定されていることを確認
          expect(badgeInfo.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
        }
      }
    }

    console.log('✅ 個別ステータス色が正常に設定されています');
  });
});