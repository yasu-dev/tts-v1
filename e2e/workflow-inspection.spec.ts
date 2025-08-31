import { test, expect } from '@playwright/test';

test.describe('WorkflowProgress表示確認', () => {
  test('WorkflowProgressコンポーネントの表示状況を調査', async ({ page }) => {
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
      
      // WorkflowProgress関連の要素を探す
      const progressElements = page.locator('[class*="space-y-4"]');
      const progressCount = await progressElements.count();
      console.log('WorkflowProgress候補要素数:', progressCount);
      
      // すべてのdiv要素でステップ関連のものを探す
      const stepDivs = page.locator('div:has-text("保管中"), div:has-text("梱包作業中"), div:has-text("梱包完了"), div:has-text("集荷準備完了")');
      const stepDivCount = await stepDivs.count();
      console.log('ステップラベルdiv数:', stepDivCount);
      
      if (stepDivCount > 0) {
        for (let i = 0; i < stepDivCount; i++) {
          const div = stepDivs.nth(i);
          const text = await div.textContent();
          console.log(`ステップラベル ${i}: "${text}"`);
        }
      }
      
      // 大きなspan要素（text-2xl）を探す
      const largeSpans = page.locator('span[class*="text-2xl"]');
      const largeSpanCount = await largeSpans.count();
      console.log('text-2xlクラスのspan数:', largeSpanCount);
      
      if (largeSpanCount > 0) {
        const span = largeSpans.first();
        const text = await span.textContent();
        const className = await span.getAttribute('class');
        console.log('大きなspan: テキスト="' + text + '", クラス="' + className + '"');
      }
    }
  });

  test('実際の集荷エリアへ移動ボタンのクリック動作確認', async ({ page }) => {
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForTimeout(5000);
    
    // 梱包済みタブの数を確認
    await page.click('button:has-text("梱包済み")');
    await page.waitForTimeout(2000);
    
    const packedBefore = await page.locator('button:has-text("梱包済み") span').textContent();
    const readyBefore = await page.locator('button:has-text("集荷準備完了") span').textContent();
    
    console.log('移動前 - 梱包済み:', packedBefore, ', 集荷準備完了:', readyBefore);
    
    // 集荷エリアへ移動ボタンをクリック
    const moveButton = page.locator('button:has-text("集荷エリアへ移動")');
    await moveButton.click();
    await page.waitForTimeout(3000);
    
    // コンソールログを確認
    page.on('console', msg => console.log('ブラウザコンソール:', msg.text()));
    
    // 移動後の数を確認
    const packedAfter = await page.locator('button:has-text("梱包済み") span').textContent();
    const readyAfter = await page.locator('button:has-text("集荷準備完了") span').textContent();
    
    console.log('移動後 - 梱包済み:', packedAfter, ', 集荷準備完了:', readyAfter);
    
    // 集荷準備完了タブをクリック
    await page.click('button:has-text("集荷準備完了")');
    await page.waitForTimeout(2000);
    
    // アイテムが表示されているかチェック
    const readyItems = await page.locator('tbody tr').count();
    console.log('集荷準備完了タブのアイテム数:', readyItems);
  });
});
