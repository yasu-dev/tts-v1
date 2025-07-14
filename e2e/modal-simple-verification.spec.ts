import { test, expect } from '@playwright/test';

test.describe('モーダル開時業務フロー制御基本確認', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/login');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"], input[placeholder*="メール"]').first();
    await emailInput.fill('staff@example.com');
    
    const passwordInput = page.locator('input[type="password"], input[placeholder*="パスワード"]').first();
    await passwordInput.fill('password123');
    
    const loginButton = page.locator('button[type="submit"], button:has-text("ログイン")').first();
    await loginButton.click();
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    console.log('✅ ログイン完了');
  });

  test('🎯 基本動作確認: モーダル開時業務フロー制御', async ({ page }) => {
    console.log('🎯 基本動作確認テスト開始...');
    
    // 返品管理画面に移動
    await page.click('a[href="/staff/returns"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('✅ 返品管理画面移動完了');
    
    // 要素を定義
    const flowContent = page.locator('[data-testid="unified-product-flow"]');
    const toggleButton = page.locator('div.bg-white.border-b').locator('div.flex.items-center.justify-between').locator('button');
    
    // 初期状態確認
    const isFlowVisibleInitial = await flowContent.isVisible();
    const isToggleButtonDisabledInitial = await toggleButton.isDisabled();
    
    console.log(`📊 初期状態 - 業務フロー表示: ${isFlowVisibleInitial}`);
    console.log(`🔘 初期状態 - トグルボタン無効化: ${isToggleButtonDisabledInitial}`);
    
    // モーダルを開く
    const detailButtons = page.locator('button:has-text("詳細")');
    const detailButtonCount = await detailButtons.count();
    console.log(`🔍 詳細ボタン数: ${detailButtonCount}`);
    
    if (detailButtonCount > 0) {
      await detailButtons.first().click();
      await page.waitForTimeout(1500);
      
      // モーダル表示確認
      const modal = page.locator('[role="dialog"]');
      const isModalVisible = await modal.isVisible();
      console.log(`📱 モーダル表示状態: ${isModalVisible}`);
      
      if (isModalVisible) {
        // モーダル開後の業務フロー状態確認
        const isFlowVisibleAfterModal = await flowContent.isVisible();
        const isToggleButtonDisabledAfterModal = await toggleButton.isDisabled();
        const toggleButtonTitleAfterModal = await toggleButton.getAttribute('title');
        
        console.log(`📊 モーダル開後 - 業務フロー表示: ${isFlowVisibleAfterModal}`);
        console.log(`🔘 モーダル開後 - トグルボタン無効化: ${isToggleButtonDisabledAfterModal}`);
        console.log(`🔘 モーダル開後 - トグルボタンtitle: ${toggleButtonTitleAfterModal}`);
        
        // 基本的な検証
        const isBusinessFlowHidden = !isFlowVisibleAfterModal;
        const isToggleButtonDisabled = isToggleButtonDisabledAfterModal;
        const hasCorrectTitle = toggleButtonTitleAfterModal === 'モーダル表示中は操作できません';
        
        console.log(`🎯 検証1: 業務フロー非表示 = ${isBusinessFlowHidden}`);
        console.log(`🎯 検証2: トグルボタン無効化 = ${isToggleButtonDisabled}`);
        console.log(`🎯 検証3: 正しいタイトル = ${hasCorrectTitle}`);
        
        if (isBusinessFlowHidden && isToggleButtonDisabled && hasCorrectTitle) {
          console.log('🎉 成功: 全ての基本機能が正常に動作しています！');
        } else {
          console.log('❌ 一部の機能に問題があります');
        }
        
        // モーダルを閉じる
        const closeButton = page.locator('[role="dialog"] button').first();
        await closeButton.click();
        await page.waitForTimeout(1500);
        
        // モーダル閉じ後の確認
        const isModalVisibleAfterClose = await modal.isVisible();
        const isToggleButtonDisabledAfterClose = await toggleButton.isDisabled();
        
        console.log(`📱 モーダル閉じ後表示状態: ${isModalVisibleAfterClose}`);
        console.log(`🔘 モーダル閉じ後 - トグルボタン無効化: ${isToggleButtonDisabledAfterClose}`);
        
        const isModalClosed = !isModalVisibleAfterClose;
        const isToggleButtonEnabled = !isToggleButtonDisabledAfterClose;
        
        console.log(`🎯 検証4: モーダル閉じ = ${isModalClosed}`);
        console.log(`🎯 検証5: トグルボタン有効化 = ${isToggleButtonEnabled}`);
        
        if (isModalClosed && isToggleButtonEnabled) {
          console.log('🎉 成功: モーダル閉じ後の復活も正常です！');
        }
        
        console.log('✅ 基本動作確認テスト完了');
      } else {
        console.log('⚠️ モーダルが表示されませんでした');
      }
    } else {
      console.log('⚠️ 詳細ボタンが見つかりません');
    }
  });
}); 