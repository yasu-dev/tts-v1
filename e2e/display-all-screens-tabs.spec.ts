import { test, expect, Browser, BrowserContext } from '@playwright/test';

test.describe('全画面複数タブ表示', () => {
  const allScreens = [
    // セラー画面
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
    
    // スタッフ画面
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
  ];

  test('全22画面を複数タブで表示したまま維持', async ({ browser }) => {
    console.log('\n🌐 === 全22画面を複数タブで表示開始 ===');
    console.log(`📊 対象画面数: ${allScreens.length}画面`);
    
    const contexts: BrowserContext[] = [];
    const pages: any[] = [];
    
    try {
      // 各画面を個別のタブで開く
      for (let i = 0; i < allScreens.length; i++) {
        const screen = allScreens[i];
        console.log(`\n🔄 [${i + 1}/${allScreens.length}] ${screen.title} をタブで開いています...`);
        
        // 新しいコンテキストとページを作成
        const context = await browser.newContext({
          viewport: { width: 1920, height: 1080 }
        });
        contexts.push(context);
        
        const page = await context.newPage();
        pages.push({ page, screen });
        
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
        await page.waitForTimeout(1000);
        
        console.log(`✅ ${screen.title} - タブ表示完了`);
      }
      
      console.log(`\n🎉 === 全${allScreens.length}画面のタブ表示完了 ===`);
      console.log('📱 各画面がブラウザタブで表示されています');
      console.log('🔍 白いカードの横幅統一を目視で確認できます');
      console.log('⏰ 60秒間表示を維持します...');
      
      // 60秒間表示を維持
      await new Promise(resolve => setTimeout(resolve, 60000));
      
      console.log('\n📸 各画面のスクリーンショットを取得中...');
      
      // 各タブのスクリーンショットを取得
      for (let i = 0; i < pages.length; i++) {
        const { page, screen } = pages[i];
        const screenshotPath = `test-results/全画面タブ表示--${screen.name}.png`;
        
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        
        console.log(`📸 ${screen.title} - スクリーンショット保存: ${screenshotPath}`);
      }
      
      console.log('\n✅ 全画面タブ表示とスクリーンショット取得完了！');
      
    } finally {
      // 全コンテキストを閉じる
      for (const context of contexts) {
        await context.close();
      }
    }
  });
}); 