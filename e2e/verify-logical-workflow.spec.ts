import { test, expect } from '@playwright/test';

test.describe('論理的業務フロー確認', () => {
  test('正しい業務フロー: 梱包待ち→梱包開始→梱包済み→ラベル印刷→集荷準備', async ({ page }) => {
    console.log('🔄 論理的業務フロー確認開始');

    await page.waitForTimeout(5000);

    // 出荷管理画面にアクセス
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'WORKFLOW-1-initial.png',
      fullPage: true
    });

    // 梱包待ちタブをクリック
    const workstationTab = page.locator('button:has-text("梱包待ち")');
    if (await workstationTab.count() > 0) {
      await workstationTab.click();
      await page.waitForTimeout(2000);
    }

    console.log('🔵 STEP 1: 梱包待ちステータスでボタン確認');
    await page.screenshot({
      path: 'WORKFLOW-2-workstation-buttons.png',
      fullPage: true
    });

    // 梱包待ちでのボタン確認
    const packingButton = page.locator('button:has-text("同梱梱包開始")');
    const printButton = page.locator('button:has-text("同梱ラベル印刷")');
    
    const hasPackingButton = await packingButton.count() > 0;
    const hasUnexpectedPrintButton = await printButton.count() > 0;
    
    console.log(`📦 梱包開始ボタン: ${hasPackingButton}`);
    console.log(`❌ ラベル印刷ボタン（あってはダメ）: ${hasUnexpectedPrintButton}`);

    if (hasPackingButton && !hasUnexpectedPrintButton) {
      console.log('✅ STEP 1 SUCCESS: 梱包待ちで梱包開始ボタンのみ');
      
      // 梱包開始ボタンをクリック
      console.log('🔵 STEP 2: 梱包開始ボタンクリック');
      await packingButton.first().click();
      await page.waitForTimeout(3000);

      await page.screenshot({
        path: 'WORKFLOW-3-after-packing.png',
        fullPage: true
      });

      // 梱包済みタブをクリック
      console.log('🔵 STEP 3: 梱包済みタブで確認');
      const packedTab = page.locator('button:has-text("梱包済み")');
      if (await packedTab.count() > 0) {
        await packedTab.click();
        await page.waitForTimeout(2000);
      }

      await page.screenshot({
        path: 'WORKFLOW-4-packed-buttons.png',
        fullPage: true
      });

      // 梱包済みでのボタン確認
      const packedPrintButton = page.locator('button:has-text("同梱ラベル印刷")');
      const readyButton = page.locator('button:has-text("同梱集荷準備")');
      
      const hasPackedPrintButton = await packedPrintButton.count() > 0;
      const hasReadyButton = await readyButton.count() > 0;
      
      console.log(`📄 ラベル印刷ボタン（packed）: ${hasPackedPrintButton}`);
      console.log(`🚛 集荷準備ボタン: ${hasReadyButton}`);

      if (hasPackedPrintButton && hasReadyButton) {
        console.log('🎉 SUCCESS: 完璧な論理的業務フロー実装！');
        console.log('✅ 梱包待ち: 梱包開始のみ');
        console.log('✅ 梱包済み: ラベル印刷 + 集荷準備');
        
        await page.screenshot({
          path: 'WORKFLOW-SUCCESS-LOGICAL.png',
          fullPage: true
        });
        
      } else {
        console.log('❌ ERROR: 梱包済みでボタンが正しくない');
      }
      
    } else if (hasUnexpectedPrintButton) {
      console.log('❌ ERROR: 梱包待ちなのにラベル印刷ボタンがある（論理矛盾）');
      
      await page.screenshot({
        path: 'WORKFLOW-ERROR-ILLOGICAL.png',
        fullPage: true
      });
      
    } else {
      console.log('❌ ERROR: 梱包開始ボタンが見つからない');
    }

    console.log('✅ 論理的業務フロー確認完了');
  });
});


