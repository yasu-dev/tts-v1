import { test, expect } from '@playwright/test';

test.describe('最終ステータス表示一致性検証', () => {

  test('セラー在庫管理: カスタムドロップダウンとバッジの一致確認', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('🔍 セラー在庫管理 - カスタムドロップダウン検証');

    // カスタムドロップダウンボタンを探す（ステータスラベル付き）
    const statusDropdownButton = page.locator('div:has-text("ステータス") button').first();

    if (await statusDropdownButton.count() > 0) {
      // ドロップダウンを開く
      await statusDropdownButton.click();
      await page.waitForTimeout(500);

      // ポータルで表示されたドロップダウンメニューの選択肢を取得
      const dropdownOptions = await page.locator('div[class*="fixed z-"] div[class*="cursor-pointer"] span').allTextContents();
      console.log('📋 ステータスフィルター選択肢:', dropdownOptions);

      // ドロップダウンを閉じる
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // テーブル内のステータス列（7番目の列）からステータスを取得
      const statusCells = await page.locator('table tbody tr td:nth-child(7)').allTextContents();
      const uniqueStatuses = [...new Set(statusCells.filter(text => text.trim().length > 0))];
      console.log('🏷️ 実際のステータスバッジ:', uniqueStatuses);

      // 一致性確認
      console.log('\n=== セラー在庫管理 ステータス一致性分析 ===');
      const mismatches: string[] = [];

      uniqueStatuses.forEach(badge => {
        const found = dropdownOptions.some(option => {
          const optionText = option.trim();
          return optionText === badge ||
                 (badge === '出品中' && optionText === '出品中') ||
                 (badge === '配送中' && optionText === '配送中') ||
                 (badge === '保管作業中' && optionText === '保管作業中') ||
                 (badge === '購入者決定' && optionText === '購入者決定') ||
                 (badge === '入庫待ち' && optionText === '入庫待ち') ||
                 (badge === 'キャンセル' && optionText === 'キャンセル') ||
                 (badge === '作業台' && optionText === '作業台');
        });

        console.log(`${badge}: ${found ? '✅ 一致' : '❌ 不一致'}`);
        if (!found) {
          mismatches.push(badge);
        }
      });

      if (mismatches.length > 0) {
        console.log(`\n❗ 不一致が発見されました: ${mismatches.join(', ')}`);
      } else {
        console.log('\n✅ すべてのステータスが一致しています');
      }

    } else {
      console.log('❌ ステータスドロップダウンが見つかりませんでした');
    }
  });

  test('スタッフ在庫管理: カスタムドロップダウンとバッジの一致確認', async ({ page }) => {
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('🔍 スタッフ在庫管理 - カスタムドロップダウン検証');

    // カスタムドロップダウンボタンを探す
    const statusDropdownButton = page.locator('div:has-text("ステータス") button').first();

    if (await statusDropdownButton.count() > 0) {
      // ドロップダウンを開く
      await statusDropdownButton.click();
      await page.waitForTimeout(500);

      // ポータルで表示されたドロップダウンメニューの選択肢を取得
      const dropdownOptions = await page.locator('div[class*="fixed z-"] div[class*="cursor-pointer"] span').allTextContents();
      console.log('📋 ステータスフィルター選択肢:', dropdownOptions);

      // ドロップダウンを閉じる
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // テーブル内のステータス列からステータスを取得
      const statusCells = await page.locator('table tbody tr td:nth-child(6)').allTextContents();
      const uniqueStatuses = [...new Set(statusCells.filter(text => text.trim().length > 0))];
      console.log('🏷️ 実際のステータスバッジ:', uniqueStatuses);

      // 一致性確認
      console.log('\n=== スタッフ在庫管理 ステータス一致性分析 ===');
      const mismatches: string[] = [];

      uniqueStatuses.forEach(badge => {
        const found = dropdownOptions.some(option => option.trim() === badge);
        console.log(`${badge}: ${found ? '✅ 一致' : '❌ 不一致'}`);
        if (!found) {
          mismatches.push(badge);
        }
      });

      if (mismatches.length > 0) {
        console.log(`\n❗ 不一致が発見されました: ${mismatches.join(', ')}`);
      } else {
        console.log('\n✅ すべてのステータスが一致しています');
      }

    } else {
      console.log('❌ ステータスドロップダウンが見つかりませんでした');
    }
  });

  test('セラー販売管理: カスタムドロップダウンとバッジの一致確認', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('🔍 セラー販売管理 - カスタムドロップダウン検証');

    // カスタムドロップダウンボタンを探す
    const statusDropdownButton = page.locator('div:has-text("ステータス") button').first();

    if (await statusDropdownButton.count() > 0) {
      // ドロップダウンを開く
      await statusDropdownButton.click();
      await page.waitForTimeout(500);

      // ポータルで表示されたドロップダウンメニューの選択肢を取得
      const dropdownOptions = await page.locator('div[class*="fixed z-"] div[class*="cursor-pointer"] span').allTextContents();
      console.log('📋 ステータスフィルター選択肢:', dropdownOptions);

      // ドロップダウンを閉じる
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // テーブル内のステータス列からステータスを取得
      const statusCells = await page.locator('table tbody tr td:nth-child(5)').allTextContents();
      const uniqueStatuses = [...new Set(statusCells.filter(text => text.trim().length > 0))];
      console.log('🏷️ 実際のステータスバッジ:', uniqueStatuses);

      // 一致性確認
      console.log('\n=== セラー販売管理 ステータス一致性分析 ===');
      const mismatches: string[] = [];

      uniqueStatuses.forEach(badge => {
        const found = dropdownOptions.some(option => option.trim() === badge);
        console.log(`${badge}: ${found ? '✅ 一致' : '❌ 不一致'}`);
        if (!found) {
          mismatches.push(badge);
        }
      });

      if (mismatches.length > 0) {
        console.log(`\n❗ 不一致が発見されました: ${mismatches.join(', ')}`);
      } else {
        console.log('\n✅ すべてのステータスが一致しています');
      }

    } else {
      console.log('❌ ステータスドロップダウンが見つかりませんでした');
    }
  });

  test('総合レポート: 全ページのステータス一致性', async ({ page }) => {
    console.log('\n📊 ========== ステータス一致性総合レポート ==========\n');

    const pages = [
      { url: '/inventory', name: 'セラー在庫管理', statusColumn: 7 },
      { url: '/staff/inventory', name: 'スタッフ在庫管理', statusColumn: 6 },
      { url: '/sales', name: 'セラー販売管理', statusColumn: 5 }
    ];

    const allMismatches: { [key: string]: string[] } = {};

    for (const pageInfo of pages) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log(`\n🔍 ${pageInfo.name} 検証中...`);

        // カスタムドロップダウンボタンを探す
        const statusDropdownButton = page.locator('div:has-text("ステータス") button').first();

        if (await statusDropdownButton.count() > 0) {
          // ドロップダウンを開く
          await statusDropdownButton.click();
          await page.waitForTimeout(500);

          // ドロップダウンオプションを取得
          const dropdownOptions = await page.locator('div[class*="fixed z-"] div[class*="cursor-pointer"] span').allTextContents();

          // ドロップダウンを閉じる
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);

          // ステータスバッジを取得
          const statusCells = await page.locator(`table tbody tr td:nth-child(${pageInfo.statusColumn})`).allTextContents();
          const uniqueStatuses = [...new Set(statusCells.filter(text => text.trim().length > 0))];

          // 不一致チェック
          const mismatches = uniqueStatuses.filter(badge =>
            !dropdownOptions.some(option => option.trim() === badge)
          );

          if (mismatches.length > 0) {
            allMismatches[pageInfo.name] = mismatches;
            console.log(`❌ ${pageInfo.name}: 不一致 ${mismatches.join(', ')}`);
          } else {
            console.log(`✅ ${pageInfo.name}: すべて一致`);
          }

        } else {
          console.log(`❌ ${pageInfo.name}: ドロップダウン未発見`);
        }

      } catch (error) {
        console.log(`❌ ${pageInfo.name}: エラー発生`);
      }
    }

    console.log('\n📋 最終結果:');
    if (Object.keys(allMismatches).length === 0) {
      console.log('🎉 すべてのページでステータス表示が一致しています！');
    } else {
      console.log('⚠️  以下のページで不一致が見つかりました:');
      Object.entries(allMismatches).forEach(([pageName, mismatches]) => {
        console.log(`   ${pageName}: ${mismatches.join(', ')}`);
      });
    }
  });
});