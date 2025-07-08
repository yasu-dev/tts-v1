const puppeteer = require('puppeteer');

async function measureContentWidths() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  const screens = [
    { name: 'dashboard', url: '/dashboard', role: 'seller' },
    { name: 'inventory', url: '/inventory', role: 'seller' },
    { name: 'sales', url: '/sales', role: 'seller' },
    { name: 'returns', url: '/returns', role: 'seller' },
    { name: 'staff-dashboard', url: '/staff/dashboard', role: 'staff' },
    { name: 'staff-returns', url: '/staff/returns', role: 'staff' },
  ];

  console.log('\n🔍 === ボディ内部コンテンツ箱の実際の幅測定 ===\n');

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
    const measurements = await page.evaluate(() => {
      // intelligence-cardまたはメインコンテンツエリアを特定
      const intelligenceCard = document.querySelector('[class*="intelligence-card"]');
      const mainContent = document.querySelector('main > div');
      const container = intelligenceCard || mainContent;
      
      if (container) {
        const rect = container.getBoundingClientRect();
        const styles = window.getComputedStyle(container);
        
        return {
          totalWidth: rect.width,
          paddingLeft: parseFloat(styles.paddingLeft),
          paddingRight: parseFloat(styles.paddingRight),
          contentWidth: rect.width - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight),
          className: container.className,
          tagName: container.tagName
        };
      }
      return null;
    });

    if (measurements) {
      console.log(`  要素: ${measurements.tagName} (${measurements.className})`);
      console.log(`  総幅: ${measurements.totalWidth}px`);
      console.log(`  左パディング: ${measurements.paddingLeft}px`);
      console.log(`  右パディング: ${measurements.paddingRight}px`);
      console.log(`  実際のコンテンツ幅: ${measurements.contentWidth}px`);
    } else {
      console.log(`  ❌ コンテンツ要素が見つかりません`);
    }
    console.log('');
  }

  await browser.close();
}

measureContentWidths().catch(console.error); 