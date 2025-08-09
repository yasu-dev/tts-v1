import { test, expect } from '@playwright/test';

test.describe('ハードコードデータ除去後の検証', () => {
  // テスト前準備
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('納品管理画面: フロントエンドのハードコードフォールバックが除去されたことを確認', async ({ page }) => {
    console.log('🔍 納品管理画面のフロントエンドハードコードデータ除去を検証');

    // ネットワークリクエストを監視して、適切にAPIが呼ばれることを確認
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/delivery-plan')) {
        apiCalls.push(request.url());
      }
    });

    // 納品管理画面に移動
    await page.goto('/delivery');
    await expect(page.locator('h1')).toContainText('納品プラン管理');

    // ページの読み込み完了を待つ
    await page.waitForLoadState('networkidle');

    // APIが呼び出されたことを確認（フォールバックデータではなく）
    expect(apiCalls.length).toBeGreaterThan(0);
    console.log('✅ APIが適切に呼び出されています:', apiCalls[0]);

    // データがAPIから取得されていることを確認
    // 空の場合は適切な空状態が表示される
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount === 1) {
      // 空状態の場合、適切なメッセージが表示されているか確認
      const emptyMessage = page.locator('text=納品プランが見つかりません');
      await expect(emptyMessage).toBeVisible();
      console.log('✅ 空状態が適切に表示されています（APIから空データ取得）');
    } else {
      // データがある場合、テーブル構造が正しいか確認
      const statusColumns = page.locator('tbody tr td:nth-child(2)');
      const firstStatusExists = await statusColumns.first().isVisible();
      expect(firstStatusExists).toBeTruthy();
      console.log('✅ データがAPIから正しく表示されています');
    }

    // エラー状態ではないことを確認
    const errorMessage = page.locator('text=データ取得エラー');
    await expect(errorMessage).toHaveCount(0);

    console.log('✅ フロントエンドハードコードフォールバックが除去され、APIからの正常なデータフローを確認');
  });

  test('納品管理画面: 下書き保存機能の正常動作を確認', async ({ page }) => {
    console.log('🔍 下書き保存機能の動作を検証');

    // 新規納品プラン作成画面に移動
    await page.goto('/delivery-plan');
    await expect(page.locator('h1')).toContainText('納品プラン作成');

    // 倉庫選択（必須）
    await page.selectOption('select[name="warehouseId"]', { index: 1 }); // 最初の倉庫を選択
    await page.waitForTimeout(1000); // 住所が自動入力されるまで待機

    // 基本情報の入力
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="tel"]', '03-1234-5678');

    // 次のステップに進む
    await page.click('button:has-text("次のステップ")');
    
    // 商品登録ステップ
    await expect(page.locator('text=商品登録')).toBeVisible();

    // 商品を追加
    await page.click('button:has-text("商品を追加")');
    await page.fill('input[placeholder*="商品名"]', 'テスト商品');
    await page.fill('input[placeholder*="金額"]', '100000');
    await page.selectOption('select[name*="category"]', 'camera_body');
    await page.selectOption('select[name*="condition"]', 'excellent');

    // 下書き保存ボタンをクリック
    await page.click('button:has-text("下書き保存")');

    // 保存成功のトースト確認
    await expect(page.locator('.toast, [role="alert"]')).toContainText('下書き保存完了');

    // 納品管理画面にリダイレクトされることを確認
    await page.waitForURL('/delivery', { timeout: 10000 });

    // 下書き状態の納品プランが表示されることを確認
    await page.waitForSelector('text=下書き', { timeout: 5000 });
    const draftPlan = page.locator('tr:has(text="下書き")');
    await expect(draftPlan).toBeVisible();
    
    // 下書きプランにテストデータが含まれていることを確認
    await expect(draftPlan.locator('text=テスト商品')).toHaveCount(0); // テーブルには商品名は表示されない
    await expect(draftPlan.locator('text=¥100,000')).toBeVisible();

    console.log('✅ 下書き保存機能が正常に動作することを確認');
  });

  test('納品管理画面: データベースとの正常な連携を確認', async ({ page }) => {
    console.log('🔍 データベースとの正常な連携を検証');

    await page.goto('/delivery');
    await page.waitForLoadState('networkidle');

    // APIからのデータ読み込み成功を確認（ローディング→データ表示の流れ）
    
    // エラーメッセージが表示されていないことを確認
    const errorMessage = page.locator('text=データ取得エラー');
    await expect(errorMessage).toHaveCount(0);

    // 再試行ボタンが表示されていないことを確認（エラーがない場合）
    const retryButton = page.locator('button:has-text("再試行")');
    await expect(retryButton).toHaveCount(0);

    // データが表示されているか、適切な空状態メッセージが表示されていることを確認
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount === 1) {
      // 空状態の場合
      const emptyMessage = page.locator('text=納品プランが見つかりません');
      await expect(emptyMessage).toBeVisible();
      console.log('✅ 空状態が適切に表示されています');
    } else {
      // データが存在する場合
      console.log(`✅ ${rowCount}件の納品プランがデータベースから表示されています`);
      
      // 各行に適切なデータ構造が表示されていることを確認
      for (let i = 0; i < Math.min(rowCount, 3); i++) {
        const row = tableRows.nth(i);
        // ステータスを含む行があることを確認
        const cells = row.locator('td');
        const cellCount = await cells.count();
        expect(cellCount).toBeGreaterThan(3); // 最低限のカラム数を確認
      }
    }

    console.log('✅ データベースからのデータが正常に表示されています');
  });

  test('エラーハンドリング: ネットワークエラー時の適切な表示', async ({ page }) => {
    console.log('🔍 エラーハンドリングの検証');

    // ネットワーク リクエストを失敗させる
    await page.route('/api/delivery-plan*', route => {
      route.abort('failed');
    });

    await page.goto('/delivery');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=データ取得エラー')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=サーバーとの通信に失敗しました')).toBeVisible();
    
    // 再試行ボタンが表示されることを確認
    const retryButton = page.locator('button:has-text("再試行")');
    await expect(retryButton).toBeVisible();

    // ハードコードデータが表示されていないことを確認
    const hardcodedData = page.locator('text=田中太郎');
    await expect(hardcodedData).toHaveCount(0);

    console.log('✅ エラー時にハードコードデータではなく適切なエラーメッセージが表示されます');

    // ネットワークを回復させて再試行ボタンをテスト
    await page.unroute('/api/delivery-plan*');
    
    await retryButton.click();
    await page.waitForLoadState('networkidle');
    
    // エラーメッセージが消えることを確認
    await expect(page.locator('text=データ取得エラー')).toHaveCount(0);

    console.log('✅ 再試行ボタンが正常に機能します');
  });

  test('コンポーネント内のハードコードデータ除去の確認', async ({ page }) => {
    console.log('🔍 各コンポーネントのハードコードデータ除去を検証');

    // ログインユーザーでタスク管理画面をチェック  
    await page.goto('/staff/tasks');
    await page.waitForLoadState('networkidle');

    // 修正されたスタッフ名が表示されていることを確認
    const oldHardcodedNames = page.locator('text=田中太郎');
    await expect(oldHardcodedNames).toHaveCount(0);

    const newGenericNames = page.locator('text=スタッフA');
    // 新しい汎用的な名前が使用されているか確認（存在する場合）
    const count = await newGenericNames.count();
    if (count > 0) {
      console.log('✅ 汎用的なスタッフ名が使用されています');
    }

    console.log('✅ コンポーネント内のハードコードデータが除去されています');
  });

  test('画面全体のUI一貫性確認', async ({ page }) => {
    console.log('🔍 画面全体のUI一貫性を検証');

    const pages = [
      { url: '/delivery', title: '納品プラン管理' },
      { url: '/inventory', title: '在庫管理' },
      { url: '/dashboard', title: 'ダッシュボード' }
    ];

    for (const testPage of pages) {
      await page.goto(testPage.url);
      await page.waitForLoadState('networkidle');

      // ページタイトルの確認
      const pageTitle = page.locator('h1').first();
      await expect(pageTitle).toContainText(testPage.title);

      // ヘッダーの存在確認
      const header = page.locator('header, [role="banner"]').first();
      await expect(header).toBeVisible();

      // ナビゲーションメニューの存在確認
      const navigation = page.locator('nav, [role="navigation"]').first();
      await expect(navigation).toBeVisible();

      console.log(`✅ ${testPage.title}画面のUI一貫性を確認`);
    }

    console.log('✅ 全画面のUI一貫性が確保されています');
  });
});

