import { test, expect } from '@playwright/test';

test.describe('出荷管理画面 - デバッグテスト', () => {
  test('画面要素の詳細確認', async ({ page }) => {
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForTimeout(5000);
    
    // 梱包済みタブをクリック
    await page.click('button:has-text("梱包済み")');
    await page.waitForTimeout(2000);
    
    // 商品行を展開
    const rows = page.locator('tbody tr');
    if (await rows.count() > 0) {
      await rows.first().click();
      await page.waitForTimeout(2000);
      
      // すべてのspan要素をチェック
      const allSpans = page.locator('span');
      const spanCount = await allSpans.count();
      console.log('総span要素数:', spanCount);
      
      for (let i = 0; i < Math.min(spanCount, 10); i++) {
        const span = allSpans.nth(i);
        const text = await span.textContent();
        const className = await span.getAttribute('class');
        if (text && /^[1-4]$/.test(text.trim())) {
          console.log(`ステップ数字候補 ${i}: テキスト="${text}", クラス="${className}"`);
        }
      }
    }
    
    // 集荷エリアへ移動ボタンの詳細確認
    const moveButtons = page.locator('button:has-text("集荷エリアへ移動")');
    const moveButtonCount = await moveButtons.count();
    console.log('集荷エリアへ移動ボタン数:', moveButtonCount);
    
    if (moveButtonCount > 0) {
      const button = moveButtons.first();
      const isEnabled = await button.isEnabled();
      const isVisible = await button.isVisible();
      console.log('ボタン有効:', isEnabled);
      console.log('ボタン表示:', isVisible);
    }
  });
});
