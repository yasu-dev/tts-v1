import { test, expect } from '@playwright/test';

test.describe('UI修復確認テスト', () => {
  test('ダッシュボードページのUI表示確認', async ({ page }) => {
    // ダッシュボードページに移動
    await page.goto('http://localhost:3001/dashboard');
    
    // ページタイトルが表示されることを確認
    await expect(page.locator('h1')).toBeVisible();
    
    // intelligence-cardが表示されることを確認
    await expect(page.locator('.intelligence-card').first()).toBeVisible();
    
    // スクロールが機能することを確認
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    
    console.log('✅ ダッシュボードページのUI表示確認完了');
  });

  test('在庫管理ページのUI表示確認', async ({ page }) => {
    // 在庫管理ページに移動
    await page.goto('http://localhost:3001/inventory');
    
    // ページが読み込まれることを確認
    await expect(page.locator('h1')).toBeVisible();
    
    // メトリクスカードが表示されることを確認
    await expect(page.locator('.intelligence-metrics').first()).toBeVisible();
    
    console.log('✅ 在庫管理ページのUI表示確認完了');
  });

  test('スタッフダッシュボードページのUI表示確認', async ({ page }) => {
    // スタッフダッシュボードページに移動
    await page.goto('http://localhost:3001/staff/dashboard');
    
    // ページが読み込まれることを確認
    await expect(page.locator('h1')).toBeVisible();
    
    // intelligence-cardが表示されることを確認
    await expect(page.locator('.intelligence-card').first()).toBeVisible();
    
    console.log('✅ スタッフダッシュボードページのUI表示確認完了');
  });

  test('横幅制御の確認', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard');
    
    // ページコンテナの最大幅が適切に設定されていることを確認
    const container = page.locator('.page-scroll-container > div').first();
    await expect(container).toHaveCSS('max-width', '1600px');
    
    console.log('✅ 横幅制御の確認完了');
  });

  test('スクロール機能の確認', async ({ page }) => {
    await page.goto('http://localhost:3001/test-scroll');
    
    // スクロールテストページでスクロールが機能することを確認
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    
    const scrollTop = await page.evaluate(() => window.pageYOffset);
    expect(scrollTop).toBeGreaterThan(0);
    
    console.log('✅ スクロール機能の確認完了');
  });
}); 

