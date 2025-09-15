import { test, expect } from '@playwright/test';

test.describe('正確なステータス表示一致性検証', () => {

  // ドロップダウンテキストから個別のオプションを抽出するヘルパー関数
  const parseDropdownOptions = (dropdownText: string): string[] => {
    // "すべてのステータス入庫待ち保管作業中保管中出品中購入者決定出荷準備中作業台配送中返品保留中"
    // のような文字列から個別のオプションを抽出
    const options: string[] = [];

    // 既知のステータスパターンでマッチング
    const statusPatterns = [
      'すべてのステータス',
      '入庫待ち',
      '保管作業中',
      '保管中',
      '出品中',
      '購入者決定',
      '出荷準備中',
      '作業台',
      '配送中',
      '配送完了',
      '返品',
      '保留中',
      'キャンセル'
    ];

    for (const pattern of statusPatterns) {
      if (dropdownText.includes(pattern)) {
        options.push(pattern);
      }
    }

    return options;
  };

  test('セラー在庫管理: 正確なステータス一致性検証', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('🔍 セラー在庫管理 - 正確なステータス検証');

    // ステータスドロップダウンボタンを探してクリック
    const statusButton = page.locator('button:has-text("すべてのステータス")').first();

    if (await statusButton.count() > 0) {
      await statusButton.click();
      await page.waitForTimeout(500);

      // ポータルドロップダウンの内容を取得
      const dropdownContent = await page.locator('div[class*="fixed z-"]').first().textContent();
      const dropdownOptions = parseDropdownOptions(dropdownContent || '');
      console.log('📋 ステータスフィルター選択肢:', dropdownOptions);

      // ドロップダウンを閉じる
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // 正確なステータス列（7番目）からデータを取得
      const statusCells = await page.locator('table tbody tr td:nth-child(7)').allTextContents();
      const uniqueStatuses = [...new Set(statusCells.filter(text => text.trim().length > 0))];
      console.log('🏷️ 実際のステータスバッジ:', uniqueStatuses);

      // 一致性確認
      console.log('\n=== セラー在庫管理 ステータス一致性分析 ===');
      const mismatches: string[] = [];

      uniqueStatuses.forEach(badge => {
        // 「すべてのステータス」は除外して比較
        const filteredOptions = dropdownOptions.filter(opt => opt !== 'すべてのステータス');
        const found = filteredOptions.includes(badge);

        console.log(`${badge}: ${found ? '✅ 一致' : '❌ 不一致'}`);
        if (!found) {
          mismatches.push(badge);
        }
      });

      if (mismatches.length > 0) {
        console.log(`\n❗ 不一致: ${mismatches.join(', ')}`);
      } else {
        console.log('\n✅ 完全一致');
      }

    } else {
      console.log('❌ ステータスドロップダウンが見つかりませんでした');
    }
  });

  test('スタッフ在庫管理: 正確なステータス一致性検証', async ({ page }) => {
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('🔍 スタッフ在庫管理 - 正確なステータス検証');

    const statusButton = page.locator('button:has-text("すべてのステータス")').first();

    if (await statusButton.count() > 0) {
      await statusButton.click();
      await page.waitForTimeout(500);

      const dropdownContent = await page.locator('div[class*="fixed z-"]').first().textContent();
      const dropdownOptions = parseDropdownOptions(dropdownContent || '');
      console.log('📋 ステータスフィルター選択肢:', dropdownOptions);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // 正確なステータス列（7番目）からデータを取得
      const statusCells = await page.locator('table tbody tr td:nth-child(7)').allTextContents();
      const uniqueStatuses = [...new Set(statusCells.filter(text => text.trim().length > 0))];
      console.log('🏷️ 実際のステータスバッジ:', uniqueStatuses);

      console.log('\n=== スタッフ在庫管理 ステータス一致性分析 ===');
      const mismatches: string[] = [];

      uniqueStatuses.forEach(badge => {
        const filteredOptions = dropdownOptions.filter(opt => opt !== 'すべてのステータス');
        const found = filteredOptions.includes(badge);

        console.log(`${badge}: ${found ? '✅ 一致' : '❌ 不一致'}`);
        if (!found) {
          mismatches.push(badge);
        }
      });

      if (mismatches.length > 0) {
        console.log(`\n❗ 不一致: ${mismatches.join(', ')}`);
      } else {
        console.log('\n✅ 完全一致');
      }

    } else {
      console.log('❌ ステータスドロップダウンが見つかりませんでした');
    }
  });

  test('セラー販売管理: 正確なステータス一致性検証', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('🔍 セラー販売管理 - 正確なステータス検証');

    // 販売管理では異なるラベルを使用している可能性があるので複数パターンをチェック
    const statusButtons = [
      page.locator('button:has-text("すべてのステータス")').first(),
      page.locator('button:has-text("すべて")').first(),
      page.locator('div:has-text("ステータス") button').first()
    ];

    let statusButton = null;
    for (const btn of statusButtons) {
      if (await btn.count() > 0) {
        statusButton = btn;
        break;
      }
    }

    if (statusButton) {
      await statusButton.click();
      await page.waitForTimeout(500);

      const dropdownContent = await page.locator('div[class*="fixed z-"]').first().textContent();
      const dropdownOptions = parseDropdownOptions(dropdownContent || '');
      console.log('📋 ステータスフィルター選択肢:', dropdownOptions);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // 正確なステータス列（7番目）からデータを取得
      const statusCells = await page.locator('table tbody tr td:nth-child(7)').allTextContents();
      const uniqueStatuses = [...new Set(statusCells.filter(text => text.trim().length > 0))];
      console.log('🏷️ 実際のステータスバッジ:', uniqueStatuses);

      console.log('\n=== セラー販売管理 ステータス一致性分析 ===');
      const mismatches: string[] = [];

      uniqueStatuses.forEach(badge => {
        const filteredOptions = dropdownOptions.filter(opt => opt !== 'すべてのステータス' && opt !== 'すべて');
        const found = filteredOptions.includes(badge);

        console.log(`${badge}: ${found ? '✅ 一致' : '❌ 不一致'}`);
        if (!found) {
          mismatches.push(badge);
        }
      });

      if (mismatches.length > 0) {
        console.log(`\n❗ 不一致: ${mismatches.join(', ')}`);
      } else {
        console.log('\n✅ 完全一致');
      }

    } else {
      console.log('❌ ステータスドロップダウンが見つかりませんでした');
    }
  });

  test('最終総合レポート: 全ページのステータス一致性', async ({ page }) => {
    console.log('\n📊 ========== 最終ステータス一致性レポート ==========\n');

    const pages = [
      { url: '/inventory', name: 'セラー在庫管理' },
      { url: '/staff/inventory', name: 'スタッフ在庫管理' },
      { url: '/sales', name: 'セラー販売管理' }
    ];

    const results: { [key: string]: { options: string[], badges: string[], mismatches: string[] } } = {};

    for (const pageInfo of pages) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log(`🔍 ${pageInfo.name} 検証中...`);

        // ステータスボタンを探す
        const statusButtons = [
          page.locator('button:has-text("すべてのステータス")').first(),
          page.locator('button:has-text("すべて")').first(),
          page.locator('div:has-text("ステータス") button').first()
        ];

        let statusButton = null;
        for (const btn of statusButtons) {
          if (await btn.count() > 0) {
            statusButton = btn;
            break;
          }
        }

        if (statusButton) {
          await statusButton.click();
          await page.waitForTimeout(500);

          const dropdownContent = await page.locator('div[class*="fixed z-"]').first().textContent();
          const dropdownOptions = parseDropdownOptions(dropdownContent || '');

          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);

          const statusCells = await page.locator('table tbody tr td:nth-child(7)').allTextContents();
          const uniqueStatuses = [...new Set(statusCells.filter(text => text.trim().length > 0))];

          const filteredOptions = dropdownOptions.filter(opt =>
            opt !== 'すべてのステータス' && opt !== 'すべて'
          );

          const mismatches = uniqueStatuses.filter(badge => !filteredOptions.includes(badge));

          results[pageInfo.name] = {
            options: filteredOptions,
            badges: uniqueStatuses,
            mismatches
          };

          if (mismatches.length > 0) {
            console.log(`❌ ${pageInfo.name}: 不一致 ${mismatches.join(', ')}`);
          } else {
            console.log(`✅ ${pageInfo.name}: 完全一致`);
          }

        } else {
          console.log(`❌ ${pageInfo.name}: ドロップダウン未発見`);
        }

      } catch (error) {
        console.log(`❌ ${pageInfo.name}: エラー発生`);
      }
    }

    // 最終結果をまとめて表示
    console.log('\n📋 詳細結果:');
    Object.entries(results).forEach(([pageName, result]) => {
      console.log(`\n${pageName}:`);
      console.log(`  フィルター選択肢: ${result.options.join(', ')}`);
      console.log(`  実際のバッジ: ${result.badges.join(', ')}`);
      if (result.mismatches.length > 0) {
        console.log(`  ❌ 不一致: ${result.mismatches.join(', ')}`);
      } else {
        console.log(`  ✅ 完全一致`);
      }
    });

    const totalMismatches = Object.values(results).reduce((total, result) => total + result.mismatches.length, 0);

    console.log('\n🎯 最終判定:');
    if (totalMismatches === 0) {
      console.log('🎉 すべてのページでステータス表示が完全に一致しています！');
    } else {
      console.log(`⚠️  合計 ${totalMismatches} 個の不一致が発見されました。修正が必要です。`);
    }
  });
});