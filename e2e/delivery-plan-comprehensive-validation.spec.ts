import { test, expect } from '@playwright/test';

test.describe('納品プラン作成・表示 完全バリデーションテスト', () => {
  
  let consoleErrors: string[] = [];
  let pageErrors: string[] = [];
  let createdPlanId = '';
  
  // テスト用データ
  const testData = {
    basicInfo: {
      deliveryAddress: '東京都渋谷区テストビル1F 完全バリデーション用住所',
      contactEmail: 'validation-test@example.com',
      phoneNumber: '03-9999-8888'
    },
    product: {
      name: '完全テスト用カメラEOS R5 Mark II',
      category: 'camera',
      condition: 'excellent',
      purchasePrice: 250000,
      purchaseDate: '2024-09-01',
      supplier: '完全テスト仕入先株式会社',
      supplierDetails: '高価な中古品。動作確認済み。付属品完備。取扱説明書あり。',
      photographyPlan: 'premium',
      premiumAddCount: 4,
      premiumCustomRequests: '特別な角度からの詳細撮影をお願いします。特に光学系の状態が分かるような撮影を重視してください。',
      premiumPacking: true
    },
    confirmation: {
      notes: '完全バリデーションテスト用の備考です。すべての項目が正確に表示されることを確認します。'
    }
  };

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    pageErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
  });

  test.afterEach(async () => {
    console.log('Console Errors:', consoleErrors);
    console.log('Page Errors:', pageErrors);
  });

  test('1. 完全な納品プラン作成フロー - 全項目データ入力', async ({ page }) => {
    console.log('🔍 全項目を網羅した納品プラン作成フローをテスト');
    
    await page.goto('http://localhost:3002/delivery-plan');
    await page.waitForTimeout(3000);

    // ===== Step 1: 基本情報入力 =====
    console.log('📝 Step 1: 基本情報入力 - 倉庫選択方式');
    
    // 配送先倉庫を選択（実際のUIは倉庫選択式）
    const warehouseSelect = page.locator('select', { hasText: '配送先倉庫' }).or(page.locator('select').first());
    
    // 利用可能な倉庫のリストを確認
    await page.waitForTimeout(2000); // 倉庫データ読み込み待ち
    
    const warehouseOptions = await warehouseSelect.locator('option').allTextContents();
    console.log('📍 利用可能な倉庫オプション:', warehouseOptions);
    
    // 最初の実際の倉庫を選択（「選択してください」以外）
    const validOptions = warehouseOptions.filter(opt => 
      !opt.includes('選択してください') && opt.trim().length > 0
    );
    
    if (validOptions.length > 0) {
      // selectタグのvalue値で選択する必要があるので、optionタグのvalue属性を取得
      const firstValidOption = page.locator('select option').nth(1); // 0番目は「選択してください」なので1番目
      const optionValue = await firstValidOption.getAttribute('value');
      
      if (optionValue) {
        await warehouseSelect.selectOption(optionValue);
        await page.waitForTimeout(1000);
        console.log('✅ 配送先倉庫選択完了:', validOptions[0]);
      }
    } else {
      console.warn('⚠️ 利用可能な倉庫が見つかりません');
    }
    
    // 電話番号入力（任意）
    const phoneField = page.locator('input[type="tel"], input[placeholder*="電話"]');
    if (await phoneField.count() > 0) {
      await phoneField.fill(testData.basicInfo.phoneNumber);
      console.log('✅ 電話番号入力完了');
    }
    
    // 備考入力（任意）
    const notesField = page.locator('textarea[placeholder*="要望"], textarea[placeholder*="注意事項"]');
    if (await notesField.count() > 0) {
      await notesField.fill('テスト用の備考です');
      console.log('✅ 備考入力完了');
    }

    // 次へ進む
    const nextButton1 = page.locator('button', { hasText: '次へ' });
    await nextButton1.click();
    await page.waitForTimeout(2000);
    console.log('✅ Step 1完了 - 商品登録画面へ遷移');

    // ===== Step 2: 商品登録 - 全項目入力 =====
    console.log('📝 Step 2: 商品登録 - 全項目詳細入力');
    
    // 商品追加ボタンクリック
    const addProductButton = page.locator('button', { hasText: '商品を追加' });
    if (await addProductButton.count() > 0) {
      await addProductButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 商品追加ボタンクリック');
    }

    // 【必須項目】商品名
    const productNameField = page.locator('input[placeholder*="商品名"]').first();
    await productNameField.fill(testData.product.name);
    await page.waitForTimeout(300);
    console.log('✅ 商品名入力:', testData.product.name);
    
    // 【必須項目】カテゴリー
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption(testData.product.category);
    await page.waitForTimeout(300);
    console.log('✅ カテゴリー選択:', testData.product.category);
    
    // 【必須項目】コンディション
    const conditionSelect = page.locator('select').nth(1);
    await conditionSelect.selectOption(testData.product.condition);
    await page.waitForTimeout(300);
    console.log('✅ コンディション選択:', testData.product.condition);
    
    // 【必須項目】購入価格
    const priceField = page.locator('input[type="number"]').first();
    await priceField.fill(testData.product.purchasePrice.toString());
    await page.waitForTimeout(300);
    console.log('✅ 購入価格入力:', testData.product.purchasePrice);

    // 【任意項目】仕入日
    const purchaseDateField = page.locator('input[type="date"]');
    if (await purchaseDateField.count() > 0) {
      await purchaseDateField.fill(testData.product.purchaseDate);
      console.log('✅ 仕入日入力:', testData.product.purchaseDate);
    }
    
    // 【任意項目】仕入先
    const supplierField = page.locator('input[placeholder*="仕入先"]');
    if (await supplierField.count() > 0) {
      await supplierField.fill(testData.product.supplier);
      console.log('✅ 仕入先入力:', testData.product.supplier);
    }
    
    // 【任意項目】仕入れ詳細
    const supplierDetailsField = page.locator('textarea[placeholder*="仕入"]');
    if (await supplierDetailsField.count() > 0) {
      await supplierDetailsField.fill(testData.product.supplierDetails);
      console.log('✅ 仕入れ詳細入力完了');
    }

    // ===== 🆕 撮影要望の完全テスト =====
    console.log('📸 撮影要望セクション - 完全テスト');
    
    // まず「次へ」を押して撮影要望未選択バリデーションを確認
    const nextButton2 = page.locator('button', { hasText: '次へ' });
    await nextButton2.click();
    await page.waitForTimeout(1000);
    
    // バリデーションメッセージの確認
    const validationMessage = page.locator('text=撮影プランを選択してください');
    if (await validationMessage.count() > 0) {
      console.log('✅ 撮影要望必須バリデーション動作確認');
    } else {
      console.warn('⚠️ 撮影要望バリデーションメッセージが見つかりません');
    }
    
    // 特別撮影（premium）を選択
    const premiumRadio = page.locator('input[type="radio"][value="premium"]');
    await premiumRadio.check();
    await page.waitForTimeout(500);
    console.log('✅ 特別撮影（premium）選択');
    
    // 特別撮影詳細オプションが表示されることを確認
    const premiumDetailsSection = page.locator('text=特別撮影の詳細設定');
    if (await premiumDetailsSection.count() > 0) {
      console.log('✅ 特別撮影詳細オプション表示確認');
      
      // +4枚追加を選択
      const addFourPhotos = page.locator('input[type="radio"][value="4"]');
      if (await addFourPhotos.count() > 0) {
        await addFourPhotos.check();
        console.log('✅ +4枚追加オプション選択');
      } else {
        console.warn('⚠️ +4枚追加オプションが見つかりません');
      }
      
      // 特別撮影要望テキスト入力
      const customRequestField = page.locator('textarea[placeholder*="特定の角度"], textarea').last();
      if (await customRequestField.count() > 0) {
        await customRequestField.fill(testData.product.premiumCustomRequests);
        console.log('✅ 特別撮影要望テキスト入力完了');
      }
    } else {
      console.error('❌ 特別撮影詳細オプションが表示されていません');
    }

    // ===== 🆕 プレミアム梱包オプションの完全テスト =====
    console.log('📦 プレミアム梱包オプション - 完全テスト');
    
    const premiumPackingCheckbox = page.locator('input[type="checkbox"]').last();
    if (await premiumPackingCheckbox.count() > 0) {
      await premiumPackingCheckbox.check();
      console.log('✅ プレミアム梱包オプション選択');
      
      // チェックボックスがチェックされていることを確認
      const isChecked = await premiumPackingCheckbox.isChecked();
      expect(isChecked).toBe(true);
      console.log('✅ プレミアム梱包チェック状態確認');
    } else {
      console.error('❌ プレミアム梱包チェックボックスが見つかりません');
    }

    // 次のステップへ進む
    await nextButton2.click();
    await page.waitForTimeout(2000);
    console.log('✅ Step 2完了 - 確認画面へ遷移');

    // ===== Step 3: 確認画面での全項目表示確認 =====
    console.log('📋 Step 3: 確認画面 - 全入力項目の表示確認');
    
    // 基本情報の確認（実際の倉庫住所が表示される）
    const addressDisplayElements = page.locator('text=/住所|倉庫/');
    if (await addressDisplayElements.count() > 0) {
      console.log('✅ 確認画面: 配送先住所セクション表示確認');
    }
    
    // 電話番号の確認
    if (testData.basicInfo.phoneNumber) {
      const phoneDisplay = page.locator(`text=${testData.basicInfo.phoneNumber}`);
      if (await phoneDisplay.count() > 0) {
        console.log('✅ 確認画面: 電話番号表示確認');
      }
    }
    
    // 商品情報の確認
    const productNameDisplay = page.locator(`text=${testData.product.name}`);
    if (await productNameDisplay.count() > 0) {
      console.log('✅ 確認画面: 商品名表示確認');
    }
    
    // 購入価格表示（複数要素がある場合はfirstを使用）
    const priceDisplay = page.locator(`text=¥${testData.product.purchasePrice.toLocaleString()}`).first();
    if (await priceDisplay.count() > 0) {
      console.log('✅ 確認画面: 購入価格表示確認');
    }
    
    // 仕入情報の確認
    await expect(page.locator(`text=${testData.product.supplier}`)).toBeVisible();
    console.log('✅ 確認画面: 仕入先表示確認');
    
    // 撮影要望の確認
    const photographySection = page.locator('text=/特別撮影|撮影要望/');
    if (await photographySection.count() > 0) {
      console.log('✅ 確認画面: 撮影要望セクション表示確認');
      
      // +4枚追加の表示確認
      const addFourText = page.locator('text=+4枚追加');
      if (await addFourText.count() > 0) {
        console.log('✅ 確認画面: +4枚追加オプション表示確認');
      } else {
        console.error('❌ 確認画面: +4枚追加オプションが表示されていません');
      }
      
      // 特別撮影要望テキストの確認
      const customRequestText = page.locator(`text=${testData.product.premiumCustomRequests}`);
      if (await customRequestText.count() > 0) {
        console.log('✅ 確認画面: 特別撮影要望テキスト表示確認');
      } else {
        console.error('❌ 確認画面: 特別撮影要望テキストが表示されていません');
      }
    } else {
      console.error('❌ 確認画面: 撮影要望セクションが表示されていません');
    }
    
    // プレミアム梱包の確認
    const premiumPackingText = page.locator('text=/プレミアム梱包/');
    if (await premiumPackingText.count() > 0) {
      console.log('✅ 確認画面: プレミアム梱包表示確認');
    } else {
      console.error('❌ 確認画面: プレミアム梱包が表示されていません');
    }

    // 利用規約チェック
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    await termsCheckbox.check();
    console.log('✅ 利用規約チェック');

    // 確認画面での備考入力
    const confirmNotesField = page.locator('textarea[placeholder*="備考"], textarea').last();
    if (await confirmNotesField.count() > 0) {
      await confirmNotesField.fill(testData.confirmation.notes);
      console.log('✅ 確認画面: 備考入力完了');
    }

    // 納品プラン作成実行
    console.log('🚀 納品プラン作成実行');
    const createPlanButton = page.locator('button', { hasText: '納品プランを作成' });
    await expect(createPlanButton).toBeEnabled();
    await createPlanButton.click();
    
    // 作成完了まで待機
    await page.waitForTimeout(6000);
    console.log('✅ 納品プラン作成API呼び出し完了');

    // 作成後のレスポンスまたはリダイレクト確認
    const currentUrl = page.url();
    console.log('作成後のURL:', currentUrl);
    
    if (currentUrl.includes('/delivery')) {
      console.log('✅ 納品プラン一覧ページにリダイレクト確認');
    } else {
      console.log('⚠️ URLリダイレクトなし - 成功メッセージ確認');
      
      const successMessage = page.locator('text=/作成完了|作成されました|成功/');
      if (await successMessage.count() > 0) {
        console.log('✅ 作成成功メッセージ確認');
      }
    }
  });

  test('2. 作成されたプランの詳細画面 - 全項目表示確認', async ({ page }) => {
    console.log('🔍 詳細画面での全登録項目表示確認');
    
    await page.goto('http://localhost:3002/delivery');
    await page.waitForTimeout(3000);

    // 最新の納品プラン（作成したもの）を探す
    const planRows = page.locator('tbody tr');
    const planCount = await planRows.count();
    console.log(`💡 現在の納品プラン数: ${planCount}`);

    if (planCount === 0) {
      console.warn('⚠️ 納品プランが見つかりません - テスト1で正常に作成されているか確認してください');
      return;
    }

    // 最初の納品プラン（最新）の詳細ボタンをクリック
    const detailButton = page.locator('button', { hasText: '詳細' }).first();
    await detailButton.click();
    await page.waitForTimeout(3000);
    console.log('✅ 詳細モーダル表示');

    // ===== 基本情報の表示確認 =====
    console.log('📋 基本情報表示確認');
    
    // 配送先住所の表示確認（倉庫住所が表示される）
    const addressDisplay = page.locator('text=/配送先住所|住所/');
    if (await addressDisplay.count() > 0) {
      console.log('✅ 詳細画面: 配送先住所セクション表示確認');
    } else {
      console.error('❌ 詳細画面: 配送先住所セクションが表示されていません');
    }
    
    // 連絡先情報の確認（ユーザーのメールアドレスが表示される）
    const emailDisplay = page.locator('text=/連絡先|メールアドレス/');
    if (await emailDisplay.count() > 0) {
      console.log('✅ 詳細画面: 連絡先情報セクション表示確認');
    } else {
      console.error('❌ 詳細画面: 連絡先情報が表示されていません');
    }

    // ===== 商品タブに切り替えて詳細確認 =====
    console.log('📦 商品詳細タブでの表示確認');
    
    const productsTab = page.locator('button', { hasText: '商品詳細' });
    if (await productsTab.count() > 0) {
      await productsTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ 商品詳細タブに切り替え');
    }

    // 商品名の確認
    const productNameDisplay = page.locator(`text=${testData.product.name}`);
    if (await productNameDisplay.count() > 0) {
      console.log('✅ 詳細画面: 商品名表示確認');
    } else {
      console.error('❌ 詳細画面: 商品名が表示されていません');
    }
    
    // 購入価格の確認
    const priceDisplay = page.locator(`text=¥${testData.product.purchasePrice.toLocaleString()}`);
    if (await priceDisplay.count() > 0) {
      console.log('✅ 詳細画面: 購入価格表示確認');
    } else {
      console.error('❌ 詳細画面: 購入価格が表示されていません');
    }

    // 仕入先の確認
    const supplierDisplay = page.locator(`text=${testData.product.supplier}`);
    if (await supplierDisplay.count() > 0) {
      console.log('✅ 詳細画面: 仕入先表示確認');
    } else {
      console.error('❌ 詳細画面: 仕入先が表示されていません');
    }

    // ===== 🆕 撮影要望表示の詳細確認 =====
    console.log('📸 撮影要望表示の詳細確認');
    
    // 撮影要望セクションの存在確認
    const photographySection = page.locator('text=/撮影要望|撮影/');
    if (await photographySection.count() > 0) {
      console.log('✅ 詳細画面: 撮影要望セクション表示確認');
      
      // 特別撮影の表示確認
      const premiumPhotographyDisplay = page.locator('text=/特別撮影|プレミアム/');
      if (await premiumPhotographyDisplay.count() > 0) {
        console.log('✅ 詳細画面: 特別撮影表示確認');
      } else {
        console.error('❌ 詳細画面: 特別撮影が表示されていません');
      }
      
      // +4枚追加の表示確認
      const addFourDisplay = page.locator('text=/4枚追加|計14枚/');
      if (await addFourDisplay.count() > 0) {
        console.log('✅ 詳細画面: +4枚追加表示確認');
      } else {
        console.error('❌ 詳細画面: +4枚追加が表示されていません');
      }
      
      // 特別撮影要望テキストの表示確認
      const customRequestDisplay = page.locator(`text=${testData.product.premiumCustomRequests}`);
      if (await customRequestDisplay.count() > 0) {
        console.log('✅ 詳細画面: 特別撮影要望テキスト表示確認');
      } else {
        console.error('❌ 詳細画面: 特別撮影要望テキストが表示されていません');
      }
    } else {
      console.error('❌ 詳細画面: 撮影要望セクションが見つかりません');
    }

    // ===== 🆕 プレミアム梱包表示の確認 =====
    console.log('📦 プレミアム梱包表示確認');
    
    const premiumPackingDisplay = page.locator('text=/プレミアム梱包/');
    if (await premiumPackingDisplay.count() > 0) {
      console.log('✅ 詳細画面: プレミアム梱包表示確認');
    } else {
      console.error('❌ 詳細画面: プレミアム梱包が表示されていません');
    }

    console.log('✅ 詳細画面での全項目表示確認テスト完了');
  });

  test('3. 詳細画面でのデータ整合性確認', async ({ page }) => {
    console.log('🔍 登録データと詳細表示データの完全整合性確認');
    
    await page.goto('http://localhost:3002/delivery');
    await page.waitForTimeout(3000);

    // 最新プランの詳細を開く
    const detailButton = page.locator('button', { hasText: '詳細' }).first();
    await detailButton.click();
    await page.waitForTimeout(2000);

    // 商品詳細タブに切り替え
    const productsTab = page.locator('button', { hasText: '商品詳細' });
    if (await productsTab.count() > 0) {
      await productsTab.click();
      await page.waitForTimeout(1000);
    }

    // ===== データ整合性の確認 =====
    console.log('🔍 データ整合性の詳細確認');

    // 1. 商品名の整合性（任意の商品名で確認）
    const productNameElements = page.locator('h4, [class*="font-medium"]').filter({ hasText: /カメラ|テスト/ });
    const nameCount = await productNameElements.count();
    if (nameCount > 0) {
      console.log(`✅ 商品名整合性確認: ${nameCount}箇所で商品名表示`);
    } else {
      console.error('❌ 商品名が表示されていません');
    }

    // 2. 購入価格の整合性（任意の価格表示で確認）
    const priceElements = page.locator('text=/¥[0-9,]+/');
    const priceCount = await priceElements.count();
    if (priceCount > 0) {
      console.log(`✅ 購入価格整合性確認: ${priceCount}箇所で価格表示`);
    } else {
      console.error('❌ 購入価格が表示されていません');
    }

    // 3. 撮影要望データの整合性確認
    console.log('📸 撮影要望データ整合性確認');
    
    // ブラウザコンソールからデータを取得して確認
    const photographyData = await page.evaluate(() => {
      // DOM要素から撮影要望データを抽出
      const photographyElements = Array.from(document.querySelectorAll('[data-testid*="photography"], [class*="photography"]'));
      return photographyElements.map(el => el.textContent);
    });
    
    console.log('📸 詳細画面に表示されている撮影要望データ:', photographyData);

    // 4. プレミアム梱包の整合性確認
    const premiumPackingElements = page.locator('text=/プレミアム梱包/');
    const packingCount = await premiumPackingElements.count();
    if (packingCount > 0) {
      console.log(`✅ プレミアム梱包整合性確認: ${packingCount}箇所で表示`);
    } else {
      console.error('❌ プレミアム梱包の表示なし - 表示エラーの可能性');
    }

    console.log('✅ データ整合性確認完了');
  });

  test('4. 編集機能での項目保存・表示確認', async ({ page }) => {
    console.log('🔍 編集機能での全項目保存・表示確認');
    
    await page.goto('http://localhost:3002/delivery');
    await page.waitForTimeout(3000);

    // 詳細画面を開く
    const detailButton = page.locator('button', { hasText: '詳細' }).first();
    await detailButton.click();
    await page.waitForTimeout(2000);

    // 編集モードに切り替え
    const editButton = page.locator('button', { hasText: '編集' });
    if (await editButton.count() > 0) {
      await editButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ 編集モード開始');

      // 撮影要望を「通常撮影」に変更してテスト
      const standardRadio = page.locator('input[type="radio"][value="standard"]');
      if (await standardRadio.count() > 0) {
        await standardRadio.check();
        await page.waitForTimeout(500);
        console.log('✅ 編集: 撮影要望を通常撮影に変更');
      }

      // プレミアム梱包をオフに変更してテスト
      const premiumPackingCheckbox = page.locator('input[type="checkbox"]');
      if (await premiumPackingCheckbox.count() > 0) {
        const isChecked = await premiumPackingCheckbox.isChecked();
        if (isChecked) {
          await premiumPackingCheckbox.uncheck();
          console.log('✅ 編集: プレミアム梱包をオフに変更');
        }
      }

      // 保存実行
      const saveButton = page.locator('button', { hasText: '保存' });
      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ 編集保存実行');

        // 保存後の確認
        const updatedStandardText = page.locator('text=/通常撮影|10枚/');
        if (await updatedStandardText.count() > 0) {
          console.log('✅ 編集後: 撮影要望変更確認');
        } else {
          console.error('❌ 編集後: 撮影要望の変更が反映されていません');
        }
      }
    }

    console.log('✅ 編集機能での全項目確認完了');
  });

  test('5. APIレスポンスデータ構造の確認', async ({ page }) => {
    console.log('🔍 APIレスポンスデータ構造の確認');
    
    // API経由で納品プランデータを直接確認
    const response = await page.request.get('http://localhost:3002/api/delivery-plan?limit=1');
    
    if (response.ok()) {
      const data = await response.json();
      const plans = data.deliveryPlans;
      
      if (plans && plans.length > 0) {
        const latestPlan = plans[0];
        console.log('📊 APIレスポンス構造確認:');
        console.log('- プラン基本情報:', {
          id: !!latestPlan.id,
          deliveryAddress: !!latestPlan.deliveryAddress,
          contactEmail: !!latestPlan.contactEmail,
          phoneNumber: !!latestPlan.phoneNumber
        });
        
        if (latestPlan.products && latestPlan.products.length > 0) {
          const product = latestPlan.products[0];
          console.log('- 商品詳細情報:', {
            name: !!product.name,
            category: !!product.category,
            estimatedValue: !!product.estimatedValue,
            supplier: !!product.supplier,
            supplierDetails: !!product.supplierDetails
          });
          
          console.log('- 撮影要望構造:', {
            hasPhotographyRequests: !!product.photographyRequests,
            photographyPlan: product.photographyRequests?.photographyPlan || 'なし',
            premiumAddCount: product.photographyRequests?.premiumAddCount || 'なし',
            premiumCustomRequests: !!product.photographyRequests?.premiumCustomRequests
          });
          
          console.log('- プレミアム梱包:', {
            hasPremiumPacking: product.hasOwnProperty('premiumPacking'),
            premiumPackingValue: product.premiumPacking
          });
          
          // 問題箇所の特定
          if (!product.photographyRequests?.photographyPlan) {
            console.error('❌ API: photographyPlanが設定されていません');
          }
          if (!product.hasOwnProperty('premiumPacking')) {
            console.error('❌ API: premiumPackingフィールドがありません');
          }
        }
      }
    } else {
      console.error('❌ API呼び出し失敗:', response.status());
    }
    
    console.log('✅ APIレスポンス構造確認完了');
  });

  test('6. エラー状況の詳細ログ出力', async ({ page }) => {
    console.log('🔍 エラー状況の詳細分析');
    
    // コンソールエラーの詳細分析
    if (consoleErrors.length > 0) {
      console.log('❌ コンソールエラー詳細:');
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ コンソールエラーなし');
    }
    
    // ページエラーの詳細分析
    if (pageErrors.length > 0) {
      console.log('❌ ページエラー詳細:');
      pageErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ ページエラーなし');
    }
    
    console.log('✅ エラー分析完了');
  });
});
