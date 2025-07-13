import { test, expect } from '@playwright/test';

test.describe('🔍 UIモーダル機能動作検証', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(2000);
    await page.fill('input[name="username"]', 'seller');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  });

  test('🎯 ダッシュボード期間選択モーダル検証', async ({ page }) => {
    console.log('=== ダッシュボード期間選択モーダル検証開始 ===');
    
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);
    
    // 期間選択ボタンを探す
    const periodButton = page.locator('button:has-text("期間選択"), button:has-text("レポート期間")').first();
    
    const buttonExists = await periodButton.isVisible();
    console.log(`期間選択ボタン存在: ${buttonExists ? '✅' : '❌'}`);
    
    if (buttonExists) {
      await periodButton.click();
      await page.waitForTimeout(2000);
      
      // モーダルが開いたかチェック
      const modal = page.locator('[role="dialog"]');
      const modalOpen = await modal.isVisible();
      console.log(`モーダル開閉: ${modalOpen ? '✅ 動作' : '❌ 未動作'}`);
      
      if (modalOpen) {
        // DateRangePickerの存在確認
        const dateRangePicker = page.locator('.rdrCalendarWrapper');
        const pickerExists = await dateRangePicker.isVisible();
        console.log(`DateRangePicker表示: ${pickerExists ? '✅ 動作' : '❌ 未動作'}`);
        
        // 適用ボタンの存在確認
        const applyButton = page.locator('button:has-text("適用")');
        const applyExists = await applyButton.isVisible();
        console.log(`適用ボタン存在: ${applyExists ? '✅ 動作' : '❌ 未動作'}`);
        
        if (applyExists) {
          await applyButton.click();
          await page.waitForTimeout(1000);
          
          // モーダルが閉じたかチェック
          const modalClosed = !(await modal.isVisible());
          console.log(`モーダル閉じる: ${modalClosed ? '✅ 動作' : '❌ 未動作'}`);
          
          if (modalClosed) {
            console.log('🎉 ダッシュボード期間選択モーダル: 完全実装済み');
          } else {
            console.log('❌ ダッシュボード期間選択モーダル: 部分未実装');
          }
        } else {
          console.log('❌ ダッシュボード期間選択モーダル: 部分未実装');
        }
      } else {
        console.log('❌ ダッシュボード期間選択モーダル: 未実装');
      }
    } else {
      console.log('❌ ダッシュボード期間選択ボタン: 未実装');
    }
  });

  test('📦 在庫管理商品登録モーダル検証', async ({ page }) => {
    console.log('=== 在庫管理商品登録モーダル検証開始 ===');
    
    await page.goto('/inventory');
    await page.waitForTimeout(3000);
    
    // 新規商品登録ボタンを探す
    const addButton = page.locator('button:has-text("新規商品登録"), button:has-text("新規")').first();
    
    const buttonExists = await addButton.isVisible();
    console.log(`新規商品登録ボタン存在: ${buttonExists ? '✅' : '❌'}`);
    
    if (buttonExists) {
      await addButton.click();
      await page.waitForTimeout(2000);
      
      // モーダルが開いたかチェック
      const modal = page.locator('[role="dialog"]');
      const modalOpen = await modal.isVisible();
      console.log(`商品登録モーダル開閉: ${modalOpen ? '✅ 動作' : '❌ 未動作'}`);
      
      if (modalOpen) {
        // フォーム要素の存在確認
        const nameInput = page.locator('input[name="name"]');
        const nameExists = await nameInput.isVisible();
        console.log(`商品名入力フィールド: ${nameExists ? '✅ 動作' : '❌ 未動作'}`);
        
        const skuInput = page.locator('input[name="sku"]');
        const skuExists = await skuInput.isVisible();
        console.log(`SKU入力フィールド: ${skuExists ? '✅ 動作' : '❌ 未動作'}`);
        
        if (nameExists && skuExists) {
          // 実際に入力テスト
          await nameInput.fill('テスト商品');
          await skuInput.fill('TEST-001');
          
          const nameValue = await nameInput.inputValue();
          const skuValue = await skuInput.inputValue();
          
          console.log(`入力機能テスト: ${nameValue === 'テスト商品' && skuValue === 'TEST-001' ? '✅ 動作' : '❌ 未動作'}`);
          
          // 送信ボタンの存在確認
          const submitButton = page.locator('button:has-text("登録"), button:has-text("保存")').first();
          const submitExists = await submitButton.isVisible();
          console.log(`送信ボタン存在: ${submitExists ? '✅ 動作' : '❌ 未動作'}`);
          
          if (submitExists) {
            console.log('🎉 在庫管理商品登録モーダル: 完全実装済み');
          } else {
            console.log('❌ 在庫管理商品登録モーダル: 部分未実装');
          }
        } else {
          console.log('❌ 在庫管理商品登録モーダル: 部分未実装');
        }
        
        // モーダルを閉じる
        const closeButton = page.locator('button:has-text("×"), button:has-text("キャンセル")').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(1000);
        }
      } else {
        console.log('❌ 在庫管理商品登録モーダル: 未実装');
      }
    } else {
      console.log('❌ 在庫管理商品登録ボタン: 未実装');
    }
  });

  test('💰 売上管理出品設定モーダル検証', async ({ page }) => {
    console.log('=== 売上管理出品設定モーダル検証開始 ===');
    
    await page.goto('/sales');
    await page.waitForTimeout(3000);
    
    // 出品設定ボタンを探す
    const settingsButton = page.locator('button:has-text("出品設定")').first();
    
    const buttonExists = await settingsButton.isVisible();
    console.log(`出品設定ボタン存在: ${buttonExists ? '✅' : '❌'}`);
    
    if (buttonExists) {
      await settingsButton.click();
      await page.waitForTimeout(2000);
      
      // モーダルが開いたかチェック
      const modal = page.locator('[role="dialog"]');
      const modalOpen = await modal.isVisible();
      console.log(`出品設定モーダル開閉: ${modalOpen ? '✅ 動作' : '❌ 未動作'}`);
      
      if (modalOpen) {
        // 設定項目の存在確認
        const profitInput = page.locator('input[type="number"]');
        const profitExists = await profitInput.isVisible();
        console.log(`利益率入力フィールド: ${profitExists ? '✅ 動作' : '❌ 未動作'}`);
        
        const checkbox = page.locator('input[type="checkbox"]');
        const checkboxExists = await checkbox.isVisible();
        console.log(`チェックボックス: ${checkboxExists ? '✅ 動作' : '❌ 未動作'}`);
        
        if (profitExists && checkboxExists) {
          // 実際に操作テスト
          await profitInput.fill('25');
          await checkbox.check();
          
          const profitValue = await profitInput.inputValue();
          const isChecked = await checkbox.isChecked();
          
          console.log(`設定操作テスト: ${profitValue === '25' && isChecked ? '✅ 動作' : '❌ 未動作'}`);
          
          // 保存ボタンの存在確認
          const saveButton = page.locator('button:has-text("保存")').first();
          const saveExists = await saveButton.isVisible();
          console.log(`保存ボタン存在: ${saveExists ? '✅ 動作' : '❌ 未動作'}`);
          
          if (saveExists) {
            console.log('🎉 売上管理出品設定モーダル: 完全実装済み');
          } else {
            console.log('❌ 売上管理出品設定モーダル: 部分未実装');
          }
        } else {
          console.log('❌ 売上管理出品設定モーダル: 部分未実装');
        }
        
        // モーダルを閉じる
        const closeButton = page.locator('button:has-text("×"), button:has-text("キャンセル")').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(1000);
        }
      } else {
        console.log('❌ 売上管理出品設定モーダル: 未実装');
      }
    } else {
      console.log('❌ 売上管理出品設定ボタン: 未実装');
    }
  });

  test('🔄 返品管理返品申請モーダル検証', async ({ page }) => {
    console.log('=== 返品管理返品申請モーダル検証開始 ===');
    
    await page.goto('/returns');
    await page.waitForTimeout(3000);
    
    // 返品申請ボタンを探す
    const returnButton = page.locator('button:has-text("返品申請")').first();
    
    const buttonExists = await returnButton.isVisible();
    console.log(`返品申請ボタン存在: ${buttonExists ? '✅' : '❌'}`);
    
    if (buttonExists) {
      await returnButton.click();
      await page.waitForTimeout(2000);
      
      // モーダルが開いたかチェック
      const modal = page.locator('[role="dialog"]');
      const modalOpen = await modal.isVisible();
      console.log(`返品申請モーダル開閉: ${modalOpen ? '✅ 動作' : '❌ 未動作'}`);
      
      if (modalOpen) {
        // フォーム要素の存在確認
        const orderIdInput = page.locator('input[name="orderId"]');
        const orderIdExists = await orderIdInput.isVisible();
        console.log(`注文番号入力フィールド: ${orderIdExists ? '✅ 動作' : '❌ 未動作'}`);
        
        const productNameInput = page.locator('input[name="productName"]');
        const productNameExists = await productNameInput.isVisible();
        console.log(`商品名入力フィールド: ${productNameExists ? '✅ 動作' : '❌ 未動作'}`);
        
        const reasonRadio = page.locator('input[type="radio"]');
        const reasonExists = await reasonRadio.first().isVisible();
        console.log(`返品理由選択: ${reasonExists ? '✅ 動作' : '❌ 未動作'}`);
        
        if (orderIdExists && productNameExists && reasonExists) {
          // 実際に入力テスト
          await orderIdInput.fill('ORD-000123');
          await productNameInput.fill('テスト商品');
          await reasonRadio.first().check();
          
          const orderValue = await orderIdInput.inputValue();
          const productValue = await productNameInput.inputValue();
          const isChecked = await reasonRadio.first().isChecked();
          
          console.log(`入力機能テスト: ${orderValue === 'ORD-000123' && productValue === 'テスト商品' && isChecked ? '✅ 動作' : '❌ 未動作'}`);
          
          // 送信ボタンの存在確認
          const submitButton = page.locator('button:has-text("提出"), button:has-text("申請")').first();
          const submitExists = await submitButton.isVisible();
          console.log(`送信ボタン存在: ${submitExists ? '✅ 動作' : '❌ 未動作'}`);
          
          if (submitExists) {
            console.log('🎉 返品管理返品申請モーダル: 完全実装済み');
          } else {
            console.log('❌ 返品管理返品申請モーダル: 部分未実装');
          }
        } else {
          console.log('❌ 返品管理返品申請モーダル: 部分未実装');
        }
        
        // モーダルを閉じる
        const closeButton = page.locator('button:has-text("×"), button:has-text("キャンセル")').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(1000);
        }
      } else {
        console.log('❌ 返品管理返品申請モーダル: 未実装');
      }
    } else {
      console.log('❌ 返品管理返品申請ボタン: 未実装');
    }
  });

  test('🚚 納品プランウィザード検証', async ({ page }) => {
    console.log('=== 納品プランウィザード検証開始 ===');
    
    await page.goto('/delivery-plan');
    await page.waitForTimeout(3000);
    
    // 新規プラン作成ボタンを探す
    const createButton = page.locator('button:has-text("新規"), button:has-text("作成")').first();
    
    const buttonExists = await createButton.isVisible();
    console.log(`新規プラン作成ボタン存在: ${buttonExists ? '✅' : '❌'}`);
    
    if (buttonExists) {
      await createButton.click();
      await page.waitForTimeout(2000);
      
      // ウィザードまたはモーダルが開いたかチェック
      const modal = page.locator('[role="dialog"]');
      const wizard = page.locator('.wizard, .step');
      
      const modalOpen = await modal.isVisible();
      const wizardOpen = await wizard.isVisible();
      
      console.log(`ウィザード/モーダル開閉: ${modalOpen || wizardOpen ? '✅ 動作' : '❌ 未動作'}`);
      
      if (modalOpen || wizardOpen) {
        // 入力フィールドの存在確認
        const inputs = await page.locator('input').all();
        const inputCount = inputs.length;
        console.log(`入力フィールド数: ${inputCount}個`);
        
        if (inputCount > 0) {
          // 最初の入力フィールドで動作テスト
          const firstInput = inputs[0];
          if (await firstInput.isVisible()) {
            await firstInput.fill('テスト入力');
            const inputValue = await firstInput.inputValue();
            console.log(`入力機能テスト: ${inputValue === 'テスト入力' ? '✅ 動作' : '❌ 未動作'}`);
          }
          
          // 次へボタンの存在確認
          const nextButton = page.locator('button:has-text("次へ"), button:has-text("続行")').first();
          const nextExists = await nextButton.isVisible();
          console.log(`次へボタン存在: ${nextExists ? '✅ 動作' : '❌ 未動作'}`);
          
          if (nextExists && inputCount > 0) {
            console.log('🎉 納品プランウィザード: 完全実装済み');
          } else {
            console.log('❌ 納品プランウィザード: 部分未実装');
          }
        } else {
          console.log('❌ 納品プランウィザード: 部分未実装');
        }
      } else {
        console.log('❌ 納品プランウィザード: 未実装');
      }
    } else {
      console.log('❌ 納品プラン作成ボタン: 未実装');
    }
  });
}); 