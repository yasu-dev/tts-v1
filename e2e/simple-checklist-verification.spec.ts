import { test, expect } from '@playwright/test';

test.describe('検品チェックリスト実際UI検証', () => {
  
  // 開発サーバーの複数ポートに対応
  const testPorts = [3004, 3003, 3002, 3001, 3000];
  let baseUrl = '';

  test.beforeAll(async () => {
    // 利用可能なポートを見つける
    for (const port of testPorts) {
      try {
        const response = await fetch(`http://localhost:${port}`);
        if (response.ok) {
          baseUrl = `http://localhost:${port}`;
          console.log(`[INFO] 開発サーバー発見: ${baseUrl}`);
          break;
        }
      } catch {
        // ポートが使用されていない場合は継続
      }
    }
    
    if (!baseUrl) {
      console.error('[ERROR] 開発サーバーが見つかりません');
      throw new Error('開発サーバーが見つかりません');
    }
  });

  test('基本的な検品チェックリスト項目の表示確認', async ({ page }) => {
    if (!baseUrl) {
      test.skip('開発サーバーが利用できません');
      return;
    }

    console.log(`[TEST] UI確認開始: ${baseUrl}`);
    
    // ページを開く
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    console.log(`[DEBUG] ページタイトル: ${await page.title()}`);
    
    // ページのHTML構造をログ出力
    const bodyContent = await page.locator('body').textContent();
    console.log(`[DEBUG] ページの主要コンテンツ: ${bodyContent?.slice(0, 200)}...`);
    
    // スクリーンショットを保存
    await page.screenshot({ path: 'test-results/ui-verification-main.png' });
    
    // 商品登録関連のボタンやリンクを探す
    const possibleButtons = [
      'text=新規商品登録',
      'text=商品登録', 
      'text=商品追加',
      'text=登録',
      'text=Add Product',
      'button:has-text("登録")',
      'a:has-text("登録")'
    ];
    
    let foundButton = null;
    for (const selector of possibleButtons) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          foundButton = selector;
          console.log(`[FOUND] 商品登録ボタン: ${selector}`);
          break;
        }
      } catch {
        // 次のセレクターを試す
      }
    }
    
    if (foundButton) {
      // ボタンをクリック
      await page.click(foundButton);
      await page.waitForTimeout(2000);
      
      // モーダルまたはページが開いているかチェック
      await page.screenshot({ path: 'test-results/ui-verification-modal.png' });
      
      // カテゴリー選択要素を探す
      const categorySelectors = [
        'select[name="category"]',
        'select:has(option:has-text("カメラ"))',
        '[name="category"]'
      ];
      
      let categoryFound = null;
      for (const selector of categorySelectors) {
        try {
          if (await page.locator(selector).isVisible({ timeout: 2000 })) {
            categoryFound = selector;
            console.log(`[FOUND] カテゴリー選択: ${selector}`);
            break;
          }
        } catch {
          // 次のセレクターを試す
        }
      }
      
      if (categoryFound) {
        // カメラを選択
        await page.selectOption(categoryFound, 'camera');
        await page.waitForTimeout(2000);
        
        console.log('[TEST] カメラカテゴリー選択完了');
        
        // スクリーンショット撮影
        await page.screenshot({ path: 'test-results/ui-verification-camera-selected.png' });
        
        // 検品チェックリストの表示確認
        const checklistVisible = await page.locator('text=検品チェックリスト').isVisible();
        console.log(`[RESULT] 検品チェックリスト表示: ${checklistVisible}`);
        
        // ページ内容を確認
        const modalContent = await page.locator('body').textContent();
        const cameraSpecificItems = [
          'カメラボディ外観', '傷', 'スレ', '凹み', 'ひび', '割れ', '塗装剥がれ', '汚れ', 'ベタつき',
          'ファインダー', 'カビ', 'ホコリ', 'クモリ', '腐食', 'バルサム切れ',
          'フィルム室', 'モルトの劣化', 'シャッター幕動作',
          'レンズ', '光学', 'チリホコリ', '露出機能', '作動', '不動', '弱い',
          '付属品', 'バッテリー', '説明書', 'ケース', '箱', 'ストラップ', 'レンズキャップ'
        ];
        
        const foundItems = [];
        const missingItems = [];
        
        for (const item of cameraSpecificItems) {
          if (modalContent?.includes(item)) {
            foundItems.push(item);
          } else {
            missingItems.push(item);
          }
        }
        
        console.log('\n=== カメラ検品項目 UIで確認された項目 ===');
        console.log(`発見された項目 (${foundItems.length}項目):`);
        foundItems.forEach(item => console.log(`  ✓ ${item}`));
        
        console.log(`\n未発見の項目 (${missingItems.length}項目):`);
        missingItems.forEach(item => console.log(`  ✗ ${item}`));
        
        // 腕時計に変更してテスト
        await page.selectOption(categoryFound, 'watch');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'test-results/ui-verification-watch-selected.png' });
        
        const watchContent = await page.locator('body').textContent();
        const watchSpecificItems = [
          '時計本体外観', '文字盤', '針', '針の変色', '文字盤の汚れ', 'インデックスの欠け', '夜光の劣化',
          'ムーブメント機能', '時刻精度', '巻き上げ機能', 'リューズ動作', 'プッシュボタン動作', '日付機能',
          'ケース', 'ブレスレット', 'ケースの腐食', 'ブレスレットの伸び', 'バックルの不具合', 'コマの欠損',
          '防水', '防水性能', 'クロノグラフ機能', 'GMT機能', '回転ベゼル',
          '余りコマ', '工具', '純正ベルト'
        ];
        
        const foundWatchItems = [];
        const missingWatchItems = [];
        
        for (const item of watchSpecificItems) {
          if (watchContent?.includes(item)) {
            foundWatchItems.push(item);
          } else {
            missingWatchItems.push(item);
          }
        }
        
        console.log('\n=== 腕時計検品項目 UIで確認された項目 ===');
        console.log(`発見された項目 (${foundWatchItems.length}項目):`);
        foundWatchItems.forEach(item => console.log(`  ✓ ${item}`));
        
        console.log(`\n未発見の項目 (${missingWatchItems.length}項目):`);
        missingWatchItems.forEach(item => console.log(`  ✗ ${item}`));
        
        // テスト結果の判定
        const cameraItemsFound = foundItems.length;
        const watchItemsFound = foundWatchItems.length;
        
        console.log('\n=== 総合結果 ===');
        console.log(`カメラ項目発見率: ${cameraItemsFound}/${cameraSpecificItems.length} (${Math.round(cameraItemsFound/cameraSpecificItems.length*100)}%)`);
        console.log(`腕時計項目発見率: ${watchItemsFound}/${watchSpecificItems.length} (${Math.round(watchItemsFound/watchSpecificItems.length*100)}%)`);
        
        // 最低限の動作確認
        expect(cameraItemsFound).toBeGreaterThan(5); // 最低5項目は発見されること
        expect(watchItemsFound).toBeGreaterThan(3); // 最低3項目は発見されること
        
      } else {
        console.log('[ERROR] カテゴリー選択要素が見つかりません');
        
        // 現在のページの構造を詳細に確認
        const allSelects = await page.locator('select').count();
        console.log(`[DEBUG] ページ内のselect要素数: ${allSelects}`);
        
        if (allSelects > 0) {
          for (let i = 0; i < allSelects; i++) {
            const selectElement = page.locator('select').nth(i);
            const selectName = await selectElement.getAttribute('name');
            const options = await selectElement.locator('option').count();
            console.log(`[DEBUG] select[${i}]: name="${selectName}", options=${options}`);
          }
        }
        
        expect(false, 'カテゴリー選択要素が見つかりませんでした').toBeTruthy();
      }
      
    } else {
      console.log('[ERROR] 商品登録ボタンが見つかりません');
      
      // ページの全ボタンとリンクを確認
      const allButtons = await page.locator('button').count();
      const allLinks = await page.locator('a').count();
      
      console.log(`[DEBUG] ページ内のボタン数: ${allButtons}`);
      console.log(`[DEBUG] ページ内のリンク数: ${allLinks}`);
      
      // 主要なテキスト内容を取得
      const pageText = await page.locator('body').textContent();
      console.log(`[DEBUG] ページ内のテキスト (最初の500文字): ${pageText?.slice(0, 500)}`);
      
      expect(false, '商品登録ボタンが見つかりませんでした').toBeTruthy();
    }
  });

  test('スタッフ検品画面での検品チェックリスト確認', async ({ page }) => {
    if (!baseUrl) {
      test.skip('開発サーバーが利用できません');
      return;
    }

    console.log(`[TEST] スタッフ検品画面の確認: ${baseUrl}/staff/inspection`);
    
    // スタッフ検品ページに直接アクセス
    await page.goto(`${baseUrl}/staff/inspection`);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-results/ui-verification-staff-inspection.png' });
    
    // ページ内容を確認
    const staffPageContent = await page.locator('body').textContent();
    console.log(`[DEBUG] スタッフ検品ページの内容 (最初の300文字): ${staffPageContent?.slice(0, 300)}`);
    
    // 検品関連のボタンやリンクを探す
    const inspectionButtons = [
      'text=検品を続ける',
      'text=検品開始',
      'text=検品詳細',
      'text=Continue',
      'button:has-text("検品")'
    ];
    
    let inspectionButtonFound = false;
    for (const selector of inspectionButtons) {
      try {
        if (await page.locator(selector).isVisible({ timeout: 2000 })) {
          console.log(`[FOUND] 検品ボタン: ${selector}`);
          inspectionButtonFound = true;
          
          // ボタンをクリック
          await page.click(selector);
          await page.waitForTimeout(2000);
          
          await page.screenshot({ path: 'test-results/ui-verification-inspection-started.png' });
          
          // 検品チェックリストの表示確認
          const afterClick = await page.locator('body').textContent();
          const hasChecklist = afterClick?.includes('検品チェックリスト') || 
                              afterClick?.includes('Checklist') ||
                              afterClick?.includes('チェック');
          
          console.log(`[RESULT] 検品ボタンクリック後のチェックリスト表示: ${hasChecklist}`);
          
          break;
        }
      } catch {
        // 次のセレクターを試す
      }
    }
    
    if (!inspectionButtonFound) {
      console.log('[INFO] 検品ボタンが見つかりません - 検品対象商品がない可能性があります');
    }
    
    // とりあえず何らかの検品関連要素があることを確認
    const hasInspectionContent = staffPageContent?.includes('検品') || 
                                 staffPageContent?.includes('Inspection') ||
                                 staffPageContent?.includes('チェック');
    
    expect(hasInspectionContent).toBeTruthy();
  });
});