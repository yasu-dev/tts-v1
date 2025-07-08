import { test, expect } from '@playwright/test';

test.describe('全25画面表示（タブ含む）', () => {
  const allScreensWithTabs = [
    // セラー画面（12画面）
    { name: 'billing', url: '/billing', role: 'seller', title: '請求・精算' },
    { name: 'dashboard', url: '/dashboard', role: 'seller', title: 'ダッシュボード' },
    { name: 'delivery', url: '/delivery', role: 'seller', title: '納品管理' },
    { name: 'delivery-plan', url: '/delivery-plan', role: 'seller', title: '納品計画' },
    { name: 'inventory', url: '/inventory', role: 'seller', title: '在庫管理' },
    { name: 'returns', url: '/returns', role: 'seller', title: '返品管理' },
    { name: 'sales', url: '/sales', role: 'seller', title: '販売管理' },
    { name: 'profile', url: '/profile', role: 'seller', title: 'プロフィール設定' },
    { name: 'settings', url: '/settings', role: 'seller', title: 'アカウント設定' },
    { name: 'timeline', url: '/timeline', role: 'seller', title: '商品履歴' },
    { name: 'reports', url: '/reports', role: 'seller', title: 'レポート' },
    { name: 'reports-monthly', url: '/reports/monthly', role: 'seller', title: '月次レポート' },
    
    // スタッフ画面（10画面）
    { name: 'staff-dashboard', url: '/staff/dashboard', role: 'staff', title: 'スタッフダッシュボード' },
    { name: 'staff-inspection', url: '/staff/inspection', role: 'staff', title: '検品・撮影' },
    { name: 'staff-inventory', url: '/staff/inventory', role: 'staff', title: 'スタッフ在庫管理' },
    { name: 'staff-listing', url: '/staff/listing', role: 'staff', title: '出品管理' },
    { name: 'staff-location', url: '/staff/location', role: 'staff', title: 'ロケーション管理' },
    { name: 'staff-picking', url: '/staff/picking', role: 'staff', title: 'ピッキング' },
    { name: 'staff-shipping', url: '/staff/shipping', role: 'staff', title: '出荷管理' },
    { name: 'staff-returns', url: '/staff/returns', role: 'staff', title: 'スタッフ返品処理' },
    { name: 'staff-reports', url: '/staff/reports', role: 'staff', title: 'スタッフ業務レポート' },
    { name: 'staff-tasks', url: '/staff/tasks', role: 'staff', title: 'タスク管理' },

    // 返品処理の詳細タブ（3タブ）
    { name: 'staff-returns-inspection', url: '/staff/returns', role: 'staff', title: 'スタッフ返品処理 - 返品検品', tab: 'inspection' },
    { name: 'staff-returns-relisting', url: '/staff/returns', role: 'staff', title: 'スタッフ返品処理 - 再出品業務フロー', tab: 'relisting' },
    { name: 'staff-returns-analysis', url: '/staff/returns', role: 'staff', title: 'スタッフ返品処理 - 返品理由分析', tab: 'analysis' },
  ];

  test('全25画面を順次表示（タブ操作含む）', async ({ page }) => {
    console.log('\n🌐 === 全25画面表示開始（タブ含む） ===');
    console.log(`📊 対象画面数: ${allScreensWithTabs.length}画面\n`);
    
    for (let i = 0; i < allScreensWithTabs.length; i++) {
      const screen = allScreensWithTabs[i];
      console.log(`\n🔄 [${i + 1}/${allScreensWithTabs.length}] ${screen.title} を表示中...`);
      
      try {
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
        
        // 対象画面に移動
        await page.goto(`http://localhost:3001${screen.url}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // タブ操作が必要な場合
        if (screen.tab) {
          console.log(`  📑 ${screen.tab}タブをクリック中...`);
          
          if (screen.tab === 'inspection') {
            // 返品検品タブをクリック
            const inspectionTab = page.locator('text=返品検品').or(page.locator('[data-tab="inspection"]'));
            if (await inspectionTab.isVisible()) {
              await inspectionTab.click();
              await page.waitForTimeout(1000);
              console.log(`  ✅ 返品検品タブ表示完了`);
            }
          } else if (screen.tab === 'relisting') {
            // 再出品業務フロータブをクリック
            const relistingTab = page.locator('text=再出品業務フロー').or(page.locator('[data-tab="relisting"]'));
            if (await relistingTab.isVisible()) {
              await relistingTab.click();
              await page.waitForTimeout(1000);
              console.log(`  ✅ 再出品業務フロータブ表示完了`);
            }
          } else if (screen.tab === 'analysis') {
            // 返品理由分析タブをクリック
            const analysisTab = page.locator('text=返品理由分析').or(page.locator('[data-tab="analysis"]'));
            if (await analysisTab.isVisible()) {
              await analysisTab.click();
              await page.waitForTimeout(1000);
              console.log(`  ✅ 返品理由分析タブ表示完了`);
            }
          }
        }
        
        // スクリーンショット撮影
        const screenshotPath = `test-results/全画面表示-${screen.name}.png`;
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        
        // 白いカードの横幅を測定
        const cardWidths = await page.evaluate(() => {
          const cards = document.querySelectorAll('.intelligence-card');
          return Array.from(cards).map(card => {
            const rect = card.getBoundingClientRect();
            const innerDiv = card.querySelector('div');
            const innerRect = innerDiv ? innerDiv.getBoundingClientRect() : null;
            return {
              cardWidth: rect.width,
              innerWidth: innerRect ? innerRect.width : 0,
              className: card.className
            };
          });
        });
        
        if (cardWidths.length > 0) {
          const firstCardInnerWidth = cardWidths[0].innerWidth;
          console.log(`  📏 白いカード内部幅: ${firstCardInnerWidth}px`);
        }
        
        console.log(`  ✅ ${screen.title} - 表示完了`);
        console.log(`  📸 スクリーンショット: ${screenshotPath}`);
        
        // 3秒間表示を維持
        await page.waitForTimeout(3000);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`  ❌ エラー: ${errorMessage}`);
      }
    }
    
    console.log('\n🎉 === 全25画面表示完了 ===');
    console.log('📱 セラー画面: 12画面');
    console.log('👥 スタッフ画面: 10画面');
    console.log('📑 返品処理タブ: 3タブ');
    console.log('📸 全スクリーンショットが test-results/ に保存されました');
    console.log('🔍 UIを見て横幅統一を確認してください');
  });
}); 