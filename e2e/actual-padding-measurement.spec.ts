import { test, expect } from '@playwright/test'

test.describe('実際のパディング測定 - スタッフ返品管理', () => {
  test('スタッフ返品管理画面の正確なパディング測定', async ({ page }) => {
    // ログイン処理
    await page.goto('http://localhost:3002/login')
    await page.fill('input[type="email"]', 'staff@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('http://localhost:3002/dashboard')
    await page.waitForTimeout(2000)

    // 返品管理ページに移動
    await page.goto('http://localhost:3002/staff/returns')
    await page.waitForTimeout(3000)

    console.log('=== 返品管理画面パディング実測 ===')

    // 1. 再出品業務フロータブ測定
    await page.click('button:has-text("再出品業務フロー")')
    await page.waitForTimeout(2000)

    // メインコンテナを特定
    const relistingContainer = page.locator('.intelligence-card.global').first()
    
    if (await relistingContainer.isVisible()) {
      // 要素の実際の位置とサイズを取得
      const containerBox = await relistingContainer.boundingBox()
      const viewport = page.viewportSize()!
      
      // 内側のコンテンツdivも取得
      const contentDiv = relistingContainer.locator('div').first()
      const contentBox = await contentDiv.boundingBox()
      
      if (containerBox && contentBox) {
        const leftPadding = contentBox.x - containerBox.x
        const rightPadding = (containerBox.x + containerBox.width) - (contentBox.x + contentBox.width)
        
        console.log('📊 再出品業務フロー測定結果:')
        console.log(`  - コンテナ位置: x=${containerBox.x}, width=${containerBox.width}`)
        console.log(`  - コンテンツ位置: x=${contentBox.x}, width=${contentBox.width}`)
        console.log(`  - 左パディング: ${leftPadding}px`)
        console.log(`  - 右パディング: ${rightPadding}px`)
        console.log(`  - パディング差: ${Math.abs(leftPadding - rightPadding)}px`)
        
        // CSS computed styleも確認
        const computedPadding = await contentDiv.evaluate((el) => {
          const styles = window.getComputedStyle(el)
          return {
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            paddingTop: styles.paddingTop,
            paddingBottom: styles.paddingBottom
          }
        })
        console.log(`  - CSS計算値:`, computedPadding)
      }
    }

    // 2. 返品理由分析タブ測定
    await page.click('button:has-text("返品理由分析")')
    await page.waitForTimeout(2000)

    const analysisContainer = page.locator('.intelligence-card.global').first()
    
    if (await analysisContainer.isVisible()) {
      // 要素の実際の位置とサイズを取得
      const containerBox = await analysisContainer.boundingBox()
      
      // 内側のコンテンツdivも取得
      const contentDiv = analysisContainer.locator('div').first()
      const contentBox = await contentDiv.boundingBox()
      
      if (containerBox && contentBox) {
        const leftPadding = contentBox.x - containerBox.x
        const rightPadding = (containerBox.x + containerBox.width) - (contentBox.x + contentBox.width)
        
        console.log('📊 返品理由分析測定結果:')
        console.log(`  - コンテナ位置: x=${containerBox.x}, width=${containerBox.width}`)
        console.log(`  - コンテンツ位置: x=${contentBox.x}, width=${contentBox.width}`)
        console.log(`  - 左パディング: ${leftPadding}px`)
        console.log(`  - 右パディング: ${rightPadding}px`)
        console.log(`  - パディング差: ${Math.abs(leftPadding - rightPadding)}px`)
        
        // CSS computed styleも確認
        const computedPadding = await contentDiv.evaluate((el) => {
          const styles = window.getComputedStyle(el)
          return {
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            paddingTop: styles.paddingTop,
            paddingBottom: styles.paddingBottom
          }
        })
        console.log(`  - CSS計算値:`, computedPadding)
      }
    }

    // 3. 参考：他のスタッフ画面も測定
    console.log('=== 他のスタッフ画面との比較 ===')
    
    // スタッフタスク管理
    await page.goto('http://localhost:3002/staff/tasks')
    await page.waitForTimeout(2000)
    
    const tasksContainer = page.locator('.intelligence-card').first()
    if (await tasksContainer.isVisible()) {
      const containerBox = await tasksContainer.boundingBox()
      const contentDiv = tasksContainer.locator('div').first()
      const contentBox = await contentDiv.boundingBox()
      
      if (containerBox && contentBox) {
        const leftPadding = contentBox.x - containerBox.x
        const rightPadding = (containerBox.x + containerBox.width) - (contentBox.x + contentBox.width)
        
        console.log('📊 スタッフタスク管理（参考）:')
        console.log(`  - 左パディング: ${leftPadding}px`)
        console.log(`  - 右パディング: ${rightPadding}px`)
        console.log(`  - パディング差: ${Math.abs(leftPadding - rightPadding)}px`)
      }
    }

    // スタッフ在庫管理
    await page.goto('http://localhost:3002/staff/inventory')
    await page.waitForTimeout(2000)
    
    const inventoryContainer = page.locator('.intelligence-card').first()
    if (await inventoryContainer.isVisible()) {
      const containerBox = await inventoryContainer.boundingBox()
      const contentDiv = inventoryContainer.locator('div').first()
      const contentBox = await contentDiv.boundingBox()
      
      if (containerBox && contentBox) {
        const leftPadding = contentBox.x - containerBox.x
        const rightPadding = (containerBox.x + containerBox.width) - (contentBox.x + contentBox.width)
        
        console.log('📊 スタッフ在庫管理（参考）:')
        console.log(`  - 左パディング: ${leftPadding}px`)
        console.log(`  - 右パディング: ${rightPadding}px`)
        console.log(`  - パディング差: ${Math.abs(leftPadding - rightPadding)}px`)
      }
    }

    console.log('=== 測定完了 ===')
  })
}) 