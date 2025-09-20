const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🌟 ★テキスト表示の最終検証を開始します...');

    let modalStarFound = false;
    let labelStarFound = false;

    // 1. セラーとしてログイン
    console.log('\n1. セラーログイン中...');
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(2000);
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 2. セラー在庫管理で★テキスト詳細確認
    console.log('\n2. セラー在庫管理ページで★テキスト詳細確認...');
    await page.goto('http://localhost:3002/inventory');
    await page.waitForTimeout(5000);

    const sellerRows = await page.locator('tr').all();
    let sellerStarFound = false;

    for (const row of sellerRows) {
      const text = await row.textContent();
      if (text && text.includes('DEMOカメラ２７')) {
        console.log('   ✓ DEMOカメラ２７を発見');

        // 検品備考の要素を探す
        const inspectionElements = await row.locator('div:has-text("検品備考")').all();
        const redElements = await row.locator('[class*="bg-red-100"]').all();

        console.log(`   📊 "検品備考"を含む要素数: ${inspectionElements.length}`);
        console.log(`   📊 赤色背景要素数: ${redElements.length}`);

        if (inspectionElements.length > 0 || redElements.length > 0) {
          const allElements = [...inspectionElements, ...redElements];
          for (let i = 0; i < allElements.length; i++) {
            const elementText = await allElements[i].textContent();
            console.log(`   📝 要素${i + 1}: "${elementText}"`);

            if (elementText && elementText.includes('★')) {
              console.log('   🌟 ★テキストが表示されています！');
              sellerStarFound = true;
            }
          }
        } else {
          console.log('   ❌ 検品備考要素が見つかりません');
        }
        break;
      }
    }

    console.log(`   🔍 セラー在庫管理での★表示結果: ${sellerStarFound ? '成功' : '失敗'}`);

    // 3. スタッフとしてログイン
    console.log('\n3. スタッフログイン中...');
    await page.goto('http://localhost:3002/logout');
    await page.waitForTimeout(1000);
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(1000);
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 4. スタッフ在庫管理で★テキスト詳細確認
    console.log('\n4. スタッフ在庫管理ページで★テキスト詳細確認...');
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForTimeout(5000);

    const staffRows = await page.locator('tr').all();
    let staffStarFound = false;

    for (const row of staffRows) {
      const text = await row.textContent();
      if (text && text.includes('DEMOカメラ２７')) {
        console.log('   ✓ DEMOカメラ２７を発見');

        const inspectionElements = await row.locator('div:has-text("検品備考")').all();
        const redElements = await row.locator('[class*="bg-red-100"]').all();

        console.log(`   📊 "検品備考"を含む要素数: ${inspectionElements.length}`);
        console.log(`   📊 赤色背景要素数: ${redElements.length}`);

        if (inspectionElements.length > 0 || redElements.length > 0) {
          const allElements = [...inspectionElements, ...redElements];
          for (let i = 0; i < allElements.length; i++) {
            const elementText = await allElements[i].textContent();
            console.log(`   📝 要素${i + 1}: "${elementText}"`);

            if (elementText && elementText.includes('★')) {
              console.log('   🌟 ★テキストが表示されています！');
              staffStarFound = true;
            }
          }
        } else {
          console.log('   ❌ 検品備考要素が見つかりません');
        }
        break;
      }
    }

    console.log(`   🔍 スタッフ在庫管理での★表示結果: ${staffStarFound ? '成功' : '失敗'}`);

    // 5. スタッフ商品詳細モーダル確認
    console.log('\n5. スタッフ商品詳細モーダルで★テキスト確認...');

    const detailButton = await page.locator('tr:has-text("DEMOカメラ２７") button:has-text("詳細")').first();
    if (await detailButton.isVisible()) {
      await detailButton.click();
      await page.waitForTimeout(3000);

      const modalInspectionElements = await page.locator('div:has-text("検品備考")').all();
      const modalRedElements = await page.locator('[class*="bg-red-100"]').all();

      console.log(`   📊 モーダル"検品備考"要素数: ${modalInspectionElements.length}`);
      console.log(`   📊 モーダル赤色背景要素数: ${modalRedElements.length}`);

      if (modalInspectionElements.length > 0 || modalRedElements.length > 0) {
        const allModalElements = [...modalInspectionElements, ...modalRedElements];
        for (let i = 0; i < allModalElements.length; i++) {
          const elementText = await allModalElements[i].textContent();
          console.log(`   📝 モーダル要素${i + 1}: "${elementText}"`);

          if (elementText && elementText.includes('★')) {
            console.log('   🌟 モーダルで★テキストが表示されています！');
            modalStarFound = true;
          }
        }
      }

      console.log(`   🔍 モーダル★表示結果: ${modalStarFound ? '成功' : '失敗'}`);

      await page.press('body', 'Escape');
      await page.waitForTimeout(1000);
    }

    // 6. 検品プロセスのラベル出力セクション確認
    console.log('\n6. 検品プロセスでのラベル出力セクション確認...');
    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForTimeout(3000);

    const inspectionRows = await page.locator('tr').all();
    for (const row of inspectionRows) {
      const text = await row.textContent();
      if (text && text.includes('DEMOカメラ２７')) {
        const startButton = await row.locator('button:has-text("検品開始")').first();
        if (await startButton.isVisible()) {
          await startButton.click();
          await page.waitForTimeout(3000);

          // 梱包ステップまで進む
          for (let i = 0; i < 5; i++) {
            const nextButton = await page.locator('button:has-text("次へ")').first();
            if (await nextButton.isVisible()) {
              await nextButton.click();
              await page.waitForTimeout(2000);
            }
          }

          // ラベル出力セクションでの★確認
          const labelInspectionElements = await page.locator('div:has-text("検品備考")').all();
          const labelRedElements = await page.locator('[class*="bg-red-100"]').all();

          console.log(`   📊 ラベル"検品備考"要素数: ${labelInspectionElements.length}`);
          console.log(`   📊 ラベル赤色背景要素数: ${labelRedElements.length}`);

          if (labelInspectionElements.length > 0 || labelRedElements.length > 0) {
            const allLabelElements = [...labelInspectionElements, ...labelRedElements];
            for (let i = 0; i < allLabelElements.length; i++) {
              const elementText = await allLabelElements[i].textContent();
              console.log(`   📝 ラベル要素${i + 1}: "${elementText}"`);

              if (elementText && elementText.includes('★')) {
                console.log('   🌟 ラベルセクションで★テキストが表示されています！');
                labelStarFound = true;
              }
            }
          }

          console.log(`   🔍 ラベルセクション★表示結果: ${labelStarFound ? '成功' : '失敗'}`);
          break;
        }
      }
    }

    // 最終結果
    console.log('\n=== 🌟 ★テキスト表示検証最終結果 ===');
    console.log(`✅ セラー在庫管理: ${sellerStarFound ? '✅ 表示確認' : '❌ 表示なし'}`);
    console.log(`✅ スタッフ在庫管理: ${staffStarFound ? '✅ 表示確認' : '❌ 表示なし'}`);
    console.log(`✅ スタッフ詳細モーダル: ${modalStarFound ? '✅ 表示確認' : '❌ 表示なし'}`);
    console.log(`✅ ラベル出力セクション: ${labelStarFound ? '✅ 表示確認' : '❌ 表示なし'}`);

    const allSuccess = sellerStarFound && staffStarFound && modalStarFound && labelStarFound;
    console.log(`\n🎯 総合結果: ${allSuccess ? '🎉 すべて成功!' : '❌ 一部または全部で表示されていません'}`);

  } catch (error) {
    console.error('\n❌ テスト実行エラー:', error);
  } finally {
    await browser.close();
    console.log('\nテスト完了');
  }
})();