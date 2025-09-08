import { test, expect } from '@playwright/test';

test.describe('テストボタン表示確認', () => {
  test('強制テストボタンが表示されるか確認', async ({ page }) => {
    console.log('🚨 テストボタン表示確認開始');

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const testButton = page.locator('button:has-text("🚨 テスト")');
    const testButtonCount = await testButton.count();
    
    console.log(`🚨 テストボタン数: ${testButtonCount}`);

    if (testButtonCount > 0) {
      console.log('✅ SUCCESS: テストボタンは表示されています');
      
      // Nikon Z9関連のボタンを確認
      const bundleButtons = page.locator('button:has-text("同梱")');
      const bundleCount = await bundleButtons.count();
      console.log(`📦 同梱関連ボタン数: ${bundleCount}`);
      
    } else {
      console.log('❌ CRITICAL: テストボタンすら表示されない（基本的な問題）');
    }

    await page.screenshot({
      path: 'TEST-BUTTON-VISIBILITY.png',
      fullPage: true
    });

    console.log('🚨 テストボタン表示確認完了');
  });
});



