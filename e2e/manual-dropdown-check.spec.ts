import { test, expect } from '@playwright/test';

test.describe('手動ドロップダウン確認', () => {

  test('ドロップダウンを手動で開いて10秒待機', async ({ page }) => {
    console.log('=== 手動ドロップダウン確認開始 ===');
    console.log('このテストでは、手動でドロップダウンを操作する時間を提供します');

    await page.goto('http://localhost:3002/delivery');
    await page.waitForTimeout(3000);

    console.log('納品管理ページを開きました');
    console.log('以下の手順でテストしてください:');
    console.log('1. ステータスドロップダウンをクリックして開く');
    console.log('2. 右側の境界線があることを確認');
    console.log('3. 他の場所をクリックして閉じる');
    console.log('4. 期間ドロップダウンをクリックして開く');
    console.log('5. 右側の境界線の有無を確認');
    console.log('6. 期間指定を選択');
    console.log('7. 日付フィールドをクリックして日付ピッカーを開く');
    console.log('8. 日付ピッカーの境界線を確認');

    // 30秒待機して手動確認の時間を提供
    console.log('30秒間待機します。この間に手動でドロップダウンを確認してください...');

    for (let i = 30; i > 0; i--) {
      console.log(`残り ${i} 秒...`);
      await page.waitForTimeout(1000);
    }

    console.log('手動確認時間終了');

    // 最終的にプログラムでドロップダウンの状態を確認
    console.log('=== プログラムでの確認開始 ===');

    // CSSプロパティを詳細に確認
    const selects = page.locator('select');
    const selectCount = await selects.count();

    for (let i = 0; i < selectCount; i++) {
      const select = selects.nth(i);
      const isVisible = await select.isVisible();

      if (isVisible) {
        const styles = await select.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            border: computed.border,
            borderWidth: computed.borderWidth,
            borderStyle: computed.borderStyle,
            borderColor: computed.borderColor,
            borderRight: computed.borderRight,
            borderRightColor: computed.borderRightColor,
            borderRightWidth: computed.borderRightWidth,
            borderRightStyle: computed.borderRightStyle,
            boxShadow: computed.boxShadow,
            outline: computed.outline
          };
        });

        console.log(`Select[${i}] 詳細スタイル:`, JSON.stringify(styles, null, 2));
      }
    }

    console.log('=== 手動ドロップダウン確認完了 ===');
  });

});