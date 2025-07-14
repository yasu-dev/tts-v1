import { test, expect } from '@playwright/test';

test.describe('Seller画面での業務フロー制御テスト', () => {
  
  test.beforeEach(async ({ page }) => {
    // Sellerログイン処理
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(2000); // 初期化待機
  });

  // 業務フロー制御確認のヘルパー関数
  async function checkBusinessFlowHidden(page: any, testName: string) {
    const flowContainer = page.locator('text=業務フロー').locator('..');
    const unifiedFlow = flowContainer.locator('[class*="unified-product-flow"], [data-testid="unified-product-flow"]');
    const isFlowVisible = await unifiedFlow.isVisible();
    expect(isFlowVisible, `${testName}: 業務フローが閉じられていません`).toBe(false);
    
    // スクロールテスト
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(500);
    const isStillHidden = await unifiedFlow.isVisible();
    expect(isStillHidden, `${testName}: スクロール後に業務フローが開いてしまいました`).toBe(false);
  }

  test('Dashboard - 期間変更モーダル', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // 業務フローが初期状態で表示されていることを確認
    await expect(page.locator('text=業務フロー')).toBeVisible();
    const flowBeforeModal = page.locator('[data-testid="business-flow"], .business-flow, .unified-product-flow');
    
    // 期間変更ボタンをクリックしてモーダルを開く
    await page.click('button:has-text("期間変更")');
    await page.waitForTimeout(1000);
    
    // モーダルが表示されていることを確認
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 業務フローが閉じられていることを確認
    const flowAfterModal = await flowBeforeModal.first().isVisible();
    if (flowAfterModal) {
      // 業務フローが見える場合、確実に閉じられているかチェック
      const flowContainer = page.locator('.business-flow, .unified-product-flow').first();
      const isCollapsed = await flowContainer.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display === 'none' || el.scrollHeight === 0 || (el as HTMLElement).offsetHeight === 0;
      });
      expect(isCollapsed, '業務フローが閉じられていません').toBe(true);
    }
    
    // スクロールしても業務フローが開かないことを確認
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    
    // スクロール後も業務フローが閉じたままであることを確認
    const flowAfterScroll = await flowBeforeModal.first().isVisible();
    if (flowAfterScroll) {
      const flowContainer = page.locator('.business-flow, .unified-product-flow').first();
      const isStillCollapsed = await flowContainer.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display === 'none' || el.scrollHeight === 0 || (el as HTMLElement).offsetHeight === 0;
      });
      expect(isStillCollapsed, 'スクロール後に業務フローが開いてしまいました').toBe(true);
    }
    
    // モーダルを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });

  test('Inventory - 商品登録モーダル', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForTimeout(2000);
    
    // 商品登録ボタンをクリック
    await page.click('button:has-text("商品登録")');
    await page.waitForTimeout(1000);
    
    // モーダルが表示されていることを確認
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 業務フローが閉じられていることを確認
    await checkBusinessFlowHidden(page, 'Inventory商品登録モーダル');
    
    // モーダルを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });

  test('Sales - プロモーション作成モーダル', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForTimeout(2000);
    
    // プロモーション作成ボタンをクリック
    await page.click('button:has-text("プロモーション作成")');
    await page.waitForTimeout(1000);
    
    // モーダルが表示されていることを確認
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 業務フロー制御確認
    await checkBusinessFlowHidden(page, 'Salesプロモーション作成モーダル');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });

  test('Returns - 返品申請モーダル', async ({ page }) => {
    await page.goto('/returns');
    await page.waitForTimeout(2000);
    
    // 返品申請ボタンをクリック
    await page.click('button:has-text("返品申請")');
    await page.waitForTimeout(1000);
    
    // モーダルが表示されていることを確認
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 業務フロー制御確認
    await checkBusinessFlowHidden(page, 'Returns返品申請モーダル');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });

  test('Billing - 支払い方法登録モーダル', async ({ page }) => {
    await page.goto('/billing');
    await page.waitForTimeout(2000);
    
    // 支払い方法登録ボタンをクリック
    await page.click('button:has-text("支払い方法を登録")');
    await page.waitForTimeout(1000);
    
    // モーダルが表示されていることを確認
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 業務フロー制御確認
    await checkBusinessFlowHidden(page, 'Billing支払い方法登録モーダル');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });

  test('Timeline - 詳細フローモーダル', async ({ page }) => {
    await page.goto('/timeline');
    await page.waitForTimeout(2000);
    
    // 最初の商品をクリック
    await page.click('[data-testid="timeline-item"]:first-child, .timeline-item:first-child, .product-item:first-child');
    await page.waitForTimeout(1000);
    
    // モーダルが表示されていることを確認
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 業務フロー制御確認
    await checkBusinessFlowHidden(page, 'Timeline詳細フローモーダル');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });

  test('Settings - アカウント削除モーダル', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForTimeout(2000);
    
    // アカウント削除確認モーダル
    await page.click('button:has-text("アカウント削除")');
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 業務フロー制御確認
    await checkBusinessFlowHidden(page, 'Settingsアカウント削除モーダル');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });

  test('Profile - パスワード変更モーダル', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(2000);
    
    // パスワード変更モーダル
    await page.click('button:has-text("パスワード変更")');
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 業務フロー制御確認
    await checkBusinessFlowHidden(page, 'Profileパスワード変更モーダル');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });

  // Seller画面総合テスト
  test('Seller画面での一貫性確認', async ({ page }) => {
    const pagesWithModals = [
      { url: '/dashboard', modalTrigger: 'button:has-text("期間変更")', name: 'Dashboard期間変更' },
      { url: '/inventory', modalTrigger: 'button:has-text("商品登録")', name: 'Inventory商品登録' },
      { url: '/sales', modalTrigger: 'button:has-text("プロモーション作成")', name: 'Salesプロモーション作成' },
      { url: '/returns', modalTrigger: 'button:has-text("返品申請")', name: 'Returns返品申請' },
      { url: '/billing', modalTrigger: 'button:has-text("支払い方法を登録")', name: 'Billing支払い方法登録' },
      { url: '/settings', modalTrigger: 'button:has-text("アカウント削除")', name: 'Settingsアカウント削除' },
      { url: '/profile', modalTrigger: 'button:has-text("パスワード変更")', name: 'Profileパスワード変更' }
    ];

    const failedPages: string[] = [];

    for (const pageInfo of pagesWithModals) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForTimeout(2000);
        
        // モーダル起動
        await page.click(pageInfo.modalTrigger);
        await page.waitForTimeout(1000);
        
        // モーダルが表示されていることを確認
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        
        // 業務フロー制御確認
        try {
          const flowContainer = page.locator('text=業務フロー').locator('..');
          const unifiedFlow = flowContainer.locator('[class*="unified-product-flow"], [data-testid="unified-product-flow"]');
          const isFlowVisible = await unifiedFlow.isVisible();
          
          if (isFlowVisible) {
            failedPages.push(pageInfo.name);
            console.log(`❌ ${pageInfo.name}: 業務フローが閉じられていません`);
          } else {
            console.log(`✅ ${pageInfo.name}: 業務フロー制御OK`);
          }
        } catch (flowError) {
          // 業務フロー要素が見つからない場合はOKとする
          console.log(`✅ ${pageInfo.name}: 業務フロー制御OK（要素なし）`);
        }
        
        // モーダルを閉じる
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        
      } catch (error) {
        failedPages.push(`${pageInfo.name} (エラー: ${error})`);
        console.log(`❌ ${pageInfo.name}: テスト実行エラー`);
      }
    }

    // 失敗したページがある場合はテストを失敗させる
    if (failedPages.length > 0) {
      throw new Error(`以下のページで業務フロー制御が正しく動作していません:\n${failedPages.join('\n')}`);
    }
  });
});

