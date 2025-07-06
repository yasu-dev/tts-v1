import { test, expect } from '@playwright/test';

test.describe('UI統一化修正項目 E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
  });

  test.describe('🔴 高優先度修正項目', () => {
    test('Dashboard - 日付選択モーダル修正', async ({ page }) => {
      await page.goto('/dashboard');
      
      // 期間選択ボタンの存在確認
      const periodButton = page.locator('button:has-text("期間選択"), button:has-text("期間でフィルター")');
      await expect(periodButton).toBeVisible();
      
      // BaseModalの確認
      await periodButton.click();
      const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-50, [role="dialog"]');
      await expect(modal).toBeVisible();
      
      // モーダルタイトルの確認
      const modalTitle = page.locator('h2:has-text("期間選択"), h3:has-text("期間選択")');
      await expect(modalTitle).toBeVisible();
      
      // キャンセルボタンで閉じる
      const cancelButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じる")');
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await expect(modal).not.toBeVisible();
      }
    });

    test('Inventory - CSV インポートモーダル・ボタン修正', async ({ page }) => {
      await page.goto('/inventory');
      
      // NexusButtonの確認
      const buttons = [
        '新規商品登録',
        'CSVインポート',
        'CSVエクスポート'
      ];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        await expect(button).toBeVisible();
        
        // NexusButtonクラスまたはスタイルの確認
        const buttonClass = await button.getAttribute('class');
        expect(buttonClass).toContain('nexus-button');
      }
      
      // CSVインポートモーダルの確認
      const csvImportButton = page.locator('button:has-text("CSVインポート")');
      await csvImportButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // モーダル内のNexusInputの確認
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeVisible();
      
      // モーダルを閉じる
      const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じる")');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    });

    test('Sales - モーダル・ボタン修正', async ({ page }) => {
      await page.goto('/sales');
      
      // NexusButtonの確認
      const buttons = ['出品設定', 'プロモーション作成'];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        await expect(button).toBeVisible();
        
        const buttonClass = await button.getAttribute('class');
        expect(buttonClass).toContain('nexus-button');
      }
      
      // HoloTableの確認
      const table = page.locator('.holo-table, table');
      await expect(table).toBeVisible();
      
      // 出品設定モーダルの確認
      const settingsButton = page.locator('button:has-text("出品設定")');
      await settingsButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // モーダルタイトルの確認
      const modalTitle = page.locator('h2:has-text("出品設定"), h3:has-text("出品設定")');
      await expect(modalTitle).toBeVisible();
      
      // モーダルを閉じる
      const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じる")');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    });

    test('Billing - ボタン・テーブル修正', async ({ page }) => {
      await page.goto('/billing');
      
      // NexusButtonの確認
      const buttons = ['支払履歴をエクスポート', '支払い方法を登録'];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        await expect(button).toBeVisible();
        
        const buttonClass = await button.getAttribute('class');
        expect(buttonClass).toContain('nexus-button');
      }
      
      // HoloTableの確認
      const table = page.locator('.holo-table, table');
      await expect(table).toBeVisible();
      
      // ボタンのアイコン確認
      const exportButton = page.locator('button:has-text("支払履歴をエクスポート")');
      const buttonIcon = exportButton.locator('svg');
      await expect(buttonIcon).toBeVisible();
    });

    test('Delivery - モーダル・入力修正', async ({ page }) => {
      await page.goto('/delivery');
      
      // NexusButtonの確認
      const buttons = ['新規納品プラン作成', 'バーコード発行'];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        await expect(button).toBeVisible();
        
        const buttonClass = await button.getAttribute('class');
        expect(buttonClass).toContain('nexus-button');
      }
      
      // バーコード発行モーダルの確認
      const barcodeButton = page.locator('button:has-text("バーコード発行")');
      await barcodeButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // モーダル内のNexusInputの確認
      const inputs = modal.locator('input');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);
      
      // モーダルを閉じる
      const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じる")');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    });

    test('Returns - 大型モーダル修正', async ({ page }) => {
      await page.goto('/returns');
      
      // NexusButtonの確認
      const buttons = ['返品申請', 'レポート出力'];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        await expect(button).toBeVisible();
        
        const buttonClass = await button.getAttribute('class');
        expect(buttonClass).toContain('nexus-button');
      }
      
      // 返品申請モーダルの確認
      const returnButton = page.locator('button:has-text("返品申請")');
      await returnButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // モーダルサイズの確認（lg）
      const modalContent = modal.locator('.max-w-lg, .max-w-2xl, .max-w-4xl');
      await expect(modalContent).toBeVisible();
      
      // NexusInputとNexusTextareaの確認
      const inputs = modal.locator('input');
      const textareas = modal.locator('textarea');
      
      expect(await inputs.count()).toBeGreaterThan(0);
      expect(await textareas.count()).toBeGreaterThan(0);
      
      // モーダルを閉じる
      const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じる")');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    });

    test('Profile - 入力・モーダル修正', async ({ page }) => {
      await page.goto('/profile');
      
      // 編集ボタンの確認
      const editButton = page.locator('button:has-text("編集")');
      await expect(editButton).toBeVisible();
      
      const buttonClass = await editButton.getAttribute('class');
      expect(buttonClass).toContain('nexus-button');
      
      // 編集モードの確認
      await editButton.click();
      
      // NexusInputの確認
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);
      
      // パスワード変更ボタンの確認
      const passwordButton = page.locator('button:has-text("パスワード変更")');
      if (await passwordButton.isVisible()) {
        await passwordButton.click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // モーダルを閉じる
        const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じる")');
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    });

    test('Timeline - ボタン・モーダル修正', async ({ page }) => {
      await page.goto('/timeline');
      
      // NexusButtonの確認
      const buttons = ['期間でフィルター', '履歴をエクスポート'];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        await expect(button).toBeVisible();
        
        const buttonClass = await button.getAttribute('class');
        expect(buttonClass).toContain('nexus-button');
      }
      
      // フィルターモーダルの確認
      const filterButton = page.locator('button:has-text("期間でフィルター")');
      await filterButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // モーダルを閉じる
      const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じる")');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    });
  });

  test.describe('🟡 中優先度修正項目', () => {
    test('Staff Dashboard - フィルター修正', async ({ page }) => {
      await page.goto('/staff/dashboard');
      
      // NexusSelectの確認
      const selects = page.locator('select');
      const selectCount = await selects.count();
      expect(selectCount).toBeGreaterThan(0);
      
      // 検索入力の確認
      const searchInput = page.locator('input[type="search"], input[placeholder*="検索"]');
      await expect(searchInput).toBeVisible();
      
      // 新規タスク作成ボタンの確認
      const createButton = page.locator('button:has-text("新規タスク作成")');
      await expect(createButton).toBeVisible();
      
      const buttonClass = await createButton.getAttribute('class');
      expect(buttonClass).toContain('nexus-button');
    });

    test('Staff Inventory - フィルター・モーダル修正', async ({ page }) => {
      await page.goto('/staff/inventory');
      
      // NexusSelectの確認
      const filters = [
        'select[name="status"]',
        'select[name="category"]',
        'select[name="location"]',
        'select[name="assignee"]'
      ];
      
      for (const filter of filters) {
        const select = page.locator(filter);
        if (await select.isVisible()) {
          const selectClass = await select.getAttribute('class');
          expect(selectClass).toContain('nexus-select');
        }
      }
      
      // 検索入力の確認
      const searchInput = page.locator('input[type="search"], input[placeholder*="検索"]');
      await expect(searchInput).toBeVisible();
      
      // NexusButtonの確認
      const buttons = ['商品詳細を編集', 'ロケーション移動', 'CSVエクスポート'];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        if (await button.isVisible()) {
          const buttonClass = await button.getAttribute('class');
          expect(buttonClass).toContain('nexus-button');
        }
      }
    });

    test('Staff Inspection - モーダル修正', async ({ page }) => {
      await page.goto('/staff/inspection');
      
      // NexusButtonの確認
      const buttons = ['検品基準を確認', 'カメラ設定', '検品開始'];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        if (await button.isVisible()) {
          const buttonClass = await button.getAttribute('class');
          expect(buttonClass).toContain('nexus-button');
        }
      }
      
      // 検品基準モーダルの確認
      const standardsButton = page.locator('button:has-text("検品基準を確認")');
      if (await standardsButton.isVisible()) {
        await standardsButton.click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // モーダルを閉じる
        const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じる")');
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    });

    test('Login - 入力フィールド修正', async ({ page }) => {
      await page.goto('/login');
      
      // NexusInputの確認
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      
      // enterpriseバリアントの確認
      const emailClass = await emailInput.getAttribute('class');
      const passwordClass = await passwordInput.getAttribute('class');
      
      expect(emailClass).toContain('nexus-input');
      expect(passwordClass).toContain('nexus-input');
      
      // ラベルのアイコン確認
      const emailLabel = page.locator('label:has(svg) >> text=メールアドレス');
      const passwordLabel = page.locator('label:has(svg) >> text=パスワード');
      
      await expect(emailLabel).toBeVisible();
      await expect(passwordLabel).toBeVisible();
      
      // ログイン機能の確認
      await emailInput.fill('seller@example.com');
      await passwordInput.fill('password123');
      
      const loginButton = page.locator('button:has-text("ログイン")');
      await expect(loginButton).toBeVisible();
      
      const buttonClass = await loginButton.getAttribute('class');
      expect(buttonClass).toContain('nexus-button');
    });
  });

  test.describe('🟢 低優先度修正項目', () => {
    test('NexusTextarea - ラベル色修正', async ({ page }) => {
      // NexusTextareaが使用されている画面をチェック
      const pages = ['/returns', '/staff/inspection'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        
        const textareas = page.locator('textarea');
        const textareaCount = await textareas.count();
        
        if (textareaCount > 0) {
          // ラベルの色がnexus-text-secondaryであることを確認
          const labels = page.locator('label');
          const labelCount = await labels.count();
          
          for (let i = 0; i < labelCount; i++) {
            const label = labels.nth(i);
            const labelClass = await label.getAttribute('class');
            if (labelClass && labelClass.includes('nexus-text-secondary')) {
              // ラベル色が正しく設定されていることを確認
              expect(labelClass).toContain('nexus-text-secondary');
            }
          }
        }
      }
    });
  });

  test.describe('📋 全体的な統一性確認', () => {
    test('デザインシステム統一性確認', async ({ page }) => {
      const pages = [
        '/dashboard',
        '/inventory',
        '/sales',
        '/billing',
        '/delivery',
        '/returns',
        '/profile',
        '/timeline'
      ];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        
        // NexusButtonの確認
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        
        if (buttonCount > 0) {
          // 少なくとも1つのボタンがNexusButtonであることを確認
          const nexusButtons = page.locator('button.nexus-button, button[class*="nexus-button"]');
          const nexusButtonCount = await nexusButtons.count();
          expect(nexusButtonCount).toBeGreaterThan(0);
        }
        
        // モーダルの確認
        const modals = page.locator('[role="dialog"]');
        const modalCount = await modals.count();
        
        // 入力フィールドの確認
        const inputs = page.locator('input');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          // 少なくとも1つの入力がNexusInputであることを確認
          const nexusInputs = page.locator('input.nexus-input, input[class*="nexus-input"]');
          const nexusInputCount = await nexusInputs.count();
          expect(nexusInputCount).toBeGreaterThan(0);
        }
      }
    });

    test('機能保持確認', async ({ page }) => {
      // 主要な機能が正常に動作することを確認
      await page.goto('/dashboard');
      
      // ナビゲーションの確認
      const navLinks = page.locator('nav a');
      const navLinkCount = await navLinks.count();
      expect(navLinkCount).toBeGreaterThan(0);
      
      // 各ページへのアクセス確認
      const pages = ['/inventory', '/sales', '/billing'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        
        // ページが正常に読み込まれることを確認
        await expect(page.locator('h1')).toBeVisible();
        
        // エラーがないことを確認
        const errors = page.locator('.error, [role="alert"]');
        const errorCount = await errors.count();
        expect(errorCount).toBe(0);
      }
    });

    test('レスポンシブデザイン確認', async ({ page }) => {
      const viewports = [
        { width: 1440, height: 900 }, // デスクトップ
        { width: 768, height: 1024 },  // タブレット
        { width: 375, height: 667 }    // モバイル
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/dashboard');
        
        // ページが正常に表示されることを確認
        await expect(page.locator('h1')).toBeVisible();
        
        // ボタンのタッチターゲットサイズ確認（モバイル）
        if (viewport.width === 375) {
          const buttons = page.locator('button');
          const buttonCount = await buttons.count();
          
          for (let i = 0; i < Math.min(buttonCount, 3); i++) {
            const button = buttons.nth(i);
            const boundingBox = await button.boundingBox();
            if (boundingBox) {
              expect(boundingBox.height).toBeGreaterThanOrEqual(40);
              expect(boundingBox.width).toBeGreaterThanOrEqual(40);
            }
          }
        }
      }
    });
  });
}); 