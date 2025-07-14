import { test, expect } from '@playwright/test'

test.describe('現在の画面状態確認', () => {
  test('ダッシュボード表示確認', async ({ page }) => {
    // ログインページにアクセス
    await page.goto('http://localhost:3002/login')
    
    // ログイン情報を入力
    await page.fill('input[type="email"]', 'seller@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // ダッシュボードに移動することを確認
    await page.waitForURL('http://localhost:3002/dashboard')
    await page.waitForTimeout(2000)
    
    // 収益管理タブをクリック
    await page.click('button:has-text("収益管理")')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'revenue-tab-ui.png', fullPage: true })
    console.log('収益管理タブUI確認 - スクリーンショット保存: revenue-tab-ui.png')
    
    // 運営効率タブをクリック
    await page.click('button:has-text("運営効率")')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'operations-tab-ui.png', fullPage: true })
    console.log('運営効率タブUI確認 - スクリーンショット保存: operations-tab-ui.png')
    
    // 返品理由分析タブをクリック
    await page.click('button:has-text("返品理由分析")')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'returns-tab-ui.png', fullPage: true })
    console.log('返品理由分析タブUI確認 - スクリーンショット保存: returns-tab-ui.png')
    
    console.log('全タブUI比較確認完了')
  })
}) 