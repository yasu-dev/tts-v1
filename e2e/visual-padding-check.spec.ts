import { test, expect } from '@playwright/test';

test.describe('👁️ 視覚的パディング確認', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.goto('/staff/returns');
    await page.waitForLoadState('networkidle');
  });

  test('📸 各タブの見た目比較', async ({ page }) => {
    // 各タブのスクリーンショットを撮影
    const tabs = [
      { name: '返品検品', filename: 'inspection-visual' },
      { name: '再出品業務フロー', filename: 'relisting-visual' },
      { name: '返品理由分析', filename: 'analysis-visual' }
    ];
    
    for (const tab of tabs) {
      await page.click(`button:has-text("${tab.name}")`);
      await page.waitForTimeout(1000);
      
      // フルページスクリーンショット
      await page.screenshot({ 
        path: `test-results/${tab.filename}.png`,
        fullPage: true 
      });
      
      console.log(`📸 ${tab.name} スクリーンショット保存完了`);
    }
  });

  test('🔴 パディング赤色ハイライト比較', async ({ page }) => {
    const tabs = [
      { name: '返品検品', filename: 'inspection-highlighted' },
      { name: '再出品業務フロー', filename: 'relisting-highlighted' },
      { name: '返品理由分析', filename: 'analysis-highlighted' }
    ];
    
    for (const tab of tabs) {
      await page.click(`button:has-text("${tab.name}")`);
      await page.waitForTimeout(500);
      
      // 赤色ハイライトを追加（パディング部分を可視化）
      await page.evaluate(() => {
        // メインコンテンツコンテナを取得
        const containers = document.querySelectorAll('#main-content .p-8, .p-8, [class*="p-8"]');
        
        containers.forEach((container, index) => {
          const el = container as HTMLElement;
          if (el) {
            // 既存の背景を保存
            const originalBg = el.style.background;
            // パディング部分を赤色でハイライト
            el.style.background = `
              linear-gradient(90deg, 
                red 0px, red 32px, 
                ${originalBg || 'transparent'} 32px, 
                ${originalBg || 'transparent'} calc(100% - 32px), 
                red calc(100% - 32px), red 100%
              )
            `;
            el.style.backgroundClip = 'content-box, padding-box';
            el.style.minHeight = '300px';
          }
        });
        
        // 追加でアウトラインも表示
        document.querySelectorAll('.intelligence-card').forEach(card => {
          const el = card as HTMLElement;
          el.style.outline = '2px solid blue';
          el.style.outlineOffset = '2px';
        });
      });
      
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/${tab.filename}.png`,
        fullPage: true 
      });
      
      console.log(`🔴 ${tab.name} ハイライト表示完了`);
    }
  });

  test('📐 実際のレイアウト寸法確認', async ({ page }) => {
    const tabs = ['返品検品', '再出品業務フロー', '返品理由分析'];
    
    for (const tab of tabs) {
      await page.click(`button:has-text("${tab}")`);
      await page.waitForTimeout(500);
      
      const measurements = await page.evaluate(() => {
        // 複数の要素を調査
        const mainContent = document.querySelector('#main-content .page-scroll-container > div');
        const intelligenceCards = document.querySelectorAll('.intelligence-card');
        const spaceY6 = document.querySelectorAll('.space-y-6');
        
        const getElementInfo = (element: Element | null) => {
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          const computed = window.getComputedStyle(element);
          return {
            width: rect.width,
            left: rect.left,
            right: rect.right,
            paddingLeft: computed.paddingLeft,
            paddingRight: computed.paddingRight,
            marginLeft: computed.marginLeft,
            marginRight: computed.marginRight,
            className: element.className
          };
        };
        
        return {
          mainContent: getElementInfo(mainContent),
          firstCard: getElementInfo(intelligenceCards[0]),
          spaceY6Count: spaceY6.length,
          cardCount: intelligenceCards.length,
          viewportWidth: window.innerWidth
        };
      });
      
      console.log(`📐 ${tab}:`, measurements);
    }
  });
}); 