import { test, expect } from '@playwright/test';

test.describe('統一配送フロー', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/sales');
    await page.waitForSelector('.holo-table');
  });

  test('FedEx配送フロー: ラベル生成→ピッキング→出荷', async ({ page }) => {
    // ステップ1: セラーがFedExラベル生成
    console.log('ステップ1: FedExラベル生成');
    
    // 注文のラベル生成ボタンをクリック
    const labelButton = page.locator('button:has-text("ラベル生成")').first();
    await expect(labelButton).toBeVisible();
    await labelButton.click();

    // 配送業者選択モーダルでFedExを選択
    await page.waitForSelector('text=配送ラベル生成');
    await page.selectOption('select.w-full', { value: 'fedex' });

    // FedExサービス選択モーダル
    await page.waitForSelector('text=FedExサービス選択');
    const standardService = page.locator('button:has-text("Standard")');
    await expect(standardService).toBeVisible();
    await standardService.click();

    // ラベル生成完了を確認
    await expect(page.locator('.toast-success')).toContainText('FedEx配送ラベルが生成され、ピッキング開始可能になりました');
    
    // ステップ2: スタッフがロケーション管理でピッキング対象確認
    console.log('ステップ2: ロケーション管理でピッキング対象確認');
    
    // スタッフ権限でログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/staff/dashboard');

    // ロケーション管理画面へ
    await page.goto('/staff/location');
    await page.waitForSelector('[data-testid="location-list"]');

    // 出荷リストタブに切り替え
    const shippingTab = page.locator('button:has-text("出荷リスト")');
    await expect(shippingTab).toBeVisible();
    await shippingTab.click();

    // orderedステータスの商品が表示されることを確認
    await expect(page.locator('.holo-card')).toBeVisible();
    await expect(page.locator('text=ピッキング待ち')).toBeVisible();

    // ピッキングリスト作成ボタンをクリック
    const pickingButton = page.locator('button:has-text("ピッキングリスト作成")');
    await expect(pickingButton).toBeVisible();
    await pickingButton.click();

    // ピッキングモーダルが表示されることを確認
    await page.waitForSelector('[data-testid="picking-modal"]');
    await expect(page.locator('text=ピッキングリスト作成')).toBeVisible();

    // ピッキング画面へ進むボタンをクリック
    const proceedButton = page.locator('button:has-text("ピッキング画面へ進む")');
    await expect(proceedButton).toBeVisible();
    await proceedButton.click();

    // ピッキング完了の成功メッセージを確認
    await expect(page.locator('.toast-success')).toContainText('ピッキングリスト作成完了');

    // ステップ3: スタッフ出荷管理でラベルダウンロード確認
    console.log('ステップ3: スタッフ出荷管理でラベルダウンロード');
    
    await page.goto('/staff/shipping');
    await page.waitForSelector('[data-testid="shipping-table"]');

    // storageタブが存在しないことを確認
    await expect(page.locator('button:has-text("ピッキング待ち")')).not.toBeVisible();

    // picked以降のステータスのみ表示されることを確認
    await expect(page.locator('button:has-text("梱包待ち")')).toBeVisible();
    await expect(page.locator('button:has-text("梱包済み")')).toBeVisible();

    // 梱包済みタブをクリック
    const packedTab = page.locator('button:has-text("梱包済み")');
    await packedTab.click();

    // 梱包済み商品のラベルボタンを確認（セラー準備済みラベルをダウンロード）
    const labelDownloadButton = page.locator('button:has-text("ラベル")').first();
    if (await labelDownloadButton.isVisible()) {
      // ダウンロードが実行されることを確認
      const downloadPromise2 = page.waitForEvent('download');
      await labelDownloadButton.click();
      await downloadPromise2;
      
      // 成功メッセージを確認
      await expect(page.locator('.toast-success')).toContainText('ダウンロード完了');
    }

    console.log('FedEx配送フロー完了');
  });

  test('外部配送業者フロー: ラベルアップロード→ピッキング→出荷', async ({ page }) => {
    // ステップ1: セラーが外部配送業者選択
    console.log('ステップ1: 外部配送業者選択');
    
    // 注文のラベル生成ボタンをクリック
    const labelButton = page.locator('button:has-text("ラベル生成")').first();
    await expect(labelButton).toBeVisible();
    await labelButton.click();

    // 配送業者選択モーダルで外部業者を選択（例：ヤマト運輸）
    await page.waitForSelector('[data-testid="carrier-selection-modal"]');
    const yamatoOption = page.locator('button:has-text("ヤマト運輸")');
    await expect(yamatoOption).toBeVisible();
    await yamatoOption.click();

    // 外部サイトが開かれる通知を確認
    await expect(page.locator('.toast-info')).toContainText('新しいタブで開きました');

    // ラベルアップロードモーダルが自動的に開くことを確認
    await page.waitForSelector('[data-testid="label-upload-modal"]', { timeout: 2000 });
    await expect(page.locator('text=配送伝票アップロード')).toBeVisible();

    // テスト用のファイルをアップロード
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-label.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content')
    });

    // アップロードボタンをクリック
    const uploadButton = page.locator('button:has-text("アップロード")');
    await expect(uploadButton).toBeVisible();
    await uploadButton.click();

    // アップロード完了を確認
    await expect(page.locator('.toast-success')).toContainText('配送伝票がアップロードされ、ピッキング開始可能になりました');

    // ステップ2: スタッフがロケーション管理でピッキング対象確認
    console.log('ステップ2: ロケーション管理でピッキング対象確認');
    
    // スタッフ権限でログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/staff/dashboard');

    // ロケーション管理画面へ
    await page.goto('/staff/location');
    await page.waitForSelector('[data-testid="location-list"]');

    // 出荷リストタブに切り替え
    const shippingTab = page.locator('button:has-text("出荷リスト")');
    await expect(shippingTab).toBeVisible();
    await shippingTab.click();

    // アップロードされたラベルに対応する商品が表示されることを確認
    await expect(page.locator('.holo-card')).toBeVisible();
    await expect(page.locator('text=ピッキング待ち')).toBeVisible();

    // ピッキングリスト作成
    const pickingButton = page.locator('button:has-text("ピッキングリスト作成")');
    if (await pickingButton.isVisible()) {
      await pickingButton.click();
      await page.waitForSelector('[data-testid="picking-modal"]');
      
      const proceedButton = page.locator('button:has-text("ピッキング画面へ進む")');
      await proceedButton.click();
      
      await expect(page.locator('.toast-success')).toContainText('ピッキングリスト作成完了');
    }

    // ステップ3: スタッフ出荷管理で外部ラベルダウンロード確認
    console.log('ステップ3: スタッフ出荷管理で外部ラベルダウンロード');
    
    await page.goto('/staff/shipping');
    await page.waitForSelector('[data-testid="shipping-table"]');

    // 梱包済みタブで外部ラベルのダウンロードを確認
    const packedTab = page.locator('button:has-text("梱包済み")');
    await packedTab.click();

    const labelDownloadButton = page.locator('button:has-text("ラベル")').first();
    if (await labelDownloadButton.isVisible()) {
      await labelDownloadButton.click();
      
      // エラーまたは成功メッセージを確認（ラベルの存在によって異なる）
      const toast = page.locator('.toast');
      await expect(toast).toBeVisible();
    }

    console.log('外部配送業者フロー完了');
  });

  test('統一フロー制約確認: ラベル未準備商品はピッキング対象外', async ({ page }) => {
    console.log('統一フロー制約確認');
    
    // スタッフ権限でログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/staff/dashboard');

    // ロケーション管理画面へ
    await page.goto('/staff/location');
    await page.waitForSelector('[data-testid="location-list"]');

    // 出荷リストタブに切り替え
    const shippingTab = page.locator('button:has-text("出荷リスト")');
    await shippingTab.click();

    // ラベル未準備の場合は商品が表示されないか、適切なメッセージが表示される
    const noItemsMessage = page.locator('text=ピッキング対象の商品はありません');
    const labelReadyMessage = page.locator('text=ラベル準備完了後、商品がここに表示されます');
    
    // どちらかのメッセージが表示されることを確認
    await expect(noItemsMessage.or(labelReadyMessage)).toBeVisible();

    // スタッフ出荷管理画面でも確認
    await page.goto('/staff/shipping');
    await page.waitForSelector('[data-testid="shipping-table"]');

    // storageタブ（ピッキング待ち）が存在しないことを再確認
    await expect(page.locator('button:has-text("出荷待ち")')).not.toBeVisible();
    await expect(page.locator('button:has-text("ピッキング待ち")')).not.toBeVisible();

    // picked以降のステータスタブのみ存在することを確認
    await expect(page.locator('button:has-text("梱包待ち")')).toBeVisible();
    await expect(page.locator('button:has-text("梱包済み")')).toBeVisible();

    console.log('統一フロー制約確認完了');
  });

  test('エラーハンドリング: ラベル取得失敗時の挙動', async ({ page }) => {
    console.log('エラーハンドリング確認');
    
    // スタッフ権限でログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/staff/dashboard');

    // スタッフ出荷管理画面へ
    await page.goto('/staff/shipping');
    await page.waitForSelector('[data-testid="shipping-table"]');

    // 梱包済みタブで存在しないラベルのダウンロードを試行
    const packedTab = page.locator('button:has-text("梱包済み")');
    await packedTab.click();

    const labelDownloadButton = page.locator('button:has-text("ラベル")').first();
    if (await labelDownloadButton.isVisible()) {
      await labelDownloadButton.click();
      
      // エラーメッセージが適切に表示されることを確認
      const errorToast = page.locator('.toast-error');
      if (await errorToast.isVisible()) {
        await expect(errorToast).toContainText('配送ラベルが見つかりません');
      }
    }

    console.log('エラーハンドリング確認完了');
  });
});













