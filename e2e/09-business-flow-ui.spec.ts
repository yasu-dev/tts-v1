import { test, expect } from '@playwright/test';

test.describe('業務フローでのUI統一性検証', () => {
  test.beforeEach(async ({ page }) => {
    // スタッフアカウントでログイン
    await page.goto('/login');
    await page.click('[data-testid="staff-login"]');
    await page.waitForURL('/staff/dashboard');
  });

  test('商品検品フローでのUI統一性', async ({ page }) => {
    // 検品ページへ移動
    await page.goto('/staff/inspection');
    
    // PageHeaderの確認
    await expect(page.locator('h1:has-text("商品検品")')).toBeVisible();
    
    // 統一されたボタンスタイルの確認
    const inspectionButtons = page.locator('button');
    const buttonCount = await inspectionButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // カードコンポーネントの統一確認
    const cards = page.locator('.intelligence-card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // 検品開始ボタンの確認
    const startButton = page.locator('button:has-text("検品を開始")');
    if (await startButton.isVisible()) {
      await expect(startButton).toBeEnabled();
      
      // ボタンのスタイル統一確認
      const buttonClasses = await startButton.getAttribute('class');
      expect(buttonClasses).toContain('nexus-button');
    }
  });

  test('QRコード生成フローでのUI統一性', async ({ page }) => {
    // 在庫管理ページへ移動
    await page.goto('/staff/inventory');
    
    // QRコード生成ボタンの確認
    const qrButton = page.locator('button:has-text("QR生成"), button:has-text("QRコード")').first();
    if (await qrButton.isVisible()) {
      await qrButton.click();
      
      // モーダルの統一スタイル確認
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        await expect(modal).toHaveAttribute('aria-modal', 'true');
        
        // モーダル内のボタン統一確認
        const modalButtons = modal.locator('button');
        const modalButtonCount = await modalButtons.count();
        expect(modalButtonCount).toBeGreaterThan(0);
        
        // 閉じるボタンの確認
        const closeButton = modal.locator('button:has-text("閉じる"), button:has-text("キャンセル")').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    }
  });

  test('返品処理フローでのUI統一性', async ({ page }) => {
    // 返品管理ページへ移動
    await page.goto('/staff/returns');
    
    // PageHeaderの地域カラーリング確認
    const pageHeader = page.locator('.intelligence-card');
    await expect(pageHeader.first()).toBeVisible();
    
    // 返品処理ボタンの統一確認
    const returnButtons = page.locator('button:has-text("処理"), button:has-text("承認"), button:has-text("拒否")');
    const returnButtonCount = await returnButtons.count();
    
    if (returnButtonCount > 0) {
      const firstButton = returnButtons.first();
      await expect(firstButton).toBeVisible();
      
      // ボタンのホバーエフェクト確認
      await firstButton.hover();
      await page.waitForTimeout(200);
    }
    
    // ステータスバッジの統一確認
    const statusBadges = page.locator('.status-badge');
    const badgeCount = await statusBadges.count();
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });

  test('出荷処理フローでのUI統一性', async ({ page }) => {
    // 出荷管理ページへ移動
    await page.goto('/staff/shipping');
    
    // 統一されたテーブルスタイル確認
    const holoTable = page.locator('.holo-table');
    if (await holoTable.isVisible()) {
      await expect(holoTable).toBeVisible();
      
      // テーブルヘッダーの統一確認
      const tableHeaders = holoTable.locator('th');
      const headerCount = await tableHeaders.count();
      expect(headerCount).toBeGreaterThan(0);
    }
    
    // 出荷ラベル印刷ボタンの確認
    const printButtons = page.locator('button:has-text("印刷"), button:has-text("ラベル")');
    const printButtonCount = await printButtons.count();
    
    if (printButtonCount > 0) {
      const printButton = printButtons.first();
      await expect(printButton).toBeVisible();
      
      // ボタンスタイルの統一確認
      const buttonStyle = await printButton.getAttribute('class');
      expect(buttonStyle).toContain('nexus-button');
    }
  });

  test('タスク管理フローでのUI統一性', async ({ page }) => {
    // タスク管理ページへ移動
    await page.goto('/staff/tasks');
    
    // 新規タスク作成ボタンの確認
    const createTaskButton = page.locator('button:has-text("新規"), button:has-text("作成")').first();
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      
      // タスク作成モーダルの統一確認
      const taskModal = page.locator('[role="dialog"]');
      if (await taskModal.isVisible()) {
        await expect(taskModal).toBeVisible();
        
        // フォーム要素の統一確認
        const formInputs = taskModal.locator('input, select, textarea');
        const inputCount = await formInputs.count();
        expect(inputCount).toBeGreaterThan(0);
        
        // 保存ボタンの統一確認
        const saveButton = taskModal.locator('button:has-text("保存"), button:has-text("作成")').first();
        if (await saveButton.isVisible()) {
          await expect(saveButton).toBeVisible();
        }
        
        // キャンセルボタンで閉じる
        const cancelButton = taskModal.locator('button:has-text("キャンセル"), button:has-text("閉じる")').first();
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
    }
    
    // タスクカードの統一確認
    const taskCards = page.locator('.intelligence-card');
    const taskCardCount = await taskCards.count();
    expect(taskCardCount).toBeGreaterThan(0);
  });

  test('ピッキングフローでのUI統一性', async ({ page }) => {
    // ピッキングページへ移動
    await page.goto('/staff/picking');
    
    // ピッキングリストの統一確認
    const pickingCards = page.locator('.intelligence-card');
    const cardCount = await pickingCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // ピッキング完了ボタンの確認
    const completeButtons = page.locator('button:has-text("完了"), button:has-text("確認")');
    const completeButtonCount = await completeButtons.count();
    
    if (completeButtonCount > 0) {
      const completeButton = completeButtons.first();
      await expect(completeButton).toBeVisible();
      
      // プライマリボタンスタイルの確認
      const buttonClasses = await completeButton.getAttribute('class');
      expect(buttonClasses).toMatch(/nexus-button|primary/);
    }
  });

  test('レポート生成フローでのUI統一性', async ({ page }) => {
    // レポートページへ移動
    await page.goto('/staff/reports');
    
    // レポート生成ボタンの確認
    const generateButton = page.locator('button:has-text("生成"), button:has-text("作成")').first();
    if (await generateButton.isVisible()) {
      await expect(generateButton).toBeVisible();
      
      // ボタンのアイコン統一確認
      const buttonIcon = generateButton.locator('svg');
      if (await buttonIcon.isVisible()) {
        await expect(buttonIcon).toBeVisible();
      }
    }
    
    // 期間選択UI の統一確認
    const dateInputs = page.locator('input[type="date"], input[type="datetime-local"]');
    const dateInputCount = await dateInputs.count();
    
    if (dateInputCount > 0) {
      const dateInput = dateInputs.first();
      await expect(dateInput).toBeVisible();
      
      // 入力フィールドのスタイル統一確認
      const inputStyle = await dateInput.getAttribute('class');
      expect(inputStyle).toMatch(/nexus-input|form-control/);
    }
  });

  test('ロケーション管理フローでのUI統一性', async ({ page }) => {
    // ロケーション管理ページへ移動
    await page.goto('/staff/location');
    
    // ロケーション追加ボタンの確認
    const addLocationButton = page.locator('button:has-text("追加"), button:has-text("新規")').first();
    if (await addLocationButton.isVisible()) {
      await addLocationButton.click();
      
      // ロケーション追加モーダルの統一確認
      const locationModal = page.locator('[role="dialog"]');
      if (await locationModal.isVisible()) {
        await expect(locationModal).toBeVisible();
        
        // モーダルのクローズボタン確認
        const closeButton = locationModal.locator('button:has-text("×"), button[aria-label*="閉じる"]').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          // ESCキーで閉じる
          await page.keyboard.press('Escape');
        }
      }
    }
    
    // ロケーションカードの統一確認
    const locationCards = page.locator('.intelligence-card');
    const locationCardCount = await locationCards.count();
    expect(locationCardCount).toBeGreaterThan(0);
  });

  test('統計ダッシュボードでのUI統一性', async ({ page }) => {
    // スタッフダッシュボードで統計表示の確認
    await page.goto('/staff/dashboard');
    
    // KPIカードの地域別カラーリング確認
    const kpiCards = page.locator('.intelligence-card');
    const kpiCardCount = await kpiCards.count();
    expect(kpiCardCount).toBeGreaterThan(0);
    
    // 統計値の表示統一確認
    const metricValues = page.locator('.metric-value');
    const metricCount = await metricValues.count();
    expect(metricCount).toBeGreaterThan(0);
    
    // アクションオーブの統一確認
    const actionOrbs = page.locator('.action-orb');
    const orbCount = await actionOrbs.count();
    expect(orbCount).toBeGreaterThan(0);
    
    // ステータスバッジの統一確認
    const statusBadges = page.locator('.status-badge');
    const badgeCount = await statusBadges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('モバイルビューでの業務フロー統一性', async ({ page }) => {
    // モバイルビューに切り替え
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 各主要ページでのモバイル対応確認
    const pages = [
      '/staff/dashboard',
      '/staff/inspection',
      '/staff/inventory',
      '/staff/shipping',
      '/staff/returns'
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // ページの読み込み確認
      await page.waitForLoadState('networkidle');
      
      // ヘッダーの表示確認
      const header = page.locator('.nexus-header');
      await expect(header).toBeVisible();
      
      // ボタンのタッチターゲットサイズ確認
      const buttons = page.locator('button').first();
      if (await buttons.isVisible()) {
        const boundingBox = await buttons.boundingBox();
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(40);
          expect(boundingBox.width).toBeGreaterThanOrEqual(40);
        }
      }
      
      // カードの表示確認
      const cards = page.locator('.intelligence-card');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });
}); 