import { test, expect } from '@playwright/test';

test.describe('左右パディング精密一致テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('🎯 他の画面と在庫管理画面の左右パディング精密測定', async ({ page }) => {
    console.log('🔍 他の画面と在庫管理画面の左右パディングを精密測定します...');
    
    const screens = [
      { name: 'ダッシュボード', url: 'http://localhost:3002/dashboard' },
      { name: '返品管理', url: 'http://localhost:3002/staff/returns' },
      { name: '出荷管理', url: 'http://localhost:3002/staff/shipping' },
      { name: '在庫管理', url: 'http://localhost:3002/staff/inventory' }
    ];

    const measurements = [];
    
    for (const screen of screens) {
      console.log(`\n--- ${screen.name}画面を測定中 ---`);
      
      await page.goto(screen.url);
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // 各画面の主要コンテンツ要素を特定
      let contentSelector = '';
      if (screen.name === 'ダッシュボード') {
        contentSelector = '.space-y-6';
      } else if (screen.name === '在庫管理') {
        contentSelector = '.space-y-6.max-w-6xl.mx-auto';
      } else {
        contentSelector = '.space-y-6';
      }
      
      const contentElement = await page.locator(contentSelector).first();
      const viewport = page.viewportSize();
      
      if (await contentElement.isVisible() && viewport) {
        const bounds = await contentElement.boundingBox();
        if (bounds) {
          const leftPadding = bounds.x;
          const rightPadding = viewport.width - (bounds.x + bounds.width);
          const contentWidth = bounds.width;
          const occupancyRate = (contentWidth / viewport.width) * 100;
          
          const measurement = {
            screen: screen.name,
            leftPadding: Math.round(leftPadding * 10) / 10,
            rightPadding: Math.round(rightPadding * 10) / 10,
            contentWidth: Math.round(contentWidth),
            occupancyRate: Math.round(occupancyRate * 10) / 10,
            viewportWidth: viewport.width
          };
          
          measurements.push(measurement);
          
          console.log(`📏 ${screen.name}:`);
          console.log(`   左パディング: ${measurement.leftPadding}px`);
          console.log(`   右パディング: ${measurement.rightPadding}px`);
          console.log(`   コンテンツ幅: ${measurement.contentWidth}px`);
          console.log(`   占有率: ${measurement.occupancyRate}%`);
        }
      }
      
      // スクリーンショット保存
      await page.screenshot({ 
        path: `${screen.name.toLowerCase()}-padding-measure.png`,
        fullPage: false 
      });
    }
    
    // 測定結果の比較分析
    console.log('\n🎯 左右パディング比較分析:');
    console.log('=====================================');
    
    const dashboardMeasure = measurements.find(m => m.screen === 'ダッシュボード');
    const returnsMeasure = measurements.find(m => m.screen === '返品管理');
    const shippingMeasure = measurements.find(m => m.screen === '出荷管理');
    const inventoryMeasure = measurements.find(m => m.screen === '在庫管理');
    
    if (dashboardMeasure && returnsMeasure && shippingMeasure && inventoryMeasure) {
      // 他の画面の平均値を計算（在庫管理以外）
      const otherScreens = [dashboardMeasure, returnsMeasure, shippingMeasure];
      const avgLeftPadding = otherScreens.reduce((sum, m) => sum + m.leftPadding, 0) / otherScreens.length;
      const avgRightPadding = otherScreens.reduce((sum, m) => sum + m.rightPadding, 0) / otherScreens.length;
      const avgOccupancyRate = otherScreens.reduce((sum, m) => sum + m.occupancyRate, 0) / otherScreens.length;
      
      console.log(`📊 他の画面平均:`);
      console.log(`   左パディング平均: ${Math.round(avgLeftPadding * 10) / 10}px`);
      console.log(`   右パディング平均: ${Math.round(avgRightPadding * 10) / 10}px`);
      console.log(`   占有率平均: ${Math.round(avgOccupancyRate * 10) / 10}%`);
      
      console.log(`\n📋 在庫管理画面:`);
      console.log(`   左パディング: ${inventoryMeasure.leftPadding}px`);
      console.log(`   右パディング: ${inventoryMeasure.rightPadding}px`);
      console.log(`   占有率: ${inventoryMeasure.occupancyRate}%`);
      
      // 差異の計算
      const leftDiff = Math.abs(inventoryMeasure.leftPadding - avgLeftPadding);
      const rightDiff = Math.abs(inventoryMeasure.rightPadding - avgRightPadding);
      const occupancyDiff = Math.abs(inventoryMeasure.occupancyRate - avgOccupancyRate);
      
      console.log(`\n🔍 差異分析:`);
      console.log(`   左パディング差異: ${Math.round(leftDiff * 10) / 10}px`);
      console.log(`   右パディング差異: ${Math.round(rightDiff * 10) / 10}px`);
      console.log(`   占有率差異: ${Math.round(occupancyDiff * 10) / 10}%`);
      
      // 許容範囲の判定（5px以内なら合格）
      const isMatching = leftDiff <= 5 && rightDiff <= 5 && occupancyDiff <= 2;
      
      if (isMatching) {
        console.log('✅ 左右パディングが他の画面と十分に一致しています');
      } else {
        console.log('⚠️ 左右パディングに調整が必要です');
        if (inventoryMeasure.occupancyRate > avgOccupancyRate) {
          console.log('🔧 → max-w-6xlをmax-w-5xlに変更して狭くする必要があります');
        } else if (inventoryMeasure.occupancyRate < avgOccupancyRate) {
          console.log('🔧 → max-w-7xlに変更して広くする必要があります');
        }
      }
      
      // 詳細な測定結果をJSON出力
      console.log('\n📄 詳細測定結果:');
      console.log(JSON.stringify(measurements, null, 2));
    }
    
    await page.screenshot({ 
      path: 'padding-comparison-analysis.png',
      fullPage: true 
    });
    
    console.log('📸 パディング比較分析の証拠を保存しました');
  });
}); 