test.describe('Staff画面での業務フロー制御テスト', () => {
  
  test.beforeEach(async ({ page }) => {
    // Staffログイン処理
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/staff/dashboard');
    await page.waitForTimeout(2000); // 初期化待機
  });

  // 業務フロー制御確認のヘルパー関数
  async function checkBusinessFlowHidden(page: any, testName: string) {
    const flowContainer = page.locator('text=業務フロー').locator('..');
    const unifiedFlow = flowContainer.locator('[class*="unified-product-flow"], [data-testid="unified-product-flow"]');
    const isFlowVisible = await unifiedFlow.isVisible();
    expect(isFlowVisible, `${testName}: 業務フローが閉じられていません`).toBe(false);
    
    // スクロールテスト
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(500);
    const isStillHidden = await unifiedFlow.isVisible();
    expect(isStillHidden, `${testName}: スクロール後に業務フローが開いてしまいました`).toBe(false);
  }

  test('Staff Dashboard - タスク作成モーダル', async ({ page }) => {
    await page.goto('/staff/dashboard');
    await page.waitForTimeout(2000);
    
    // タスク作成ボタンをクリック
    await page.click('button:has-text("タスク作成")');
    await page.waitForTimeout(1000);
    
    // モーダルが表示されていることを確認
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 業務フロー制御確認
    await checkBusinessFlowHidden(page, 'StaffDashboardタスク作成モーダル');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });

  test('Staff Location - バーコードスキャナーモーダル（独自実装）', async ({ page }) => {
    await page.goto('/staff/location');
    await page.waitForTimeout(2000);
    
    // バーコードスキャンボタンをクリック
    await page.click('button:has-text("バーコードスキャン")');
    await page.waitForTimeout(1000);
    
    // 独自実装モーダルが表示されていることを確認
    await expect(page.locator('.fixed.inset-0, [class*="fixed"][class*="inset-0"]')).toBeVisible();
    
    // 業務フロー制御確認
    await checkBusinessFlowHidden(page, 'StaffLocationバーコードスキャナーモーダル');
    
    // モーダルを閉じる
    await page.click('button:has-text("✕")');
    await page.waitForTimeout(1000);
  });

  test('Staff Inspection - 商品検品モーダル', async ({ page }) => {
    await page.goto('/staff/inspection');
    await page.waitForTimeout(2000);
    
    // 最初の商品をクリック
    await page.click('[data-testid="product-item"]:first-child, .product-item:first-child, .table tbody tr:first-child');
    await page.waitForTimeout(1000);
    
    // モーダルが表示されていることを確認
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 業務フロー制御確認
    await checkBusinessFlowHidden(page, 'StaffInspection商品検品モーダル');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });

  test('Staff Returns - 再出品業務フローモーダル', async ({ page }) => {
    await page.goto('/staff/returns');
    await page.waitForTimeout(2000);
    
    // 再出品ボタンをクリック
    await page.click('button:has-text("再出品")');
    await page.waitForTimeout(1000);
    
    // モーダルが表示されていることを確認
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 業務フロー制御確認
    await checkBusinessFlowHidden(page, 'StaffReturns再出品業務フローモーダル');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });

  test('Staff Tasks - 全てのモーダル', async ({ page }) => {
    await page.goto('/staff/tasks');
    await page.waitForTimeout(2000);
    
    // タスク作成モーダル
    await page.click('button:has-text("タスク作成")');
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 業務フロー制御確認
    await checkBusinessFlowHidden(page, 'StaffTasksタスク作成モーダル');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // 一括割り当てモーダル
    await page.click('button:has-text("一括割り当て")');
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 業務フロー制御確認
    await checkBusinessFlowHidden(page, 'StaffTasks一括割り当てモーダル');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });

  // Staff画面総合テスト
  test('Staff画面での一貫性確認', async ({ page }) => {
    const pagesWithModals = [
      { url: '/staff/dashboard', modalTrigger: 'button:has-text("タスク作成")', name: 'StaffDashboardタスク作成' },
      { url: '/staff/inspection', modalTrigger: '.table tbody tr:first-child', name: 'StaffInspection商品検品' },
      { url: '/staff/returns', modalTrigger: 'button:has-text("再出品")', name: 'StaffReturns再出品' }
    ];

    const failedPages: string[] = [];

    for (const pageInfo of pagesWithModals) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForTimeout(2000);
        
        // モーダル起動
        await page.click(pageInfo.modalTrigger);
        await page.waitForTimeout(1000);
        
        // モーダルが表示されていることを確認
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        
        // 業務フロー制御確認
        try {
          const flowContainer = page.locator('text=業務フロー').locator('..');
          const unifiedFlow = flowContainer.locator('[class*="unified-product-flow"], [data-testid="unified-product-flow"]');
          const isFlowVisible = await unifiedFlow.isVisible();
          
          if (isFlowVisible) {
            failedPages.push(pageInfo.name);
            console.log(`❌ ${pageInfo.name}: 業務フローが閉じられていません`);
          } else {
            console.log(`✅ ${pageInfo.name}: 業務フロー制御OK`);
          }
        } catch (flowError) {
          // 業務フロー要素が見つからない場合はOKとする
          console.log(`✅ ${pageInfo.name}: 業務フロー制御OK（要素なし）`);
        }
        
        // モーダルを閉じる
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        
      } catch (error) {
        failedPages.push(`${pageInfo.name} (エラー: ${error})`);
        console.log(`❌ ${pageInfo.name}: テスト実行エラー`);
      }
    }

    // 失敗したページがある場合はテストを失敗させる
    if (failedPages.length > 0) {
      throw new Error(`以下のページで業務フロー制御が正しく動作していません:\n${failedPages.join('\n')}`);
    }
  });
}); 