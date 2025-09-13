import { test, expect } from '@playwright/test';

test.describe('ドロップダウンの見た目確認', () => {

  test('ドロップダウンを開いて境界線を実際に確認', async ({ page }) => {
    console.log('=== ドロップダウン見た目確認開始 ===');

    await page.goto('http://localhost:3002/delivery');
    await page.waitForTimeout(2000);

    // 初期状態
    await page.screenshot({ path: 'dropdown-initial.png', fullPage: true });
    console.log('初期状態スクリーンショット保存');

    // ステータスドロップダウンを開く
    const statusSelect = page.locator('select').first();
    await statusSelect.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'dropdown-status-open.png', fullPage: true });
    console.log('ステータスドロップダウン開いた状態スクリーンショット保存');

    // 他の場所をクリックして閉じる
    await page.click('body');
    await page.waitForTimeout(500);

    // 期間ドロップダウンを開く
    const periodSelect = page.locator('select').nth(1);
    await periodSelect.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'dropdown-period-open.png', fullPage: true });
    console.log('期間ドロップダウン開いた状態スクリーンショット保存');

    // 期間を「期間指定」に選択
    await periodSelect.selectOption('custom');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'dropdown-custom-period.png', fullPage: true });
    console.log('カスタム期間表示状態スクリーンショット保存');

    // 開始日フィールドをクリックして日付ピッカーを開く
    const startDateInput = page.locator('input[type="date"]').first();
    await startDateInput.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'dropdown-date-picker.png', fullPage: true });
    console.log('日付ピッカー開いた状態スクリーンショット保存');

    // 日付ピッカーを閉じる（ESCキー）
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // 期間を「すべて」に戻す
    await periodSelect.selectOption('all');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'dropdown-final.png', fullPage: true });
    console.log('最終状態スクリーンショット保存');

    console.log('=== 全スクリーンショット保存完了 ===');
    console.log('以下のファイルを確認してください:');
    console.log('- dropdown-initial.png');
    console.log('- dropdown-status-open.png');
    console.log('- dropdown-period-open.png');
    console.log('- dropdown-custom-period.png');
    console.log('- dropdown-date-picker.png');
    console.log('- dropdown-final.png');

    console.log('=== ドロップダウン見た目確認完了 ===');
  });

});