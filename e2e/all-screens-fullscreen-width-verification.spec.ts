import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

test.describe('全画面横幅統一検証', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // 全画面モードに設定
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // ログイン
    await page.goto('http://localhost:3001/login');
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  const screens = [
    { name: 'dashboard', url: '/dashboard', role: 'seller' },
    { name: 'inventory', url: '/inventory', role: 'seller' },
    { name: 'sales', url: '/sales', role: 'seller' },
    { name: 'returns', url: '/returns', role: 'seller' },
    { name: 'delivery', url: '/delivery', role: 'seller' },
    { name: 'delivery-plan', url: '/delivery-plan', role: 'seller' },
    { name: 'billing', url: '/billing', role: 'seller' },
    { name: 'profile', url: '/profile', role: 'seller' },
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
  ];

  test('全画面スクリーンショット取得と横幅測定', async () => {
    const screenshotDir = 'test-results/fullscreen-width-verification';
    await fs.mkdir(screenshotDir, { recursive: true });
    
    const widthMeasurements: { screen: string; width: number; contentWidth: number }[] = [];

    for (const screen of screens) {
      console.log(`\n=== ${screen.name} 画面の検証開始 ===`);
      
      // スタッフ画面の場合はスタッフでログイン
      if (screen.role === 'staff') {
        await page.goto('http://localhost:3001/login');
        await page.fill('input[type="email"]', 'staff@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/staff/dashboard');
      }

      // 画面に移動
      await page.goto(`http://localhost:3001${screen.url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // レンダリング完了を待つ

      // 全画面スクリーンショット取得
      const screenshotPath = path.join(screenshotDir, `${screen.name}-fullscreen.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true,
        type: 'png'
      });

      // ビューポート幅を測定
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      // メインコンテンツエリアの幅を測定
      const contentWidth = await page.evaluate(() => {
        // DashboardLayoutまたはメインコンテンツエリアの幅を取得
        const mainContent = document.querySelector('main') || 
                           document.querySelector('[class*="dashboard"]') ||
                           document.querySelector('[class*="container"]') ||
                           document.body;
        return mainContent ? mainContent.getBoundingClientRect().width : 0;
      });

      // 実際のコンテンツ幅（パディングを除いた幅）を測定
      const actualContentWidth = await page.evaluate(() => {
        const intelligenceCard = document.querySelector('[class*="intelligence-card"]') ||
                                document.querySelector('[class*="card"]') ||
                                document.querySelector('main > div') ||
                                document.querySelector('main');
        if (intelligenceCard) {
          const rect = intelligenceCard.getBoundingClientRect();
          const styles = window.getComputedStyle(intelligenceCard);
          const paddingLeft = parseFloat(styles.paddingLeft);
          const paddingRight = parseFloat(styles.paddingRight);
          return rect.width - paddingLeft - paddingRight;
        }
        return 0;
      });

      widthMeasurements.push({
        screen: screen.name,
        width: viewportWidth,
        contentWidth: actualContentWidth || contentWidth
      });

      console.log(`${screen.name}: ビューポート幅=${viewportWidth}px, コンテンツ幅=${actualContentWidth || contentWidth}px`);
    }

    // 横幅の統一性を検証
    console.log('\n=== 横幅統一性検証結果 ===');
    const contentWidths = widthMeasurements.map(m => m.contentWidth);
    const uniqueWidths = Array.from(new Set(contentWidths));
    
    console.log('測定結果一覧:');
    widthMeasurements.forEach(m => {
      console.log(`  ${m.screen}: ${m.contentWidth}px`);
    });
    
    console.log(`\n異なる幅の種類: ${uniqueWidths.length}種類`);
    console.log(`幅のバリエーション: ${uniqueWidths.join('px, ')}px`);

    // 結果をファイルに保存
    const resultPath = path.join(screenshotDir, 'width-analysis-result.json');
    await fs.writeFile(resultPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      measurements: widthMeasurements,
      uniqueWidths: uniqueWidths,
      isUnified: uniqueWidths.length === 1,
      summary: {
        totalScreens: widthMeasurements.length,
        uniqueWidthCount: uniqueWidths.length,
        widthVariations: uniqueWidths
      }
    }, null, 2));

    // 統一性の検証
    if (uniqueWidths.length === 1) {
      console.log('✅ 全画面の横幅が統一されています');
    } else {
      console.log('❌ 画面間で横幅に違いがあります');
      
      // 幅の違いを詳細分析
      const maxWidth = Math.max(...contentWidths);
      const minWidth = Math.min(...contentWidths);
      const widthDifference = maxWidth - minWidth;
      
      console.log(`最大幅: ${maxWidth}px`);
      console.log(`最小幅: ${minWidth}px`);
      console.log(`幅の差: ${widthDifference}px`);
      
      // 幅が異なる画面を特定
      const standardWidth = contentWidths[0]; // dashboard画面を基準とする
      const differentScreens = widthMeasurements.filter(m => m.contentWidth !== standardWidth);
      
      if (differentScreens.length > 0) {
        console.log('\n基準幅と異なる画面:');
        differentScreens.forEach(screen => {
          const difference = screen.contentWidth - standardWidth;
          console.log(`  ${screen.screen}: ${screen.contentWidth}px (差分: ${difference > 0 ? '+' : ''}${difference}px)`);
        });
      }
    }

    // 統一性の期待値検証
    expect(uniqueWidths.length).toBe(1);
  });

  test('画像重ね合わせによる視覚的検証', async () => {
    const screenshotDir = 'test-results/fullscreen-width-verification';
    
    // 全画面のスクリーンショットを重ね合わせて比較用の画像を生成
    const overlayScript = `
      const sharp = require('sharp');
      const fs = require('fs');
      const path = require('path');
      
      async function createOverlay() {
        const screenshotDir = '${screenshotDir}';
        const files = fs.readdirSync(screenshotDir).filter(f => f.endsWith('-fullscreen.png'));
        
        if (files.length === 0) return;
        
        // 基準画像（dashboard）を読み込み
        const baseImagePath = path.join(screenshotDir, 'dashboard-fullscreen.png');
        const baseImage = sharp(baseImagePath);
        const { width, height } = await baseImage.metadata();
        
        // 全画像を重ね合わせた合成画像を作成
        const overlayImage = sharp({
          create: {
            width: width,
            height: height,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          }
        });
        
        const composite = [];
        for (let i = 0; i < files.length; i++) {
          const filePath = path.join(screenshotDir, files[i]);
          composite.push({
            input: filePath,
            blend: 'multiply',
            opacity: 0.1
          });
        }
        
        await overlayImage
          .composite(composite)
          .png()
          .toFile(path.join(screenshotDir, 'width-overlay-comparison.png'));
        
        console.log('重ね合わせ画像を生成しました: width-overlay-comparison.png');
      }
      
      createOverlay().catch(console.error);
    `;

    // Node.jsスクリプトとして実行
    const scriptPath = path.join('test-results', 'create-overlay.js');
    await fs.writeFile(scriptPath, overlayScript);
    
    console.log('画像重ね合わせスクリプトを作成しました');
    console.log('手動実行: node test-results/create-overlay.js');
  });
}); 