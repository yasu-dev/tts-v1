import { test, expect } from '@playwright/test'

test.describe('スタッフ返品管理 - 実際のパディング測定', () => {
  test('返品管理画面のパディング実測', async ({ page }) => {
    // ログイン処理
    await page.goto('http://localhost:3002/login')
    await page.fill('input[type="email"]', 'staff@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // スタッフの場合は /staff/dashboard にリダイレクトされる
    await page.waitForURL('http://localhost:3002/staff/dashboard')
    await page.waitForTimeout(2000)

    console.log('=== スタッフ返品管理画面パディング実測開始 ===')

    // 返品管理ページに移動
    await page.goto('http://localhost:3002/staff/returns')
    await page.waitForTimeout(3000)

    // 基本画面の確認
    const pageTitle = await page.locator('h1').textContent()
    console.log(`現在のページタイトル: ${pageTitle}`)

    // 1. 再出品業務フロータブ測定
    console.log('\n--- 再出品業務フロータブ測定 ---')
    await page.click('button:has-text("再出品業務フロー")')
    await page.waitForTimeout(2000)

    const relistingCard = page.locator('.intelligence-card.global').first()
    const isRelistingVisible = await relistingCard.isVisible()
    console.log(`再出品業務フローカード表示: ${isRelistingVisible}`)

    if (isRelistingVisible) {
      // コンテナとコンテンツの境界ボックスを取得
      const containerBox = await relistingCard.boundingBox()
      const innerDiv = relistingCard.locator('div').first()
      const contentBox = await innerDiv.boundingBox()
      
      if (containerBox && contentBox) {
        const actualLeftPadding = contentBox.x - containerBox.x
        const actualRightPadding = (containerBox.x + containerBox.width) - (contentBox.x + contentBox.width)
        
        console.log(`再出品業務フロー実測結果:`)
        console.log(`  コンテナ: x=${containerBox.x}, width=${containerBox.width}`)
        console.log(`  コンテンツ: x=${contentBox.x}, width=${contentBox.width}`)
        console.log(`  左パディング: ${actualLeftPadding}px`)
        console.log(`  右パディング: ${actualRightPadding}px`)
        console.log(`  左右パディング差: ${Math.abs(actualLeftPadding - actualRightPadding)}px`)
        
        // CSS値も確認
        const cssValues = await innerDiv.evaluate((el) => {
          const styles = window.getComputedStyle(el)
          return {
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            classNames: el.className
          }
        })
        console.log(`  CSS値: ${cssValues.paddingLeft} / ${cssValues.paddingRight}`)
        console.log(`  クラス: ${cssValues.classNames}`)
      }
    }

    // 2. 返品理由分析タブ測定
    console.log('\n--- 返品理由分析タブ測定 ---')
    await page.click('button:has-text("返品理由分析")')
    await page.waitForTimeout(2000)

    const analysisCard = page.locator('.intelligence-card.global').first()
    const isAnalysisVisible = await analysisCard.isVisible()
    console.log(`返品理由分析カード表示: ${isAnalysisVisible}`)

    if (isAnalysisVisible) {
      // コンテナとコンテンツの境界ボックスを取得
      const containerBox = await analysisCard.boundingBox()
      const innerDiv = analysisCard.locator('div').first()
      const contentBox = await innerDiv.boundingBox()
      
      if (containerBox && contentBox) {
        const actualLeftPadding = contentBox.x - containerBox.x
        const actualRightPadding = (containerBox.x + containerBox.width) - (contentBox.x + contentBox.width)
        
        console.log(`返品理由分析実測結果:`)
        console.log(`  コンテナ: x=${containerBox.x}, width=${containerBox.width}`)
        console.log(`  コンテンツ: x=${contentBox.x}, width=${contentBox.width}`)
        console.log(`  左パディング: ${actualLeftPadding}px`)
        console.log(`  右パディング: ${actualRightPadding}px`)
        console.log(`  左右パディング差: ${Math.abs(actualLeftPadding - actualRightPadding)}px`)
        
        // CSS値も確認
        const cssValues = await innerDiv.evaluate((el) => {
          const styles = window.getComputedStyle(el)
          return {
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            classNames: el.className
          }
        })
        console.log(`  CSS値: ${cssValues.paddingLeft} / ${cssValues.paddingRight}`)
        console.log(`  クラス: ${cssValues.classNames}`)
      }
    }

    // 3. 比較用：スタッフタスク管理画面
    console.log('\n--- 比較：スタッフタスク管理画面 ---')
    await page.goto('http://localhost:3002/staff/tasks')
    await page.waitForTimeout(2000)
    
    const tasksCard = page.locator('.intelligence-card').first()
    const isTasksVisible = await tasksCard.isVisible()
    console.log(`タスク管理カード表示: ${isTasksVisible}`)

    if (isTasksVisible) {
      const containerBox = await tasksCard.boundingBox()
      const innerDiv = tasksCard.locator('div').first()
      const contentBox = await innerDiv.boundingBox()
      
      if (containerBox && contentBox) {
        const actualLeftPadding = contentBox.x - containerBox.x
        const actualRightPadding = (containerBox.x + containerBox.width) - (contentBox.x + contentBox.width)
        
        console.log(`タスク管理実測結果（参考）:`)
        console.log(`  左パディング: ${actualLeftPadding}px`)
        console.log(`  右パディング: ${actualRightPadding}px`)
        console.log(`  左右パディング差: ${Math.abs(actualLeftPadding - actualRightPadding)}px`)
      }
    }

    // 4. 比較用：スタッフ在庫管理画面
    console.log('\n--- 比較：スタッフ在庫管理画面 ---')
    await page.goto('http://localhost:3002/staff/inventory')
    await page.waitForTimeout(2000)
    
    const inventoryCard = page.locator('.intelligence-card').first()
    const isInventoryVisible = await inventoryCard.isVisible()
    console.log(`在庫管理カード表示: ${isInventoryVisible}`)

    if (isInventoryVisible) {
      const containerBox = await inventoryCard.boundingBox()
      const innerDiv = inventoryCard.locator('div').first()
      const contentBox = await innerDiv.boundingBox()
      
      if (containerBox && contentBox) {
        const actualLeftPadding = contentBox.x - containerBox.x
        const actualRightPadding = (containerBox.x + containerBox.width) - (contentBox.x + contentBox.width)
        
        console.log(`在庫管理実測結果（参考）:`)
        console.log(`  左パディング: ${actualLeftPadding}px`)
        console.log(`  右パディング: ${actualRightPadding}px`)
        console.log(`  左右パディング差: ${Math.abs(actualLeftPadding - actualRightPadding)}px`)
      }
    }

    console.log('\n=== パディング実測完了 ===')
  })
}) 