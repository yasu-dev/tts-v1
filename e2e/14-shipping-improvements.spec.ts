import { test, expect } from '@playwright/test';

test.describe('出荷管理機能改善', () => {
  test.beforeEach(async ({ page }) => {
    // スタッフとしてログイン
    await page.goto('/login');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/staff/dashboard');
    
    // 出荷管理ページへ移動
    await page.click('a[href="/staff/shipping"]');
    await page.waitForURL('/staff/shipping');
  });

  test('商品名クリックで詳細モーダルが開く', async ({ page }) => {
    // 商品名をクリック
    const productName = page.locator('.hover\\:underline').first();
    await expect(productName).toBeVisible();
    await productName.click();
    
    // 詳細モーダルが開くことを確認
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('商品詳細')).toBeVisible();
  });

  test('保管場所が大きく表示される', async ({ page }) => {
    // 商品名をクリックして詳細モーダルを開く
    await page.locator('.hover\\:underline').first().click();
    
    // 保管場所セクションの確認
    await expect(page.getByText('商品保管場所')).toBeVisible();
    
    // 保管場所が大きく表示されていることを確認（text-3xlクラス）
    const locationElement = page.locator('.text-3xl.font-bold.text-nexus-blue');
    await expect(locationElement).toBeVisible();
    
    // 保管場所のコード形式を確認（例：A-01）
    const locationText = await locationElement.textContent();
    expect(locationText).toMatch(/^[A-Z]-\d{2}$/);
  });

  test('伝票アップロード機能', async ({ page }) => {
    // 商品名をクリックして詳細モーダルを開く
    await page.locator('.hover\\:underline').first().click();
    
    // 伝票アップロードボタンが表示されることを確認
    const uploadButton = page.getByRole('button', { name: /伝票をアップロード/ });
    await expect(uploadButton).toBeVisible();
    
    // 伝票アップロードボタンをクリック
    await uploadButton.click();
    
    // 伝票アップロードモーダルが開くことを確認
    await expect(page.getByText('配送伝票アップロード')).toBeVisible();
    
    // 作成者選択オプションの確認
    await expect(page.getByText('セラーが用意')).toBeVisible();
    await expect(page.getByText('ワールドドア社が用意')).toBeVisible();
    
    // ファイル選択エリアの確認
    await expect(page.getByText('クリックしてファイルを選択')).toBeVisible();
  });

  test('伝票アップロード後の表示', async ({ page }) => {
    // テスト用のファイルを準備
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('.hover\\:underline').first().click()
        .then(() => page.getByRole('button', { name: /伝票をアップロード/ }).click())
        .then(() => page.locator('div[class*="border-dashed"]').click())
    ]);
    
    // PDFファイルを選択（実際のテストでは適切なテストファイルを用意）
    await fileChooser.setFiles([{
      name: 'test-label.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content')
    }]);
    
    // ファイル名が表示されることを確認
    await expect(page.getByText('test-label.pdf')).toBeVisible();
    
    // アップロードボタンが有効になることを確認
    const uploadButton = page.getByRole('button', { name: 'アップロード' });
    await expect(uploadButton).toBeEnabled();
  });

  test('ステータス別タブビューの動作', async ({ page }) => {
    // 各タブが表示されることを確認
    const tabs = ['全体', '検品待ち', '梱包待ち', '出荷待ち', '集荷準備中', '本日出荷'];
    
    for (const tabName of tabs) {
      const tab = page.getByRole('button', { name: new RegExp(tabName) });
      await expect(tab).toBeVisible();
    }
    
    // タブをクリックして切り替え
    await page.getByRole('button', { name: /梱包待ち/ }).click();
    
    // フィルタリングが適用されることを確認（URLパラメータ等で確認）
    await expect(page).toHaveURL(/tab=inspected/);
  });

  test('統計カードの表示', async ({ page }) => {
    // 6つの統計カードが表示されることを確認
    const statsCards = page.locator('.intelligence-card');
    await expect(statsCards).toHaveCount(6);
    
    // 各統計カードのラベルを確認
    const labels = ['総件数', '検品待ち', '梱包待ち', '出荷待ち', '集荷準備中', '緊急案件'];
    
    for (const label of labels) {
      await expect(page.getByText(label)).toBeVisible();
    }
  });

  test('インライン作業機能', async ({ page }) => {
    // 展開可能な行をクリック
    const expandButton = page.locator('button[aria-label="詳細を表示"]').first();
    await expandButton.click();
    
    // ワークフロー進捗が表示されることを確認
    await expect(page.getByText('作業進捗')).toBeVisible();
    
    // 次のアクションボタンが表示されることを確認
    const actionButton = page.locator('button').filter({ hasText: /完了|開始/ }).first();
    await expect(actionButton).toBeVisible();
  });

  test('一括選択機能', async ({ page }) => {
    // 全選択チェックボックスをクリック
    const selectAllCheckbox = page.locator('input[type="checkbox"]').first();
    await selectAllCheckbox.click();
    
    // 一括処理ボタンが表示されることを確認
    await expect(page.getByRole('button', { name: /一括処理/ })).toBeVisible();
  });

  test('モバイルレスポンシブ対応', async ({ page }) => {
    // ビューポートをモバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 });
    
    // モバイル用のレイアウトが適用されることを確認
    // 統計カードがグリッド表示されることを確認
    const statsGrid = page.locator('.grid').first();
    await expect(statsGrid).toHaveCSS('grid-template-columns', /repeat\(2/);
    
    // テーブルがモバイル最適化されていることを確認
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('ワークフローの進行', async ({ page }) => {
    // 検品待ちの商品を探す
    await page.getByRole('button', { name: /検品待ち/ }).click();
    
    // 最初の商品の詳細を開く
    await page.locator('.hover\\:underline').first().click();
    
    // ステータス変更ボタンが表示されることを確認
    const statusButton = page.getByRole('button', { name: /検査済みに進める/ });
    await expect(statusButton).toBeVisible();
    
    // ステータスを変更
    await statusButton.click();
    
    // 成功メッセージが表示されることを確認
    await expect(page.getByText('ステータスを検査済みに更新しました')).toBeVisible();
  });

  test('納品時画像へのアクセス', async ({ page }) => {
    // 商品名をクリックして詳細モーダルを開く
    await page.locator('.hover\\:underline').first().click();
    
    // 画像タブが表示されることを確認
    const imagesTab = page.getByRole('button', { name: '画像' });
    await expect(imagesTab).toBeVisible();
    
    // 画像タブをクリック
    await imagesTab.click();
    
    // 納品時画像セクションが表示されることを確認
    await expect(page.getByText('納品時画像')).toBeVisible();
    await expect(page.getByText('検品時画像')).toBeVisible();
    
    // 画像が表示されることを確認（モックデータの場合）
    const productImages = page.locator('img[alt^="納品時画像"]');
    const imageCount = await productImages.count();
    
    if (imageCount > 0) {
      // 画像がある場合、クリックして拡大表示のテキストが表示されることを確認
      await productImages.first().hover();
      await expect(page.getByText('クリックして拡大')).toBeVisible();
    } else {
      // 画像がない場合のメッセージを確認
      await expect(page.getByText('納品時画像がありません')).toBeVisible();
    }
  });

  test('梱包動画記録機能', async ({ page }) => {
    // 検品済みの商品を探す
    await page.getByRole('button', { name: /梱包待ち/ }).click();
    
    // 最初の商品の詳細を開く
    await page.locator('.hover\\:underline').first().click();
    
    // 梱包動画記録ボタンが表示されることを確認
    const packingButton = page.getByRole('button', { name: /梱包動画記録/ });
    await expect(packingButton).toBeVisible();
    
    // 梱包動画記録ボタンをクリック
    await packingButton.click();
    
    // 梱包動画記録モーダルが開くことを確認
    await expect(page.getByText('梱包作業動画記録（任意）')).toBeVisible();
    
    // スキップボタンが表示されることを確認（任意機能）
    await expect(page.getByRole('button', { name: 'スキップ' })).toBeVisible();
    
    // 動画記録コンポーネントが表示されることを確認
    await expect(page.getByText('梱包作業の動画記録について')).toBeVisible();
  });
}); 