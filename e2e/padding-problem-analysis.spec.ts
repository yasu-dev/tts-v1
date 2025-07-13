import { test, expect } from '@playwright/test';

test.describe('🔍 パディング問題の詳細分析', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('📏 指摘された4画面の実際のパディング測定', async ({ page }) => {
    const screens = [
      {
        name: 'スタッフタスク管理',
        path: '/staff/tasks',
        userType: 'staff',
        username: 'staff1'
      },
      {
        name: 'スタッフ在庫管理',
        path: '/staff/inventory',
        userType: 'staff',
        username: 'staff1'
      },
      {
        name: 'セラー在庫管理',
        path: '/inventory',
        userType: 'seller',
        username: 'seller1'
      },
      {
        name: '商品履歴',
        path: '/timeline',
        userType: 'seller',
        username: 'seller1'
      }
    ];

    for (const screen of screens) {
      console.log(`\n📋 ${screen.name} パディング詳細分析`);
      console.log('==========================================');
      
      // ログイン
      await page.fill('input[name="username"]', screen.username);
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // 画面に移動
      await page.goto(screen.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // 詳細なパディング分析
      const paddingAnalysis = await page.evaluate(() => {
        const results: Array<{
          layer: string;
          selector: string;
          paddingLeft: string;
          paddingRight: string;
          element: string;
        }> = [];
        
        // DashboardLayoutのパディング
        const dashboardContainer = document.querySelector('.page-scroll-container > div');
        if (dashboardContainer) {
          const styles = window.getComputedStyle(dashboardContainer);
          results.push({
            layer: 'DashboardLayout',
            selector: '.page-scroll-container > div',
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            element: 'メインコンテナ'
          });
        }
        
        // intelligence-cardのパディング  
        const intelligenceCards = document.querySelectorAll('.intelligence-card');
        intelligenceCards.forEach((card, index) => {
          const cardContainer = card.querySelector('div');
          if (cardContainer) {
            const styles = window.getComputedStyle(cardContainer);
            results.push({
              layer: 'intelligence-card',
              selector: `.intelligence-card:nth-child(${index + 1}) > div`,
              paddingLeft: styles.paddingLeft,
              paddingRight: styles.paddingRight,
              element: `カード${index + 1}`
            });
          }
        });
        
        // その他のp-8クラス
        const p8Elements = document.querySelectorAll('.p-8');
        p8Elements.forEach((element, index) => {
          const styles = window.getComputedStyle(element);
          results.push({
            layer: 'p-8直接',
            selector: `.p-8:nth-child(${index + 1})`,
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            element: `p-8要素${index + 1}`
          });
        });
        
        return results;
      });
      
      // 結果をコンソールに出力
      paddingAnalysis.forEach((analysis) => {
        console.log(`🔍 ${analysis.layer} - ${analysis.element}:`);
        console.log(`   Left: ${analysis.paddingLeft}, Right: ${analysis.paddingRight}`);
        console.log(`   セレクタ: ${analysis.selector}`);
        
        // 重複チェック
        const leftPx = parseInt(analysis.paddingLeft);
        const rightPx = parseInt(analysis.paddingRight);
        if (leftPx > 32 || rightPx > 32) {
          console.log(`   ⚠️  警告: パディングが32pxを超えています (重複の可能性)`);
        }
      });
      
      // 実際の見た目のパディング（ボディ部分）
      const actualPadding = await page.evaluate(() => {
        const mainContent = document.querySelector('#main-content');
        if (mainContent) {
          const rect = mainContent.getBoundingClientRect();
          const firstCard = document.querySelector('.intelligence-card, .holo-table, .nexus-content-card');
          if (firstCard) {
            const cardRect = firstCard.getBoundingClientRect();
            return {
              leftMargin: cardRect.left - rect.left,
              rightMargin: rect.right - cardRect.right,
              containerWidth: rect.width,
              cardWidth: cardRect.width
            };
          }
        }
        return null;
      });
      
      if (actualPadding) {
        console.log(`📐 実際の見た目のパディング:`);
        console.log(`   左余白: ${actualPadding.leftMargin}px`);
        console.log(`   右余白: ${actualPadding.rightMargin}px`);
        console.log(`   統一性: ${Math.abs(actualPadding.leftMargin - actualPadding.rightMargin) <= 2 ? '✅ 一致' : '❌ 不一致'}`);
        
        // 32px（期待値）との比較
        const deviation = Math.abs(actualPadding.leftMargin - 32);
        console.log(`   期待値(32px)との差: ${deviation}px ${deviation <= 5 ? '✅' : '❌'}`);
      }
      
      // スクリーンショット
      await page.screenshot({
        path: `test-results/current-padding-${screen.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`,
        fullPage: true
      });
      
      // ログアウト
      await page.goto('/login');
    }
  });

  test('📊 パディング重複問題の検証', async ({ page }) => {
    console.log('\n🔍 パディング重複問題の検証');
    console.log('==========================================');
    
    // セラーでログイン
    await page.fill('input[name="username"]', 'seller1');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // DOM構造とパディング階層の確認
    const domStructure = await page.evaluate(() => {
      const main = document.querySelector('#main-content');
      const container = main?.querySelector('.page-scroll-container > div');
      const card = container?.querySelector('.intelligence-card');
      const cardInner = card?.querySelector('div');
      
      return {
        mainContent: main ? {
          padding: window.getComputedStyle(main).padding,
          className: main.className
        } : null,
        container: container ? {
          padding: window.getComputedStyle(container).padding,
          className: container.className
        } : null,
        card: card ? {
          padding: window.getComputedStyle(card).padding,
          className: card.className
        } : null,
        cardInner: cardInner ? {
          padding: window.getComputedStyle(cardInner).padding,
          className: cardInner.className
        } : null
      };
    });
    
    console.log('🏗️  DOM構造とパディング階層:');
    if (domStructure.mainContent) {
      console.log(`   main#main-content: padding: ${domStructure.mainContent.padding}`);
    }
    if (domStructure.container) {
      console.log(`   .page-scroll-container > div: padding: ${domStructure.container.padding}`);
    }
    if (domStructure.card) {
      console.log(`   .intelligence-card: padding: ${domStructure.card.padding}`);
    }
    if (domStructure.cardInner) {
      console.log(`   .intelligence-card > div: padding: ${domStructure.cardInner.padding}`);
    }
    
    // 重複度の計算
    const totalPadding = await page.evaluate(() => {
      const container = document.querySelector('.page-scroll-container > div');
      const cardInner = document.querySelector('.intelligence-card > div');
      
      const containerPadding = container ? parseInt(window.getComputedStyle(container).paddingLeft) : 0;
      const cardPadding = cardInner ? parseInt(window.getComputedStyle(cardInner).paddingLeft) : 0;
      
      return {
        containerPadding,
        cardPadding,
        total: containerPadding + cardPadding,
        isDuplicated: containerPadding > 0 && cardPadding > 0
      };
    });
    
    console.log('🧮 パディング重複分析:');
    console.log(`   DashboardLayout: ${totalPadding.containerPadding}px`);
    console.log(`   intelligence-card: ${totalPadding.cardPadding}px`);
    console.log(`   合計実効パディング: ${totalPadding.total}px`);
    console.log(`   重複状態: ${totalPadding.isDuplicated ? '❌ 重複あり' : '✅ 重複なし'}`);
    console.log(`   期待値(32px): ${totalPadding.total === 32 ? '✅ 一致' : '❌ 不一致'}`);
  });
}); 