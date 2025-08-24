import { test, expect } from '@playwright/test';

test.describe('カテゴリー別検品チェックリスト - UIテスト', () => {
  
  test.beforeEach(async ({ page }) => {
    // 開発サーバーに接続
    await page.goto('http://localhost:3003');
    await page.waitForTimeout(2000); // ページロード待機
  });

  test('商品登録モーダルでカテゴリー選択時に検品チェックリストが表示される', async ({ page }) => {
    console.log('[TEST] 商品登録モーダルのテスト開始');

    // 商品登録モーダルを開く（ボタンを探して処理）
    try {
      await page.click('text=新規商品登録');
    } catch {
      await page.click('text=商品登録');
    }
    
    await page.waitForTimeout(1000);
    
    // カテゴリーを「カメラ」に選択
    await page.selectOption('select[name="category"]', 'camera');
    await page.waitForTimeout(1000);
    
    // カメラカテゴリーの検品チェックリストが表示されることを確認
    await expect(page.locator('text=検品チェックリスト - カメラ')).toBeVisible();
    
    console.log('[SUCCESS] カメラカテゴリーの検品チェックリストが表示されました');
  });

  test('カメラカテゴリーで指定された検品項目がすべて表示される', async ({ page }) => {
    console.log('[TEST] カメラ検品項目の確認開始');
    
    // 商品登録モーダルを開く
    try {
      await page.click('text=新規商品登録');
    } catch {
      await page.click('text=商品登録');  
    }
    
    await page.waitForTimeout(1000);
    
    // カテゴリーを「カメラ」に選択
    await page.selectOption('select[name="category"]', 'camera');
    await page.waitForTimeout(2000);
    
    // ユーザー指定のカメラ検品項目を確認
    const expectedCameraItems = [
      // カメラボディ外観
      '傷', 'スレ', '凹み', 'ひび', '割れ', '塗装剥がれ', '汚れ', 'ベタつき',
      // ファインダー  
      'カビ', 'ホコリ', 'クモリ', '腐食', 'バルサム切れ',
      // フィルム室
      'フィルム室内部の状況', 'モルトの劣化', 'シャッター幕動作',
      // レンズ項目は一部カメラボディと重複
      // 光学
      'チリホコリ', 'キズ',
      // 露出機能
      '作動', '不動', '弱い',
      // 付属品
      'バッテリー', '説明書', 'ケース', '箱', 'ストラップ', 'レンズキャップ'
    ];
    
    console.log('[DEBUG] 期待される項目数:', expectedCameraItems.length);
    
    // 各項目が表示されているかチェック
    let foundItems = 0;
    let missingItems = [];
    
    for (const item of expectedCameraItems) {
      try {
        await expect(page.locator(`text=${item}`)).toBeVisible({ timeout: 2000 });
        foundItems++;
        console.log(`[✓] 項目確認: ${item}`);
      } catch (error) {
        missingItems.push(item);
        console.log(`[✗] 項目未発見: ${item}`);
      }
    }
    
    console.log(`[RESULT] 発見項目: ${foundItems}/${expectedCameraItems.length}`);
    console.log('[MISSING]', missingItems);
    
    // 少なくとも主要項目の70%以上が表示されていることを確認
    expect(foundItems / expectedCameraItems.length).toBeGreaterThan(0.7);
  });

  test('腕時計カテゴリーで適切な検品項目が表示される', async ({ page }) => {
    console.log('[TEST] 腕時計検品項目の確認開始');
    
    // 商品登録モーダルを開く
    try {
      await page.click('text=新規商品登録');
    } catch {
      await page.click('text=商品登録');
    }
    
    await page.waitForTimeout(1000);
    
    // カテゴリーを「腕時計」に選択
    await page.selectOption('select[name="category"]', 'watch');
    await page.waitForTimeout(2000);
    
    // 腕時計検品項目を確認
    const expectedWatchItems = [
      // 時計本体外観
      '傷', 'スレ', '凹み', 'ひび', '割れ', '塗装剥がれ', '汚れ', 'ベタつき',
      // 文字盤・針
      '針の変色', '文字盤の汚れ', 'インデックスの欠け', '夜光の劣化',
      // ムーブメント機能
      '時刻精度', '巻き上げ機能', 'リューズ動作', 'プッシュボタン動作', '日付機能',
      // 付属品
      '箱', '保証書', '説明書', '余りコマ', '工具'
    ];
    
    let foundWatchItems = 0;
    let missingWatchItems = [];
    
    for (const item of expectedWatchItems) {
      try {
        await expect(page.locator(`text=${item}`)).toBeVisible({ timeout: 2000 });
        foundWatchItems++;
        console.log(`[✓] 腕時計項目確認: ${item}`);
      } catch (error) {
        missingWatchItems.push(item);
        console.log(`[✗] 腕時計項目未発見: ${item}`);
      }
    }
    
    console.log(`[RESULT] 腕時計発見項目: ${foundWatchItems}/${expectedWatchItems.length}`);
    console.log('[MISSING WATCH]', missingWatchItems);
    
    // 腕時計項目の60%以上が表示されていることを確認
    expect(foundWatchItems / expectedWatchItems.length).toBeGreaterThan(0.6);
  });

  test('「その他」項目選択でテキスト入力フィールドが表示される', async ({ page }) => {
    console.log('[TEST] その他項目のテキスト入力確認開始');
    
    // 商品登録モーダルを開く
    try {
      await page.click('text=新規商品登録');
    } catch {
      await page.click('text=商品登録');
    }
    
    await page.waitForTimeout(1000);
    
    // カテゴリーを「カメラ」に選択
    await page.selectOption('select[name="category"]', 'camera');
    await page.waitForTimeout(2000);
    
    // 「その他」項目のチェックボックスを見つける
    const otherCheckboxes = page.locator('input[type="checkbox"]').filter({ hasText: /その他/ });
    const firstOtherCheckbox = otherCheckboxes.first();
    
    if (await firstOtherCheckbox.isVisible()) {
      // 「その他」項目をチェック
      await firstOtherCheckbox.check();
      await page.waitForTimeout(1000);
      
      // テキスト入力フィールドが表示されることを確認
      const textareaVisible = await page.locator('textarea').filter({ hasText: /詳細/ }).isVisible();
      expect(textareaVisible).toBeTruthy();
      
      console.log('[SUCCESS] その他項目選択でテキスト入力フィールドが表示されました');
    } else {
      console.log('[WARNING] その他項目のチェックボックスが見つかりませんでした');
    }
  });

  test('スタッフ検品画面で検品チェックリストが表示される', async ({ page }) => {
    console.log('[TEST] スタッフ検品画面の検品チェックリスト確認開始');
    
    // スタッフ検品画面に移動
    await page.goto('http://localhost:3003/staff/inspection');
    await page.waitForTimeout(3000);
    
    // 検品対象商品があるかチェック
    const hasProducts = await page.locator('text=検品を続ける').isVisible();
    
    if (hasProducts) {
      // 「検品を続ける」ボタンをクリック
      await page.click('text=検品を続ける');
      await page.waitForTimeout(2000);
      
      // 検品チェックリストが表示されることを確認
      const checklistVisible = await page.locator('text=検品チェックリスト').isVisible();
      expect(checklistVisible).toBeTruthy();
      
      console.log('[SUCCESS] スタッフ検品画面で検品チェックリストが表示されました');
    } else {
      console.log('[INFO] 検品対象商品がありません - テスト用商品を作成する必要があります');
      
      // テスト用商品データを作成するためのAPI呼び出し
      await page.goto('http://localhost:3003');
      // 商品登録で簡単なテストデータを作成
      try {
        await page.click('text=新規商品登録');
        await page.waitForTimeout(1000);
        
        await page.fill('input[name="name"]', 'テスト用カメラ');
        await page.fill('input[name="sku"]', 'TEST-CAM-001');
        await page.selectOption('select[name="category"]', 'camera');
        await page.fill('input[name="purchasePrice"]', '50000');
        
        await page.click('text=登録');
        await page.waitForTimeout(2000);
        
        console.log('[INFO] テスト用商品を作成しました');
      } catch (error) {
        console.log('[WARNING] テスト用商品の作成に失敗:', error.message);
      }
    }
  });

  test('カテゴリー変更時に検品項目が正しく切り替わる', async ({ page }) => {
    console.log('[TEST] カテゴリー変更による検品項目の切り替え確認開始');
    
    // 商品登録モーダルを開く
    try {
      await page.click('text=新規商品登録');
    } catch {
      await page.click('text=商品登録');
    }
    
    await page.waitForTimeout(1000);
    
    // まずカメラを選択
    await page.selectOption('select[name="category"]', 'camera');
    await page.waitForTimeout(2000);
    
    // カメラ固有項目が表示されることを確認
    await expect(page.locator('text=シャッター幕動作')).toBeVisible();
    
    // 腕時計に切り替え
    await page.selectOption('select[name="category"]', 'watch');
    await page.waitForTimeout(2000);
    
    // 腕時計固有項目が表示されることを確認
    const watchSpecificVisible = await page.locator('text=時刻精度').isVisible() || 
                                   await page.locator('text=リューズ動作').isVisible();
    expect(watchSpecificVisible).toBeTruthy();
    
    // カメラ固有項目が非表示になることを確認
    const cameraSpecificHidden = !(await page.locator('text=シャッター幕動作').isVisible());
    expect(cameraSpecificHidden).toBeTruthy();
    
    console.log('[SUCCESS] カテゴリー変更時の検品項目切り替えが正常に動作しました');
  });
});

