const { chromium } = require('playwright');

async function testInspectionNotesDisplay() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // セラーログイン
    console.log('1. セラーログイン中...');
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 在庫管理ページへ
    console.log('2. 在庫管理ページへ移動...');
    await page.goto('http://localhost:3002/inventory');
    await page.waitForTimeout(2000);

    // DEMOカメラ２７を探してクリック
    console.log('3. DEMOカメラ２７を探しています...');
    const productRow = page.locator('tr').filter({ hasText: 'DEMOカメラ２７' }).first();

    if (await productRow.isVisible()) {
      await productRow.click();
      await page.waitForTimeout(1000);

      // 商品詳細モーダルが開いたか確認
      console.log('4. 商品詳細モーダルを確認...');
      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();

      if (await modal.isVisible()) {
        // 基本情報タブのスクリーンショット
        await page.screenshot({
          path: 'seller-demo27-basic-tab.png',
          fullPage: false
        });
        console.log('✅ 基本情報タブのスクリーンショット保存');

        // 備考タブを探してクリック
        const notesTab = page.locator('button, div').filter({ hasText: '備考' }).first();

        if (await notesTab.isVisible()) {
          console.log('5. 備考タブをクリック...');
          await notesTab.click();
          await page.waitForTimeout(1000);

          // 備考タブのスクリーンショット
          await page.screenshot({
            path: 'seller-demo27-notes-tab-with-inspection.png',
            fullPage: false
          });
          console.log('✅ 備考タブのスクリーンショット保存（検品メモ含む）');

          // 検品メモが表示されているか確認
          const inspectionNotes = await page.locator('text=★★★検品テスト備考★★★').isVisible();
          if (inspectionNotes) {
            console.log('✅✅✅ 検品備考が正しく表示されています！');
          } else {
            console.log('❌ 検品備考が見つかりません');
          }
        }
      }
    } else {
      console.log('❌ DEMOカメラ２７が見つかりません');
    }

    // スタッフページでも確認
    console.log('\n6. スタッフページでの確認...');
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForTimeout(2000);

    // 詳細ボタンをクリック
    const detailButton = page.locator('button').filter({ hasText: '詳細' }).first();
    if (await detailButton.isVisible()) {
      await detailButton.click();
      await page.waitForTimeout(1000);

      // スタッフ商品詳細のスクリーンショット
      await page.screenshot({
        path: 'staff-product-detail-with-inspection.png',
        fullPage: false
      });
      console.log('✅ スタッフ商品詳細のスクリーンショット保存');
    }

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await browser.close();
  }
}

testInspectionNotesDisplay();