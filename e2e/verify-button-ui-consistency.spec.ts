import { test, expect } from '@playwright/test';

test.describe('詳細ボタンUI統一の確認', () => {
  test('スタッフ在庫管理とセラー在庫管理の詳細ボタンUIが統一されていることを確認', async ({ page }) => {
    // スタッフ在庫管理の詳細ボタンを確認
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // スタッフ在庫管理の詳細ボタンの情報を取得
    const staffDetailButtons = await page.$$eval('.holo-table tbody tr td:last-child button', buttons =>
      buttons.map(button => ({
        text: button.textContent?.trim() || '',
        hasIcon: button.querySelector('svg') !== null,
        iconClass: button.querySelector('svg')?.getAttribute('class') || '',
        buttonClass: button.getAttribute('class') || '',
        variant: button.getAttribute('class')?.includes('secondary') ? 'secondary' : 'primary'
      }))
    );

    console.log('=== スタッフ在庫管理の詳細ボタン ===');
    if (staffDetailButtons.length > 0) {
      const firstButton = staffDetailButtons[0];
      console.log(`テキスト: ${firstButton.text}`);
      console.log(`アイコンあり: ${firstButton.hasIcon ? 'はい' : 'いいえ'}`);
      console.log(`アイコンクラス: ${firstButton.iconClass}`);
      console.log(`バリアント: ${firstButton.variant}`);
    }

    // スタッフ在庫管理のスクリーンショット
    const staffTable = await page.$('.holo-table');
    if (staffTable) {
      await staffTable.screenshot({
        path: 'staff-inventory-button-ui.png'
      });
    }

    // セラー在庫管理の詳細ボタンを確認
    await page.goto('http://localhost:3002/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    const sellerDetailButtons = await page.$$eval('.holo-table tbody tr td:last-child button', buttons =>
      buttons.filter(button => button.textContent?.includes('詳細')).map(button => ({
        text: button.textContent?.trim() || '',
        hasIcon: button.querySelector('svg') !== null,
        iconClass: button.querySelector('svg')?.getAttribute('class') || '',
        buttonClass: button.getAttribute('class') || '',
        variant: button.getAttribute('class')?.includes('secondary') ? 'secondary' : 'primary'
      }))
    );

    console.log('\n=== セラー在庫管理の詳細ボタン ===');
    if (sellerDetailButtons.length > 0) {
      const firstButton = sellerDetailButtons[0];
      console.log(`テキスト: ${firstButton.text}`);
      console.log(`アイコンあり: ${firstButton.hasIcon ? 'はい' : 'いいえ'}`);
      console.log(`アイコンクラス: ${firstButton.iconClass}`);
      console.log(`バリアント: ${firstButton.variant}`);
    }

    // セラー在庫管理のスクリーンショット
    const sellerTable = await page.$('.holo-table');
    if (sellerTable) {
      await sellerTable.screenshot({
        path: 'seller-inventory-button-ui.png'
      });
    }

    // UI統一の検証
    console.log('\n=== UI統一性の検証 ===');

    if (staffDetailButtons.length > 0 && sellerDetailButtons.length > 0) {
      const staffButton = staffDetailButtons[0];
      const sellerButton = sellerDetailButtons[0];

      console.log(`テキスト統一: ${staffButton.text === sellerButton.text ? '✅' : '❌'}`);
      console.log(`アイコン統一: ${staffButton.hasIcon === sellerButton.hasIcon ? '✅' : '❌'}`);
      console.log(`バリアント統一: ${staffButton.variant === sellerButton.variant ? '✅' : '❌'}`);

      // アサーション
      expect(staffButton.text).toBe(sellerButton.text);
      expect(staffButton.hasIcon).toBe(sellerButton.hasIcon);
      expect(staffButton.variant).toBe(sellerButton.variant);

      if (staffButton.hasIcon && sellerButton.hasIcon) {
        expect(staffButton.iconClass).toContain('w-4 h-4');
        expect(sellerButton.iconClass).toContain('w-4 h-4');
      }

      console.log('✅ すべてのUI要素が統一されています');
    } else {
      console.log('❌ ボタンが見つかりませんでした');
    }
  });
});