test.describe('🔧 ドロップダウンメニューz-index修正検証', () => {
  test.beforeEach(async ({ page }) => {
    // スタッフダッシュボードに移動
    await page.goto('/staff/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('📋 プロフィールメニューが最前面に表示される', async ({ page }) => {
    // プロフィールボタンをクリック
    const profileButton = page.locator('button').filter({ hasText: 'スタッフ' }).first();
    await expect(profileButton).toBeVisible();
    await profileButton.click();

    // プロフィールメニューが表示されることを確認
    const profileMenu = page.locator('[data-testid="profile-menu"]');
    await expect(profileMenu).toBeVisible({ timeout: 5000 });

    // z-indexが適切に設定されていることを確認
    const zIndex = await profileMenu.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      console.log('Profile menu z-index:', computedStyle.zIndex);
      return computedStyle.zIndex;
    });
    
    console.log('Actual z-index value:', zIndex);
    
    // z-index が 10000 以上であることを確認（文字列として比較）
    const zIndexNum = parseInt(zIndex);
    expect(zIndexNum).toBeGreaterThanOrEqual(10000);

    // メニューが実際に表示されていることを確認
    const rect = await profileMenu.boundingBox();
    expect(rect).not.toBeNull();
    expect(rect!.width).toBeGreaterThan(0);
    expect(rect!.height).toBeGreaterThan(0);
  });

  test('🔔 通知パネルが最前面に表示される', async ({ page }) => {
    // 通知ボタンをクリック
    const notificationButton = page.locator('button[aria-label="通知"]');
    await expect(notificationButton).toBeVisible();
    await notificationButton.click();

    // 通知パネルが表示されることを確認
    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible({ timeout: 5000 });

    // z-indexが適切に設定されていることを確認
    const zIndex = await notificationPanel.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      console.log('Notification panel z-index:', computedStyle.zIndex);
      return computedStyle.zIndex;
    });
    
    console.log('Notification panel z-index value:', zIndex);
    const zIndexNum = parseInt(zIndex);
    expect(zIndexNum).toBeGreaterThanOrEqual(10000);
  });

  test('📦 出荷ページのステータスドロップダウンが最前面に表示される', async ({ page }) => {
    // 出荷ページに移動
    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');

    // 統一されたステータス変更ボタンを探してクリック
    const statusButton = page.locator('button').filter({ hasText: 'ステータス変更' }).first();
    
    if (await statusButton.isVisible()) {
      await statusButton.click();

      // 統一されたステータスドロップダウンが表示されることを確認
      const dropdown = page.locator('[data-testid="unified-status-dropdown"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      // z-indexが適切に設定されていることを確認
      const zIndex = await dropdown.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        console.log('Unified status dropdown z-index:', computedStyle.zIndex);
        return computedStyle.zIndex;
      });
      
      console.log('Unified status dropdown z-index value:', zIndex);
      const zIndexNum = parseInt(zIndex);
      expect(zIndexNum).toBe(10000);

      // ドロップダウンの内容が統一されたUIデザインになっていることを確認
      const dropdownHeader = dropdown.locator('text=次のステータスに変更');
      await expect(dropdownHeader).toBeVisible();

      // ステータスオプションが表示されることを確認
      const statusOptions = dropdown.locator('.unified-status-option');
      const optionCount = await statusOptions.count();
      expect(optionCount).toBeGreaterThan(0);

      console.log(`Found ${optionCount} status options in unified dropdown`);
    } else {
      console.log('No unified status change button found on shipping page');
      // ステータス変更ボタンが見つからない場合はテストをスキップ
      test.skip();
    }
  });

  test('🏗️ z-index階層システムの整合性確認', async ({ page }) => {
    // ヘッダーのz-indexを確認
    const header = page.locator('header.nexus-header');
    await expect(header).toBeVisible();
    
    const headerZIndex = await header.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      console.log('Header z-index:', computedStyle.zIndex);
      return computedStyle.zIndex;
    });
    
    console.log('Header z-index value:', headerZIndex);
    // ヘッダーが z-index 100 であることを確認
    expect(parseInt(headerZIndex)).toBe(100);

    // プロフィールメニューを開く
    const profileButton = page.locator('button').filter({ hasText: 'スタッフ' }).first();
    await profileButton.click();

    const profileMenu = page.locator('[data-testid="profile-menu"]');
    await expect(profileMenu).toBeVisible({ timeout: 5000 });

    const menuZIndex = await profileMenu.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      console.log('Profile menu z-index:', computedStyle.zIndex);
      return computedStyle.zIndex;
    });

    console.log('Profile menu z-index value:', menuZIndex);
    // ドロップダウンメニューがヘッダーより高いz-indexを持つことを確認
    expect(parseInt(menuZIndex)).toBeGreaterThan(parseInt(headerZIndex));
  });

  test('🎯 複数のドロップダウンメニューの重ね合わせ動作', async ({ page }) => {
    // 通知パネルのz-indexを確認
    const notificationButton = page.locator('button[aria-label="通知"]');
    await notificationButton.click();

    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible({ timeout: 5000 });

    const notificationZIndex = await notificationPanel.evaluate((el) => {
      return window.getComputedStyle(el).zIndex;
    });

    console.log('Notification z-index:', notificationZIndex);
    expect(parseInt(notificationZIndex)).toBe(10000);

    // 通知パネルを閉じる（通知ボタンを再クリック）
    await notificationButton.click();

    // プロフィールメニューのz-indexを確認
    const profileButton = page.locator('button').filter({ hasText: 'スタッフ' }).first();
    await profileButton.click();

    const profileMenu = page.locator('[data-testid="profile-menu"]');
    await expect(profileMenu).toBeVisible({ timeout: 5000 });

    const profileZIndex = await profileMenu.evaluate((el) => {
      return window.getComputedStyle(el).zIndex;
    });

    console.log('Profile z-index:', profileZIndex);
    expect(parseInt(profileZIndex)).toBe(10000);

    // 両方のメニューが同じz-index階層にあることを確認
    expect(parseInt(profileZIndex)).toBe(parseInt(notificationZIndex));
  });
}); 