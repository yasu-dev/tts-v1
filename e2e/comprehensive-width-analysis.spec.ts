import { test, expect } from '@playwright/test';

test.describe('全画面横幅制御の完全分析', () => {
  test('全17画面のintelligence-cardパディング設定を抽出', async ({ page }) => {
    console.log('=== 全画面横幅制御の完全分析開始 ===');
    
    // セラー画面（7画面）
    const sellerPages = [
      { name: 'ダッシュボード', url: '/dashboard' },
      { name: '納品管理', url: '/delivery' },
      { name: '在庫管理', url: '/inventory' },
      { name: '販売管理', url: '/sales' },
      { name: '返品管理', url: '/returns' },
      { name: '請求・精算', url: '/billing' },
      { name: '商品履歴', url: '/timeline' }
    ];
    
    // スタッフ画面（8画面）
    const staffPages = [
      { name: 'スタッフダッシュボード', url: '/staff/dashboard' },
      { name: 'タスク管理', url: '/staff/tasks' },
      { name: '在庫管理', url: '/staff/inventory' },
      { name: '検品・撮影', url: '/staff/inspection' },
      { name: 'ロケーション管理', url: '/staff/location' },
      { name: '出荷管理', url: '/staff/shipping' },
      { name: '返品処理', url: '/staff/returns' },
      { name: '業務レポート', url: '/staff/reports' }
    ];
    
    // ヘッダー設定画面（2画面）
    const headerPages = [
      { name: 'プロフィール設定', url: '/profile' },
      { name: 'アカウント設定', url: '/settings' }
    ];
    
    // セラーとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    console.log('\n=== セラー画面の横幅制御分析 ===');
    for (const pageInfo of sellerPages) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForSelector('.intelligence-card', { timeout: 5000 });
        
        const cards = await page.locator('.intelligence-card').all();
        console.log(`\n${pageInfo.name} (${pageInfo.url}):`);
        console.log(`  intelligence-card数: ${cards.length}`);
        
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const className = await card.getAttribute('class');
          const childDiv = card.locator('> div').first();
          const childClassName = await childDiv.getAttribute('class');
          
          console.log(`  Card ${i + 1}: ${className}`);
          if (childClassName) {
            console.log(`    子要素: ${childClassName}`);
            
            // パディング設定を抽出
            const paddingMatch = childClassName.match(/p-\d+|p-\w+/g);
            if (paddingMatch) {
              console.log(`    パディング設定: ${paddingMatch.join(', ')}`);
            }
          }
        }
      } catch (error) {
        console.log(`${pageInfo.name}: アクセス不可またはエラー`);
      }
    }
    
    console.log('\n=== ヘッダー設定画面の横幅制御分析 ===');
    for (const pageInfo of headerPages) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForSelector('.intelligence-card, h1', { timeout: 5000 });
        
        const cards = await page.locator('.intelligence-card').all();
        console.log(`\n${pageInfo.name} (${pageInfo.url}):`);
        console.log(`  intelligence-card数: ${cards.length}`);
        
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const className = await card.getAttribute('class');
          const childDiv = card.locator('> div').first();
          const childClassName = await childDiv.getAttribute('class');
          
          console.log(`  Card ${i + 1}: ${className}`);
          if (childClassName) {
            console.log(`    子要素: ${childClassName}`);
            
            // パディング設定を抽出
            const paddingMatch = childClassName.match(/p-\d+|p-\w+/g);
            if (paddingMatch) {
              console.log(`    パディング設定: ${paddingMatch.join(', ')}`);
            }
          }
        }
      } catch (error) {
        console.log(`${pageInfo.name}: アクセス不可またはエラー`);
      }
    }
    
    // スタッフとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    console.log('\n=== スタッフ画面の横幅制御分析 ===');
    for (const pageInfo of staffPages) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForSelector('.intelligence-card', { timeout: 5000 });
        
        const cards = await page.locator('.intelligence-card').all();
        console.log(`\n${pageInfo.name} (${pageInfo.url}):`);
        console.log(`  intelligence-card数: ${cards.length}`);
        
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const className = await card.getAttribute('class');
          const childDiv = card.locator('> div').first();
          const childClassName = await childDiv.getAttribute('class');
          
          console.log(`  Card ${i + 1}: ${className}`);
          if (childClassName) {
            console.log(`    子要素: ${childClassName}`);
            
            // パディング設定を抽出
            const paddingMatch = childClassName.match(/p-\d+|p-\w+/g);
            if (paddingMatch) {
              console.log(`    パディング設定: ${paddingMatch.join(', ')}`);
            }
          }
        }
      } catch (error) {
        console.log(`${pageInfo.name}: アクセス不可またはエラー`);
      }
    }
  });

  test('DashboardLayoutの外枠パディング設定を確認', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/dashboard');
    await page.waitForSelector('main', { timeout: 5000 });
    
    console.log('\n=== DashboardLayout外枠パディング分析 ===');
    
    // メインコンテナのクラスを確認
    const mainElement = page.locator('main');
    const mainClassName = await mainElement.getAttribute('class');
    console.log(`main要素クラス: ${mainClassName}`);
    
    // DashboardLayout内の直接の子要素を確認
    const directChildren = await page.locator('main > *').all();
    console.log(`main直下の要素数: ${directChildren.length}`);
    
    for (let i = 0; i < directChildren.length; i++) {
      const child = directChildren[i];
      const tagName = await child.evaluate(el => el.tagName);
      const className = await child.getAttribute('class');
      console.log(`  子要素${i + 1}: <${tagName}> class="${className}"`);
    }
  });

  test('CSSファイルでのintelligence-card定義を確認', async ({ page }) => {
    console.log('\n=== CSS定義分析 ===');
    
    await page.goto('/dashboard');
    
    // intelligence-cardクラスのCSS定義を取得
    const cardStyles = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      const rules: string[] = [];
      
      for (const sheet of styleSheets) {
        try {
          const cssRules = Array.from(sheet.cssRules || sheet.rules || []);
          for (const rule of cssRules) {
            if (rule instanceof CSSStyleRule && rule.selectorText?.includes('intelligence-card')) {
              rules.push(`${rule.selectorText} { ${rule.style.cssText} }`);
            }
          }
        } catch (e) {
          // Cross-origin stylesheets are not accessible
        }
      }
      
      return rules;
    });
    
    console.log('intelligence-cardのCSS定義:');
    cardStyles.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule}`);
    });
    
    // Tailwind CSSクラスの計算済みスタイルを確認
    const computedStyles = await page.evaluate(() => {
      const element = document.querySelector('.intelligence-card');
      if (!element) return null;
      
      const styles = window.getComputedStyle(element);
      return {
        width: styles.width,
        maxWidth: styles.maxWidth,
        padding: styles.padding,
        margin: styles.margin,
        boxSizing: styles.boxSizing
      };
    });
    
    console.log('\nintelligence-cardの計算済みスタイル:');
    if (computedStyles) {
      Object.entries(computedStyles).forEach(([property, value]) => {
        console.log(`  ${property}: ${value}`);
      });
    }
  });
}); 