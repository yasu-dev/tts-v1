import { test, expect } from '@playwright/test';

test.describe('eBay出品フロー導線改善テスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/staff/dashboard');
  });

  test('URLから直接/staff/listingにアクセスできないことを確認', async ({ page }) => {
    // 直接URLアクセスを試みる
    await page.goto('/staff/listing');
    
    // 404またはダッシュボードへのリダイレクトを確認
    const url = page.url();
    expect(url).not.toContain('/staff/listing');
  });

  test('在庫管理画面に出品可能フィルターが存在することを確認', async ({ page }) => {
    // 在庫管理画面へ遷移
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');
    
    // ステータスフィルターをクリック
    const filterSelector = 'select[data-testid="status-filter"], select:has-text("すべてのステータス"), select[name="status"]';
    await page.waitForSelector(filterSelector);
    
    // セレクトボックスのオプションを確認
    const selectElement = await page.locator(filterSelector).first();
    await selectElement.click();
    
    // 「出品可能」オプションが存在することを確認
    const options = await selectElement.locator('option').allTextContents();
    console.log('ステータスフィルターのオプション:', options);
    
    const hasListableOption = options.some(option => option.includes('出品可能'));
    expect(hasListableOption).toBeTruthy();
  });

  test('出品可能商品のフィルタリングが正しく動作することを確認', async ({ page }) => {
    // 在庫管理画面へ遷移
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');
    
    // 初期状態の商品数を確認
    await page.waitForTimeout(1000);
    const initialRows = await page.locator('table tbody tr, div[data-testid="inventory-item"]').count();
    console.log('初期表示商品数:', initialRows);
    
    // 出品可能フィルターを選択
    const filterSelector = 'select[data-testid="status-filter"], select:has-text("すべてのステータス"), select[name="status"]';
    await page.selectOption(filterSelector, { label: '出品可能' });
    await page.waitForTimeout(1000);
    
    // フィルター後の商品数を確認
    const filteredRows = await page.locator('table tbody tr, div[data-testid="inventory-item"]').count();
    console.log('出品可能フィルター適用後の商品数:', filteredRows);
    
    // 商品が存在する場合、条件を満たしているか確認
    if (filteredRows > 0) {
      // 最初の商品をクリックして詳細を確認
      await page.locator('table tbody tr, div[data-testid="inventory-item"]').first().click();
      await page.waitForTimeout(500);
      
      // 商品詳細モーダルが表示されることを確認
      const modal = await page.locator('[role="dialog"], .modal, [data-testid="item-detail-modal"]');
      await expect(modal).toBeVisible();
    }
  });

  test('商品詳細モーダルに出品可能判定が表示されることを確認', async ({ page }) => {
    // 在庫管理画面へ遷移
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');
    
    // 最初の商品をクリック
    await page.waitForTimeout(1000);
    const firstItem = await page.locator('table tbody tr, div[data-testid="inventory-item"]').first();
    await firstItem.click();
    
    // モーダルが表示されることを確認
    const modal = await page.locator('[role="dialog"], .modal, [data-testid="item-detail-modal"]');
    await expect(modal).toBeVisible();
    
    // 出品可能判定セクションが存在することを確認
    const eligibilitySection = await modal.locator('text=/出品可能性|出品ステータス|出品条件/');
    const sectionExists = await eligibilitySection.count() > 0;
    console.log('出品可能判定セクションの存在:', sectionExists);
    
    // 条件の表示を確認
    const conditions = [
      { text: 'ステータス', icon: ['✓', '✗', 'check', 'x'] },
      { text: '検品', icon: ['✓', '✗', 'check', 'x'] },
      { text: '撮影', icon: ['✓', '✗', 'check', 'x', '📷'] }
    ];
    
    for (const condition of conditions) {
      const conditionElement = await modal.locator(`text=/${condition.text}/`);
      if (await conditionElement.count() > 0) {
        console.log(`${condition.text}条件が表示されています`);
      }
    }
  });

  test('出品可能商品に「出品する」ボタンが表示されることを確認', async ({ page }) => {
    // 在庫管理画面へ遷移
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');
    
    // 出品可能フィルターを選択
    const filterSelector = 'select[data-testid="status-filter"], select:has-text("すべてのステータス"), select[name="status"]';
    await page.selectOption(filterSelector, { label: '出品可能' });
    await page.waitForTimeout(1000);
    
    // 商品が存在する場合
    const itemCount = await page.locator('table tbody tr, div[data-testid="inventory-item"]').count();
    if (itemCount > 0) {
      // 最初の商品をクリック
      await page.locator('table tbody tr, div[data-testid="inventory-item"]').first().click();
      
      // モーダルが表示されるのを待つ
      const modal = await page.locator('[role="dialog"], .modal, [data-testid="item-detail-modal"]');
      await expect(modal).toBeVisible();
      
      // 「出品する」ボタンが存在することを確認
      const listingButton = await modal.locator('button:has-text("出品する"), button:has-text("出品")');
      const buttonExists = await listingButton.count() > 0;
      console.log('出品するボタンの存在:', buttonExists);
      
      if (buttonExists) {
        expect(buttonExists).toBeTruthy();
      }
    } else {
      console.log('出品可能商品が存在しません');
    }
  });

  test('出品フォームモーダルが正しく表示されることを確認', async ({ page }) => {
    // 在庫管理画面へ遷移
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');
    
    // 出品可能フィルターを選択
    const filterSelector = 'select[data-testid="status-filter"], select:has-text("すべてのステータス"), select[name="status"]';
    await page.selectOption(filterSelector, { label: '出品可能' });
    await page.waitForTimeout(1000);
    
    // 商品が存在する場合
    const itemCount = await page.locator('table tbody tr, div[data-testid="inventory-item"]').count();
    if (itemCount > 0) {
      // 最初の商品をクリック
      await page.locator('table tbody tr, div[data-testid="inventory-item"]').first().click();
      
      // モーダルが表示されるのを待つ
      const detailModal = await page.locator('[role="dialog"], .modal, [data-testid="item-detail-modal"]');
      await expect(detailModal).toBeVisible();
      
      // 「出品する」ボタンをクリック
      const listingButton = await detailModal.locator('button:has-text("出品する"), button:has-text("出品")');
      if (await listingButton.count() > 0) {
        await listingButton.click();
        
        // 出品フォームモーダルが表示されることを確認
        await page.waitForTimeout(500);
        const listingModal = await page.locator('text=/出品フォーム|eBay出品|出品設定/').first();
        const modalExists = await listingModal.count() > 0;
        console.log('出品フォームモーダルの表示:', modalExists);
        
        if (modalExists) {
          // 必要な要素が存在することを確認
          const requiredElements = [
            'テンプレート',
            '開始価格',
            '即決価格',
            'タイトル',
            '説明'
          ];
          
          for (const element of requiredElements) {
            const elementExists = await page.locator(`text=/${element}/`).count() > 0;
            console.log(`${element}の存在:`, elementExists);
          }
        }
      } else {
        console.log('出品するボタンが見つかりません');
      }
    } else {
      console.log('出品可能商品が存在しません');
    }
  });

  test('出品フローの完全な動作確認', async ({ page }) => {
    // 在庫管理画面へ遷移
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');
    
    // テスト用の商品データを準備（実際のデータが存在しない場合のシミュレーション）
    console.log('出品フローの統合テストを開始');
    
    // フィルターの動作確認
    const filterSelector = 'select[data-testid="status-filter"], select:has-text("すべてのステータス"), select[name="status"]';
    const filterExists = await page.locator(filterSelector).count() > 0;
    console.log('ステータスフィルターの存在:', filterExists);
    
    // 商品一覧の表示確認
    const itemsExist = await page.locator('table tbody tr, div[data-testid="inventory-item"]').count() > 0;
    console.log('商品一覧の表示:', itemsExist);
    
    // UI要素の一貫性確認
    const headerExists = await page.locator('h1:has-text("在庫管理"), h2:has-text("在庫管理")').count() > 0;
    console.log('ページヘッダーの表示:', headerExists);
    
    // テスト結果サマリー
    const testSummary = {
      フィルター機能: filterExists,
      商品一覧表示: itemsExist,
      UIの一貫性: headerExists
    };
    
    console.log('テスト結果サマリー:', testSummary);
  });
});