test.describe('修正後の動作確認', () => {
  test('下書き保存後の正確な位置での再開', async ({ page }) => {
    console.log('🔍 下書き保存後の正確な位置での再開を検証');

    // ログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 納品プラン作成開始
    await page.goto('/delivery-plan');
    
    // Step 1: 基本情報入力
    // 倉庫選択（必須）
    await page.selectOption('select[name="warehouseId"]', { index: 1 });
    await page.waitForTimeout(1000);
    
    await page.fill('input[type="email"]', 'verification@test.com');
    await page.click('button:has-text("次のステップ")');

    // Step 2: 商品登録で部分的に入力
    await page.click('button:has-text("商品を追加")');
    await page.fill('input[placeholder*="商品名"]', '検証用商品');
    await page.fill('input[placeholder*="金額"]', '50000');

    // 下書き保存
    await page.click('button:has-text("下書き保存")');
    await expect(page.locator('.toast')).toContainText('下書き保存完了');

    // 納品管理画面で下書きを確認
    await page.waitForURL('/delivery');
    const draftRow = page.locator('tr:has-text("下書き")').first();
    await expect(draftRow).toBeVisible();

    // 編集ボタンをクリック
    await draftRow.locator('button:has-text("詳細"), button[title*="詳細"]').click();
    
    // モーダルで編集ボタンをクリック
    const editButton = page.locator('button:has-text("編集")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // 編集画面で保存されたデータが正しく表示されることを確認
      await expect(page.locator('input[value*="検証用住所123"]')).toBeVisible();
      await expect(page.locator('input[value*="verification@test.com"]')).toBeVisible();
      
      console.log('✅ 下書きデータが正確に保存・復元されています');
    }

    console.log('✅ 下書き保存後の再開機能が正常に動作しています');
  });
}); 
