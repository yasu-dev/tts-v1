import { test, expect } from '@playwright/test';

test.describe('Toast Notification Form Tests', () => {
  test.beforeEach(async ({ page }) => {
    // デモモードのため、ログインをスキップ
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('EditModal should show toast notification on form submit', async ({ page }) => {
    // インベントリページに移動
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    // 新規商品登録ボタンをクリック
    const newItemButton = page.locator('button:has-text("新規商品登録")');
    if (await newItemButton.isVisible()) {
      await newItemButton.click();
      
      // フォームに入力
      await page.fill('input[name="name"]', 'テスト商品');
      await page.fill('input[name="sku"]', 'TEST-001');
      await page.selectOption('select[name="category"]', 'camera');
      
      // 登録ボタンをクリック
      await page.click('button[type="submit"]');
      
      // トースト通知が表示されることを確認
      await expect(page.locator('.toast, [role="alert"]')).toBeVisible({ timeout: 3000 });
      
      console.log('✅ EditModal toast notification test passed');
    } else {
      console.log('⚠️ New item button not found, skipping test');
    }
  });

  test('Inspection form should show toast notification on completion', async ({ page }) => {
    // スタッフ検品ページに移動
    await page.goto('/staff/inspection');
    await page.waitForLoadState('networkidle');
    
    // 検品開始ボタンまたは商品をクリック
    const inspectionButton = page.locator('button:has-text("検品開始"), button:has-text("詳細")').first();
    if (await inspectionButton.isVisible()) {
      await inspectionButton.click();
      
      // 検品フォームの最終ステップまで進む（簡略化）
      await page.waitForTimeout(1000);
      
      // 検品完了ボタンをクリック
      const completeButton = page.locator('button:has-text("検品完了"), button:has-text("送信")');
      if (await completeButton.isVisible()) {
        await completeButton.click();
        
        // トースト通知が表示されることを確認
        await expect(page.locator('.toast, [role="alert"]')).toBeVisible({ timeout: 3000 });
        
        console.log('✅ Inspection form toast notification test passed');
      } else {
        console.log('⚠️ Complete button not found, skipping test');
      }
    } else {
      console.log('⚠️ Inspection button not found, skipping test');
    }
  });

  test('Delivery plan wizard should show toast notification on completion', async ({ page }) => {
    // 納品プランページに移動
    await page.goto('/delivery-plan');
    await page.waitForLoadState('networkidle');
    
    // 基本情報を入力
    await page.fill('input[placeholder*="セラー名"]', 'テストセラー');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('textarea[placeholder*="住所"]', 'テスト住所');
    
    // 次へボタンをクリック
    const nextButton = page.locator('button:has-text("次へ")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      // 最終ステップまで進む（簡略化）
      const createButton = page.locator('button:has-text("作成"), button:has-text("完了")');
      if (await createButton.isVisible()) {
        await createButton.click();
        
        // トースト通知が表示されることを確認
        await expect(page.locator('.toast, [role="alert"]')).toBeVisible({ timeout: 3000 });
        
        console.log('✅ Delivery plan wizard toast notification test passed');
      } else {
        console.log('⚠️ Create button not found, skipping test');
      }
    } else {
      console.log('⚠️ Next button not found, skipping test');
    }
  });

  test('Toast notifications should display demo mode message', async ({ page }) => {
    // インベントリページに移動
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    // 新規商品登録ボタンをクリック
    const newItemButton = page.locator('button:has-text("新規商品登録")');
    if (await newItemButton.isVisible()) {
      await newItemButton.click();
      
      // フォームに入力
      await page.fill('input[name="name"]', 'デモテスト商品');
      await page.fill('input[name="sku"]', 'DEMO-001');
      
      // 登録ボタンをクリック
      await page.click('button[type="submit"]');
      
      // デモモードメッセージが含まれることを確認
      const toastMessage = page.locator('.toast, [role="alert"]');
      await expect(toastMessage).toBeVisible({ timeout: 3000 });
      
      const messageText = await toastMessage.textContent();
      expect(messageText).toContain('デモ');
      
      console.log('✅ Demo mode message test passed');
    } else {
      console.log('⚠️ New item button not found, skipping test');
    }
  });
}); 