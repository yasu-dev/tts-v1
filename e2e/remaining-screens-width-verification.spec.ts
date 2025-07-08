import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

test.describe('残り画面横幅統一検証', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  const remainingScreens = [
    { name: 'settings', url: '/settings', role: 'seller' },
    { name: 'timeline', url: '/timeline', role: 'seller' },
    { name: 'reports', url: '/reports', role: 'seller' },
    { name: 'reports-monthly', url: '/reports/monthly', role: 'seller' },
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

  test('残り画面の横幅測定', async () => {
    const screenshotDir = 'test-results/fullscreen-width-verification';
    await fs.mkdir(screenshotDir, { recursive: true });
    
    const widthMeasurements: { screen: string; width: number; contentWidth: number }[] = [];

    for (const screen of remainingScreens) {
      console.log(`\n=== ${screen.name} 画面の検証開始 ===`);
      
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
      await page.waitForTimeout(1000);

      // 全画面スクリーンショット取得
      const screenshotPath = path.join(screenshotDir, `${screen.name}-fullscreen.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true,
        type: 'png'
      });

      // ビューポート幅を測定
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      // 実際のコンテンツ幅を測定
      const actualContentWidth = await page.evaluate(() => {
        const intelligenceCard = document.querySelector('[class*="intelligence-card"]') ||
                                document.querySelector('[class*="card"]') ||
                                document.querySelector('main > div') ||
                                document.querySelector('main');
        if (intelligenceCard) {
          const rect = intelligenceCard.getBoundingClientRect();
          return rect.width;
        }
        return window.innerWidth;
      });

      widthMeasurements.push({
        screen: screen.name,
        width: viewportWidth,
        contentWidth: actualContentWidth
      });

      console.log(`${screen.name}: ビューポート幅=${viewportWidth}px, コンテンツ幅=${actualContentWidth}px`);
    }

    // 結果を既存のレポートに追加
    const existingReportPath = path.join(screenshotDir, 'width-unification-report.json');
    let existingReport = { widthMeasurements: [], screens: [] };
    
    if (await fs.access(existingReportPath).then(() => true).catch(() => false)) {
      const existingData = await fs.readFile(existingReportPath, 'utf8');
      existingReport = JSON.parse(existingData);
    }

    const allMeasurements = [...(existingReport.widthMeasurements || []), ...widthMeasurements];
    const allScreens = [...(existingReport.screens || []), ...widthMeasurements.map(m => m.screen)];
    const contentWidths = allMeasurements.map(m => m.contentWidth);
    const uniqueWidths = Array.from(new Set(contentWidths));

    console.log('\n=== 全画面横幅統一検証結果 ===');
    console.log(`総画面数: ${allMeasurements.length}画面`);
    console.log(`異なる幅の種類: ${uniqueWidths.length}種類`);
    console.log(`幅のバリエーション: ${uniqueWidths.join('px, ')}px`);

    if (uniqueWidths.length === 1) {
      console.log('✅ 全画面の横幅が統一されています');
    } else {
      console.log('❌ 画面間で横幅に違いがあります');
    }

    // 更新されたレポートを保存
    const updatedReport = {
      timestamp: new Date().toISOString(),
      analysis: '全画面横幅統一検証（完全版）',
      totalScreens: allMeasurements.length,
      screens: allScreens,
      widthMeasurements: allMeasurements,
      uniqueWidths: uniqueWidths,
      isUnified: uniqueWidths.length === 1,
      conclusion: uniqueWidths.length === 1 ? 
        '✅ 全画面の横幅が完全に統一されています' : 
        '❌ 画面間で横幅に違いがあります'
    };

    await fs.writeFile(existingReportPath, JSON.stringify(updatedReport, null, 2));
    
    console.log('\n📊 完全な分析レポートが更新されました');
  });
}); 