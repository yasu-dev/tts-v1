import { test, expect } from '@playwright/test'

test.describe('現在の画面状態確認', () => {
  test('カメラ・時計専門ダッシュボード表示確認', async ({ page }) => {
    // ログインページにアクセス
    await page.goto('http://localhost:3003/login')
    
    // ログイン情報を入力
    await page.fill('input[type="email"]', 'seller@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // ダッシュボードに移動することを確認
    await page.waitForURL('http://localhost:3003/dashboard')
    await page.waitForTimeout(2000)
    
    // カメラ・時計専門ダッシュボードのタイトルを確認
    const title = await page.locator('h1').textContent()
    console.log('ページタイトル:', title)
    
    // サブタイトルを確認
    const subtitle = await page.locator('p').first().textContent()
    console.log('サブタイトル:', subtitle)
    
    // タブの存在を確認
    const tabs = await page.locator('[role="tab"]').allTextContents()
    console.log('タブ一覧:', tabs)
    
    // 返品理由分析タブをクリック
    await page.click('button:has-text("返品理由分析")')
    await page.waitForTimeout(1000)
    
    // 返品サマリーカードを確認
    const summaryCards = await page.locator('[class*="bg-white"][class*="rounded-lg"]').count()
    console.log('サマリーカード数:', summaryCards)
    
    // 返品理由一覧を確認
    const reasonsList = await page.locator('h4').allTextContents()
    console.log('返品理由一覧:', reasonsList)
    
    // 改善アクションプランを確認
    const actionPlans = await page.locator('h3:has-text("改善アクションプラン")').count()
    console.log('改善アクションプラン存在:', actionPlans > 0)
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'current-screen-state.png', fullPage: true })
    
    console.log('画面状態確認完了 - スクリーンショット保存: current-screen-state.png')
  })
}) 