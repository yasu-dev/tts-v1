import { test, expect } from '@playwright/test';

test.describe('商品履歴画面UI確認', () => {
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

  test('商品履歴画面のUI構造確認', async ({ page }) => {
    console.log('🔍 商品履歴画面のUI構造確認開始');
    
    // 商品履歴ページに直接アクセス
    await page.goto('/timeline');
    await page.waitForTimeout(3000);
    
    // 現在のURL確認
    const currentUrl = page.url();
    console.log(`現在のURL: ${currentUrl}`);
    expect(currentUrl).toContain('/timeline');
    
    // ページタイトル確認
    const titleElement = page.locator('h1');
    if (await titleElement.isVisible()) {
      const titleText = await titleElement.textContent();
      console.log(`ページタイトル: ${titleText}`);
    } else {
      console.log('❌ h1タイトルが見つかりません');
    }
    
    // 古いintelligence-cardスタイルの確認
    const oldCards = page.locator('.intelligence-card');
    const oldCardCount = await oldCards.count();
    console.log(`古いintelligence-card: ${oldCardCount}個`);
    
    if (oldCardCount > 0) {
      console.log('❌ 古いintelligence-cardスタイルが残っています');
      // スクリーンショット取得
      await page.screenshot({ 
        path: 'timeline-ui-with-old-cards.png', 
        fullPage: true 
      });
      console.log('古いカードが残っている画面をtimeline-ui-with-old-cards.pngとして保存');
      
      // 古いカードの詳細を取得
      for (let i = 0; i < Math.min(3, oldCardCount); i++) {
        const cardText = await oldCards.nth(i).textContent();
        console.log(`  古いカード${i+1}: ${cardText?.substring(0, 100)}...`);
      }
    } else {
      console.log('✅ 古いintelligence-cardスタイルは削除されています');
    }
    
    // 新しいスタイルの確認
    const newCards = page.locator('.bg-white.rounded-xl.border.border-nexus-border');
    const newCardCount = await newCards.count();
    console.log(`新しいスタイルのカード: ${newCardCount}個`);
    
    // パディング構造の確認
    const mainContainer = page.locator('div.space-y-6');
    const hasCorrectPadding = await mainContainer.count() > 0;
    console.log(`space-y-6パディング構造: ${hasCorrectPadding ? '✅ 使用中' : '❌ 未使用'}`);
    
    // グリッドレイアウトの確認
    const newGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.gap-6');
    const hasNewGrid = await newGrid.count() > 0;
    
    const oldGrid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-3.gap-4');
    const hasOldGrid = await oldGrid.count() > 0;
    
    console.log(`新しいグリッド(1-2列): ${hasNewGrid ? '✅ 使用中' : '❌ 未使用'}`);
    console.log(`古いグリッド(1-3列): ${hasOldGrid ? '❌ 残存' : '✅ 削除済み'}`);
    
    // 統計セクションのスタイル確認
    const statsSection = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6');
    const hasUnifiedStats = await statsSection.count() > 0;
    console.log(`統一された統計セクション: ${hasUnifiedStats ? '✅ 使用中' : '❌ 未使用'}`);
    
    // UnifiedPageHeaderの使用確認
    const unifiedHeader = page.locator('[class*="UnifiedPageHeader"], .unified-page-header');
    const hasUnifiedHeader = await unifiedHeader.count() > 0;
    console.log(`UnifiedPageHeader: ${hasUnifiedHeader ? '✅ 使用中' : '❌ 未使用'}`);
    
    // アクションボタンの確認
    const exportBtn = page.locator('button:has-text("履歴をエクスポート"), button:has-text("エクスポート")');
    const hasExportBtn = await exportBtn.isVisible();
    
    const filterBtn = page.locator('button:has-text("期間でフィルター"), button:has-text("フィルター")');
    const hasFilterBtn = await filterBtn.isVisible();
    
    console.log(`エクスポートボタン: ${hasExportBtn ? '✅ 表示中' : '❌ 未表示'}`);
    console.log(`フィルターボタン: ${hasFilterBtn ? '✅ 表示中' : '❌ 未表示'}`);
    
    // 商品選択エリアの確認
    const productSelection = page.locator('h3:has-text("商品を選択")');
    const hasProductSelection = await productSelection.isVisible();
    console.log(`商品選択エリア: ${hasProductSelection ? '✅ 表示中' : '❌ 未表示'}`);
    
    // スクリーンショット取得
    await page.screenshot({ 
      path: 'timeline-ui-current-state.png', 
      fullPage: true 
    });
    console.log('現在の画面状態をtimeline-ui-current-state.pngとして保存');
    
    // 最終判定
    const isUIFixed = oldCardCount === 0 && 
                     newCardCount > 0 && 
                     hasCorrectPadding && 
                     hasNewGrid && 
                     !hasOldGrid &&
                     hasUnifiedStats;
    
    console.log('\n🎯 UI確認結果:');
    console.log('================================');
    if (isUIFixed) {
      console.log('✅ UIの作り直しが成功しています');
    } else {
      console.log('❌ UIの作り直しが不完全です');
      console.log('修正が必要な項目:');
      if (oldCardCount > 0) console.log('  - 古いintelligence-cardスタイルの削除');
      if (!hasCorrectPadding) console.log('  - space-y-6パディング構造の適用');
      if (!hasNewGrid) console.log('  - 新しいグリッドレイアウトの適用');
      if (hasOldGrid) console.log('  - 古いグリッドレイアウトの削除');
      if (!hasUnifiedStats) console.log('  - 統一された統計セクションの適用');
    }
    
    // 最低限のUIが機能していることを確認
    expect(await page.locator('h1').isVisible()).toBeTruthy();
    expect(await page.locator('button').count()).toBeGreaterThan(0);
  });

  test('レスポンシブデザイン確認', async ({ page }) => {
    await page.goto('/timeline');
    await page.waitForTimeout(2000);
    
    // デスクトップサイズ
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'timeline-ui-desktop.png', fullPage: true });
    
    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'timeline-ui-tablet.png', fullPage: true });
    
    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'timeline-ui-mobile.png', fullPage: true });
    
    console.log('レスポンシブデザインのスクリーンショットを保存しました');
  });

  test('ナビゲーション確認', async ({ page }) => {
    console.log('🧭 商品履歴画面へのナビゲーション確認');
    
    // ダッシュボードから開始
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // サイドメニューの「商品履歴」リンクを探す
    const timelineLink = page.locator('a[href="/timeline"], a:has-text("商品履歴")');
    const isTimelineLinkVisible = await timelineLink.isVisible();
    
    console.log(`商品履歴リンク: ${isTimelineLinkVisible ? '✅ 表示中' : '❌ 未表示'}`);
    
    if (isTimelineLinkVisible) {
      // リンクをクリック
      await timelineLink.click();
      await page.waitForTimeout(3000);
      
      // 正しいページに遷移したか確認
      const currentUrl = page.url();
      console.log(`遷移後URL: ${currentUrl}`);
      expect(currentUrl).toContain('/timeline');
      
      console.log('✅ サイドメニューからの遷移が正常に動作しています');
    } else {
      console.log('❌ サイドメニューに商品履歴リンクが見つかりません');
    }
  });
}); 