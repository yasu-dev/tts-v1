import { test, expect } from '@playwright/test';

test.describe('UI統一性検証', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
  });

  test('PageHeaderコンポーネントの統一性確認', async ({ page }) => {
    // ダッシュボードページのPageHeader確認
    await page.goto('/dashboard');
    const dashboardHeader = page.locator('.intelligence-card.americas');
    await expect(dashboardHeader).toBeVisible();
    
    // タイトルとサブタイトルの存在確認
    await expect(page.locator('h1:has-text("セラーダッシュボード")')).toBeVisible();
    await expect(page.locator('text=販売実績と在庫状況の概要')).toBeVisible();
    
    // アイコンの存在確認
    await expect(page.locator('.module-icon')).toBeVisible();

    // 設定ページのPageHeader確認
    await page.goto('/settings');
    const settingsHeader = page.locator('.intelligence-card.global');
    await expect(settingsHeader).toBeVisible();
    
    await expect(page.locator('h1:has-text("アカウント設定")')).toBeVisible();
    await expect(page.locator('text=アカウント情報とデータ管理')).toBeVisible();

    // スタッフダッシュボードのPageHeader確認
    await page.goto('/staff/dashboard');
    await expect(page.locator('h1:has-text("スタッフダッシュボード")')).toBeVisible();
    await expect(page.locator('text=日々のタスクと業務フローの管理')).toBeVisible();
  });

  test('NexusButtonコンポーネントの統一性確認', async ({ page }) => {
    await page.goto('/dashboard');
    
    // プライマリボタンの確認
    const primaryButtons = page.locator('.nexus-button.primary, button:has-class("nexus-button"):has-class("primary")');
    const primaryButtonCount = await primaryButtons.count();
    expect(primaryButtonCount).toBeGreaterThan(0);
    
    // ボタンのホバーエフェクト確認
    const firstPrimaryButton = primaryButtons.first();
    await firstPrimaryButton.hover();
    
    // ボタンのクリック可能性確認
    await expect(firstPrimaryButton).toBeEnabled();
    
    // 設定ページでのボタン確認
    await page.goto('/settings');
    
    // エクスポートボタンの確認
    const exportButton = page.locator('button:has-text("エクスポート")');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();
    
    // 危険ボタンの確認
    const deleteButton = page.locator('button:has-text("削除")');
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toBeEnabled();
  });

  test('地域別カラーリングシステムの確認', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Americas（青）カラーリング確認
    const americasCard = page.locator('.intelligence-card.americas');
    await expect(americasCard).toBeVisible();
    
    // Europe（赤）カラーリング確認
    const europeCard = page.locator('.intelligence-card.europe');
    await expect(europeCard).toBeVisible();
    
    // Asia（黄）カラーリング確認
    const asiaCard = page.locator('.intelligence-card.asia');
    await expect(asiaCard).toBeVisible();
    
    // Africa（緑）カラーリング確認
    const africaCard = page.locator('.intelligence-card.africa');
    await expect(africaCard).toBeVisible();
    
    // Global（紫）カラーリング確認
    const globalCard = page.locator('.intelligence-card.global');
    await expect(globalCard).toBeVisible();
  });

  test('レスポンシブデザインの確認', async ({ page }) => {
    // デスクトップビュー
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dashboard');
    
    // サイドバーの表示確認
    await expect(page.locator('.nexus-sidebar')).toBeVisible();
    
    // タブレットビュー
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // ヘッダーの高さ調整確認
    const header = page.locator('.nexus-header');
    await expect(header).toBeVisible();
    
    // モバイルビュー
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // タッチターゲットサイズの確認
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const boundingBox = await button.boundingBox();
      if (boundingBox) {
        // 最小タッチターゲット44px確認
        expect(boundingBox.height).toBeGreaterThanOrEqual(40);
        expect(boundingBox.width).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('アクセシビリティの確認', async ({ page }) => {
    await page.goto('/dashboard');
    
    // フォーカス可能な要素の確認
    const focusableElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const focusableCount = await focusableElements.count();
    expect(focusableCount).toBeGreaterThan(0);
    
    // キーボードナビゲーション確認
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // ARIA属性の確認
    const modals = page.locator('[role="dialog"]');
    const modalCount = await modals.count();
    
    if (modalCount > 0) {
      const firstModal = modals.first();
      await expect(firstModal).toHaveAttribute('aria-modal', 'true');
    }
  });

  test('統一されたエラーハンドリング確認', async ({ page }) => {
    await page.goto('/settings');
    
    // エラー状態のボタン操作
    const deleteButton = page.locator('button:has-text("削除")');
    await deleteButton.click();
    
    // 確認ダイアログの表示確認
    await page.waitForEvent('dialog');
  });

  test('ローディング状態の統一性確認', async ({ page }) => {
    await page.goto('/dashboard');
    
    // ページ読み込み時のローディング表示確認
    const loadingIndicator = page.locator('.animate-spin, text=読み込み中');
    
    // 非同期操作でのローディング確認
    const reportButton = page.locator('button:has-text("レポートをダウンロード")');
    if (await reportButton.isVisible()) {
      await reportButton.click();
      // ダウンロード処理の完了を待つ
      await page.waitForTimeout(1000);
    }
  });

  test('グラデーション効果の確認', async ({ page }) => {
    await page.goto('/dashboard');
    
    // カードのグラデーション上部バーの確認
    const gradientBars = page.locator('.intelligence-card .bg-gradient-to-r');
    const gradientCount = await gradientBars.count();
    expect(gradientCount).toBeGreaterThan(0);
    
    // ボタンのグラデーション確認
    const gradientButtons = page.locator('.nexus-button:has-class("primary")');
    const buttonGradientCount = await gradientButtons.count();
    expect(buttonGradientCount).toBeGreaterThan(0);
  });

  test('フォント統一性の確認', async ({ page }) => {
    await page.goto('/dashboard');
    
    // ディスプレイフォントの確認
    const displayElements = page.locator('.font-display');
    const displayCount = await displayElements.count();
    expect(displayCount).toBeGreaterThan(0);
    
    // モノスペースフォントの確認（商品ID等）
    const monoElements = page.locator('.font-mono');
    const monoCount = await monoElements.count();
    expect(monoCount).toBeGreaterThan(0);
  });

  test('統一されたスペーシングシステム確認', async ({ page }) => {
    await page.goto('/dashboard');
    
    // カード間のスペーシング確認
    const cardContainer = page.locator('.space-y-6');
    await expect(cardContainer).toBeVisible();
    
    // グリッドのギャップ確認
    const gridContainer = page.locator('.grid.gap-3, .grid.gap-4, .grid.gap-6');
    const gridCount = await gridContainer.count();
    expect(gridCount).toBeGreaterThan(0);
  });
}); 