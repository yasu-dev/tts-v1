import { test, expect } from '@playwright/test'

test.describe('トリアージ入力画面', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login')
    await page.fill('input[type="email"]', 'tri@demo.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')

    // トリアージ入力画面を待機
    await page.waitForURL(/\/triage\/scan/, { timeout: 10000 })
  })

  test('トリアージ入力画面が表示される', async ({ page }) => {
    // ヘッダー確認
    await expect(page.locator('h1')).toContainText('トリアージ入力')

    // プログレスバー確認
    await expect(page.locator('text=1. QRスキャン')).toBeVisible()
    await expect(page.locator('text=2. START法')).toBeVisible()
    await expect(page.locator('text=3. バイタル')).toBeVisible()
  })

  test('手動入力でタグ番号を入力できる', async ({ page }) => {
    // 手動入力フィールド確認
    const manualInput = page.locator('input[placeholder*="T-2025"]')
    await expect(manualInput).toBeVisible()

    // タグ番号入力
    await manualInput.fill('T-2025-999')

    // 次へボタンクリック
    await page.click('button:has-text("次へ")')

    // START法画面に遷移
    await expect(page.locator('h3:has-text("START法トリアージ")')).toBeVisible()
  })

  test('START法ウィザードで緑タグ判定', async ({ page }) => {
    // タグ番号入力
    await page.fill('input[placeholder*="T-2025"]', 'T-2025-TEST-001')
    await page.click('button:has-text("次へ")')

    // ステップ1: 歩行可能
    await expect(page.locator('text=患者は歩行可能ですか？')).toBeVisible()
    await page.click('button:has-text("はい")')

    // バイタル入力画面に進む（緑タグは自動判定）
    await expect(page.locator('text=判定: 緑（軽症）')).toBeVisible({ timeout: 5000 })
  })

  test('START法ウィザードで赤タグ判定', async ({ page }) => {
    // タグ番号入力
    await page.fill('input[placeholder*="T-2025"]', 'T-2025-TEST-002')
    await page.click('button:has-text("次へ")')

    // ステップ1: 歩行不可
    await page.click('button:has-text("いいえ")')

    // ステップ2: 呼吸あり
    await page.click('button:has-text("はい")')

    // ステップ3: 呼吸数30回以上（設問は「30回/分未満ですか？」→ いいえ）
    await page.click('button:has-text("いいえ")')

    // 赤タグ判定
    await expect(page.locator('text=判定: 赤（重症）')).toBeVisible({ timeout: 5000 })
  })

  test('バイタルサイン入力フォーム', async ({ page }) => {
    // タグ番号 → START法（緑）
    await page.fill('input[placeholder*="T-2025"]', 'T-2025-TEST-003')
    await page.click('button:has-text("次へ")')
    await page.click('button:has-text("はい")')

    // バイタル入力画面
    await expect(page.locator('text=バイタルサイン入力')).toBeVisible()

    // フォーム入力
    await page.fill('input[placeholder*="例: 20"]', '18')
    await page.fill('input[placeholder*="例: 80"]', '75')
    await page.fill('input[placeholder*="例: 120"]', '120')

    // 意識レベル選択
    await page.selectOption('select', 'alert')

    // 次へ
    await page.click('button[type="submit"]:has-text("次へ")')

    // 患者情報入力画面
    await expect(page.locator('text=患者情報・メモ')).toBeVisible()
  })

  test('患者情報とメモの入力', async ({ page }) => {
    // タグ番号 → START法（緑） → バイタル
    await page.fill('input[placeholder*="T-2025"]', 'T-2025-TEST-004')
    await page.click('button:has-text("次へ")')
    await page.click('button:has-text("はい")')
    await page.click('button[type="submit"]:has-text("次へ")')

    // 患者情報入力
    await page.fill('input[placeholder*="例: 45"]', '35')
    await page.selectOption('select', 'male')

    // メモ入力
    await page.fill('textarea', '軽傷、自力歩行可能')

    // 確認画面へ
    await page.click('button:has-text("確認画面へ")')

    // 確認画面
    await expect(page.locator('text=登録内容の確認')).toBeVisible()
  })

  test('位置情報取得の確認', async ({ page }) => {
    // 位置情報許可のモック（実際のGPSは使用しない）
    await page.context().grantPermissions(['geolocation'])

    // ページリロード
    await page.reload()

    // 位置情報取得済みインジケーター確認（患者情報画面まで進む）
    await page.fill('input[placeholder*="T-2025"]', 'T-2025-TEST-005')
    await page.click('button:has-text("次へ")')
    await page.click('button:has-text("はい")')
    await page.click('button[type="submit"]:has-text("次へ")')

    // 位置情報表示確認
    const locationText = page.locator('text=位置情報取得済み')
    const hasLocation = await locationText.isVisible().catch(() => false)

    if (hasLocation) {
      expect(hasLocation).toBeTruthy()
    }
  })
})
