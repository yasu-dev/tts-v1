import { test, expect } from '@playwright/test'

test.describe('スタッフ返品管理 - パディング修正確認', () => {
  test('返品管理画面のパディング確認', async ({ page }) => {
    // ログイン
    await page.goto('http://localhost:3002/login')
    await page.fill('input[type="email"]', 'staff@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('http://localhost:3002/dashboard')
    await page.waitForTimeout(2000)

    // 返品管理ページに移動
    await page.goto('http://localhost:3002/staff/returns')
    await page.waitForTimeout(3000)

    console.log('=== 返品管理画面のパディング確認 ===')

    // 再出品業務フロータブをクリック
    await page.click('button:has-text("再出品業務フロー")')
    await page.waitForTimeout(2000)

    console.log('✅ 再出品業務フロータブをクリックしました')

    // メインコンテンツを特定
    const mainCard = page.locator('.intelligence-card.global').first()
    const isMainCardVisible = await mainCard.isVisible()
    console.log(`メインカードの表示状態: ${isMainCardVisible}`)

    if (isMainCardVisible) {
      const paddingInfo = await mainCard.evaluate((el) => {
        const innerDiv = el.querySelector('div')
        if (innerDiv) {
          const styles = window.getComputedStyle(innerDiv)
          return {
            padding: styles.padding,
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            paddingTop: styles.paddingTop,
            paddingBottom: styles.paddingBottom
          }
        }
        return null
      })

      console.log('再出品業務フロー パディング情報:', paddingInfo)
    }

    // 返品理由分析タブをクリック
    await page.click('button:has-text("返品理由分析")')
    await page.waitForTimeout(2000)

    console.log('✅ 返品理由分析タブをクリックしました')

    const analysisCard = page.locator('.intelligence-card.global').first()
    const isAnalysisCardVisible = await analysisCard.isVisible()
    console.log(`分析カードの表示状態: ${isAnalysisCardVisible}`)

    if (isAnalysisCardVisible) {
      const analysisPaddingInfo = await analysisCard.evaluate((el) => {
        const innerDiv = el.querySelector('div')
        if (innerDiv) {
          const styles = window.getComputedStyle(innerDiv)
          return {
            padding: styles.padding,
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            paddingTop: styles.paddingTop,
            paddingBottom: styles.paddingBottom
          }
        }
        return null
      })

      console.log('返品理由分析 パディング情報:', analysisPaddingInfo)
    }

    // 統計カードのパディングも確認
    const statCards = page.locator('.intelligence-card.americas, .intelligence-card.europe, .intelligence-card.asia')
    const statCardCount = await statCards.count()
    console.log(`統計カード数: ${statCardCount}`)

    for (let i = 0; i < Math.min(statCardCount, 3); i++) {
      const card = statCards.nth(i)
      const isCardVisible = await card.isVisible()
      
      if (isCardVisible) {
        const cardPaddingInfo = await card.evaluate((el) => {
          const innerDiv = el.querySelector('div')
          if (innerDiv) {
            const styles = window.getComputedStyle(innerDiv)
            return {
              padding: styles.padding,
              paddingLeft: styles.paddingLeft,
              paddingRight: styles.paddingRight
            }
          }
          return null
        })

        console.log(`統計カード ${i + 1} パディング情報:`, cardPaddingInfo)
      }
    }

    console.log('=== パディング確認完了 ===')
  })
}) 