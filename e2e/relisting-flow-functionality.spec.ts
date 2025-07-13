import { test, expect } from '@playwright/test'

test.describe('🔄 再出品業務フロー機能テスト', () => {
  
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login')
    await page.fill('input[type="email"]', 'staff@example.com')
    await page.fill('input[type="password"]', 'staff123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/staff/dashboard')
    
    // 返品処理ページに移動
    await page.goto('/staff/returns')
    await page.waitForLoadState('networkidle')
    
    // 再出品業務フロータブをクリック
    await page.click('text=再出品業務フロー')
    await page.waitForTimeout(1000)
  })

  test('🎯 ステップ遷移と白画面問題修正確認', async ({ page }) => {
    console.log('📋 ステップ遷移テスト開始...')
    
    // 初期状態確認
    await expect(page.locator('text=検品結果確認')).toBeVisible()
    console.log('✅ 初期画面表示確認')
    
    // 「次へ」ボタンをクリックしてステップ2へ
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(500)
    
    // 白画面になっていないことを確認
    await expect(page.locator('text=写真撮影')).toBeVisible()
    console.log('✅ ステップ2（写真撮影）表示確認 - 白画面問題修正済み')
    
    // さらに次へ
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(500)
    
    await expect(page.locator('text=商品情報更新')).toBeVisible()
    console.log('✅ ステップ3（商品情報更新）表示確認')
    
    // さらに次へ
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(500)
    
    await expect(page.locator('text=価格設定')).toBeVisible()
    console.log('✅ ステップ4（価格設定）表示確認')
    
    // 最終ステップへ
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(500)
    
    await expect(page.locator('text=再出品確認')).toBeVisible()
    console.log('✅ ステップ5（再出品確認）表示確認')
    
    // 最終ステップでは「再出品する」ボタンが表示される
    await expect(page.locator('button:has-text("再出品する")')).toBeVisible()
    console.log('✅ 最終ステップで「再出品する」ボタン表示確認')
  })

  test('🎨 アイコンステータス変更機能確認', async ({ page }) => {
    console.log('🎨 アイコンステータス変更テスト開始...')
    
    // ステップインジケーターの初期状態確認
    const stepIndicators = page.locator('.flex.items-center.justify-between .flex.flex-col.items-center')
    await expect(stepIndicators).toHaveCount(5)
    
    // 初期状態: 1番目は完了、2番目は進行中、残りは待機
    const firstStep = stepIndicators.nth(0).locator('.w-12.h-12')
    const secondStep = stepIndicators.nth(1).locator('.w-12.h-12')
    const thirdStep = stepIndicators.nth(2).locator('.w-12.h-12')
    
    // 初期アイコン状態確認
    await expect(firstStep).toHaveClass(/bg-nexus-primary/)
    await expect(secondStep).toHaveClass(/bg-nexus-primary/)
    await expect(thirdStep).toHaveClass(/bg-nexus-bg-secondary/)
    console.log('✅ 初期アイコン状態確認完了')
    
    // 次へボタンをクリック
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(1000)
    
    // ステップ進行後のアイコン状態確認
    await expect(firstStep).toHaveClass(/bg-nexus-primary/)
    await expect(secondStep).toHaveClass(/bg-nexus-primary/)
    await expect(thirdStep).toHaveClass(/bg-nexus-primary/)
    console.log('✅ ステップ進行後のアイコン状態確認')
    
    // 進行中ステップのアニメーション確認
    const currentStep = stepIndicators.nth(2).locator('.w-12.h-12')
    await expect(currentStep).toHaveClass(/animate-pulse/)
    console.log('✅ 進行中ステップのアニメーション確認')
  })

  test('🔄 戻るボタン機能確認', async ({ page }) => {
    console.log('🔄 戻るボタン機能テスト開始...')
    
    // 初期状態で戻るボタンは無効
    const backButton = page.locator('button:has-text("戻る")')
    await expect(backButton).toBeDisabled()
    console.log('✅ 初期状態で戻るボタン無効確認')
    
    // 次へ進む
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(500)
    
    // 戻るボタンが有効になる
    await expect(backButton).toBeEnabled()
    console.log('✅ ステップ進行後に戻るボタン有効確認')
    
    // 戻るボタンをクリック
    await backButton.click()
    await page.waitForTimeout(500)
    
    // 前のステップに戻ることを確認
    await expect(page.locator('text=検品結果確認')).toBeVisible()
    console.log('✅ 戻るボタン機能確認完了')
  })

  test('🚀 統一アイコンシステム確認', async ({ page }) => {
    console.log('🚀 統一アイコンシステム確認開始...')
    
    // 各ステップのアイコンがSVGとして表示されることを確認
    const stepIcons = page.locator('.w-12.h-12 svg')
    await expect(stepIcons).toHaveCount(5)
    console.log('✅ 全ステップにSVGアイコン表示確認')
    
    // 検品結果確認アイコン（緑の円＋チェック）確認
    const inspectionIcon = stepIcons.nth(0)
    await expect(inspectionIcon).toHaveAttribute('viewBox', '0 0 24 24')
    console.log('✅ 検品結果確認アイコン確認')
    
    // カメラアイコン確認
    const cameraIcon = stepIcons.nth(1)
    await expect(cameraIcon).toHaveAttribute('viewBox', '0 0 24 24')
    console.log('✅ カメラアイコン確認')
    
    // 在庫管理アイコン確認
    const inventoryIcon = stepIcons.nth(2)
    await expect(inventoryIcon).toHaveAttribute('viewBox', '0 0 24 24')
    console.log('✅ 在庫管理アイコン確認')
    
    // 価格設定アイコン確認
    const billingIcon = stepIcons.nth(3)
    await expect(billingIcon).toHaveAttribute('viewBox', '0 0 24 24')
    console.log('✅ 価格設定アイコン確認')
    
    // 出品アイコン確認
    const listingIcon = stepIcons.nth(4)
    await expect(listingIcon).toHaveAttribute('viewBox', '0 0 24 24')
    console.log('✅ 出品アイコン確認')
  })

  test('💫 アニメーション効果確認', async ({ page }) => {
    console.log('💫 アニメーション効果確認開始...')
    
    // transition-all duration-300クラスが適用されていることを確認
    const stepContainer = page.locator('.w-12.h-12.rounded-full').first()
    await expect(stepContainer).toHaveClass(/transition-all/)
    await expect(stepContainer).toHaveClass(/duration-300/)
    console.log('✅ ステップコンテナのトランジション効果確認')
    
    // 次へボタンクリック時のアニメーション
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(1500) // アニメーション完了待ち
    
    // 進行中ステップのパルス効果確認
    const currentStepIcon = page.locator('.animate-pulse').first()
    await expect(currentStepIcon).toBeVisible()
    console.log('✅ 進行中ステップのパルス効果確認')
  })
}) 