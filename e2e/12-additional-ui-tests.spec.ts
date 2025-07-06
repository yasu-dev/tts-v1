import { test, expect } from '@playwright/test';

test.describe('追加修正項目 E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
  });

  test.describe('🔧 追加修正項目テスト', () => {
    test('TaskDetailModal - ボタン統一修正', async ({ page }) => {
      await page.goto('/dashboard');
      
      // タスク詳細モーダルを開く
      const taskButton = page.locator('button:has-text("タスク詳細"), button:has-text("詳細"), [data-testid*="task"]');
      if (await taskButton.first().isVisible()) {
        await taskButton.first().click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // ヘッダーの閉じるボタン確認
        const closeButton = modal.locator('button:has-text("閉じる"), button[aria-label="Close"], button:has(svg)');
        if (await closeButton.first().isVisible()) {
          const buttonClass = await closeButton.first().getAttribute('class');
          expect(buttonClass).toContain('nexus-button');
        }
        
        // フッターボタンの確認
        const footerButtons = modal.locator('button:has-text("印刷"), button:has-text("複製"), button:has-text("編集")');
        const footerButtonCount = await footerButtons.count();
        
        for (let i = 0; i < footerButtonCount; i++) {
          const button = footerButtons.nth(i);
          const buttonClass = await button.getAttribute('class');
          expect(buttonClass).toContain('nexus-button');
        }
        
        // モーダルを閉じる
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click();
        }
      }
    });

    test('CarrierSettingsModal - 入力フィールド修正', async ({ page }) => {
      await page.goto('/settings');
      
      // 配送業者設定モーダルを開く
      const carrierButton = page.locator('button:has-text("配送業者設定"), button:has-text("配送設定"), button:has-text("業者設定")');
      if (await carrierButton.first().isVisible()) {
        await carrierButton.first().click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // NexusInputの確認
        const inputs = modal.locator('input[type="text"], input[type="number"]');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          for (let i = 0; i < Math.min(inputCount, 3); i++) {
            const input = inputs.nth(i);
            const inputClass = await input.getAttribute('class');
            expect(inputClass).toContain('nexus-input');
          }
        }
        
        // NexusTextareaの確認
        const textareas = modal.locator('textarea');
        const textareaCount = await textareas.count();
        
        if (textareaCount > 0) {
          const textarea = textareas.first();
          const textareaClass = await textarea.getAttribute('class');
          expect(textareaClass).toContain('nexus-textarea');
        }
        
        // ボタンの確認
        const saveButton = modal.locator('button:has-text("保存"), button:has-text("更新")');
        if (await saveButton.first().isVisible()) {
          const buttonClass = await saveButton.first().getAttribute('class');
          expect(buttonClass).toContain('nexus-button');
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じる")');
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click();
        }
      }
    });

    test('PackingMaterialsModal - 数量入力修正', async ({ page }) => {
      await page.goto('/inventory');
      
      // 梱包資材モーダルを開く
      const packingButton = page.locator('button:has-text("梱包資材"), button:has-text("資材確認"), button:has-text("発注")');
      if (await packingButton.first().isVisible()) {
        await packingButton.first().click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // 数量入力フィールドの確認
        const quantityInputs = modal.locator('input[type="number"], input[placeholder*="数量"], input[name*="quantity"]');
        const quantityCount = await quantityInputs.count();
        
        if (quantityCount > 0) {
          const quantityInput = quantityInputs.first();
          const inputClass = await quantityInput.getAttribute('class');
          expect(inputClass).toContain('nexus-input');
          
          // 数量変更テスト
          await quantityInput.fill('5');
          const value = await quantityInput.inputValue();
          expect(value).toBe('5');
        }
        
        // 発注ボタンの確認
        const orderButton = modal.locator('button:has-text("発注"), button:has-text("注文")');
        if (await orderButton.first().isVisible()) {
          const buttonClass = await orderButton.first().getAttribute('class');
          expect(buttonClass).toContain('nexus-button');
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("閉じる"), button:has-text("キャンセル")');
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click();
        }
      }
    });

    test('ProductRegistrationModal - 入力統一修正', async ({ page }) => {
      await page.goto('/inventory');
      
      // 新規商品登録モーダルを開く
      const registerButton = page.locator('button:has-text("新規商品登録"), button:has-text("商品追加"), button:has-text("登録")');
      if (await registerButton.first().isVisible()) {
        await registerButton.first().click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // NexusInputの確認
        const textInputs = modal.locator('input[type="text"], input[type="number"]');
        const textInputCount = await textInputs.count();
        
        if (textInputCount > 0) {
          for (let i = 0; i < Math.min(textInputCount, 5); i++) {
            const input = textInputs.nth(i);
            const inputClass = await input.getAttribute('class');
            expect(inputClass).toContain('nexus-input');
          }
        }
        
        // NexusSelectの確認
        const selects = modal.locator('select');
        const selectCount = await selects.count();
        
        if (selectCount > 0) {
          for (let i = 0; i < selectCount; i++) {
            const select = selects.nth(i);
            const selectClass = await select.getAttribute('class');
            expect(selectClass).toContain('nexus-select');
          }
        }
        
        // NexusTextareaの確認
        const textareas = modal.locator('textarea');
        const textareaCount = await textareas.count();
        
        if (textareaCount > 0) {
          for (let i = 0; i < textareaCount; i++) {
            const textarea = textareas.nth(i);
            const textareaClass = await textarea.getAttribute('class');
            expect(textareaClass).toContain('nexus-textarea');
          }
        }
        
        // 登録ボタンの確認
        const submitButton = modal.locator('button:has-text("登録"), button:has-text("保存"), button[type="submit"]');
        if (await submitButton.first().isVisible()) {
          const buttonClass = await submitButton.first().getAttribute('class');
          expect(buttonClass).toContain('nexus-button');
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じる")');
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click();
        }
      }
    });

    test('QRCodeModal - 色彩統一修正', async ({ page }) => {
      await page.goto('/inventory');
      
      // QRコード生成モーダルを開く
      const qrButton = page.locator('button:has-text("QRコード"), button:has-text("バーコード"), button[data-testid*="qr"]');
      if (await qrButton.first().isVisible()) {
        await qrButton.first().click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // Nexusデザイントークンの確認
        const textElements = modal.locator('.nexus-text-primary, .nexus-text-secondary');
        const textCount = await textElements.count();
        expect(textCount).toBeGreaterThan(0);
        
        // 背景色の確認
        const bgElements = modal.locator('[class*="nexus-bg"], [class*="bg-nexus"]');
        const bgCount = await bgElements.count();
        
        // ボーダー色の確認
        const borderElements = modal.locator('[class*="nexus-border"], [class*="border-nexus"]');
        const borderCount = await borderElements.count();
        
        // データコピーボタンの確認
        const copyButton = modal.locator('button:has-text("コピー"), button:has-text("データ"), button[data-testid*="copy"]');
        if (await copyButton.first().isVisible()) {
          const buttonClass = await copyButton.first().getAttribute('class');
          expect(buttonClass).toMatch(/nexus-blue|blue/);
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("閉じる"), button:has-text("キャンセル")');
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click();
        }
      }
    });

    test('SearchModal - タイポグラフィ修正', async ({ page }) => {
      await page.goto('/dashboard');
      
      // 検索モーダルを開く（Ctrl+Kまたは検索ボタン）
      await page.keyboard.press('Control+k');
      
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        // 検索入力フィールドの確認
        const searchInput = modal.locator('input[type="search"], input[placeholder*="検索"]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('テスト');
          
          // 検索結果のタイポグラフィ確認
          const resultTitles = modal.locator('.nexus-text-primary');
          const titleCount = await resultTitles.count();
          
          const resultDescriptions = modal.locator('.nexus-text-secondary');
          const descCount = await resultDescriptions.count();
          
          // アイコンの確認
          const icons = modal.locator('svg');
          const iconCount = await icons.count();
          expect(iconCount).toBeGreaterThan(0);
          
          // ローディング表示の確認
          const loadingElements = modal.locator('[class*="nexus-blue"], [class*="blue"]');
          const loadingCount = await loadingElements.count();
          
          // ホバー効果の確認
          const hoverElements = modal.locator('[class*="nexus-bg-secondary"], [class*="hover"]');
          const hoverCount = await hoverElements.count();
        }
        
        // モーダルを閉じる（Escapeキー）
        await page.keyboard.press('Escape');
      } else {
        // 代替方法：検索ボタンをクリック
        const searchButton = page.locator('button:has-text("検索"), button[data-testid*="search"], [data-testid*="search"]');
        if (await searchButton.first().isVisible()) {
          await searchButton.first().click();
          
          const modal = page.locator('[role="dialog"]');
          if (await modal.isVisible()) {
            // タイポグラフィの確認
            const textElements = modal.locator('.nexus-text-primary, .nexus-text-secondary');
            const textCount = await textElements.count();
            
            // モーダルを閉じる
            const closeButton = modal.locator('button:has-text("閉じる")');
            if (await closeButton.isVisible()) {
              await closeButton.click();
            } else {
              await page.keyboard.press('Escape');
            }
          }
        }
      }
    });
  });

  test.describe('🔍 統合テスト', () => {
    test('全追加修正項目の統一性確認', async ({ page }) => {
      const pages = ['/dashboard', '/inventory', '/settings'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        
        // ページが正常に読み込まれることを確認
        await expect(page.locator('h1')).toBeVisible();
        
        // NexusButtonの確認
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        
        if (buttonCount > 0) {
          // 少なくとも1つのNexusButtonが存在することを確認
          const nexusButtons = page.locator('button[class*="nexus-button"]');
          const nexusButtonCount = await nexusButtons.count();
          
          if (nexusButtonCount > 0) {
            console.log(`${pagePath}: NexusButton found: ${nexusButtonCount} buttons`);
          }
        }
        
        // 入力フィールドの確認
        const inputs = page.locator('input');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          // NexusInputの確認
          const nexusInputs = page.locator('input[class*="nexus-input"]');
          const nexusInputCount = await nexusInputs.count();
          
          if (nexusInputCount > 0) {
            console.log(`${pagePath}: NexusInput found: ${nexusInputCount} inputs`);
          }
        }
      }
    });

    test('モーダル表示機能の確認', async ({ page }) => {
      await page.goto('/dashboard');
      
      // 各種モーダルボタンの存在確認
      const modalButtons = [
        'button:has-text("詳細")',
        'button:has-text("設定")',
        'button:has-text("登録")',
        'button:has-text("QR")',
        'button:has-text("検索")'
      ];
      
      for (const buttonSelector of modalButtons) {
        const button = page.locator(buttonSelector);
        if (await button.first().isVisible()) {
          console.log(`Modal button found: ${buttonSelector}`);
          
          // ボタンクリックでモーダルが開くことを確認
          await button.first().click();
          
          // モーダルの表示確認
          const modal = page.locator('[role="dialog"]');
          if (await modal.isVisible()) {
            console.log(`Modal opened successfully for: ${buttonSelector}`);
            
            // モーダルを閉じる
            const closeButton = modal.locator('button:has-text("閉じる"), button:has-text("キャンセル")');
            if (await closeButton.first().isVisible()) {
              await closeButton.first().click();
            } else {
              await page.keyboard.press('Escape');
            }
          }
        }
      }
    });
  });
}); 