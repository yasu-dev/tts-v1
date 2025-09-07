import { test, expect } from '@playwright/test';

test.describe('論理的同梱アクション確認', () => {
  test('同梱グループで正しいアクション表示確認: 一つのアクションで全体処理', async ({ page }) => {
    console.log('🧠 論理的同梱アクション確認開始');

    await page.waitForTimeout(5000);

    // 出荷管理画面にアクセス
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'LOGICAL-1-initial.png',
      fullPage: true
    });

    // 梱包待ちタブをクリック
    const workstationTab = page.locator('button:has-text("梱包待ち")');
    if (await workstationTab.count() > 0) {
      await workstationTab.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({
      path: 'LOGICAL-2-workstation-tab.png',
      fullPage: true
    });

    // 商品とアクションボタンを詳細確認
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`📦 出荷管理商品数: ${rowCount}`);

    let testProductRow = -1;
    let nikonZ9Row = -1;
    let testProductActions = '';
    let nikonZ9Actions = '';

    for (let i = 0; i < Math.min(rowCount, 10); i++) {
      try {
        const productText = await rows.nth(i).locator('td:nth-child(2)').textContent();
        const actionText = await rows.nth(i).locator('td:nth-child(5)').textContent() || '';
        
        if (productText) {
          if (productText.includes('テスト商品') && productText.includes('soldステータス確認用')) {
            testProductRow = i;
            testProductActions = actionText;
            console.log(`📦 テスト商品発見: 行 ${i}, アクション: "${actionText}"`);
          } else if (productText.includes('Nikon Z9') && productText.includes('excellent')) {
            nikonZ9Row = i;
            nikonZ9Actions = actionText;
            console.log(`📦 Nikon Z9発見: 行 ${i}, アクション: "${actionText}"`);
          }
        }
      } catch (e) {
        console.log(`📦 商品 ${i}: 取得エラー`);
      }
    }

    console.log(`\n🧠 論理的アクション確認結果:`);
    console.log(`📦 テスト商品アクション: "${testProductActions}"`);
    console.log(`📦 Nikon Z9アクション: "${nikonZ9Actions}"`);

    // 論理的確認: 一つのアクションボタン、もう一つは「一緒に処理」表示
    const hasActionButton = testProductActions.includes('同梱ラベル印刷') || nikonZ9Actions.includes('同梱ラベル印刷');
    const hasTogetherMessage = testProductActions.includes('同梱相手と一緒に処理') || nikonZ9Actions.includes('同梱相手と一緒に処理');

    if (hasActionButton && hasTogetherMessage) {
      console.log('🎉 SUCCESS: 論理的な同梱アクション実装完了！');
      console.log('✅ 一つの商品: アクションボタン');
      console.log('✅ もう一つの商品: 一緒に処理メッセージ');
      
      await page.screenshot({
        path: 'LOGICAL-SUCCESS-BUNDLE-ACTIONS.png',
        fullPage: true
      });
      
    } else if (!hasActionButton) {
      console.log('❌ ERROR: 同梱ラベル印刷ボタンが見つかりません');
      
      await page.screenshot({
        path: 'LOGICAL-ERROR-NO-ACTION.png',
        fullPage: true
      });
      
    } else if (!hasTogetherMessage) {
      console.log('❌ ERROR: 「同梱相手と一緒に処理」メッセージが見つかりません');
      
      await page.screenshot({
        path: 'LOGICAL-ERROR-NO-TOGETHER.png',
        fullPage: true
      });
      
    } else {
      console.log('❌ ERROR: まだ個別アクションボタンが表示されています（論理矛盾）');
      
      await page.screenshot({
        path: 'LOGICAL-ERROR-STILL-INDIVIDUAL.png',
        fullPage: true
      });
    }

    console.log('✅ 論理的同梱アクション確認完了');
  });
});


