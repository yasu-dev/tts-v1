import { test, expect } from '@playwright/test'

test('スタッフ返品管理 - パディング確認', async ({ page }) => {
  // ログイン
  await page.goto('http://localhost:3002/login')
  await page.fill('input[type="email"]', 'staff@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await page.waitForURL('http://localhost:3002/staff/dashboard')
  
  // 返品管理ページに移動
  await page.goto('http://localhost:3002/staff/returns')
  await page.waitForTimeout(2000)

  console.log('🔍 スタッフ返品管理画面のパディング確認')

  // 再出品業務フロー
  await page.click('button:has-text("再出品業務フロー")')
  await page.waitForTimeout(1000)
  
  const relistingDiv = page.locator('.intelligence-card.global div').first()
  const relistingClass = await relistingDiv.getAttribute('class')
  console.log(`再出品業務フロー クラス: ${relistingClass}`)
  
  // 返品理由分析
  await page.click('button:has-text("返品理由分析")')
  await page.waitForTimeout(1000)
  
  const analysisDiv = page.locator('.intelligence-card.global div').first()
  const analysisClass = await analysisDiv.getAttribute('class')
  console.log(`返品理由分析 クラス: ${analysisClass}`)
  
  // 実際のCSS値も確認
  const relistingCSS = await relistingDiv.evaluate((el) => {
    const styles = window.getComputedStyle(el)
    return {
      paddingLeft: styles.paddingLeft,
      paddingRight: styles.paddingRight
    }
  })
  console.log(`再出品業務フロー CSS: ${relistingCSS.paddingLeft} / ${relistingCSS.paddingRight}`)
  
  await page.click('button:has-text("再出品業務フロー")')
  await page.waitForTimeout(1000)
  
  const analysisCSS = await analysisDiv.evaluate((el) => {
    const styles = window.getComputedStyle(el)
    return {
      paddingLeft: styles.paddingLeft,
      paddingRight: styles.paddingRight
    }
  })
  console.log(`返品理由分析 CSS: ${analysisCSS.paddingLeft} / ${analysisCSS.paddingRight}`)
}) 