import { test, expect } from '@playwright/test';

test.describe('ビューポート幅の詳細測定', () => {
  test('セラー在庫管理の実際の表示幅と最適幅を測定', async ({ page }) => {
    // 様々なビューポートサイズでテスト
    const viewportSizes = [
      { width: 1024, height: 768, name: '小さめノートPC' },
      { width: 1280, height: 720, name: '一般的ノートPC' },
      { width: 1366, height: 768, name: '最も一般的' },
      { width: 1440, height: 900, name: 'MacBook Air' },
      { width: 1920, height: 1080, name: 'フルHD' },
    ];

    for (const viewport of viewportSizes) {
      console.log(`\n=== ${viewport.name} (${viewport.width}x${viewport.height}) ===`);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // セラー在庫管理を測定
      await page.goto('http://localhost:3002/inventory');
      await page.waitForSelector('.holo-table', { timeout: 10000 });

      const sellerMeasurement = await page.evaluate(() => {
        const table = document.querySelector('.holo-table');
        const container = document.querySelector('.intelligence-card');
        const body = document.body;

        if (!table || !container) return null;

        return {
          tableWidth: table.getBoundingClientRect().width,
          tableScrollWidth: (table as HTMLElement).scrollWidth,
          containerWidth: container.getBoundingClientRect().width,
          bodyWidth: body.getBoundingClientRect().width,
          overflowing: (table as HTMLElement).scrollWidth > table.getBoundingClientRect().width,
          availableSpace: body.getBoundingClientRect().width - container.getBoundingClientRect().width
        };
      });

      // スタッフ在庫管理を測定
      await page.goto('http://localhost:3002/staff/inventory');
      await page.waitForSelector('.holo-table', { timeout: 10000 });

      const staffMeasurement = await page.evaluate(() => {
        const table = document.querySelector('.holo-table');
        const container = document.querySelector('.intelligence-card');
        const maxWidthContainer = document.querySelector('.max-w-4xl');
        const body = document.body;

        if (!table || !container) return null;

        return {
          tableWidth: table.getBoundingClientRect().width,
          tableScrollWidth: (table as HTMLElement).scrollWidth,
          containerWidth: container.getBoundingClientRect().width,
          maxWidthContainerWidth: maxWidthContainer?.getBoundingClientRect().width || 0,
          bodyWidth: body.getBoundingClientRect().width,
          overflowing: (table as HTMLElement).scrollWidth > table.getBoundingClientRect().width,
          availableSpace: body.getBoundingClientRect().width - (maxWidthContainer?.getBoundingClientRect().width || 0)
        };
      });

      console.log('セラー在庫管理:');
      console.log(`  テーブル幅: ${sellerMeasurement?.tableWidth}px`);
      console.log(`  コンテナ幅: ${sellerMeasurement?.containerWidth}px`);
      console.log(`  利用可能余白: ${sellerMeasurement?.availableSpace}px`);
      console.log(`  オーバーフロー: ${sellerMeasurement?.overflowing ? 'あり' : 'なし'}`);

      console.log('スタッフ在庫管理:');
      console.log(`  テーブル幅: ${staffMeasurement?.tableWidth}px`);
      console.log(`  max-w-4xlコンテナ幅: ${staffMeasurement?.maxWidthContainerWidth}px`);
      console.log(`  利用可能余白: ${staffMeasurement?.availableSpace}px`);
      console.log(`  オーバーフロー: ${staffMeasurement?.overflowing ? 'あり' : 'なし'}`);

      const spaceGain = (sellerMeasurement?.containerWidth || 0) - (staffMeasurement?.maxWidthContainerWidth || 0);
      console.log(`  幅を統一した場合の拡張: ${spaceGain}px`);
    }
  });

  test('max-w-4xlを削除した場合のシミュレーション', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });

    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // 現在の状態を測定
    const beforeChange = await page.evaluate(() => {
      const maxWidthEl = document.querySelector('.max-w-4xl');
      const table = document.querySelector('.holo-table');

      return {
        maxWidthWidth: maxWidthEl?.getBoundingClientRect().width || 0,
        tableWidth: table?.getBoundingClientRect().width || 0,
        bodyWidth: document.body.getBoundingClientRect().width
      };
    });

    // max-w-4xlクラスを一時的に削除してテスト
    await page.evaluate(() => {
      const maxWidthEl = document.querySelector('.max-w-4xl');
      if (maxWidthEl) {
        maxWidthEl.classList.remove('max-w-4xl');
        maxWidthEl.classList.add('max-w-7xl'); // より大きな制限を設定
      }
    });

    // 変更後の状態を測定
    const afterChange = await page.evaluate(() => {
      const container = document.querySelector('.space-y-6');
      const table = document.querySelector('.holo-table');

      return {
        containerWidth: container?.getBoundingClientRect().width || 0,
        tableWidth: table?.getBoundingClientRect().width || 0,
        bodyWidth: document.body.getBoundingClientRect().width
      };
    });

    console.log('\n=== max-w-4xl削除シミュレーション ===');
    console.log('変更前:');
    console.log(`  コンテナ幅: ${beforeChange.maxWidthWidth}px`);
    console.log(`  テーブル幅: ${beforeChange.tableWidth}px`);

    console.log('変更後 (max-w-7xl):');
    console.log(`  コンテナ幅: ${afterChange.containerWidth}px`);
    console.log(`  テーブル幅: ${afterChange.tableWidth}px`);
    console.log(`  幅の拡張: ${afterChange.containerWidth - beforeChange.maxWidthWidth}px`);

    const maxSafeWidth = afterChange.bodyWidth * 0.95; // ビューポートの95%を安全な最大幅とする
    console.log(`  ビューポート幅: ${afterChange.bodyWidth}px`);
    console.log(`  安全な最大幅: ${maxSafeWidth}px`);
    console.log(`  はみ出しリスク: ${afterChange.containerWidth > maxSafeWidth ? 'あり' : 'なし'}`);

    // スクリーンショットで確認
    await page.screenshot({
      path: 'staff-inventory-expanded-width.png',
      fullPage: false
    });
  });
});