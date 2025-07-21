import { test, expect } from '@playwright/test';

test.describe('業務フローのスクロール動作テスト', () => {
  
  test.beforeEach(async ({ page }) => {
    // Sellerログイン処理
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(3000); // 初期化待機
  });

  test('スクロール動作の確認 - 下スクロールで閉じ、最上部に戻っても開かない', async ({ page }) => {
    // 業務フローが初期状態で表示されていることを確認
    await expect(page.locator('text=業務フロー')).toBeVisible();
    const flowContent = page.locator('.unified-product-flow, [data-testid="unified-product-flow"]').first();
    
    // 初期状態で業務フローが開いていることを確認
    await expect(flowContent).toBeVisible();
    console.log('✅ 初期状態: 業務フローが開いています');
    
    // 下スクロールして業務フローが閉じることを確認
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    
    // 業務フローが閉じたことを確認
    const isFlowHidden = await flowContent.isHidden();
    expect(isFlowHidden).toBe(true);
    console.log('✅ 下スクロール後: 業務フローが閉じました');
    
    // 最上部に戻る
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);
    
    // 最上部に戻っても業務フローが閉じたままであることを確認
    const isStillHidden = await flowContent.isHidden();
    expect(isStillHidden).toBe(true);
    console.log('✅ 最上部に戻った後: 業務フローは閉じたままです（期待通り）');
    
    // 右上のトグルボタンを探す
    const toggleButton = page.locator('button[title*="フローを展開"], button[title*="フローを折りたたむ"]').first();
    await expect(toggleButton).toBeVisible();
    
    // トグルボタンをクリックして業務フローを開く
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    // 業務フローが開いたことを確認
    await expect(flowContent).toBeVisible();
    console.log('✅ トグルボタンクリック後: 業務フローが開きました');
    
    // 再度下スクロールして業務フローが閉じることを確認
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    
    const isFlowHiddenAgain = await flowContent.isHidden();
    expect(isFlowHiddenAgain).toBe(true);
    console.log('✅ 再度下スクロール後: 業務フローが閉じました');
  });

  test('上スクロールしても業務フローは開かない', async ({ page }) => {
    // 業務フローが初期状態で表示されていることを確認
    const flowContent = page.locator('.unified-product-flow, [data-testid="unified-product-flow"]').first();
    
    // 下スクロールして業務フローを閉じる
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    
    // 業務フローが閉じたことを確認
    const isFlowHidden = await flowContent.isHidden();
    expect(isFlowHidden).toBe(true);
    
    // 中間位置までスクロール
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(500);
    
    // 上スクロール
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(1000);
    
    // 上スクロール後も業務フローが閉じたままであることを確認
    const isStillHidden = await flowContent.isHidden();
    expect(isStillHidden).toBe(true);
    console.log('✅ 上スクロール後: 業務フローは閉じたままです（期待通り）');
  });
}); 