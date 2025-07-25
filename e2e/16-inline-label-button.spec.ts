import { test, expect } from '@playwright/test';

test.describe('一覧ラベルボタンテスト', () => {
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

  test('一覧の「ラベル」ボタンから直接配送業者選択モーダルが表示される', async ({ page }) => {
    console.log('テスト開始: 一覧ラベルボタンからの配送業者選択モーダル表示');
    
    // 全体タブで確認
    await page.click('button:has-text("全体")');
    await page.waitForTimeout(1000);
    
    // 商品行を探す
    const itemRows = page.locator('.holo-row');
    const rowCount = await itemRows.count();
    console.log(`商品行数: ${rowCount}`);
    
    if (rowCount === 0) {
      throw new Error('商品が見つかりません');
    }
    
    // packed状態の商品の「ラベル」ボタンを探す
    let labelButtonFound = false;
    let targetRow = null;
    
    for (let i = 0; i < rowCount; i++) {
      const row = itemRows.nth(i);
      const labelButton = row.getByRole('button', { name: 'ラベル' });
      
      if (await labelButton.count() > 0) {
        console.log(`行 ${i + 1} で「ラベル」ボタンを発見`);
        targetRow = row;
        labelButtonFound = true;
        break;
      }
    }
    
    if (!labelButtonFound) {
      console.log('packed状態の商品が見つかりません。inspected商品を梱包済み状態にします。');
      
      // inspected状態の商品を探して梱包処理を行う
      for (let i = 0; i < rowCount; i++) {
        const row = itemRows.nth(i);
        const packButton = row.getByRole('button', { name: '梱包' });
        
        if (await packButton.count() > 0) {
          console.log(`行 ${i + 1} で「梱包」ボタンをクリック`);
          await packButton.click();
          await page.waitForTimeout(2000); // 梱包処理完了を待機
          
          // 同じ行の「ラベル」ボタンを確認
          const labelButton = row.getByRole('button', { name: 'ラベル' });
          if (await labelButton.count() > 0) {
            targetRow = row;
            labelButtonFound = true;
            break;
          }
        }
      }
    }
    
    if (!labelButtonFound || !targetRow) {
      throw new Error('「ラベル」ボタンが見つかりません');
    }
    
    // 「ラベル」ボタンをクリック
    const labelButton = targetRow.getByRole('button', { name: 'ラベル' });
    await expect(labelButton).toBeVisible();
    console.log('「ラベル」ボタンをクリックします');
    await labelButton.click();
    
    // 配送業者選択モーダルが直接表示されることを確認
    const carrierModal = page.locator('.nexus-modal:has-text("配送業者選択")');
    await expect(carrierModal).toBeVisible({ timeout: 5000 });
    console.log('✅ 成功: 配送業者選択モーダルが直接表示されました！');
    
    // 配送業者の選択肢が表示されることを確認
    await expect(carrierModal.locator('text=FedEx')).toBeVisible();
    await expect(carrierModal.locator('text=ヤマト運輸')).toBeVisible();
    await expect(carrierModal.locator('text=佐川急便')).toBeVisible();
    await expect(carrierModal.locator('text=ゆうパック')).toBeVisible();
    console.log('✅ 全ての配送業者選択肢が表示されています');
    
    // 詳細モーダルが表示されていないことを確認
    const detailModal = page.locator('.nexus-modal').filter({ hasNotText: '配送業者選択' });
    await expect(detailModal).not.toBeVisible();
    console.log('✅ 詳細モーダルは表示されていません（直接遷移成功）');
  });

  test('配送業者選択からラベル生成まで完全フロー', async ({ page }) => {
    console.log('一覧ラベルボタンからの完全フローテストを開始');
    
    // 全体タブで確認
    await page.click('button:has-text("全体")');
    await page.waitForTimeout(1000);
    
    const itemRows = page.locator('.holo-row');
    let targetRow = null;
    
    // packed状態の商品または梱包可能な商品を探す
    const rowCount = await itemRows.count();
    for (let i = 0; i < rowCount; i++) {
      const row = itemRows.nth(i);
      
      // まずラベルボタンがあるかチェック
      const labelButton = row.getByRole('button', { name: 'ラベル' });
      if (await labelButton.count() > 0) {
        targetRow = row;
        break;
      }
      
      // なければ梱包ボタンがあるかチェック
      const packButton = row.getByRole('button', { name: '梱包' });
      if (await packButton.count() > 0) {
        await packButton.click();
        await page.waitForTimeout(2000);
        
        const labelButton = row.getByRole('button', { name: 'ラベル' });
        if (await labelButton.count() > 0) {
          targetRow = row;
          break;
        }
      }
    }
    
    if (!targetRow) {
      throw new Error('ラベル印刷可能な商品が見つかりません');
    }
    
    // ラベルボタンをクリック
    const labelButton = targetRow.getByRole('button', { name: 'ラベル' });
    await labelButton.click();
    
    // 配送業者選択モーダルが表示される
    const carrierModal = page.locator('.nexus-modal:has-text("配送業者選択")');
    await expect(carrierModal).toBeVisible();
    
    // ヤマト運輸を選択
    await carrierModal.getByText('ヤマト運輸').click();
    await page.waitForTimeout(500);
    
    // ラベル生成ボタンをクリック
    const generateButton = carrierModal.locator('button:has-text("ラベル生成")');
    await expect(generateButton).toBeEnabled();
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
    
    // モーダルが閉じることを確認
    await expect(carrierModal).not.toBeVisible();
    
    console.log('✅ 一覧ラベルボタンからの完全フローが正常に完了しました');
  });
}); 