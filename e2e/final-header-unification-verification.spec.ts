import { test, expect } from '@playwright/test';

const VERIFIED_SCREENS = [
  // セラー画面
  { path: '/dashboard', title: 'セラーダッシュボード', userType: 'seller' },
  { path: '/inventory', title: '在庫管理', userType: 'seller' },
  { path: '/sales', title: '販売管理', userType: 'seller' },
  { path: '/returns', title: '返品管理', userType: 'seller' },
  { path: '/delivery', title: '納品管理', userType: 'seller' },
  { path: '/billing', title: '請求管理', userType: 'seller' },
  { path: '/profile', title: 'プロフィール設定', userType: 'seller' },
  { path: '/settings', title: '設定', userType: 'seller' },
  
  // スタッフ画面
  { path: '/staff/dashboard', title: '業務レポート', userType: 'staff' },
  { path: '/staff/tasks', title: 'タスク管理', userType: 'staff' },
  { path: '/staff/returns', title: '返品処理', userType: 'staff' },
  { path: '/staff/reports', title: '業務レポート', userType: 'staff' },
  { path: '/staff/inventory', title: 'スタッフ在庫管理', userType: 'staff' },
  { path: '/staff/picking', title: 'ピッキングリスト', userType: 'staff' },
  { path: '/staff/location', title: 'ロケーション管理', userType: 'staff' },
  { path: '/staff/shipping', title: '出荷管理', userType: 'staff' },
];

const UNIFIED_HEADER_SPECIFICATIONS = {
  // 統一されたアイコン（clipboard）
  icon: {
    selector: '[data-testid="unified-page-header"] svg',
    expectedClass: 'w-8 h-8 text-nexus-yellow',
    expectedPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
  },
  // 統一されたタイトルスタイル
  title: {
    selector: '[data-testid="unified-page-header"] h1',
    expectedClass: 'text-3xl font-display font-bold text-nexus-text-primary'
  },
  // 統一されたサブタイトルスタイル
  subtitle: {
    selector: '[data-testid="unified-page-header"] p',
    expectedClass: 'text-nexus-text-secondary'
  },
  // 統一されたパディング
  container: {
    selector: '[data-testid="unified-page-header"] .intelligence-card',
    expectedClass: 'intelligence-card global'
  },
  padding: {
    selector: '[data-testid="unified-page-header"] .p-8',
    expectedClass: 'p-8'
  }
};

test.describe('🎯 全画面ヘッダー統一性検証 - 最終確認', () => {
  test.beforeEach(async ({ page }) => {
    // デバッグモードを有効化
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  for (const screen of VERIFIED_SCREENS) {
    test(`📱 ${screen.userType.toUpperCase()} - ${screen.title} - ヘッダー統一性確認`, async ({ page }) => {
      // 画面に移動
      await page.goto(screen.path);
      await page.waitForTimeout(2000);

      // UnifiedPageHeaderの存在確認
      const unifiedHeader = page.locator('[data-testid="unified-page-header"]');
      await expect(unifiedHeader).toBeVisible({ timeout: 10000 });

      console.log(`✅ ${screen.title}: UnifiedPageHeaderが確認されました`);

      // 📌 1. アイコンの統一性確認
      const icon = unifiedHeader.locator('svg').first();
      await expect(icon).toBeVisible();
      
      // アイコンのクラス確認
      await expect(icon).toHaveClass(/w-8 h-8 text-nexus-yellow/);
      
      // clipboardアイコンのpath確認（統一アイコン）
      const pathElement = icon.locator('path');
      const pathD = await pathElement.getAttribute('d');
      expect(pathD).toContain('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2');

      console.log(`✅ ${screen.title}: 統一アイコン(clipboard)が確認されました`);

      // 📌 2. タイトルの統一性確認
      const title = unifiedHeader.locator('h1');
      await expect(title).toBeVisible();
      await expect(title).toHaveClass(/text-3xl font-display font-bold text-nexus-text-primary/);
      
      const titleText = await title.textContent();
      expect(titleText?.trim()).toBe(screen.title);

      console.log(`✅ ${screen.title}: 統一タイトルスタイルが確認されました`);

      // 📌 3. サブタイトルの統一性確認（存在する場合）
      const subtitle = unifiedHeader.locator('p');
      if (await subtitle.count() > 0) {
        await expect(subtitle).toHaveClass(/text-nexus-text-secondary/);
        console.log(`✅ ${screen.title}: 統一サブタイトルスタイルが確認されました`);
      }

      // 📌 4. コンテナの統一性確認
      const container = unifiedHeader.locator('.intelligence-card');
      await expect(container).toBeVisible();
      await expect(container).toHaveClass(/intelligence-card global/);

      console.log(`✅ ${screen.title}: 統一コンテナスタイルが確認されました`);

      // 📌 5. パディングの統一性確認
      const paddingDiv = unifiedHeader.locator('.p-8');
      await expect(paddingDiv).toBeVisible();

      console.log(`✅ ${screen.title}: 統一パディング(p-8)が確認されました`);

      // 📌 6. レイアウトの統一性確認
      const flexContainer = unifiedHeader.locator('.flex');
      await expect(flexContainer).toBeVisible();

      console.log(`✅ ${screen.title}: 統一レイアウトが確認されました`);

      // スクリーンショット撮影（デバッグ用）
      await page.screenshot({ 
        path: `test-results/header-unified-${screen.userType}-${screen.path.replace(/\//g, '-')}.png`,
        fullPage: false
      });

      console.log(`🎯 ${screen.title}: 全ての統一性要件をクリアしました！`);
    });
  }

  test('📊 統一性サマリー確認', async ({ page }) => {
    let passedScreens = 0;
    let totalScreens = VERIFIED_SCREENS.length;

    for (const screen of VERIFIED_SCREENS) {
      try {
        await page.goto(screen.path);
        await page.waitForTimeout(1000);

        const unifiedHeader = page.locator('[data-testid="unified-page-header"]');
        if (await unifiedHeader.isVisible()) {
          passedScreens++;
        }
      } catch (error) {
        console.log(`❌ ${screen.title}: ヘッダー統一性チェック失敗`);
      }
    }

    console.log(`\n🎯 ヘッダー統一性サマリー:`);
    console.log(`✅ 統一済み画面: ${passedScreens}/${totalScreens}`);
    console.log(`📊 統一率: ${Math.round((passedScreens / totalScreens) * 100)}%`);

    // 統一率が80%以上であることを確認
    expect(passedScreens / totalScreens).toBeGreaterThanOrEqual(0.8);
  });

  test('🔍 ヘッダー要素詳細分析', async ({ page }) => {
    // 代表的な画面でヘッダー要素を詳細分析
    const testScreen = VERIFIED_SCREENS[0]; // ダッシュボード
    await page.goto(testScreen.path);
    await page.waitForTimeout(2000);

    const unifiedHeader = page.locator('[data-testid="unified-page-header"]');
    await expect(unifiedHeader).toBeVisible();

    // レイアウト分析
    const boundingBox = await unifiedHeader.boundingBox();
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.width).toBeGreaterThan(300);

    // アイコンとタイトルの位置関係確認
    const icon = unifiedHeader.locator('svg').first();
    const title = unifiedHeader.locator('h1');
    
    const iconBox = await icon.boundingBox();
    const titleBox = await title.boundingBox();
    
    expect(iconBox).toBeTruthy();
    expect(titleBox).toBeTruthy();
    
    // アイコンがタイトルの左側にあることを確認
    expect(iconBox!.x).toBeLessThan(titleBox!.x);

    console.log('🎯 ヘッダーレイアウト分析完了');
  });
}); 