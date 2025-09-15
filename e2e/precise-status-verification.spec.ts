import { test, expect } from '@playwright/test';

test.describe('ステータス表示一致性の正確な検証', () => {

  test('セラー在庫管理: プルダウンとバッジの一致確認', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('🔍 セラー在庫管理 - ステータスフィルター詳細確認');

    // NexusSelectコンポーネントの実際のselect要素を探す
    const statusSelectContainer = page.locator('div:has-text("ステータス")').filter({ hasText: 'すべてのステータス' });
    const statusSelect = statusSelectContainer.locator('select').first();

    if (await statusSelect.count() > 0) {
      const filterOptions = await statusSelect.locator('option').allTextContents();
      console.log('📋 ステータスフィルター選択肢:', filterOptions);

      // BusinessStatusIndicator コンポーネントのテキストを取得
      const statusBadges = await page.locator('[class*="status-"], .status-indicator, [data-status], td:has(> div > div)').filter({
        has: page.locator('text=出品中, text=配送中, text=保管作業中, text=購入者決定, text=入庫待ち, text=キャンセル, text=作業台')
      }).allTextContents();

      const uniqueStatuses = [...new Set(statusBadges.filter(text => {
        const trimmed = text.trim();
        return ['出品中', '配送中', '保管作業中', '購入者決定', '入庫待ち', 'キャンセル', '作業台', '配送完了', '返品', '保留中'].includes(trimmed);
      }))];

      console.log('🏷️ 実際のステータスバッジ:', uniqueStatuses);

      // 一致性確認
      console.log('\n=== セラー在庫管理 ステータス一致性分析 ===');
      uniqueStatuses.forEach(badge => {
        const found = filterOptions.some(option => {
          const optionText = option.trim();
          return optionText.includes(badge) ||
                 (badge === '出品中' && optionText.includes('出品中')) ||
                 (badge === '配送中' && optionText.includes('配送中')) ||
                 (badge === '保管作業中' && optionText.includes('保管作業中')) ||
                 (badge === '購入者決定' && optionText.includes('購入者決定')) ||
                 (badge === '入庫待ち' && optionText.includes('入庫待ち')) ||
                 (badge === 'キャンセル' && optionText.includes('キャンセル')) ||
                 (badge === '作業台' && optionText.includes('作業台'));
        });
        console.log(`${badge}: ${found ? '✅ 一致' : '❌ 不一致'}`);
      });
    } else {
      console.log('❌ ステータスフィルターが見つかりませんでした');
    }
  });

  test('スタッフ在庫管理: プルダウンとバッジの一致確認', async ({ page }) => {
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('🔍 スタッフ在庫管理 - ステータスフィルター詳細確認');

    // ステータスフィルターを探す
    const statusSelectContainer = page.locator('div:has-text("ステータス")').filter({ hasText: 'すべてのステータス' });
    const statusSelect = statusSelectContainer.locator('select').first();

    if (await statusSelect.count() > 0) {
      const filterOptions = await statusSelect.locator('option').allTextContents();
      console.log('📋 ステータスフィルター選択肢:', filterOptions);

      // テーブル内のステータス列を特定
      const statusCells = await page.locator('table tbody tr td:nth-child(6)').allTextContents();
      const uniqueStatuses = [...new Set(statusCells.filter(text => {
        const trimmed = text.trim();
        return ['出品中', '配送中', '保管作業中', '購入者決定', '入庫待ち', 'キャンセル', '作業台', '配送完了', '返品', '保留中'].includes(trimmed);
      }))];

      console.log('🏷️ 実際のステータスバッジ:', uniqueStatuses);

      // 一致性確認
      console.log('\n=== スタッフ在庫管理 ステータス一致性分析 ===');
      uniqueStatuses.forEach(badge => {
        const found = filterOptions.some(option => option.includes(badge));
        console.log(`${badge}: ${found ? '✅ 一致' : '❌ 不一致'}`);
      });
    } else {
      console.log('❌ ステータスフィルターが見つかりませんでした');
    }
  });

  test('セラー販売管理: プルダウンとバッジの一致確認', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('🔍 セラー販売管理 - ステータスフィルター詳細確認');

    // ステータスフィルターを探す
    const statusSelectContainer = page.locator('div:has-text("ステータス")').filter({ hasText: 'すべて' });
    const statusSelect = statusSelectContainer.locator('select').first();

    if (await statusSelect.count() > 0) {
      const filterOptions = await statusSelect.locator('option').allTextContents();
      console.log('📋 ステータスフィルター選択肢:', filterOptions);

      // テーブル内のステータス列を特定
      const statusCells = await page.locator('table tbody tr td:nth-child(5)').allTextContents();
      const uniqueStatuses = [...new Set(statusCells.filter(text => {
        const trimmed = text.trim();
        return ['出品中', '配送中', '配送完了', '購入者決定', '出荷準備中', 'キャンセル'].includes(trimmed);
      }))];

      console.log('🏷️ 実際のステータスバッジ:', uniqueStatuses);

      // 一致性確認
      console.log('\n=== セラー販売管理 ステータス一致性分析 ===');
      uniqueStatuses.forEach(badge => {
        const found = filterOptions.some(option => option.includes(badge));
        console.log(`${badge}: ${found ? '✅ 一致' : '❌ 不一致'}`);
      });
    } else {
      console.log('❌ ステータスフィルターが見つかりませんでした');
    }
  });

  test('DOM要素の詳細調査', async ({ page }) => {
    console.log('\n🔍 DOM要素の詳細調査');

    // セラー在庫管理
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n--- セラー在庫管理 ---');

    // すべてのselect要素を調査
    const allSelects = await page.locator('select').all();
    console.log(`発見されたselect要素数: ${allSelects.length}`);

    for (let i = 0; i < allSelects.length; i++) {
      const options = await allSelects[i].locator('option').allTextContents();
      console.log(`Select ${i}: ${options.join(', ')}`);

      // ステータス関連かチェック
      if (options.some(opt => opt.includes('すべてのステータス') || opt.includes('ステータス') || opt.includes('出品中') || opt.includes('配送中'))) {
        console.log(`   ✅ これはステータスフィルターです！`);
      }
    }

    // ページのHTMLの一部を取得してステータス関連要素を探す
    const pageContent = await page.content();
    if (pageContent.includes('すべてのステータス')) {
      console.log('✅ ページに「すべてのステータス」が含まれています');
    }

    // テーブルの構造を調査
    const tableHeaders = await page.locator('table th').allTextContents();
    console.log('テーブルヘッダー:', tableHeaders);

    const firstRowCells = await page.locator('table tbody tr:first-child td').allTextContents();
    console.log('最初の行のセル:', firstRowCells);

    // NexusSelectコンポーネントを探す
    const nexusSelects = await page.locator('[class*="nexus"], [class*="select"]').all();
    console.log(`NexusSelect関連要素数: ${nexusSelects.length}`);

    for (let i = 0; i < Math.min(nexusSelects.length, 5); i++) {
      const text = await nexusSelects[i].textContent();
      console.log(`NexusSelect ${i}: ${text?.substring(0, 100)}...`);
    }
  });
});