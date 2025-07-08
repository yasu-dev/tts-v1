import { test, expect, Page } from '@playwright/test';

test.describe('コンテンツボックス横幅測定', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  const screens = [
    { name: 'dashboard', url: '/dashboard', role: 'seller' },
    { name: 'inventory', url: '/inventory', role: 'seller' },
    { name: 'sales', url: '/sales', role: 'seller' },
    { name: 'returns', url: '/returns', role: 'seller' },
    { name: 'staff-dashboard', url: '/staff/dashboard', role: 'staff' },
    { name: 'staff-returns', url: '/staff/returns', role: 'staff' },
  ];

  test('各画面のコンテンツボックス幅を測定', async () => {
    console.log('\n🔍 === ボディ内部コンテンツ箱の実際の幅測定 ===\n');

    const measurements: any[] = [];

    for (const screen of screens) {
      console.log(`📱 ${screen.name} 画面の測定中...`);
      
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

      // コンテンツ箱の実際の幅を測定
      const measurement = await page.evaluate(() => {
        // intelligence-cardまたはメインコンテンツエリアを特定
        const intelligenceCards = document.querySelectorAll('[class*="intelligence-card"]');
        const mainContent = document.querySelector('main');
        
        const results: any[] = [];
        
        // intelligence-cardの測定
        intelligenceCards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const styles = window.getComputedStyle(card);
          const innerDiv = card.querySelector('div');
          
          let innerMeasurement = null;
          if (innerDiv) {
            const innerRect = innerDiv.getBoundingClientRect();
            const innerStyles = window.getComputedStyle(innerDiv);
            innerMeasurement = {
              width: innerRect.width,
              paddingLeft: parseFloat(innerStyles.paddingLeft),
              paddingRight: parseFloat(innerStyles.paddingRight),
              className: innerDiv.className
            };
          }
          
          results.push({
            type: 'intelligence-card',
            index: index,
            width: rect.width,
            paddingLeft: parseFloat(styles.paddingLeft),
            paddingRight: parseFloat(styles.paddingRight),
            className: card.className,
            inner: innerMeasurement
          });
        });
        
        // mainコンテンツの測定
        if (mainContent) {
          const rect = mainContent.getBoundingClientRect();
          const styles = window.getComputedStyle(mainContent);
          results.push({
            type: 'main',
            width: rect.width,
            paddingLeft: parseFloat(styles.paddingLeft),
            paddingRight: parseFloat(styles.paddingRight),
            className: mainContent.className
          });
        }
        
        return results;
      });

      measurements.push({
        screen: screen.name,
        measurements: measurement
      });

      console.log(`  ${screen.name}の測定結果:`);
      measurement.forEach((m: any, index: number) => {
        if (m.type === 'intelligence-card') {
          console.log(`    intelligence-card[${m.index}]: 幅=${m.width}px (${m.className})`);
          if (m.inner) {
            console.log(`      内部div: 幅=${m.inner.width}px, パディング=${m.inner.paddingLeft}px/${m.inner.paddingRight}px (${m.inner.className})`);
            const actualContentWidth = m.inner.width - m.inner.paddingLeft - m.inner.paddingRight;
            console.log(`      実際のコンテンツ幅: ${actualContentWidth}px`);
          }
        } else {
          console.log(`    ${m.type}: 幅=${m.width}px (${m.className})`);
        }
      });
      console.log('');
    }

    // 最初のintelligence-cardの内部コンテンツ幅を比較
    console.log('\n📊 === 各画面の実際のコンテンツ幅比較 ===');
    const contentWidths: { [key: string]: number } = {};
    
    measurements.forEach(m => {
      const firstCard = m.measurements.find((measure: any) => measure.type === 'intelligence-card');
      if (firstCard && firstCard.inner) {
        const actualWidth = firstCard.inner.width - firstCard.inner.paddingLeft - firstCard.inner.paddingRight;
        contentWidths[m.screen] = actualWidth;
        console.log(`${m.screen}: ${actualWidth}px`);
      }
    });

    const uniqueWidths = Object.values(contentWidths);
    const uniqueWidthValues = Array.from(new Set(uniqueWidths));
    
    console.log(`\n異なる幅の種類: ${uniqueWidthValues.length}種類`);
    console.log(`幅のバリエーション: ${uniqueWidthValues.join('px, ')}px`);
    
    if (uniqueWidthValues.length === 1) {
      console.log('✅ 全画面のコンテンツ幅が統一されています');
    } else {
      console.log('❌ 画面間でコンテンツ幅に違いがあります');
      
      // 基準幅（dashboard）との差分を表示
      const dashboardWidth = contentWidths['dashboard'];
      if (dashboardWidth) {
        console.log('\n基準幅（dashboard）との差分:');
        Object.entries(contentWidths).forEach(([screen, width]) => {
          if (screen !== 'dashboard') {
            const diff = width - dashboardWidth;
            console.log(`  ${screen}: ${diff > 0 ? '+' : ''}${diff}px`);
          }
        });
      }
    }

    // テストアサーション
    expect(uniqueWidthValues.length).toBe(1);
  });
}); 