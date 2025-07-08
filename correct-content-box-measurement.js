const puppeteer = require('puppeteer');

async function measureActualContentBoxes() {
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

  console.log('\n🎯 === 実際のコンテンツボックス（白いカード）の幅測定 ===\n');
  console.log('グレー余白を除外し、白いコンテンツカードのみを測定します\n');

  const allMeasurements = {};

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

    // 実際のコンテンツボックス（白いカード）を測定
    const measurements = await page.evaluate(() => {
      const results = [];
      
      // intelligence-cardクラスを持つ要素を取得
      const intelligenceCards = document.querySelectorAll('[class*="intelligence-card"]');
      
      intelligenceCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const styles = window.getComputedStyle(card);
        
        // 背景色を確認（白いカードかどうか）
        const backgroundColor = styles.backgroundColor;
        const isWhiteCard = backgroundColor === 'rgb(255, 255, 255)' || 
                           backgroundColor === 'white' || 
                           backgroundColor === 'rgba(255, 255, 255, 1)';
        
        results.push({
          index: index,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          backgroundColor: backgroundColor,
          isWhiteCard: isWhiteCard,
          className: card.className,
          // 実際の表示位置
          position: {
            x: Math.round(rect.left),
            y: Math.round(rect.top)
          }
        });
      });

      // 白いカードのみをフィルタリング
      const whiteCards = results.filter(r => r.isWhiteCard);
      
      return {
        allCards: results,
        whiteCards: whiteCards,
        whiteCardWidths: whiteCards.map(c => c.width)
      };
    });

    allMeasurements[screen.name] = measurements;

    console.log(`  発見されたカード数: ${measurements.allCards.length}個`);
    console.log(`  白いカード数: ${measurements.whiteCards.length}個`);
    
    if (measurements.whiteCards.length > 0) {
      console.log(`  白いカードの幅:`);
      measurements.whiteCards.forEach((card, i) => {
        console.log(`    カード${i + 1}: ${card.width}px (位置: ${card.left}px-${card.right}px)`);
      });
      
      const uniqueWidths = [...new Set(measurements.whiteCardWidths)];
      console.log(`  幅のバリエーション: ${uniqueWidths.join('px, ')}px`);
    } else {
      console.log(`  ⚠️ 白いカードが見つかりません`);
    }
    console.log('');
  }

  // 全画面の白いカード幅を比較
  console.log('\n📊 === 全画面の白いカード幅比較 ===');
  
  const allWhiteCardWidths = [];
  Object.entries(allMeasurements).forEach(([screenName, data]) => {
    if (data.whiteCards.length > 0) {
      console.log(`${screenName}:`);
      const widths = data.whiteCardWidths;
      const uniqueWidths = [...new Set(widths)];
      console.log(`  幅の種類: ${uniqueWidths.join('px, ')}px`);
      allWhiteCardWidths.push(...widths);
    }
  });

  const allUniqueWidths = [...new Set(allWhiteCardWidths)];
  console.log(`\n総合結果:`);
  console.log(`  全白いカードの幅の種類数: ${allUniqueWidths.length}種類`);
  console.log(`  幅のバリエーション: ${allUniqueWidths.join('px, ')}px`);
  
  if (allUniqueWidths.length === 1) {
    console.log('  ✅ 全画面の白いカード幅が統一されています！');
  } else {
    console.log('  ❌ 画面間で白いカード幅に違いがあります');
    
    // 最も多い幅を基準として差分を表示
    const widthCounts = {};
    allWhiteCardWidths.forEach(w => {
      widthCounts[w] = (widthCounts[w] || 0) + 1;
    });
    const mostCommonWidth = Object.keys(widthCounts).reduce((a, b) => 
      widthCounts[a] > widthCounts[b] ? a : b
    );
    
    console.log(`\n基準幅（最頻出）: ${mostCommonWidth}px`);
    console.log(`差分:`);
    allUniqueWidths.forEach(width => {
      const diff = width - parseInt(mostCommonWidth);
      if (diff !== 0) {
        console.log(`  ${width}px: ${diff > 0 ? '+' : ''}${diff}px`);
      }
    });
  }

  await browser.close();
  return allMeasurements;
}

measureActualContentBoxes().catch(console.error); 