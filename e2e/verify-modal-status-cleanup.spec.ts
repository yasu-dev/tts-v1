import { test, expect } from '@playwright/test';

test.describe('保管先情報モーダルの重複ステータス修正確認', () => {
  test('重複するステータス表示が削除されていることを確認', async ({ page }) => {
    // セラー在庫管理ページを開く
    await page.goto('http://localhost:3002/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // 最初の詳細ボタンをクリック
    const firstDetailButton = await page.$('.holo-table tbody tr button:has-text("詳細")');
    if (firstDetailButton) {
      await firstDetailButton.click();

      // モーダルが開くのを待つ
      await page.waitForSelector('.intelligence-card', { timeout: 5000 });

      // 保管先情報タブをクリック（あれば）
      const storageTab = await page.$('button:has-text("保管先")');
      if (storageTab) {
        await storageTab.click();
        await page.waitForTimeout(1000);
      }

      // モーダル内のバッジ要素を確認
      const badges = await page.$$eval('.intelligence-card [class*="badge"], .intelligence-card .text-xs', elements =>
        elements.map(el => ({
          text: el.textContent?.trim() || '',
          className: el.className,
          tagName: el.tagName.toLowerCase()
        }))
      );

      console.log('=== モーダル内のバッジ情報 ===');
      badges.forEach((badge, index) => {
        if (badge.text) {
          console.log(`${index + 1}: "${badge.text}" (${badge.tagName}) - ${badge.className}`);
        }
      });

      // 重複チェック
      const statusTexts = badges
        .map(b => b.text)
        .filter(text => text.includes('保管') || text.includes('完了'));

      console.log('\\n=== 保管関連のテキスト ===');
      statusTexts.forEach(text => console.log(`- "${text}"`));

      // 「保管完了」と「保管完了済み」の重複チェック
      const hasHokanKanryo = statusTexts.some(text => text === '保管完了');
      const hasHokanKanryoZumi = statusTexts.some(text => text === '保管完了済み');

      console.log('\\n=== 重複チェック結果 ===');
      console.log(`「保管完了」の存在: ${hasHokanKanryo ? 'あり' : 'なし'}`);
      console.log(`「保管完了済み」の存在: ${hasHokanKanryoZumi ? 'あり' : 'なし'}`);

      if (hasHokanKanryo && hasHokanKanryoZumi) {
        console.log('❌ 重複が検出されました');
      } else if (hasHokanKanryo || hasHokanKanryoZumi) {
        console.log('✅ 重複が解消されました');
      } else {
        console.log('ℹ️ 保管関連ステータスが表示されていません');
      }

      // モーダルのスクリーンショット
      await page.screenshot({
        path: 'storage-modal-after-cleanup.png',
        fullPage: false
      });

      // アサーション：両方同時に存在しないことを確認
      expect(hasHokanKanryo && hasHokanKanryoZumi).toBe(false);

      // モーダルを閉じる
      const closeButton = await page.$('.intelligence-card button[aria-label="Close"], .intelligence-card .close, button:has-text("×")');
      if (closeButton) {
        await closeButton.click();
      }

      console.log('\\n✅ 重複ステータス表示の修正を確認完了');
    } else {
      console.log('詳細ボタンが見つかりませんでした');
    }
  });

  test('保管先情報が表示されている場合の適切なステータス表示', async ({ page }) => {
    // セラー在庫管理ページを開く
    await page.goto('http://localhost:3002/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // 保管済みの商品を探して詳細を開く
    const storageStatusBadges = await page.$$('.holo-table tbody [class*="bg-teal"], .holo-table tbody [class*="bg-green"]');

    if (storageStatusBadges.length > 0) {
      // 保管済み商品の行を特定
      const storageRow = await storageStatusBadges[0].$('xpath=ancestor::tr');
      if (storageRow) {
        const detailButton = await storageRow.$('button:has-text("詳細")');
        if (detailButton) {
          await detailButton.click();

          // モーダルが開くのを待つ
          await page.waitForSelector('.intelligence-card', { timeout: 5000 });

          // 保管先情報の存在確認
          const hasStorageInfo = await page.$('text=保管先情報, text=現在の保管場所, text=棚番号');

          if (hasStorageInfo) {
            console.log('✅ 保管先情報が表示されています');

            // この場合、ステータス表示は1つだけであることを確認
            const storageRelatedTexts = await page.$$eval(
              '.intelligence-card *',
              elements => elements
                .map(el => el.textContent?.trim() || '')
                .filter(text =>
                  text.includes('保管完了') ||
                  text.includes('保管済み') ||
                  text === '保管完了' ||
                  text === '保管完了済み'
                )
            );

            console.log('保管関連ステータス:', storageRelatedTexts);

            // 重複していないことを確認
            const uniqueStatuses = [...new Set(storageRelatedTexts)];
            expect(uniqueStatuses.length).toBeLessThanOrEqual(1);

            console.log(`✅ ステータス表示が重複していません (${uniqueStatuses.length}個)`);
          } else {
            console.log('ℹ️ 保管先情報が表示されていません');
          }

          // モーダルを閉じる
          const closeButton = await page.$('.intelligence-card button[aria-label="Close"], .intelligence-card .close, button:has-text("×")');
          if (closeButton) {
            await closeButton.click();
          }
        }
      }
    } else {
      console.log('保管済み商品が見つかりませんでした');
    }
  });
});