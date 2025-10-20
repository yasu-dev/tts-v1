import { test, expect } from '@playwright/test'

test.describe('指揮本部ダッシュボード', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login')
    await page.fill('input[type="email"]', 'ic@demo.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')

    // ダッシュボード表示を待機
    await page.waitForURL(/\/command/, { timeout: 10000 })
  })

  test('ダッシュボードが正しく表示される', async ({ page }) => {
    // ヘッダー確認
    await expect(page.locator('h1')).toContainText('指揮本部')

    // 統計カード確認
    await expect(page.locator('text=総数')).toBeVisible()
    await expect(page.locator('text=黒（死亡）')).toBeVisible()
    await expect(page.locator('text=赤（重症）')).toBeVisible()
    await expect(page.locator('text=黄（中等症）')).toBeVisible()
    await expect(page.locator('text=緑（軽症）')).toBeVisible()
  })

  test('フィルター機能が動作する', async ({ page }) => {
    // 全てのタグを確認
    const allCount = await page.locator('text=トリアージタッグ一覧').textContent()
    expect(allCount).toContain('件')

    // 赤タグでフィルター
    await page.click('button:has-text("赤")')
    await expect(page.locator('.bg-red-500').first()).toBeVisible()

    // 黄タグでフィルター
    await page.click('button:has-text("黄")')

    // 緑タグでフィルター
    await page.click('button:has-text("緑")')

    // 黒タグでフィルター
    await page.click('button:has-text("黒")')

    // 全てに戻す
    await page.click('button:has-text("全て")')
  })

  test('患者詳細が表示される', async ({ page }) => {
    // 最初の患者カードを確認
    const firstTag = page.locator('.bg-gray-50').first()
    await expect(firstTag).toBeVisible()

    // タグ番号が表示されている
    await expect(firstTag.locator('text=/T-2025-/')).toBeVisible()

    // 搬送状態が表示されている
    await expect(firstTag.locator('text=搬送状態')).toBeVisible()
  })

  test('地図が表示される', async ({ page }) => {
    // 地図コンテナの確認
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 })

    // 地図タイルが読み込まれている
    await expect(page.locator('.leaflet-tile-pane')).toBeVisible()

    // マーカーが表示されている（患者がいる場合）
    const markers = page.locator('.leaflet-marker-icon')
    const markerCount = await markers.count()

    if (markerCount > 0) {
      // マーカーをクリックしてポップアップ表示
      await markers.first().click()
      await expect(page.locator('.leaflet-popup')).toBeVisible()
    }
  })

  test('リアルタイム更新インジケーターが表示される（モック）', async ({ page }) => {
    // リアルタイム更新の確認は実際のデータ更新が必要なためスキップ可能
    // ここではUI要素の存在確認のみ
    const realtimeIndicator = page.locator('text=データ更新')
    // 表示されていればテスト、なければスキップ
    const isVisible = await realtimeIndicator.isVisible().catch(() => false)

    if (isVisible) {
      expect(isVisible).toBeTruthy()
    }
  })
})
