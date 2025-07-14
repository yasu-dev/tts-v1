import { test, expect } from '@playwright/test'

test.describe('ログイン処理デバッグ', () => {
  test('ログイン画面の詳細確認', async ({ page }) => {
    // ログインページにアクセス
    await page.goto('http://localhost:3003/login')
    await page.waitForTimeout(2000)
    
    // ページタイトルを確認
    const title = await page.title()
    console.log('ページタイトル:', title)
    
    // 現在のURLを確認
    console.log('現在のURL:', page.url())
    
    // ログインフォームの要素を確認
    const emailInput = await page.locator('input[type="email"]').count()
    const passwordInput = await page.locator('input[type="password"]').count()
    const submitButton = await page.locator('button[type="submit"]').count()
    
    console.log('メールインプット数:', emailInput)
    console.log('パスワードインプット数:', passwordInput)
    console.log('送信ボタン数:', submitButton)
    
    // すべてのinput要素を確認
    const allInputs = await page.locator('input').allTextContents()
    console.log('全input要素:', allInputs)
    
    // すべてのbutton要素を確認
    const allButtons = await page.locator('button').allTextContents()
    console.log('全button要素:', allButtons)
    
    // フォームの存在を確認
    const forms = await page.locator('form').count()
    console.log('フォーム数:', forms)
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'login-debug.png', fullPage: true })
    
    console.log('ログイン画面デバッグ完了')
  })
}) 