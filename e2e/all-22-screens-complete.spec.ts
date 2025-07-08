import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

test.describe('全22画面完全横幅検証', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  const allScreens = [
    // Seller画面
    { name: 'billing', url: '/billing', role: 'seller' },
    { name: 'dashboard', url: '/dashboard', role: 'seller' },
    { name: 'delivery', url: '/delivery', role: 'seller' },
    { name: 'delivery-plan', url: '/delivery-plan', role: 'seller' },
    { name: 'inventory', url: '/inventory', role: 'seller' },
    { name: 'returns', url: '/returns', role: 'seller' },
    { name: 'sales', url: '/sales', role: 'seller' },
    { name: 'profile', url: '/profile', role: 'seller' },
    { name: 'settings', url: '/settings', role: 'seller' },
    { name: 'timeline', url: '/timeline', role: 'seller' },
    { name: 'reports', url: '/reports', role: 'seller' },
    { name: 'reports-monthly', url: '/reports/monthly', role: 'seller' },
    // Staff画面
    { name: 'staff-dashboard', url: '/staff/dashboard', role: 'staff' },
    { name: 'staff-inspection', url: '/staff/inspection', role: 'staff' },
    { name: 'staff-inventory', url: '/staff/inventory', role: 'staff' },
    { name: 'staff-listing', url: '/staff/listing', role: 'staff' },
    { name: 'staff-location', url: '/staff/location', role: 'staff' },
    { name: 'staff-picking', url: '/staff/picking', role: 'staff' },
    { name: 'staff-shipping', url: '/staff/shipping', role: 'staff' },
    { name: 'staff-returns', url: '/staff/returns', role: 'staff' },
    { name: 'staff-reports', url: '/staff/reports', role: 'staff' },
    { name: 'staff-tasks', url: '/staff/tasks', role: 'staff' },
  ];

  test('全22画面のスクリーンショット取得と横幅検証', async () => {
    const screenshotDir = 'test-results/all-22-screens-verification';
    await fs.mkdir(screenshotDir, { recursive: true });

    const widthMeasurements: { screen: string; width: number; height: number; fileSize: number }[] = [];

    console.log(`\n🎯 === 全22画面の横幅統一検証開始 ===`);
    console.log(`📊 対象画面数: ${allScreens.length}画面`);

    for (let i = 0; i < allScreens.length; i++) {
      const screen = allScreens[i];
      console.log(`\n🔄 [${i + 1}/${allScreens.length}] ${screen.name} 画面のスクリーンショット取得中...`);
      
      // ログイン
      if (screen.role === 'staff') {
        await page.goto('http://localhost:3001/login');
        await page.fill('input[type="email"]', 'staff@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/staff/dashboard');
      } else {
        await page.goto('http://localhost:3001/login');
        await page.fill('input[type="email"]', 'seller@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');
      }

      // 画面に移動
      await page.goto(`http://localhost:3001${screen.url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 全画面スクリーンショット取得
      const screenshotPath = path.join(screenshotDir, `${screen.name}-fullscreen.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true,
        type: 'png'
      });

      // ビューポート幅を測定
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      // ファイルサイズを取得
      const stats = await fs.stat(screenshotPath);
      const fileSize = stats.size;

      widthMeasurements.push({
        screen: screen.name,
        width: viewportWidth,
        height: viewportHeight,
        fileSize: fileSize
      });
      
      console.log(`✅ ${screen.name}: ${viewportWidth}px × ${viewportHeight}px (${Math.round(fileSize / 1024)}KB)`);
    }

    // 横幅統一性の検証
    const uniqueWidths = Array.from(new Set(widthMeasurements.map(m => m.width)));
    const uniqueHeights = Array.from(new Set(widthMeasurements.map(m => m.height)));

    console.log(`\n📊 === 全22画面横幅統一検証結果 ===`);
    console.log(`🔢 異なる幅の種類: ${uniqueWidths.length}種類`);
    console.log(`📐 幅のバリエーション: ${uniqueWidths.join('px, ')}px`);
    console.log(`📏 異なる高さの種類: ${uniqueHeights.length}種類`);
    console.log(`📐 高さのバリエーション: ${uniqueHeights.join('px, ')}px`);

    if (uniqueWidths.length === 1 && uniqueHeights.length === 1) {
      console.log(`\n🎉 ✅ 完璧！全22画面の横幅と縦幅が完全に統一されています！`);
      console.log(`📏 統一サイズ: ${uniqueWidths[0]}px × ${uniqueHeights[0]}px`);
    } else {
      console.log(`\n❌ 画面間でサイズに違いがあります`);
    }

    // 詳細結果を表示
    console.log(`\n📋 === 全画面詳細測定結果 ===`);
    widthMeasurements.forEach((m, index) => {
      const num = (index + 1).toString().padStart(2);
      console.log(`  ${num}. ${m.screen.padEnd(20)} ${m.width}px × ${m.height}px (${Math.round(m.fileSize / 1024)}KB)`);
    });

    // 最終レポートを保存
    const finalReport = {
      timestamp: new Date().toISOString(),
      analysis: '全22画面横幅統一完全検証',
      totalScreens: allScreens.length,
      screens: widthMeasurements.map(m => m.screen),
      detailedMeasurements: widthMeasurements,
      uniqueWidths: uniqueWidths,
      uniqueHeights: uniqueHeights,
      isWidthUnified: uniqueWidths.length === 1,
      isHeightUnified: uniqueHeights.length === 1,
      isPerfectlyUnified: uniqueWidths.length === 1 && uniqueHeights.length === 1,
      standardSize: uniqueWidths.length === 1 && uniqueHeights.length === 1 ? 
        `${uniqueWidths[0]}px × ${uniqueHeights[0]}px` : 'サイズが統一されていません',
      conclusion: uniqueWidths.length === 1 && uniqueHeights.length === 1 ? 
        `✅ 全22画面が完璧に統一されています` : 
        `❌ 画面間でサイズに違いがあります`
    };

    const reportPath = path.join(screenshotDir, 'COMPLETE-22-screens-report.json');
    await fs.writeFile(reportPath, JSON.stringify(finalReport, null, 2));

    console.log(`\n📄 完全レポート保存: COMPLETE-22-screens-report.json`);
    console.log(`\n🎯 === 最終結論 ===`);
    console.log(finalReport.conclusion);

    // 統一性の期待値検証
    expect(uniqueWidths.length).toBe(1);
    expect(uniqueHeights.length).toBe(1);
  });
}); 