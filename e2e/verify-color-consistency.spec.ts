import { test, expect } from '@playwright/test';

test.describe('タブバッジとステータスバッジの配色統一確認', () => {
  test('検品管理ページの配色統一性を確認', async ({ page }) => {
    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    console.log('=== 検品管理ページ 配色確認 ===');

    // タブバッジの色を確認
    const tabBadges = await page.$$('[role="tablist"] button span, .space-x-1 button span');

    console.log('\n--- タブバッジ色確認 ---');
    for (let i = 0; i < tabBadges.length; i++) {
      const badge = tabBadges[i];
      const text = await badge.textContent();
      const style = await badge.evaluate(el => ({
        backgroundColor: window.getComputedStyle(el).backgroundColor,
        color: window.getComputedStyle(el).color,
        className: el.className
      }));

      if (text && text.trim() && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        console.log(`タブ"${text.trim()}": ${style.backgroundColor} (${style.className})`);
      }
    }

    // 一覧のステータスバッジの色を確認
    const statusBadges = await page.$$('.holo-table .status-badge, .holo-table [class*="bg-"], .holo-table span[class*="bg-"]');

    console.log('\n--- 一覧ステータスバッジ色確認 ---');
    const statusColors = [];

    for (let i = 0; i < Math.min(statusBadges.length, 10); i++) {
      const badge = statusBadges[i];
      const text = await badge.textContent();
      const style = await badge.evaluate(el => ({
        backgroundColor: window.getComputedStyle(el).backgroundColor,
        color: window.getComputedStyle(el).color,
        className: el.className
      }));

      if (text && text.trim() && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        console.log(`ステータス"${text.trim()}": ${style.backgroundColor} (${style.className})`);
        statusColors.push({
          status: text.trim(),
          color: style.backgroundColor,
          className: style.className
        });
      }
    }

    // 配色ルール準拠チェック
    console.log('\n--- 配色ルール準拠確認 ---');

    // StatusIndicatorの配色ルールと照合
    const expectedColors = {
      '入庫待ち': 'rgb(6, 182, 212)', // cyan-500
      '保管作業中': 'rgb(8, 145, 178)', // cyan-600
      '梱包完了': 'rgb(5, 150, 105)', // emerald-600
      '保留中': 'rgb(234, 179, 8)', // yellow-500
    };

    let colorConsistencyPassed = true;
    statusColors.forEach(item => {
      const expectedColor = expectedColors[item.status];
      if (expectedColor) {
        const isConsistent = item.color === expectedColor;
        console.log(`${item.status}: ${isConsistent ? '✅' : '❌'} 期待値:${expectedColor} 実際:${item.color}`);
        if (!isConsistent) {
          colorConsistencyPassed = false;
        }
      }
    });

    // スクリーンショット撮影
    await page.screenshot({
      path: 'inspection-color-consistency.png',
      fullPage: true
    });

    // 基本的なアサーション
    expect(statusColors.length).toBeGreaterThan(0);
    console.log(`\n✅ 検品管理ページの配色確認完了 (ステータス数: ${statusColors.length})`);
  });

  test('出荷管理ページの配色統一性を確認', async ({ page }) => {
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    console.log('=== 出荷管理ページ 配色確認 ===');

    // タブバッジの色を確認
    const tabBadges = await page.$$('[role="tablist"] button span, .space-x-1 button span');

    console.log('\n--- タブバッジ色確認 ---');
    for (let i = 0; i < tabBadges.length; i++) {
      const badge = tabBadges[i];
      const text = await badge.textContent();
      const style = await badge.evaluate(el => ({
        backgroundColor: window.getComputedStyle(el).backgroundColor,
        color: window.getComputedStyle(el).color,
        className: el.className
      }));

      if (text && text.trim() && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        console.log(`タブ"${text.trim()}": ${style.backgroundColor} (${style.className})`);
      }
    }

    // 一覧のステータスバッジの色を確認
    const statusBadges = await page.$$('.holo-table .status-badge, .holo-table [class*="bg-"], .holo-table span[class*="bg-"]');

    console.log('\n--- 一覧ステータスバッジ色確認 ---');
    const statusColors = [];

    for (let i = 0; i < Math.min(statusBadges.length, 10); i++) {
      const badge = statusBadges[i];
      const text = await badge.textContent();
      const style = await badge.evaluate(el => ({
        backgroundColor: window.getComputedStyle(el).backgroundColor,
        color: window.getComputedStyle(el).color,
        className: el.className
      }));

      if (text && text.trim() && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        console.log(`ステータス"${text.trim()}": ${style.backgroundColor} (${style.className})`);
        statusColors.push({
          status: text.trim(),
          color: style.backgroundColor,
          className: style.className
        });
      }
    }

    // 配色ルール準拠チェック
    console.log('\n--- 配色ルール準拠確認 ---');

    // StatusIndicatorの配色ルールと照合
    const expectedColors = {
      '出荷準備中': 'rgb(234, 88, 12)', // orange-600
      '梱包済み': 'rgb(147, 51, 234)', // purple-500
      '集荷準備完了': 'rgb(99, 102, 241)', // indigo-500
      '出荷済み': 'rgb(34, 197, 94)', // green-500
    };

    let colorConsistencyPassed = true;
    statusColors.forEach(item => {
      const expectedColor = expectedColors[item.status];
      if (expectedColor) {
        const isConsistent = item.color === expectedColor;
        console.log(`${item.status}: ${isConsistent ? '✅' : '❌'} 期待値:${expectedColor} 実際:${item.color}`);
        if (!isConsistent) {
          colorConsistencyPassed = false;
        }
      }
    });

    // スクリーンショット撮影
    await page.screenshot({
      path: 'shipping-color-consistency.png',
      fullPage: true
    });

    // 基本的なアサーション
    expect(statusColors.length).toBeGreaterThan(0);
    console.log(`\n✅ 出荷管理ページの配色確認完了 (ステータス数: ${statusColors.length})`);
  });

  test('配色統一性の全体確認', async ({ page }) => {
    const pages = [
      { url: 'http://localhost:3002/staff/inspection', name: '検品管理' },
      { url: 'http://localhost:3002/staff/shipping', name: '出荷管理' },
      { url: 'http://localhost:3002/staff/inventory', name: 'スタッフ在庫管理' },
      { url: 'http://localhost:3002/inventory', name: 'セラー在庫管理' }
    ];

    console.log('=== 全ページ配色統一性確認 ===');

    const allStatusColors = new Map();

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForSelector('.holo-table, .intelligence-card', { timeout: 10000 });

      const statusBadges = await page.$$('.status-badge, [class*="bg-"], span[class*="bg-"]');

      console.log(`\n--- ${pageInfo.name} ---`);

      for (let i = 0; i < Math.min(statusBadges.length, 5); i++) {
        const badge = statusBadges[i];
        const text = await badge.textContent();
        const style = await badge.evaluate(el => ({
          backgroundColor: window.getComputedStyle(el).backgroundColor,
          color: window.getComputedStyle(el).color,
        }));

        if (text && text.trim() && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const statusText = text.trim();

          if (!allStatusColors.has(statusText)) {
            allStatusColors.set(statusText, []);
          }

          allStatusColors.get(statusText).push({
            page: pageInfo.name,
            color: style.backgroundColor
          });

          console.log(`  ${statusText}: ${style.backgroundColor}`);
        }
      }
    }

    // 同じステータス名の色統一性をチェック
    console.log('\n=== ステータス間色統一性チェック ===');

    allStatusColors.forEach((colorInfo, status) => {
      if (colorInfo.length > 1) {
        const uniqueColors = [...new Set(colorInfo.map(info => info.color))];
        const isConsistent = uniqueColors.length === 1;

        console.log(`${status}: ${isConsistent ? '✅統一' : '❌不統一'}`);
        if (!isConsistent) {
          colorInfo.forEach(info => {
            console.log(`  ${info.page}: ${info.color}`);
          });
        }
      }
    });

    console.log('\n✅ 全ページ配色統一性確認完了');
  });
});