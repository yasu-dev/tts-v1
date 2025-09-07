import { test, expect } from '@playwright/test';

test.describe('セラー梱包済みラベルダウンロード', () => {
  test.beforeEach(async ({ page }) => {
    // セラーでログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // セラー画面へ移動
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
  });

  test('梱包済み商品のラベルダウンロードボタンが表示される', async ({ page }) => {
    console.log('セラー画面でのラベルダウンロード機能テスト開始');
    
    // 梱包済み商品があることを確認
    const packedProducts = page.locator('tr').filter({ 
      has: page.locator('[data-status="packed"], .status-badge:has-text("梱包済み"), .status-badge:has-text("処理中"), .status-badge:has-text("完了")') 
    });
    
    // 梱包済み商品が存在する場合のテスト
    const packedCount = await packedProducts.count();
    console.log('梱包済み商品数:', packedCount);
    
    if (packedCount > 0) {
      // ラベルダウンロードボタンが表示されることを確認
      const labelButton = page.locator('button:has-text("ラベル")').first();
      await expect(labelButton).toBeVisible({ timeout: 10000 });
      
      // ボタンをクリックしてダウンロードを実行
      const downloadPromise = page.waitForEvent('download');
      await labelButton.click();
      
      // ダウンロードが開始されることを確認
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('label');
      
      console.log('ラベルダウンロード成功:', download.suggestedFilename());
    } else {
      console.log('梱包済み商品がありません。テストをスキップします。');
      test.skip();
    }
  });
  
  test('ラベル生成とダウンロード統合フロー', async ({ page }) => {
    console.log('ラベル生成→ダウンロード統合フローテスト開始');
    
    // sold状態の商品を探す
    const soldProducts = page.locator('tr').filter({ 
      has: page.locator('[data-status="sold"], .status-badge:has-text("売却済み")') 
    });
    
    const soldCount = await soldProducts.count();
    console.log('売却済み商品数:', soldCount);
    
    if (soldCount > 0) {
      // ラベル生成ボタンをクリック
      const generateButton = page.locator('button:has-text("ラベル生成")').first();
      if (await generateButton.isVisible()) {
        await generateButton.click();
        
        // 配送業者選択モーダル
        await page.waitForSelector('text=配送ラベル生成', { timeout: 10000 });
        await page.selectOption('select', { value: 'fedex' });
        
        // 詳細選択へ進む
        await page.click('button:has-text("詳細選択へ進む")');
        
        // FedExサービス選択
        await page.waitForSelector('text=FedExサービス選択', { timeout: 10000 });
        await page.click('button:has-text("STANDARD_OVERNIGHT")');
        
        // ラベル生成実行
        await page.click('button:has-text("ラベル生成")');
        
        // 成功メッセージを待機
        await expect(page.locator('.toast-success')).toBeVisible({ timeout: 30000 });
        
        // ページリロード
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // ラベルダウンロードボタンが表示されることを確認
        const labelButton = page.locator('button:has-text("ラベル")').first();
        await expect(labelButton).toBeVisible({ timeout: 10000 });
        
        // ダウンロード実行
        const downloadPromise = page.waitForEvent('download');
        await labelButton.click();
        const download = await downloadPromise;
        
        console.log('統合フロー成功 - ダウンロードファイル:', download.suggestedFilename());
        expect(download.suggestedFilename()).toContain('label');
      }
    } else {
      console.log('売却済み商品がありません。テストをスキップします。');
      test.skip();
    }
  });
});
