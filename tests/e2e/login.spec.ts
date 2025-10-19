import { test, expect } from '@playwright/test'

test.describe('ログイン機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('ログインページが正しく表示される', async ({ page }) => {
    // タイトル確認
    await expect(page.locator('h1')).toContainText('トリアージタッグシステム')

    // フォーム要素の確認
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // デモアカウント情報の表示確認
    await expect(page.locator('text=デモアカウント')).toBeVisible()
    await expect(page.locator('text=パスワード: password')).toBeVisible()
  })

  test('空のフォームで送信時にエラーが表示される', async ({ page }) => {
    await page.click('button[type="submit"]')

    // HTML5バリデーションエラーが表示される
    const emailInput = page.locator('input[type="email"]')
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBeTruthy()
  })

  test('指揮本部アカウントでログイン', async ({ page }) => {
    // フォーム入力
    await page.fill('input[type="email"]', 'ic@demo.com')
    await page.fill('input[type="password"]', 'password')

    // ログインボタンクリック
    await page.click('button[type="submit"]')

    // リダイレクト確認
    await expect(page).toHaveURL(/\/command/, { timeout: 10000 })

    // ダッシュボードの表示確認
    await expect(page.locator('h1')).toContainText('指揮本部')
  })

  test('トリアージ担当アカウントでログイン', async ({ page }) => {
    await page.fill('input[type="email"]', 'tri@demo.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')

    // トリアージ入力画面へリダイレクト
    await expect(page).toHaveURL(/\/triage\/scan/, { timeout: 10000 })
  })

  test('搬送担当アカウントでログイン', async ({ page }) => {
    await page.fill('input[type="email"]', 'trn@demo.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')

    // 搬送画面へリダイレクト
    await expect(page).toHaveURL(/\/transport/, { timeout: 10000 })
  })

  test('医療機関アカウントでログイン', async ({ page }) => {
    await page.fill('input[type="email"]', 'hsp@demo.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')

    // 病院画面へリダイレクト
    await expect(page).toHaveURL(/\/hospital/, { timeout: 10000 })
  })
})