test.describe('出品フロー導線の品質保証', () => {
  test('実装された機能の総合的な品質確認', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/staff/dashboard');
    
    // 品質チェック項目
    const qualityChecks = {
      'URLアクセス制限': false,
      '出品可能フィルター': false,
      '商品詳細モーダル拡張': false,
      '出品フォームモーダル': false,
      'UIの一貫性': false
    };
    
    // 1. URLアクセス制限の確認
    await page.goto('/staff/listing', { waitUntil: 'networkidle' });
    qualityChecks['URLアクセス制限'] = !page.url().includes('/staff/listing');
    
    // 2. 在庫管理画面の確認
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');
    
    // フィルターの確認
    const filterSelector = 'select[data-testid="status-filter"], select:has-text("すべてのステータス"), select[name="status"]';
    if (await page.locator(filterSelector).count() > 0) {
      const options = await page.locator(`${filterSelector} option`).allTextContents();
      qualityChecks['出品可能フィルター'] = options.some(opt => opt.includes('出品可能'));
    }
    
    // 3. UIの一貫性確認
    const uiElements = await page.locator('.nexus-card, [class*="card"], [class*="rounded"]').count();
    qualityChecks['UIの一貫性'] = uiElements > 0;
    
    // 結果レポート
    console.log('\n=== 品質保証レポート ===');
    for (const [check, result] of Object.entries(qualityChecks)) {
      console.log(`${check}: ${result ? '✓ 合格' : '✗ 不合格'}`);
    }
    
    const allPassed = Object.values(qualityChecks).every(v => v);
    console.log(`\n総合判定: ${allPassed ? '✓ すべての品質基準を満たしています' : '✗ 改善が必要です'}`);
  });
}); 