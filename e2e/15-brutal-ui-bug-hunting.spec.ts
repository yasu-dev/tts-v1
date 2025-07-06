import { test, expect } from '@playwright/test';

test.describe('🔥 徹底的バグハンティング - 本番運用レベルUI/UXテスト', () => {
  
  test.beforeEach(async ({ page }) => {
    // アプリケーションが実際に起動しているかを確認
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // 確実に読み込み完了を待つ
  });

  test('🚨 ログイン画面 - 実際のバグ発見テスト', async ({ page }) => {
    console.log('=== ログイン画面バグハンティング開始 ===');
    
    // 1. ページが正常に読み込まれているか
    const title = await page.title();
    console.log(`ページタイトル: ${title}`);
    
    // 2. 必要な要素が存在するか
    const sellerButton = page.locator('[data-testid="seller-login"]');
    const staffButton = page.locator('[data-testid="staff-login"]');
    const loginButton = page.locator('button:has-text("ログイン")');
    
    const sellerExists = await sellerButton.isVisible();
    const staffExists = await staffButton.isVisible();
    const loginExists = await loginButton.isVisible();
    
    console.log(`セラーログインボタン存在: ${sellerExists}`);
    console.log(`スタッフログインボタン存在: ${staffExists}`);
    console.log(`ログインボタン存在: ${loginExists}`);
    
    if (!sellerExists) {
      console.log('🚨 バグ発見: セラーログインボタンが存在しない');
    }
    if (!staffExists) {
      console.log('🚨 バグ発見: スタッフログインボタンが存在しない');
    }
    if (!loginExists) {
      console.log('🚨 バグ発見: ログインボタンが存在しない');
    }
    
    // 3. 実際にクリックできるか
    if (sellerExists) {
      await sellerButton.click();
      await page.waitForTimeout(1000);
      
      const emailValue = await page.locator('input[type="email"]').inputValue();
      const passwordValue = await page.locator('input[type="password"]').inputValue();
      
      console.log(`セラーログイン後 - Email: ${emailValue}, Password: ${passwordValue}`);
      
      if (emailValue !== 'seller@example.com') {
        console.log('🚨 バグ発見: セラーログインボタンがEmailを正しく設定していない');
      }
      if (passwordValue !== 'password123') {
        console.log('🚨 バグ発見: セラーログインボタンがPasswordを正しく設定していない');
      }
    }
    
    // 4. 実際のログイン処理
    if (loginExists) {
      await loginButton.click();
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log(`ログイン後URL: ${currentUrl}`);
      
      if (!currentUrl.includes('/dashboard')) {
        console.log('🚨 バグ発見: ログイン後にダッシュボードに遷移していない');
      }
    }
  });

  test('🚨 ダッシュボード - 実際のバグ発見テスト', async ({ page }) => {
    console.log('=== ダッシュボードバグハンティング開始 ===');
    
    // ログイン処理
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    await page.waitForTimeout(3000);
    
    // 1. ページ読み込み確認
    const h1 = page.locator('h1');
    const h1Text = await h1.textContent();
    console.log(`ダッシュボードタイトル: ${h1Text}`);
    
    // 2. 全ボタンの存在確認
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`ダッシュボードボタン総数: ${buttonCount}個`);
    
    // 3. 各ボタンを実際にクリックしてバグ確認
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = allButtons.nth(i);
      const buttonText = await button.textContent();
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      
      console.log(`ボタン${i + 1}: "${buttonText}" - 表示:${isVisible}, 有効:${isEnabled}`);
      
      if (isVisible && isEnabled && buttonText) {
        try {
          await button.click();
          await page.waitForTimeout(1000);
          
          // モーダルが開いたか確認
          const modal = page.locator('[role="dialog"]');
          const modalVisible = await modal.isVisible();
          
          if (modalVisible) {
            console.log(`✅ ボタン"${buttonText}"はモーダルを正常に開いた`);
            
            // モーダルを閉じる
            const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じる")').first();
            if (await closeButton.isVisible()) {
              await closeButton.click();
              await page.waitForTimeout(500);
            } else {
              // Escapeで閉じる
              await page.keyboard.press('Escape');
              await page.waitForTimeout(500);
            }
          } else {
            console.log(`⚠️ ボタン"${buttonText}"クリック後にモーダルが開かない`);
          }
        } catch (error) {
          console.log(`🚨 バグ発見: ボタン"${buttonText}"クリック時にエラー: ${error}`);
        }
      } else {
        console.log(`🚨 バグ発見: ボタン"${buttonText}"が無効またはクリックできない`);
      }
    }
    
    // 4. APIエラーの確認
    const apiErrors: string[] = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        apiErrors.push(`${response.status()} ${response.url()}`);
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (apiErrors.length > 0) {
      console.log('🚨 API エラー発見:');
      apiErrors.forEach(error => console.log(`  - ${error}`));
    }
  });

  test('🚨 在庫管理画面 - 実際のバグ発見テスト', async ({ page }) => {
    console.log('=== 在庫管理画面バグハンティング開始 ===');
    
    // ログイン処理
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    
    // 在庫管理ページへ
    await page.goto('/inventory');
    await page.waitForTimeout(3000);
    
    // 1. 新規商品登録ボタンのテスト
    const registerButton = page.locator('button:has-text("新規商品登録")');
    const registerExists = await registerButton.isVisible();
    console.log(`新規商品登録ボタン存在: ${registerExists}`);
    
    if (registerExists) {
      await registerButton.click();
      await page.waitForTimeout(2000);
      
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible();
      console.log(`商品登録モーダル表示: ${modalVisible}`);
      
      if (modalVisible) {
        // フォーム要素の確認
        const nameInput = modal.locator('input[name*="name"], input[placeholder*="商品名"]').first();
        const skuInput = modal.locator('input[name*="sku"], input[placeholder*="SKU"]').first();
        const priceInput = modal.locator('input[type="number"], input[name*="price"]').first();
        
        const nameExists = await nameInput.isVisible();
        const skuExists = await skuInput.isVisible();
        const priceExists = await priceInput.isVisible();
        
        console.log(`商品名入力フィールド: ${nameExists}`);
        console.log(`SKU入力フィールド: ${skuExists}`);
        console.log(`価格入力フィールド: ${priceExists}`);
        
        // 実際の入力テスト
        if (nameExists) {
          await nameInput.fill('テスト商品');
          const nameValue = await nameInput.inputValue();
          if (nameValue !== 'テスト商品') {
            console.log('🚨 バグ発見: 商品名入力フィールドが正常に動作しない');
          }
        }
        
        if (skuExists) {
          await skuInput.fill('TEST-001');
          const skuValue = await skuInput.inputValue();
          if (skuValue !== 'TEST-001') {
            console.log('🚨 バグ発見: SKU入力フィールドが正常に動作しない');
          }
        }
        
        if (priceExists) {
          await priceInput.fill('1000');
          const priceValue = await priceInput.inputValue();
          if (priceValue !== '1000') {
            console.log('🚨 バグ発見: 価格入力フィールドが正常に動作しない');
          }
        }
        
        // 保存ボタンのテスト
        const saveButton = modal.locator('button:has-text("登録"), button:has-text("保存"), button[type="submit"]').first();
        const saveExists = await saveButton.isVisible();
        console.log(`保存ボタン存在: ${saveExists}`);
        
        if (saveExists) {
          await saveButton.click();
          await page.waitForTimeout(3000);
          
          const modalStillVisible = await modal.isVisible();
          console.log(`保存後モーダル状態: ${modalStillVisible ? '開いている' : '閉じている'}`);
          
          if (modalStillVisible) {
            console.log('⚠️ 保存後もモーダルが開いている（バリデーションエラーまたは処理未完了）');
          }
        } else {
          console.log('🚨 バグ発見: 保存ボタンが存在しない');
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じる")').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
      } else {
        console.log('🚨 バグ発見: 新規商品登録ボタンをクリックしてもモーダルが開かない');
      }
    } else {
      console.log('🚨 バグ発見: 新規商品登録ボタンが存在しない');
    }
    
    // 2. CSVインポートボタンのテスト
    const csvImportButton = page.locator('button:has-text("CSVインポート")');
    const csvImportExists = await csvImportButton.isVisible();
    console.log(`CSVインポートボタン存在: ${csvImportExists}`);
    
    if (csvImportExists) {
      await csvImportButton.click();
      await page.waitForTimeout(2000);
      
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible();
      
      if (!modalVisible) {
        console.log('🚨 バグ発見: CSVインポートボタンをクリックしてもモーダルが開かない');
      } else {
        console.log('✅ CSVインポートモーダルが正常に開いた');
        
        // ファイル入力の確認
        const fileInput = modal.locator('input[type="file"]');
        const fileInputExists = await fileInput.isVisible();
        console.log(`ファイル入力フィールド存在: ${fileInputExists}`);
        
        if (!fileInputExists) {
          console.log('🚨 バグ発見: CSVインポートモーダルにファイル入力フィールドがない');
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じる")').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    } else {
      console.log('🚨 バグ発見: CSVインポートボタンが存在しない');
    }
  });

  test('🚨 スタッフダッシュボード - 詳細ボタンバグハンティング', async ({ page }) => {
    console.log('=== スタッフダッシュボード詳細ボタンバグハンティング開始 ===');
    
    // スタッフログイン
    await page.click('[data-testid="staff-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/staff/dashboard');
    await page.waitForTimeout(5000); // データ読み込み待機
    
    // タスクテーブルの確認
    const taskTable = page.locator('table, [data-testid*="table"], .holo-table');
    const tableExists = await taskTable.isVisible();
    console.log(`タスクテーブル存在: ${tableExists}`);
    
    if (!tableExists) {
      console.log('🚨 バグ発見: タスクテーブルが存在しない');
      return;
    }
    
    // 詳細ボタンの確認
    const detailButtons = page.locator('button:has-text("詳細")');
    const detailButtonCount = await detailButtons.count();
    console.log(`詳細ボタン数: ${detailButtonCount}個`);
    
    if (detailButtonCount === 0) {
      console.log('🚨 バグ発見: 詳細ボタンが1つも存在しない');
      
      // テーブル内容を詳しく調査
      const tableContent = await taskTable.textContent();
      console.log(`テーブル内容: ${tableContent?.substring(0, 200)}...`);
      
      // すべてのボタンを調査
      const allButtons = taskTable.locator('button');
      const allButtonCount = await allButtons.count();
      console.log(`テーブル内ボタン総数: ${allButtonCount}個`);
      
      for (let i = 0; i < Math.min(allButtonCount, 5); i++) {
        const button = allButtons.nth(i);
        const buttonText = await button.textContent();
        console.log(`テーブル内ボタン${i + 1}: "${buttonText}"`);
      }
    } else {
      // 詳細ボタンをクリックしてテスト
      const firstDetailButton = detailButtons.first();
      await firstDetailButton.click();
      await page.waitForTimeout(2000);
      
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible();
      console.log(`詳細モーダル表示: ${modalVisible}`);
      
      if (!modalVisible) {
        console.log('🚨 バグ発見: 詳細ボタンをクリックしてもモーダルが開かない');
      } else {
        console.log('✅ 詳細ボタンが正常に動作');
        
        // モーダル内容の確認
        const modalTitle = modal.locator('h1, h2, h3').first();
        const titleExists = await modalTitle.isVisible();
        console.log(`モーダルタイトル存在: ${titleExists}`);
        
        if (titleExists) {
          const titleText = await modalTitle.textContent();
          console.log(`モーダルタイトル: ${titleText}`);
        }
        
        // タブ機能のテスト
        const tabs = modal.locator('button:has-text("詳細"), button:has-text("履歴"), button:has-text("添付")');
        const tabCount = await tabs.count();
        console.log(`タブ数: ${tabCount}個`);
        
        if (tabCount > 0) {
          for (let i = 0; i < tabCount; i++) {
            const tab = tabs.nth(i);
            const tabText = await tab.textContent();
            console.log(`タブ${i + 1}をテスト: "${tabText}"`);
            
            await tab.click();
            await page.waitForTimeout(1000);
            
            // タブコンテンツが表示されているか確認
            const tabContent = modal.locator('[role="tabpanel"], .tab-content');
            const contentVisible = await tabContent.isVisible();
            console.log(`タブ${i + 1}コンテンツ表示: ${contentVisible}`);
          }
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("閉じる")').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    }
  });

  test('🚨 返品管理画面 - 詳細ボタンバグハンティング', async ({ page }) => {
    console.log('=== 返品管理画面詳細ボタンバグハンティング開始 ===');
    
    // セラーログイン
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    
    // 返品管理ページへ
    await page.goto('/returns');
    await page.waitForTimeout(3000);
    
    // 返品詳細ボタンの確認（複数の可能性を調査）
    const detailButtons = page.locator('button:has-text("詳細"), button[aria-label*="詳細"], svg[data-icon="eye"]').locator('..');
    const iconButtons = page.locator('button svg[data-icon="eye"]').locator('..');
    const allButtons = page.locator('button');
    
    const detailButtonCount = await detailButtons.count();
    const iconButtonCount = await iconButtons.count();
    const allButtonCount = await allButtons.count();
    
    console.log(`詳細ボタン数: ${detailButtonCount}個`);
    console.log(`アイコンボタン数: ${iconButtonCount}個`);
    console.log(`全ボタン数: ${allButtonCount}個`);
    
    // 全ボタンの内容を調査
    for (let i = 0; i < Math.min(allButtonCount, 10); i++) {
      const button = allButtons.nth(i);
      const buttonText = await button.textContent();
      const buttonHTML = await button.innerHTML();
      console.log(`ボタン${i + 1}: テキスト="${buttonText}", HTML="${buttonHTML.substring(0, 50)}..."`);
    }
    
    if (detailButtonCount === 0 && iconButtonCount === 0) {
      console.log('🚨 バグ発見: 返品詳細ボタンが1つも存在しない');
      
      // テーブルまたはリストの内容を調査
      const tables = page.locator('table');
      const tableCount = await tables.count();
      console.log(`テーブル数: ${tableCount}個`);
      
      if (tableCount > 0) {
        const tableContent = await tables.first().textContent();
        console.log(`テーブル内容: ${tableContent?.substring(0, 200)}...`);
      }
    } else {
      // 詳細ボタンまたはアイコンボタンをクリック
      const targetButton = detailButtonCount > 0 ? detailButtons.first() : iconButtons.first();
      
      await targetButton.click();
      await page.waitForTimeout(2000);
      
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible();
      console.log(`返品詳細モーダル表示: ${modalVisible}`);
      
      if (!modalVisible) {
        console.log('🚨 バグ発見: 返品詳細ボタンをクリックしてもモーダルが開かない');
      } else {
        console.log('✅ 返品詳細ボタンが正常に動作');
        
        // モーダル内容の確認
        const modalContent = modal.locator('div').first();
        const contentExists = await modalContent.isVisible();
        console.log(`モーダル内容存在: ${contentExists}`);
        
        if (contentExists) {
          const content = await modalContent.textContent();
          console.log(`モーダル内容: ${content?.substring(0, 100)}...`);
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("閉じる")').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    }
  });

  test('🚨 設定画面 - 全機能バグハンティング', async ({ page }) => {
    console.log('=== 設定画面全機能バグハンティング開始 ===');
    
    // セラーログイン
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    
    // 設定ページへ
    await page.goto('/settings');
    await page.waitForTimeout(3000);
    
    // 全ボタンの詳細調査
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`設定画面ボタン総数: ${buttonCount}個`);
    
    const buttonTests = [
      { name: '配送業者設定', selector: 'button:has-text("配送業者設定"), button:has-text("配送設定")' },
      { name: '梱包材設定', selector: 'button:has-text("梱包材設定"), button:has-text("梱包設定")' },
      { name: 'エクスポート', selector: 'button:has-text("エクスポート")' },
      { name: '保存', selector: 'button:has-text("保存")' },
      { name: '更新', selector: 'button:has-text("更新")' }
    ];
    
    for (const buttonTest of buttonTests) {
      console.log(`--- ${buttonTest.name}ボタンテスト ---`);
      
      const button = page.locator(buttonTest.selector).first();
      const buttonExists = await button.isVisible();
      console.log(`${buttonTest.name}ボタン存在: ${buttonExists}`);
      
      if (buttonExists) {
        const isEnabled = await button.isEnabled();
        console.log(`${buttonTest.name}ボタン有効: ${isEnabled}`);
        
        if (isEnabled) {
          await button.click();
          await page.waitForTimeout(2000);
          
          // モーダルまたはダウンロードの確認
          const modal = page.locator('[role="dialog"]');
          const modalVisible = await modal.isVisible();
          
          if (modalVisible) {
            console.log(`✅ ${buttonTest.name}ボタンがモーダルを正常に開いた`);
            
            // モーダル内容の確認
            const modalTitle = modal.locator('h1, h2, h3').first();
            if (await modalTitle.isVisible()) {
              const titleText = await modalTitle.textContent();
              console.log(`モーダルタイトル: ${titleText}`);
            }
            
            // モーダル内のフォーム要素確認
            const inputs = modal.locator('input');
            const selects = modal.locator('select');
            const textareas = modal.locator('textarea');
            
            const inputCount = await inputs.count();
            const selectCount = await selects.count();
            const textareaCount = await textareas.count();
            
            console.log(`フォーム要素 - input:${inputCount}, select:${selectCount}, textarea:${textareaCount}`);
            
            // 入力テスト
            if (inputCount > 0) {
              const firstInput = inputs.first();
              const inputType = await firstInput.getAttribute('type');
              console.log(`最初の入力フィールドタイプ: ${inputType}`);
              
              if (inputType !== 'file') {
                await firstInput.fill('テスト入力');
                const inputValue = await firstInput.inputValue();
                if (inputValue !== 'テスト入力') {
                  console.log('🚨 バグ発見: 入力フィールドが正常に動作しない');
                } else {
                  console.log('✅ 入力フィールド正常動作');
                }
              }
            }
            
            // モーダルを閉じる
            const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じる")').first();
            if (await closeButton.isVisible()) {
              await closeButton.click();
            } else {
              await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(1000);
          } else {
            console.log(`⚠️ ${buttonTest.name}ボタンクリック後にモーダルが開かない（ダウンロードまたは他の処理）`);
          }
        } else {
          console.log(`🚨 バグ発見: ${buttonTest.name}ボタンが無効状態`);
        }
      } else {
        console.log(`🚨 バグ発見: ${buttonTest.name}ボタンが存在しない`);
      }
    }
  });

  test('🚨 全ページナビゲーション - 実際のバグ発見テスト', async ({ page }) => {
    console.log('=== 全ページナビゲーションバグハンティング開始 ===');
    
    // セラーログイン
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    
    const pages = [
      { name: 'ダッシュボード', url: '/dashboard' },
      { name: '在庫管理', url: '/inventory' },
      { name: '売上管理', url: '/sales' },
      { name: '請求管理', url: '/billing' },
      { name: '納品管理', url: '/delivery' },
      { name: '返品管理', url: '/returns' },
      { name: 'プロフィール', url: '/profile' },
      { name: '設定', url: '/settings' },
      { name: 'タイムライン', url: '/timeline' }
    ];
    
    for (const pageInfo of pages) {
      console.log(`--- ${pageInfo.name}ページテスト ---`);
      
      try {
        await page.goto(pageInfo.url);
        await page.waitForTimeout(3000);
        
        // ページ読み込み確認
        const currentUrl = page.url();
        console.log(`現在URL: ${currentUrl}`);
        
        if (!currentUrl.includes(pageInfo.url)) {
          console.log(`🚨 バグ発見: ${pageInfo.name}ページに正しく遷移していない`);
          continue;
        }
        
        // ページタイトル確認
        const h1 = page.locator('h1');
        const h1Exists = await h1.isVisible();
        if (h1Exists) {
          const h1Text = await h1.textContent();
          console.log(`${pageInfo.name}タイトル: ${h1Text}`);
        } else {
          console.log(`🚨 バグ発見: ${pageInfo.name}ページにh1タイトルが存在しない`);
        }
        
        // ボタン数確認
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        console.log(`${pageInfo.name}ボタン数: ${buttonCount}個`);
        
        if (buttonCount === 0) {
          console.log(`🚨 バグ発見: ${pageInfo.name}ページにボタンが1つもない`);
        }
        
        // エラーメッセージの確認
        const errorMessages = page.locator('[role="alert"], .error, .alert-error');
        const errorCount = await errorMessages.count();
        if (errorCount > 0) {
          console.log(`🚨 バグ発見: ${pageInfo.name}ページにエラーメッセージが表示されている`);
          for (let i = 0; i < errorCount; i++) {
            const errorText = await errorMessages.nth(i).textContent();
            console.log(`  エラー${i + 1}: ${errorText}`);
          }
        }
        
        // JavaScriptエラーの確認
        const jsErrors: string[] = [];
        page.on('pageerror', error => {
          jsErrors.push(error.message);
        });
        
        await page.waitForTimeout(1000);
        
        if (jsErrors.length > 0) {
          console.log(`🚨 JavaScriptエラー発見 in ${pageInfo.name}:`);
          jsErrors.forEach(error => console.log(`  - ${error}`));
        }
        
      } catch (error) {
        console.log(`🚨 バグ発見: ${pageInfo.name}ページでエラー: ${error}`);
      }
    }
  });
}); 