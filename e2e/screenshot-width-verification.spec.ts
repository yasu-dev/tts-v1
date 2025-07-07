import { test, expect } from '@playwright/test';

test.describe('画面横幅の視覚的確認', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('http://localhost:3001/login');
    await page.fill('#email', 'seller@example.com');
    await page.fill('#password', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('http://localhost:3001/dashboard');
  });

  const screens = [
    { name: 'ダッシュボード', url: '/dashboard' },
    { name: 'プロフィール設定', url: '/profile' },
    { name: '在庫管理', url: '/inventory' },
    { name: '売上管理', url: '/sales' },
    { name: '配送管理', url: '/delivery' },
    { name: '返品管理', url: '/returns' },
    { name: '商品履歴', url: '/timeline' },
    { name: 'レポート', url: '/reports' },
    { name: 'スタッフダッシュボード', url: '/staff/dashboard' },
    { name: 'スタッフ在庫管理', url: '/staff/inventory' },
    { name: 'スタッフタスク管理', url: '/staff/tasks' },
    { name: 'スタッフ検品', url: '/staff/inspection' },
    { name: 'スタッフ出品', url: '/staff/listing' },
    { name: 'スタッフ返品処理', url: '/staff/returns' },
    { name: 'スタッフ業務レポート', url: '/staff/reports' },
    { name: 'スタッフピッキング', url: '/staff/picking' },
    { name: 'スタッフ配送', url: '/staff/shipping' },
    { name: 'スタッフ保管場所', url: '/staff/location' }
  ];

  test('全画面のスクリーンショット撮影（修正前）', async ({ page }) => {
    for (const screen of screens) {
      console.log(`📸 撮影中: ${screen.name} (${screen.url})`);
      
      await page.goto(`http://localhost:3001${screen.url}`);
      await page.waitForLoadState('networkidle');
      
      // intelligence-cardクラスの要素が読み込まれるまで待機
      try {
        await page.waitForSelector('.intelligence-card', { timeout: 5000 });
      } catch (e) {
        console.log(`⚠️ intelligence-cardが見つからない画面: ${screen.name}`);
      }
      
      // フルページスクリーンショット
      await page.screenshot({
        path: `test-results/screenshots/before-${screen.name.replace(/[\/\s]/g, '-')}.png`,
        fullPage: true
      });
      
      // ビューポートサイズでのスクリーンショット
      await page.screenshot({
        path: `test-results/screenshots/viewport-before-${screen.name.replace(/[\/\s]/g, '-')}.png`,
        fullPage: false
      });
      
      console.log(`✅ 撮影完了: ${screen.name}`);
    }
  });

  test('全画面のスクリーンショット撮影（修正後）', async ({ page }) => {
    for (const screen of screens) {
      console.log(`📸 修正後撮影中: ${screen.name} (${screen.url})`);
      
      await page.goto(`http://localhost:3001${screen.url}`);
      await page.waitForLoadState('networkidle');
      
      // intelligence-cardクラスの要素が読み込まれるまで待機
      try {
        await page.waitForSelector('.intelligence-card', { timeout: 5000 });
      } catch (e) {
        console.log(`⚠️ intelligence-cardが見つからない画面: ${screen.name}`);
      }
      
      // フルページスクリーンショット（修正後）
      await page.screenshot({
        path: `test-results/screenshots/after-${screen.name.replace(/[\/\s]/g, '-')}.png`,
        fullPage: true
      });
      
      // ビューポートサイズでのスクリーンショット（修正後）
      await page.screenshot({
        path: `test-results/screenshots/viewport-after-${screen.name.replace(/[\/\s]/g, '-')}.png`,
        fullPage: false
      });
      
      console.log(`✅ 修正後撮影完了: ${screen.name}`);
    }
  });

  test('カード要素の横幅測定', async ({ page }) => {
    const measurements = [];
    
    for (const screen of screens) {
      console.log(`📏 測定中: ${screen.name} (${screen.url})`);
      
      await page.goto(`http://localhost:3001${screen.url}`);
      await page.waitForLoadState('networkidle');
      
      try {
        await page.waitForSelector('.intelligence-card', { timeout: 5000 });
        
        const cards = await page.locator('.intelligence-card').all();
        const screenMeasurements = [];
        
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const boundingBox = await card.boundingBox();
          if (boundingBox) {
            screenMeasurements.push({
              cardIndex: i,
              width: boundingBox.width,
              height: boundingBox.height,
              x: boundingBox.x,
              y: boundingBox.y
            });
          }
        }
        
        measurements.push({
          screen: screen.name,
          url: screen.url,
          cardCount: cards.length,
          cards: screenMeasurements
        });
        
        console.log(`📊 ${screen.name}: ${cards.length}個のカード測定完了`);
        
      } catch (e) {
        console.log(`⚠️ ${screen.name}: intelligence-cardが見つからない`);
        measurements.push({
          screen: screen.name,
          url: screen.url,
          cardCount: 0,
          cards: [],
          error: 'intelligence-card not found'
        });
      }
    }
    
    // 測定結果をファイルに保存
    const fs = require('fs');
    fs.writeFileSync('test-results/width-measurements-after.json', JSON.stringify(measurements, null, 2));
    
    console.log('📋 修正後測定結果を保存しました: test-results/width-measurements-after.json');
  });

  test('修正前後の比較レポート生成', async ({ page }) => {
    const fs = require('fs');
    
    // 修正前後の測定データを読み込み
    let beforeData = [];
    let afterData = [];
    
    try {
      beforeData = JSON.parse(fs.readFileSync('test-results/width-measurements-before.json', 'utf8'));
    } catch (e) {
      console.log('修正前データが見つかりません');
    }
    
    try {
      afterData = JSON.parse(fs.readFileSync('test-results/width-measurements-after.json', 'utf8'));
    } catch (e) {
      console.log('修正後データが見つかりません');
    }
    
    const comparisonReport = {
      timestamp: new Date().toISOString(),
      summary: {
        screensCompared: Math.min(beforeData.length, afterData.length),
        improvementsFound: 0,
        consistencyIssues: 0
      },
             details: [] as any[]
    };
    
    // 画面ごとの比較
    for (let i = 0; i < Math.min(beforeData.length, afterData.length); i++) {
      const before = beforeData[i];
      const after = afterData[i];
      
      if (before.screen === after.screen) {
        const beforeWidths = before.cards.map((c: any) => c.width);
        const afterWidths = after.cards.map((c: any) => c.width);
        
        const beforeAvg = beforeWidths.length > 0 ? beforeWidths.reduce((a: number, b: number) => a + b, 0) / beforeWidths.length : 0;
        const afterAvg = afterWidths.length > 0 ? afterWidths.reduce((a: number, b: number) => a + b, 0) / afterWidths.length : 0;
        
        const improvement = afterAvg - beforeAvg;
        
        const detail = {
          screen: before.screen,
          before: {
            cardCount: before.cardCount,
            averageWidth: Math.round(beforeAvg),
            widths: beforeWidths
          },
          after: {
            cardCount: after.cardCount,
            averageWidth: Math.round(afterAvg),
            widths: afterWidths
          },
          improvement: Math.round(improvement),
          status: improvement > 5 ? 'improved' : improvement < -5 ? 'degraded' : 'unchanged'
        };
        
        comparisonReport.details.push(detail);
        
        if (improvement > 5) {
          comparisonReport.summary.improvementsFound++;
        }
      }
    }
    
    // レポートを保存
    fs.writeFileSync('test-results/width-comparison-report.json', JSON.stringify(comparisonReport, null, 2));
    
    console.log('📊 修正前後比較レポートを生成しました: test-results/width-comparison-report.json');
    console.log(`📈 改善された画面数: ${comparisonReport.summary.improvementsFound}`);
    console.log(`📋 比較対象画面数: ${comparisonReport.summary.screensCompared}`);
  });
});