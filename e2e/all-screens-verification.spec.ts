import { test, expect } from '@playwright/test';

test.describe('全画面横幅統一検証', () => {
  const screens = [
    // セラー画面
    { path: '/dashboard', name: '画面1: セラー - ダッシュボード', expected: '混在型(p-8,p-3)', needsFix: true },
    { path: '/delivery', name: '画面2: セラー - 納品管理', expected: '統一型(p-8)', needsFix: false },
    { path: '/inventory', name: '画面3: セラー - 在庫管理', expected: '混在型(レスポンシブ制限)', needsFix: true },
    { path: '/sales', name: '画面4: セラー - 販売管理', expected: '混在型(p-8,p-6)', needsFix: true },
    { path: '/returns', name: '画面5: セラー - 返品管理', expected: '混在型(p-8,p-6)', needsFix: true },
    { path: '/billing', name: '画面6: セラー - 請求・精算', expected: '混在型(p-8,p-6)', needsFix: true },
    { path: '/timeline', name: '画面7: セラー - 商品履歴', expected: '多段階型(3つのパディング)', needsFix: true },
    { path: '/profile', name: '画面16: プロフィール設定', expected: '要確認', needsFix: false },
    { path: '/settings', name: '画面17: アカウント設定', expected: '要確認', needsFix: false },
    
    // スタッフ画面
    { path: '/staff/dashboard', name: '画面8: スタッフ - ダッシュボード', expected: '要確認', needsFix: false },
    { path: '/staff/tasks', name: '画面9: スタッフ - タスク管理', expected: '要確認', needsFix: false },
    { path: '/staff/inventory', name: '画面10: スタッフ - 在庫管理', expected: '要確認', needsFix: false },
    { path: '/staff/inspection', name: '画面11: スタッフ - 検品・撮影', expected: '要確認', needsFix: false },
    { path: '/staff/location', name: '画面12: スタッフ - ロケーション管理', expected: '要確認', needsFix: false },
    { path: '/staff/shipping', name: '画面13: スタッフ - 出荷管理', expected: '要確認', needsFix: false },
    { path: '/staff/returns', name: '画面14: スタッフ - 返品処理', expected: '混在型(p-8,p-4)', needsFix: true },
    { path: '/staff/reports', name: '画面15: スタッフ - 業務レポート', expected: '要確認', needsFix: false },
  ];

  test('全画面のパディング状況確認', async ({ page }) => {
    console.log('\n=== 全画面横幅統一検証開始 ===\n');
    
    const results = [];
    
    for (const screen of screens) {
      try {
        await page.goto(`http://localhost:3001${screen.path}`);
        await page.waitForLoadState('domcontentloaded');
        
        // intelligence-card要素の確認
        const cards = page.locator('.intelligence-card');
        const cardCount = await cards.count();
        
        const paddingAnalysis = [];
        
        if (cardCount > 0) {
          for (let i = 0; i < cardCount; i++) {
            const card = cards.nth(i);
            const cardContent = card.locator('> div').first();
            const className = await cardContent.getAttribute('class');
            
            // パディングクラスの確認
            let paddingType = 'unknown';
            if (className?.includes('p-8')) paddingType = 'p-8';
            else if (className?.includes('p-6')) paddingType = 'p-6';
            else if (className?.includes('p-4')) paddingType = 'p-4';
            else if (className?.includes('p-3')) paddingType = 'p-3';
            else if (className?.match(/p-\d+/)) paddingType = className.match(/p-\d+/)?.[0] || 'unknown';
            
            paddingAnalysis.push(paddingType);
          }
        }
        
        const uniquePaddings = Array.from(new Set(paddingAnalysis));
        const isUnified = uniquePaddings.length <= 1;
        const status = isUnified ? '✓ 統一' : '✗ 混在';
        
        results.push({
          screen: screen.name,
          path: screen.path,
          cardCount,
          paddings: paddingAnalysis,
          uniquePaddings,
          isUnified,
          needsFix: screen.needsFix,
          expected: screen.expected
        });
        
        console.log(`${status} ${screen.name}`);
        console.log(`  パス: ${screen.path}`);
        console.log(`  カード数: ${cardCount}`);
        console.log(`  パディング: [${paddingAnalysis.join(', ')}]`);
        console.log(`  ユニーク: [${uniquePaddings.join(', ')}]`);
        console.log(`  期待値: ${screen.expected}`);
        console.log(`  修正要否: ${screen.needsFix ? '要修正' : '正常'}`);
        console.log('');
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`✗ エラー ${screen.name}: ${errorMessage}`);
        results.push({
          screen: screen.name,
          path: screen.path,
          error: errorMessage,
          needsFix: screen.needsFix
        });
      }
    }
    
    // 修正が必要な画面のリスト
    const needsFixScreens = results.filter(r => r.needsFix && !r.isUnified);
    
    console.log('\n=== 修正が必要な画面 ===');
    needsFixScreens.forEach(screen => {
      console.log(`- ${screen.screen}: ${screen.uniquePaddings?.join(', ') || 'エラー'}`);
    });
    
    console.log('\n=== 検証完了 ===');
  });

  test('修正対象画面のスクリーンショット撮影', async ({ page }) => {
    const fixTargets = [
      '/dashboard',
      '/inventory', 
      '/sales',
      '/returns',
      '/billing',
      '/timeline',
      '/staff/returns'
    ];
    
    for (const path of fixTargets) {
      try {
        await page.goto(`http://localhost:3001${path}`);
        await page.waitForLoadState('networkidle');
        
        const screenshotPath = `test-results/修正前-${path.replace(/\//g, '-')}.png`;
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        
        console.log(`修正前スクリーンショット: ${screenshotPath}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`スクリーンショット失敗 ${path}: ${errorMessage}`);
      }
    }
  });
}); 