import { test, expect } from '@playwright/test';

test.describe('出荷管理ワークフロー', () => {
  test.beforeEach(async ({ page }) => {
    // スタッフとしてログイン
    await page.goto('/login');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/staff/dashboard');
  });

  test('統合ダッシュボードの表示確認', async ({ page }) => {
    // 出荷管理ページへ移動
    await page.click('a[href="/staff/shipping"]');
    await page.waitForURL('/staff/shipping');

    // 統一ヘッダーの確認
    await expect(page.getByTestId('unified-page-header')).toBeVisible();
    await expect(page.getByText('出荷管理')).toBeVisible();
    await expect(page.getByText('eBayからの出荷指示を一元管理・処理')).toBeVisible();

    // 統計カードの確認
    const statsCards = page.locator('.intelligence-card');
    await expect(statsCards).toHaveCount(6);
    
    // 各統計項目の確認
    await expect(page.getByText('総出荷案件')).toBeVisible();
    await expect(page.getByText('検品待ち')).toBeVisible();
    await expect(page.getByText('梱包待ち')).toBeVisible();
    await expect(page.getByText('出荷待ち')).toBeVisible();
    await expect(page.getByText('緊急案件')).toBeVisible();
    await expect(page.getByText('本日出荷')).toBeVisible();
  });

  test('ステータス別タブビューの動作確認', async ({ page }) => {
    await page.goto('/staff/shipping');

    // タブの存在確認
    const tabs = page.locator('nav[aria-label="Tabs"] button');
    await expect(tabs).toHaveCount(5);

    // 各タブのクリックとアクティブ状態の確認
    const tabNames = ['全体', '検品待ち', '梱包待ち', '出荷待ち', '本日出荷'];
    
    for (const tabName of tabNames) {
      await page.click(`button:has-text("${tabName}")`);
      
      // アクティブなタブのスタイル確認
      const activeTab = page.locator(`button:has-text("${tabName}")`);
      await expect(activeTab).toHaveClass(/border-nexus-blue/);
      await expect(activeTab).toHaveClass(/text-nexus-blue/);
    }
  });

  test('インライン作業機能の確認', async ({ page }) => {
    await page.goto('/staff/shipping');

    // 検品待ちタブを選択
    await page.click('button:has-text("検品待ち")');
    
    // 最初の商品の検品完了ボタンを確認
    const firstRow = page.locator('.holo-row').first();
    const inspectButton = firstRow.locator('button:has-text("検品完了")');
    await expect(inspectButton).toBeVisible();

    // 検品完了ボタンをクリック
    await inspectButton.click();

    // トースト通知の確認
    await expect(page.getByText('ステータスを検品済みに更新しました')).toBeVisible();
  });

  test('ワークフロー進捗表示の確認', async ({ page }) => {
    await page.goto('/staff/shipping');

    // 最初の商品の詳細を展開
    const firstRow = page.locator('.holo-row').first();
    await firstRow.locator('button:has-text("詳細を見る")').click();

    // ワークフロープログレスの表示確認
    const progressSection = page.locator('.holo-row.bg-nexus-bg-secondary');
    await expect(progressSection).toBeVisible();

    // プログレスバーの確認
    const progressBar = progressSection.locator('.bg-nexus-blue');
    await expect(progressBar).toBeVisible();

    // ステップインジケーターの確認
    const steps = progressSection.locator('.rounded-full');
    await expect(steps).toHaveCount(5);

    // 次のアクション表示の確認
    await expect(progressSection.getByText('次のアクション')).toBeVisible();
  });

  test('一括選択と一括処理機能', async ({ page }) => {
    await page.goto('/staff/shipping');

    // 全選択チェックボックスをクリック
    const selectAllCheckbox = page.locator('thead input[type="checkbox"]');
    await selectAllCheckbox.click();

    // 個別チェックボックスが選択されていることを確認
    const individualCheckboxes = page.locator('tbody input[type="checkbox"]');
    const count = await individualCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(individualCheckboxes.nth(i)).toBeChecked();
    }

    // 選択中メッセージの確認
    await expect(page.getByText(/\d+件選択中/)).toBeVisible();

    // 一括処理ボタンの確認
    const batchButton = page.locator('button:has-text("一括処理")');
    await expect(batchButton).toBeVisible();

    // 一括処理ボタンをクリック
    await batchButton.click();

    // トースト通知の確認
    await expect(page.getByText(/\d+件の処理を開始します/)).toBeVisible();
  });

  test('優先度フィルターの動作確認', async ({ page }) => {
    await page.goto('/staff/shipping');

    // 優先度フィルターを選択
    const prioritySelect = page.locator('select').first();
    await prioritySelect.selectOption('urgent');

    // フィルター適用後の結果確認
    const rows = page.locator('.holo-row');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      // 緊急案件のみが表示されていることを確認
      for (let i = 0; i < rowCount; i++) {
        const priorityBadge = rows.nth(i).locator('.cert-nano.cert-ruby');
        await expect(priorityBadge).toHaveText('緊急');
      }
    }
  });

  test('バーコードスキャナーの統合確認', async ({ page }) => {
    await page.goto('/staff/shipping');

    // バーコードボタンをクリック
    await page.click('button:has-text("バーコード")');

    // バーコードスキャナーセクションの表示確認
    const scannerSection = page.locator('.intelligence-card:has-text("バーコードスキャナー")');
    await expect(scannerSection).toBeVisible();

    // 閉じるボタンの動作確認
    await scannerSection.locator('button:has-text("閉じる")').click();
    await expect(scannerSection).not.toBeVisible();
  });

  test('配送設定と梱包資材確認モーダル', async ({ page }) => {
    await page.goto('/staff/shipping');

    // 配送設定ボタンをクリック
    await page.click('button:has-text("配送設定")');
    
    // 配送設定モーダルの表示確認
    const carrierModal = page.locator('.nexus-modal:has-text("配送業者設定")');
    await expect(carrierModal).toBeVisible();
    
    // モーダルを閉じる
    await carrierModal.locator('button[aria-label="閉じる"]').click();
    await expect(carrierModal).not.toBeVisible();

    // 梱包資材確認ボタンをクリック
    await page.click('button:has-text("梱包資材確認")');
    
    // 梱包資材モーダルの表示確認
    const materialsModal = page.locator('.nexus-modal:has-text("梱包資材在庫確認")');
    await expect(materialsModal).toBeVisible();
  });

  test('ページネーションの動作確認', async ({ page }) => {
    await page.goto('/staff/shipping');

    // ページネーションコンポーネントの確認
    const pagination = page.locator('.mt-6.pt-4.border-t');
    await expect(pagination).toBeVisible();

    // 表示件数の変更
    const itemsPerPageSelect = pagination.locator('select');
    await itemsPerPageSelect.selectOption('10');

    // 10件表示されていることを確認
    const rows = page.locator('.holo-row');
    await expect(rows).toHaveCount(10);
  });

  test('モバイルレスポンシブ確認', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/staff/shipping');

    // ヘッダーアクションボタンが適切に表示されることを確認
    await expect(page.getByText('スキャン')).toBeVisible();
    await expect(page.getByText('配送')).toBeVisible();
    await expect(page.getByText('資材確認')).toBeVisible();

    // タブがスクロール可能であることを確認
    const tabContainer = page.locator('nav[aria-label="Tabs"]');
    await expect(tabContainer).toBeVisible();

    // 統計カードがグリッドレイアウトで表示されることを確認
    const statsGrid = page.locator('.grid.grid-cols-2');
    await expect(statsGrid).toBeVisible();
  });
}); 