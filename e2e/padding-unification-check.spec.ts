import { test, expect } from '@playwright/test';

test.describe('左右パディング統一確認', () => {
  test.beforeEach(async ({ page }) => {
    // ログインページにアクセス
    await page.goto('/login');
    await page.waitForTimeout(2000);
    
    // セラーログイン
    const sellerLogin = page.locator('[data-testid="seller-login"]');
    if (await sellerLogin.isVisible()) {
      await sellerLogin.click();
      await page.waitForTimeout(1000);
      
      const loginBtn = page.locator('button:has-text("ログイン")');
      if (await loginBtn.isVisible()) {
        await loginBtn.click();
        await page.waitForTimeout(3000);
      }
    }
  });

  test('ダッシュボード・在庫管理・商品履歴の左右パディング統一検証', async ({ page }) => {
    console.log('🔍 左右パディング統一検証開始');
    
    const pages = [
      { name: 'ダッシュボード', url: '/dashboard' },
      { name: '在庫管理', url: '/inventory' },
      { name: '商品履歴', url: '/timeline' }
    ];
    
    const paddingResults = [];
    
    for (const pageInfo of pages) {
      console.log(`--- ${pageInfo.name}画面の確認 ---`);
      
      // 各ページにアクセス
      await page.goto(pageInfo.url);
      await page.waitForTimeout(3000);
      
      // space-y-6パディング構造の確認
      const mainContainer = page.locator('div.space-y-6');
      const hasSpaceY6 = await mainContainer.count() > 0;
      
      // 統一されたカードスタイルの確認
      const unifiedCards = page.locator('.bg-white.rounded-xl.border.border-nexus-border');
      const unifiedCardCount = await unifiedCards.count();
      
      // 古いintelligence-cardの確認
      const oldCards = page.locator('.intelligence-card');
      const oldCardCount = await oldCards.count();
      
      // 統計セクションの確認
      const statsSection = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6, .grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4.gap-6');
      const hasUnifiedStats = await statsSection.count() > 0;
      
      // コンテンツ領域の左右マージンを測定
      const contentArea = page.locator('[data-testid="dashboard-layout"] > div, .space-y-6').first();
      let leftMargin = 0;
      let rightMargin = 0;
      
      if (await contentArea.count() > 0) {
        const boundingBox = await contentArea.boundingBox();
        const viewportSize = page.viewportSize();
        if (boundingBox && viewportSize) {
          leftMargin = boundingBox.x;
          rightMargin = viewportSize.width - (boundingBox.x + boundingBox.width);
        }
      }
      
      const result = {
        page: pageInfo.name,
        url: pageInfo.url,
        hasSpaceY6,
        unifiedCardCount,
        oldCardCount,
        hasUnifiedStats,
        leftMargin: Math.round(leftMargin),
        rightMargin: Math.round(rightMargin),
        isUnified: hasSpaceY6 && unifiedCardCount > 0 && oldCardCount === 0 && hasUnifiedStats
      };
      
      paddingResults.push(result);
      
      console.log(`${pageInfo.name}:`);
      console.log(`  space-y-6パディング: ${hasSpaceY6 ? '✅' : '❌'}`);
      console.log(`  統一カード数: ${unifiedCardCount}個`);
      console.log(`  古いカード数: ${oldCardCount}個`);
      console.log(`  統計セクション: ${hasUnifiedStats ? '✅' : '❌'}`);
      console.log(`  左マージン: ${Math.round(leftMargin)}px`);
      console.log(`  右マージン: ${Math.round(rightMargin)}px`);
      console.log(`  統一状態: ${result.isUnified ? '✅ 統一済み' : '❌ 未統一'}`);
      
      // スクリーンショット取得
      await page.screenshot({ 
        path: `${pageInfo.name.toLowerCase()}-padding-check.png`, 
        fullPage: true 
      });
    }
    
    // 統一性の最終検証
    console.log('\n🎯 左右パディング統一結果:');
    console.log('================================');
    
    const allUnified = paddingResults.every(result => result.isUnified);
    const leftMargins = paddingResults.map(result => result.leftMargin);
    const rightMargins = paddingResults.map(result => result.rightMargin);
    
    // マージンの差をチェック（多少の誤差は許容）
    const maxLeftMargin = Math.max(...leftMargins);
    const minLeftMargin = Math.min(...leftMargins);
    const maxRightMargin = Math.max(...rightMargins);
    const minRightMargin = Math.min(...rightMargins);
    
    const leftMarginDiff = maxLeftMargin - minLeftMargin;
    const rightMarginDiff = maxRightMargin - minRightMargin;
    
    console.log(`左マージン差: ${leftMarginDiff}px`);
    console.log(`右マージン差: ${rightMarginDiff}px`);
    
    const marginUnified = leftMarginDiff <= 20 && rightMarginDiff <= 20; // 20px以内の差は許容
    
    if (allUnified && marginUnified) {
      console.log('✅ 全画面の左右パディングが統一されています');
    } else {
      console.log('❌ 左右パディングの統一が不完全です');
      if (!allUnified) {
        paddingResults.forEach(result => {
          if (!result.isUnified) {
            console.log(`  - ${result.page}: 構造の統一が不完全`);
          }
        });
      }
      if (!marginUnified) {
        console.log(`  - マージンの差が大きすぎます（左:${leftMarginDiff}px, 右:${rightMarginDiff}px）`);
      }
    }
    
    // 結果をJSONで出力
    console.log('\n詳細結果:', JSON.stringify(paddingResults, null, 2));
    
    // テスト assertion
    expect(allUnified).toBeTruthy();
    expect(leftMarginDiff).toBeLessThanOrEqual(20);
    expect(rightMarginDiff).toBeLessThanOrEqual(20);
  });
}); 