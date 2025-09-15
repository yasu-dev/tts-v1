import { test, expect } from '@playwright/test';

test.describe('ドロップダウン動作デバッグ', () => {

  test('セラー在庫管理: ドロップダウン動作の詳細調査', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('🔍 ドロップダウン動作の詳細調査');

    // ページ内のボタン要素をすべて探す
    const allButtons = await page.locator('button').all();
    console.log(`発見されたボタン数: ${allButtons.length}`);

    // ステータスに関連するボタンを探す
    let statusButton = null;
    for (let i = 0; i < allButtons.length; i++) {
      const buttonText = await allButtons[i].textContent();
      if (buttonText && (buttonText.includes('ステータス') || buttonText.includes('すべて'))) {
        console.log(`✅ ステータス関連ボタン発見: "${buttonText}"`);
        statusButton = allButtons[i];
        break;
      }
    }

    if (!statusButton) {
      // ラベルからドロップダウンを探す
      const statusLabel = page.locator('label:has-text("ステータス")');
      if (await statusLabel.count() > 0) {
        console.log('✅ ステータスラベル発見');

        // ラベルの親要素からボタンを探す
        const parentDiv = statusLabel.locator('..').first();
        const buttonInParent = parentDiv.locator('button').first();

        if (await buttonInParent.count() > 0) {
          statusButton = buttonInParent;
          const buttonText = await statusButton.textContent();
          console.log(`✅ ラベル経由でボタン発見: "${buttonText}"`);
        }
      }
    }

    if (statusButton) {
      console.log('🖱️ ステータスボタンをクリックします...');

      // クリック前の状態をチェック
      const portalBefore = await page.locator('div[class*="fixed z-"]').count();
      console.log(`クリック前のポータル要素数: ${portalBefore}`);

      await statusButton.click();
      await page.waitForTimeout(1000);

      // クリック後の状態をチェック
      const portalAfter = await page.locator('div[class*="fixed z-"]').count();
      console.log(`クリック後のポータル要素数: ${portalAfter}`);

      // 様々なセレクターでドロップダウンを探す
      const selectors = [
        'div[class*="fixed z-"]',
        '[role="listbox"]',
        '[aria-expanded="true"]',
        'div[class*="shadow"]',
        'div[class*="dropdown"]',
        'div[class*="menu"]'
      ];

      for (const selector of selectors) {
        const elements = await page.locator(selector).count();
        if (elements > 0) {
          console.log(`✅ セレクター "${selector}": ${elements}個の要素発見`);

          // 要素の内容を確認
          const contents = await page.locator(selector).allTextContents();
          contents.forEach((content, index) => {
            if (content.trim().length > 0 && content.length < 200) {
              console.log(`   内容[${index}]: "${content}"`);
            }
          });
        }
      }

      // ページ全体のHTMLをチェック（ポータル内容確認）
      const html = await page.content();
      if (html.includes('すべてのステータス')) {
        console.log('✅ HTMLに「すべてのステータス」が含まれています');

        // より具体的にポータル要素を探す
        const specificSelectors = [
          'div:has-text("すべてのステータス")',
          'div:has-text("出品中")',
          'div:has-text("配送中")',
          'span:has-text("すべてのステータス")',
          'span:has-text("出品中")'
        ];

        for (const selector of specificSelectors) {
          const count = await page.locator(selector).count();
          if (count > 0) {
            console.log(`✅ "${selector}": ${count}個発見`);
          }
        }
      }

      // ドロップダウンを閉じるためにEscapeを押す
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

    } else {
      console.log('❌ ステータスドロップダウンボタンが見つかりませんでした');

      // 代替手段でボタンを探す
      const alternativeSelectors = [
        'button:has-text("すべて")',
        'button[aria-haspopup="listbox"]',
        'div[role="combobox"]',
        'button[class*="dropdown"]'
      ];

      for (const selector of alternativeSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`代替発見: "${selector}": ${count}個`);
        }
      }
    }
  });

  test('正確なテーブル列の特定', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('🔍 セラー在庫管理テーブル構造の詳細分析');

    // テーブルヘッダーを取得
    const headers = await page.locator('table thead th').allTextContents();
    console.log('テーブルヘッダー:', headers);

    // 各ヘッダーのインデックスを確認
    headers.forEach((header, index) => {
      console.log(`列${index + 1}: ${header}`);
    });

    // ステータス列のインデックスを特定
    const statusColumnIndex = headers.findIndex(header => header.includes('ステータス')) + 1;
    console.log(`ステータス列インデックス: ${statusColumnIndex}`);

    if (statusColumnIndex > 0) {
      // 正確なステータス列からデータを取得
      const statusCells = await page.locator(`table tbody tr td:nth-child(${statusColumnIndex})`).allTextContents();
      const uniqueStatuses = [...new Set(statusCells.filter(text => text.trim().length > 0))];
      console.log('正確なステータスデータ:', uniqueStatuses);
    }

    // スタッフ在庫管理も同様にチェック
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n🔍 スタッフ在庫管理テーブル構造の詳細分析');

    const staffHeaders = await page.locator('table thead th').allTextContents();
    console.log('スタッフテーブルヘッダー:', staffHeaders);

    staffHeaders.forEach((header, index) => {
      console.log(`列${index + 1}: ${header}`);
    });

    const staffStatusColumnIndex = staffHeaders.findIndex(header => header.includes('ステータス')) + 1;
    console.log(`スタッフステータス列インデックス: ${staffStatusColumnIndex}`);

    if (staffStatusColumnIndex > 0) {
      const staffStatusCells = await page.locator(`table tbody tr td:nth-child(${staffStatusColumnIndex})`).allTextContents();
      const staffUniqueStatuses = [...new Set(staffStatusCells.filter(text => text.trim().length > 0))];
      console.log('スタッフ正確なステータスデータ:', staffUniqueStatuses);
    }

    // セラー販売管理も同様にチェック
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n🔍 セラー販売管理テーブル構造の詳細分析');

    const salesHeaders = await page.locator('table thead th').allTextContents();
    console.log('販売管理テーブルヘッダー:', salesHeaders);

    salesHeaders.forEach((header, index) => {
      console.log(`列${index + 1}: ${header}`);
    });

    const salesStatusColumnIndex = salesHeaders.findIndex(header => header.includes('ステータス')) + 1;
    console.log(`販売管理ステータス列インデックス: ${salesStatusColumnIndex}`);

    if (salesStatusColumnIndex > 0) {
      const salesStatusCells = await page.locator(`table tbody tr td:nth-child(${salesStatusColumnIndex})`).allTextContents();
      const salesUniqueStatuses = [...new Set(salesStatusCells.filter(text => text.trim().length > 0))];
      console.log('販売管理正確なステータスデータ:', salesUniqueStatuses);
    }
  });
});