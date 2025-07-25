import { test, expect } from '@playwright/test';

test.describe('配送業者選択モーダルテスト', () => {
  test.beforeEach(async ({ page }) => {
    // スタッフとしてログイン
    await page.goto('/login');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/staff/dashboard');
    
    // 出荷管理ページへ移動
    await page.goto('/staff/shipping');
    await page.waitForURL('/staff/shipping');
  });

  test('配送業者選択モーダルが表示される', async ({ page }) => {
    console.log('テスト開始: 配送業者選択モーダルの表示確認');
    
    // 梱包済み（packed）ステータスの商品を探す
    await page.click('button:has-text("梱包待ち")');
    await page.waitForTimeout(1000);
    
    // 商品行が存在することを確認
    const itemRows = page.locator('.holo-row');
    const rowCount = await itemRows.count();
    console.log(`商品行数: ${rowCount}`);
    
    if (rowCount === 0) {
      console.log('梱包済み商品が見つかりません。全体タブで確認します。');
      await page.click('button:has-text("全体")');
      await page.waitForTimeout(1000);
    }
    
    // 梱包済み商品の「ラベル」ボタンをクリック（これで詳細モーダルが開く）
    const firstRow = page.locator('.holo-row').first();
    await expect(firstRow).toBeVisible();
    
    const labelButton = firstRow.getByRole('button', { name: 'ラベル' });
    await expect(labelButton).toBeVisible();
    await labelButton.click();
    
    // 出荷詳細モーダルが表示されることを確認
    const shippingModal = page.locator('.nexus-modal').first();
    await expect(shippingModal).toBeVisible();
    console.log('出荷詳細モーダルが表示されました');
    
    // ラベル印刷ボタンを探す
    const printLabelButton = shippingModal.locator('button:has-text("ラベル印刷")');
    
    if (await printLabelButton.count() > 0) {
      console.log('ラベル印刷ボタンが見つかりました');
      await expect(printLabelButton).toBeVisible();
      
      // ラベル印刷ボタンをクリック
      await printLabelButton.click();
      
      // 配送業者選択モーダルが表示されることを確認
      const carrierModal = page.locator('.nexus-modal:has-text("配送業者選択")');
      
      if (await carrierModal.count() > 0) {
        await expect(carrierModal).toBeVisible();
        console.log('✅ 成功: 配送業者選択モーダルが表示されました！');
        
        // 配送業者の選択肢が表示されることを確認
        await expect(carrierModal.locator('text=FedEx')).toBeVisible();
        await expect(carrierModal.locator('text=ヤマト運輸')).toBeVisible();
        await expect(carrierModal.locator('text=佐川急便')).toBeVisible();
        await expect(carrierModal.locator('text=ゆうパック')).toBeVisible();
        
        console.log('✅ 全ての配送業者選択肢が表示されています');
        
        // FedExを選択してラベル生成テスト
        await carrierModal.getByText('FedEx').click();
        await page.waitForTimeout(500);
        
        const generateButton = carrierModal.locator('button:has-text("ラベル生成")');
        await expect(generateButton).toBeVisible();
        await expect(generateButton).toBeEnabled();
        
        console.log('✅ 配送業者選択後、ラベル生成ボタンが有効になりました');
        
      } else {
        console.log('❌ 失敗: 配送業者選択モーダルが表示されませんでした');
        
        // デバッグ情報を収集
        const allModals = page.locator('.nexus-modal');
        const modalCount = await allModals.count();
        console.log(`現在表示されているモーダル数: ${modalCount}`);
        
        for (let i = 0; i < modalCount; i++) {
          const modalText = await allModals.nth(i).textContent();
          console.log(`モーダル ${i + 1}: ${modalText?.substring(0, 100)}...`);
        }
        
        // PDFが直接ダウンロードされる古い動作かチェック
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        const download = await downloadPromise;
        
        if (download) {
          console.log('❌ 古い動作: PDFが直接ダウンロードされています');
          console.log(`ダウンロードファイル名: ${download.suggestedFilename()}`);
          throw new Error('配送業者選択モーダルではなく、直接PDFダウンロードが実行されました');
        }
        
        throw new Error('配送業者選択モーダルが表示されませんでした');
      }
    } else {
      console.log('ラベル印刷ボタンが見つかりません。商品ステータスを確認します。');
      
      // 商品ステータスを確認
      const statusElement = shippingModal.locator('[class*="status"]').first();
      if (await statusElement.count() > 0) {
        const statusText = await statusElement.textContent();
        console.log(`商品ステータス: ${statusText}`);
      }
      
      // 利用可能なボタンを確認
      const allButtons = shippingModal.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`利用可能なボタン数: ${buttonCount}`);
      
      for (let i = 0; i < buttonCount; i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`ボタン ${i + 1}: ${buttonText}`);
      }
      
      throw new Error('ラベル印刷ボタンが見つかりません。商品が梱包済み状態ではない可能性があります。');
    }
  });

  test('配送業者選択フローの完全テスト', async ({ page }) => {
    console.log('配送業者選択フローの完全テストを開始');
    
    // 梱包済み商品を探すか、テスト用に商品を梱包済み状態にする
    await page.click('button:has-text("梱包待ち")');
    await page.waitForTimeout(1000);
    
    const itemRows = page.locator('.holo-row');
    const rowCount = await itemRows.count();
    
    if (rowCount > 0) {
      // 最初の商品を詳細表示
      const firstRow = itemRows.first();
      const detailButton = firstRow.locator('button.nexus-button:has-text("詳細")');
      await detailButton.click();
      
      const shippingModal = page.locator('.nexus-modal').first();
      await expect(shippingModal).toBeVisible();
      
      // ラベル印刷ボタンをクリック
      const labelButton = shippingModal.locator('button:has-text("ラベル印刷")');
      
      if (await labelButton.count() > 0) {
        await labelButton.click();
        
        // 配送業者選択モーダルが表示される
        const carrierModal = page.locator('.nexus-modal:has-text("配送業者選択")');
        await expect(carrierModal).toBeVisible();
        
        // ヤマト運輸を選択
        await carrierModal.getByText('ヤマト運輸').click();
        await page.waitForTimeout(500);
        
        // 配送サービスが表示されることを確認
        const serviceOptions = carrierModal.locator('[type="radio"]');
        await expect(serviceOptions.first()).toBeVisible();
        
        // ラベル生成ボタンをクリック
        const generateButton = carrierModal.locator('button:has-text("ラベル生成")');
        await generateButton.click();
        
        // ラベル生成中のトースト通知を確認
        await expect(page.getByText('ラベル生成中')).toBeVisible();
        
        // PDFダウンロードが開始されることを確認
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        const download = await downloadPromise;
        
        console.log(`✅ ラベルPDFがダウンロードされました: ${download.suggestedFilename()}`);
        
        // ファイル名に配送業者情報が含まれていることを確認
        expect(download.suggestedFilename()).toContain('yamato');
        
        // 成功トースト通知を確認
        await expect(page.getByText('ラベル生成完了')).toBeVisible();
        
        console.log('✅ 配送業者選択フローが正常に完了しました');
      }
    }
  });

  test('コンソールエラーチェック', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // 基本的なフローを実行
    await page.click('button:has-text("全体")');
    await page.waitForTimeout(1000);
    
    const itemRows = page.locator('.holo-row');
    if (await itemRows.count() > 0) {
      const firstRow = itemRows.first();
      const detailButton = firstRow.locator('button.nexus-button:has-text("詳細")');
      await detailButton.click();
      
      const shippingModal = page.locator('.nexus-modal').first();
      await expect(shippingModal).toBeVisible();
    }
    
    // エラーがないことを確認
    if (errors.length > 0) {
      console.log('コンソールエラー:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}: ${error}`);
      });
    }
    
    expect(errors.length).toBe(0);
  });
}); 