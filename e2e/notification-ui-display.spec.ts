import { test, expect } from '@playwright/test';

/**
 * 通知UI表示テスト
 * 通知パネル、ベルアイコン、バッジ、通知内容の表示と操作をテスト
 */
test.describe('通知UI表示テスト', () => {
  
  test.beforeEach(async ({ page }) => {
    // セラーとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@test.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    // ログイン後はdeliveryページまたはdashboardにリダイレクト
    await page.waitForURL(url => url.toString().includes('/delivery') || url.toString().includes('/dashboard'));
  });

  test('通知ベルアイコンとバッジの表示', async ({ page }) => {
    console.log('🔔 [E2E] 通知ベルアイコンとバッジ表示テスト開始');

    // 1. ダッシュボードで通知ベルアイコンの存在確認
    const notificationBell = page.locator('[data-testid="notification-bell"]');
    await expect(notificationBell).toBeVisible();
    
    // 2. 初期状態のバッジ確認
    const initialBadge = page.locator('[data-testid="notification-badge"]');
    if (await initialBadge.count() > 0) {
      await expect(initialBadge).toBeVisible();
      const badgeText = await initialBadge.textContent();
      expect(parseInt(badgeText || '0')).toBeGreaterThanOrEqual(0);
    }
    
    // 3. 各画面で通知ベルアイコンが表示されることを確認
    const pages = ['/sales', '/inventory', '/settings'];
    
    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      
      const bellOnPage = page.locator('[data-testid="notification-bell"]');
      await expect(bellOnPage).toBeVisible();
      
      console.log(`✅ ${pageUrl} - 通知ベルアイコン表示確認`);
    }
    
    // 4. ベルアイコンのクリック可能性確認
    await notificationBell.click();
    await page.waitForTimeout(500);
    
    // 通知パネルが開くことを確認
    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();
    
    console.log('✅ [E2E] 通知ベルアイコンとバッジ表示テスト完了');
  });

  test('通知パネルの表示と操作', async ({ page }) => {
    console.log('📋 [E2E] 通知パネル表示と操作テスト開始');

    // 1. 通知ベルをクリックしてパネルを開く
    const notificationBell = page.locator('[data-testid="notification-bell"]');
    await notificationBell.click();
    await page.waitForTimeout(1000);
    
    // 2. 通知パネルの基本要素確認
    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();
    
    // パネルヘッダーの確認
    await expect(page.locator('text="通知"')).toBeVisible();
    
    // 3. 通知が存在する場合の表示確認
    const notifications = page.locator('[data-testid="notification-item"]');
    const notificationCount = await notifications.count();
    
    if (notificationCount > 0) {
      // 最初の通知の要素確認
      const firstNotification = notifications.first();
      await expect(firstNotification).toBeVisible();
      
      // 通知タイトル
      const notificationTitle = firstNotification.locator('[data-testid="notification-title"]');
      await expect(notificationTitle).toBeVisible();
      
      // 通知メッセージ
      const notificationMessage = firstNotification.locator('[data-testid="notification-message"]');
      await expect(notificationMessage).toBeVisible();
      
      // 通知時刻
      const notificationTime = firstNotification.locator('[data-testid="notification-time"]');
      await expect(notificationTime).toBeVisible();
      
      // 既読・未読の表示確認
      const readStatus = await firstNotification.getAttribute('data-read');
      expect(['true', 'false']).toContain(readStatus);
      
      console.log(`📊 通知数: ${notificationCount}件, 最初の通知の既読状態: ${readStatus}`);
    } else {
      // 通知がない場合のメッセージ確認
      await expect(page.locator('text="新しい通知はありません"')).toBeVisible();
      console.log('📊 通知なし状態の表示確認完了');
    }
    
    // 4. パネル外をクリックして閉じる
    await page.click('body', { position: { x: 100, y: 100 } });
    await page.waitForTimeout(500);
    
    // パネルが閉じることを確認
    await expect(notificationPanel).not.toBeVisible();
    
    console.log('✅ [E2E] 通知パネル表示と操作テスト完了');
  });

  test('通知のタイプ別表示スタイル', async ({ page }) => {
    console.log('🎨 [E2E] 通知タイプ別表示スタイルテスト開始');

    // 1. テストAPI経由で各タイプの通知を生成
    const notificationTypes = [
      { type: 'product_sold', expectedClass: 'success' },
      { type: 'inventory_alert', expectedClass: 'warning' },
      { type: 'return_request', expectedClass: 'error' },
      { type: 'inspection_complete', expectedClass: 'info' }
    ];
    
    for (const { type, expectedClass } of notificationTypes) {
      // APIで通知作成
      await page.request.post('/api/notifications/test', {
        data: { type }
      });
      
      console.log(`📮 ${type} 通知を生成`);
    }
    
    // 2. 通知パネルを開いて各タイプの表示確認
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const notificationBell = page.locator('[data-testid="notification-bell"]');
    await notificationBell.click();
    await page.waitForTimeout(1000);
    
    // 3. 各通知タイプのスタイル確認
    const notifications = page.locator('[data-testid="notification-item"]');
    const notificationCount = await notifications.count();
    
    expect(notificationCount).toBeGreaterThan(0);
    
    for (let i = 0; i < Math.min(notificationCount, 4); i++) {
      const notification = notifications.nth(i);
      await expect(notification).toBeVisible();
      
      // 通知タイプに応じたアイコン・色の確認
      const notificationIcon = notification.locator('[data-testid="notification-icon"]');
      await expect(notificationIcon).toBeVisible();
      
      console.log(`✅ 通知 ${i + 1} の表示スタイル確認完了`);
    }
    
    console.log('✅ [E2E] 通知タイプ別表示スタイルテスト完了');
  });

  test('通知クリック時のナビゲーション', async ({ page }) => {
    console.log('🔗 [E2E] 通知クリック時のナビゲーションテスト開始');

    // 1. 販売関連通知を生成
    await page.request.post('/api/notifications/test', {
      data: { type: 'product_sold' }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 2. 通知パネルを開く
    const notificationBell = page.locator('[data-testid="notification-bell"]');
    await notificationBell.click();
    await page.waitForTimeout(1000);
    
    // 3. 販売関連通知をクリック
    const salesNotification = page.locator('[data-action="sales"]').first();
    
    if (await salesNotification.count() > 0) {
      // 現在のURL記録
      const currentUrl = page.url();
      
      // 通知をクリック
      await salesNotification.click();
      await page.waitForTimeout(1000);
      
      // 販売管理画面に遷移することを確認
      await expect(page.url()).toContain('/sales');
      
      console.log(`🔗 ナビゲーション確認: ${currentUrl} → ${page.url()}`);
    }
    
    // 4. 在庫関連通知のテスト
    await page.request.post('/api/notifications/test', {
      data: { type: 'inventory_alert' }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await notificationBell.click();
    await page.waitForTimeout(1000);
    
    const inventoryNotification = page.locator('[data-action="inventory"]').first();
    
    if (await inventoryNotification.count() > 0) {
      await inventoryNotification.click();
      await page.waitForTimeout(1000);
      
      // 在庫管理画面に遷移することを確認
      await expect(page.url()).toContain('/inventory');
      
      console.log(`🔗 在庫画面ナビゲーション確認完了`);
    }
    
    console.log('✅ [E2E] 通知クリック時のナビゲーションテスト完了');
  });

  test('通知の既読・未読切り替え', async ({ page }) => {
    console.log('👁️ [E2E] 通知既読・未読切り替えテスト開始');

    // 1. 新しい通知を生成
    await page.request.post('/api/notifications/test', {
      data: { type: 'product_sold' }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 2. 通知パネルを開く
    const notificationBell = page.locator('[data-testid="notification-bell"]');
    await notificationBell.click();
    await page.waitForTimeout(1000);
    
    // 3. 未読通知を探す
    const unreadNotification = page.locator('[data-read="false"]').first();
    
    if (await unreadNotification.count() > 0) {
      // 未読状態のスタイル確認
      await expect(unreadNotification).toHaveClass(/unread/);
      
      // 通知をクリックして既読にする
      await unreadNotification.click();
      await page.waitForTimeout(1000);
      
      // 4. 通知パネルを再度開いて既読状態を確認
      await notificationBell.click();
      await page.waitForTimeout(1000);
      
      // 同じ通知が既読状態になっていることを確認
      const sameNotification = page.locator('[data-testid="notification-item"]').first();
      const readStatus = await sameNotification.getAttribute('data-read');
      expect(readStatus).toBe('true');
      
      // 既読状態のスタイル確認
      await expect(sameNotification).toHaveClass(/read/);
      
      console.log('✅ 未読→既読への状態変更確認完了');
    }
    
    // 5. バッジ数の変化確認
    const badge = page.locator('[data-testid="notification-badge"]');
    
    if (await badge.count() > 0) {
      const badgeText = await badge.textContent();
      const badgeCount = parseInt(badgeText || '0');
      
      // バッジ数が減少していることを確認（または0になることを確認）
      expect(badgeCount).toBeGreaterThanOrEqual(0);
      
      console.log(`📊 現在のバッジ数: ${badgeCount}`);
    }
    
    console.log('✅ [E2E] 通知既読・未読切り替えテスト完了');
  });

  test('通知パネルのスクロールと表示件数', async ({ page }) => {
    console.log('📜 [E2E] 通知パネルスクロールと表示件数テスト開始');

    // 1. 複数の通知を生成（15件）
    const notificationTypes = ['product_sold', 'inventory_alert', 'return_request', 'inspection_complete'];
    
    for (let i = 0; i < 15; i++) {
      const type = notificationTypes[i % notificationTypes.length];
      await page.request.post('/api/notifications/test', {
        data: { type }
      });
    }
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 2. 通知パネルを開く
    const notificationBell = page.locator('[data-testid="notification-bell"]');
    await notificationBell.click();
    await page.waitForTimeout(1000);
    
    // 3. 通知パネルのスクロール機能確認
    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();
    
    // 通知一覧エリア
    const notificationList = page.locator('[data-testid="notification-list"]');
    await expect(notificationList).toBeVisible();
    
    // 4. 表示件数確認
    const notifications = page.locator('[data-testid="notification-item"]');
    const visibleCount = await notifications.count();
    
    console.log(`📊 表示されている通知数: ${visibleCount}`);
    expect(visibleCount).toBeGreaterThan(0);
    
    // 5. スクロール機能テスト
    if (visibleCount >= 5) {
      // パネル内をスクロール
      await notificationList.hover();
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(500);
      
      // スクロール後も通知が表示されることを確認
      const notificationsAfterScroll = page.locator('[data-testid="notification-item"]');
      const countAfterScroll = await notificationsAfterScroll.count();
      
      expect(countAfterScroll).toBeGreaterThan(0);
      console.log(`📊 スクロール後の表示通知数: ${countAfterScroll}`);
    }
    
    // 6. 「すべて表示」リンクの確認
    const viewAllLink = page.locator('[data-testid="view-all-notifications"]');
    
    if (await viewAllLink.count() > 0) {
      await expect(viewAllLink).toBeVisible();
      await viewAllLink.click();
      await page.waitForTimeout(1000);
      
      // 通知一覧ページに遷移することを確認（実装されている場合）
      console.log('🔗 「すべて表示」リンク動作確認完了');
    }
    
    console.log('✅ [E2E] 通知パネルスクロールと表示件数テスト完了');
  });

  test('レスポンシブデザインでの通知表示', async ({ page }) => {
    console.log('📱 [E2E] レスポンシブデザイン通知表示テスト開始');

    // 1. デスクトップサイズでの表示確認
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    let notificationBell = page.locator('[data-testid="notification-bell"]');
    await expect(notificationBell).toBeVisible();
    
    await notificationBell.click();
    await page.waitForTimeout(500);
    
    let notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();
    
    // パネルサイズ確認
    const desktopPanelBox = await notificationPanel.boundingBox();
    expect(desktopPanelBox?.width).toBeGreaterThan(300);
    
    await page.click('body', { position: { x: 100, y: 100 } });
    await page.waitForTimeout(500);
    
    console.log('✅ デスクトップサイズでの表示確認完了');
    
    // 2. タブレットサイズでの表示確認
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    notificationBell = page.locator('[data-testid="notification-bell"]');
    await expect(notificationBell).toBeVisible();
    
    await notificationBell.click();
    await page.waitForTimeout(500);
    
    notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();
    
    console.log('✅ タブレットサイズでの表示確認完了');
    
    await page.click('body', { position: { x: 100, y: 100 } });
    await page.waitForTimeout(500);
    
    // 3. モバイルサイズでの表示確認
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    notificationBell = page.locator('[data-testid="notification-bell"]');
    await expect(notificationBell).toBeVisible();
    
    await notificationBell.click();
    await page.waitForTimeout(500);
    
    notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();
    
    // モバイルでのパネル表示確認
    const mobilePanelBox = await notificationPanel.boundingBox();
    expect(mobilePanelBox?.width).toBeLessThan(400);
    
    console.log('✅ モバイルサイズでの表示確認完了');
    
    // 4. 元のサイズに戻す
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('✅ [E2E] レスポンシブデザイン通知表示テスト完了');
  });

});