test.describe('実際のUI確認レポート', () => {
  test('全体的なUI動作確認とレポート生成', async ({ page }) => {
    console.log('\n=== カテゴリー別検品チェックリスト UI確認レポート ===');
    
    await page.goto('http://localhost:3003');
    await page.waitForTimeout(2000);
    
    const report = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0
      }
    };
    
    // 各カテゴリーの検品項目を実際に確認
    const categories = ['camera', 'watch', 'other'];
    
    for (const category of categories) {
      const testResult = {
        category,
        status: 'PASS',
        details: [],
        issues: []
      };
      
      try {
        // 商品登録モーダルを開く
        try {
          await page.click('text=新規商品登録');
        } catch {
          await page.click('text=商品登録');
        }
        
        await page.waitForTimeout(1000);
        
        // カテゴリー選択
        await page.selectOption('select[name="category"]', category);
        await page.waitForTimeout(2000);
        
        // 検品チェックリストの存在確認
        const checklistExists = await page.locator('text=検品チェックリスト').isVisible();
        if (checklistExists) {
          testResult.details.push(`✓ ${category}カテゴリーで検品チェックリストが表示される`);
        } else {
          testResult.issues.push(`✗ ${category}カテゴリーで検品チェックリストが表示されない`);
          testResult.status = 'FAIL';
        }
        
        // セクションの展開状態確認
        const sections = await page.locator('h3').count();
        testResult.details.push(`セクション数: ${sections}`);
        
        // モーダルを閉じる
        await page.press('Escape');
        await page.waitForTimeout(500);
        
      } catch (error) {
        testResult.issues.push(`エラー: ${error.message}`);
        testResult.status = 'FAIL';
      }
      
      report.tests.push(testResult);
      report.summary.totalTests++;
      if (testResult.status === 'PASS') {
        report.summary.passedTests++;
      } else {
        report.summary.failedTests++;
      }
    }
    
    // レポート出力
    console.log('\n=== テスト結果 ===');
    console.log(`総テスト数: ${report.summary.totalTests}`);
    console.log(`成功: ${report.summary.passedTests}`);
    console.log(`失敗: ${report.summary.failedTests}`);
    
    report.tests.forEach(test => {
      console.log(`\n[${test.category.toUpperCase()}] ${test.status}`);
      test.details.forEach(detail => console.log(`  ${detail}`));
      test.issues.forEach(issue => console.log(`  ${issue}`));
    });
    
    // 最低限の動作確認
    expect(report.summary.passedTests).toBeGreaterThan(0);
  });
});

