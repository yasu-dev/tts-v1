import { test, expect } from '@playwright/test';

test.describe('画像表示確認テスト', () => {
  test('セラー在庫管理ページで商品画像が表示されているか確認', async ({ page }) => {
    // セラーとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 納品管理ページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/delivery$/, { timeout: 15000 });
    
    // 在庫管理ページに移動
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    // ページのスクリーンショットを撮影
    await page.screenshot({ 
      path: 'test-results/seller-inventory-page.png',
      fullPage: true 
    });
    
    // 画像要素が存在するか確認
    const images = await page.locator('img').count();
    console.log(`画像要素の数: ${images}`);
    
    // 商品画像（imgタグ）が存在することを確認
    const productImages = await page.locator('img[src*="/api/images/"], img[src^="data:image/"]').count();
    console.log(`商品画像の数: ${productImages}`);
    
    // 画像が少なくとも1つは表示されていることを期待
    expect(productImages).toBeGreaterThan(0);
  });

  test('スタッフ在庫管理ページで商品画像が表示されているか確認', async ({ page }) => {
    // スタッフとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // スタッフ在庫管理ページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/staff\/inventory$/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // ページのスクリーンショットを撮影
    await page.screenshot({ 
      path: 'test-results/staff-inventory-page.png',
      fullPage: true 
    });
    
    // 画像要素が存在するか確認
    const images = await page.locator('img').count();
    console.log(`画像要素の数: ${images}`);
    
    // 商品画像（imgタグ）が存在することを確認
    const productImages = await page.locator('img[src*="/api/images/"], img[src^="data:image/"]').count();
    console.log(`商品画像の数: ${productImages}`);
    
    // 画像が少なくとも1つは表示されていることを期待
    expect(productImages).toBeGreaterThan(0);
  });

  test('商品詳細モーダルで画像が表示されているか確認', async ({ page }) => {
    // スタッフとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // スタッフ在庫管理ページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/staff\/inventory$/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // 商品行をクリックして詳細モーダルを開く
    const productRows = await page.locator('tr').count();
    console.log(`商品行の数: ${productRows}`);
    
    if (productRows > 1) {
      // 最初の商品行をクリック（ヘッダー行を除く）
      await page.locator('tr').nth(1).click();
      
      // モーダルが開くまで待機
      await page.waitForSelector('[role="dialog"], .modal', { timeout: 10000 });
      
      // モーダルのスクリーンショットを撮影
      await page.screenshot({ 
        path: 'test-results/product-modal.png',
        fullPage: true 
      });
      
      // モーダル内の画像要素を確認
      const modalImages = await page.locator('[role="dialog"] img, .modal img').count();
      console.log(`モーダル内の画像数: ${modalImages}`);
      
      // 商品画像が表示されていることを確認
      const modalProductImages = await page.locator('[role="dialog"] img[src*="/api/images/"], [role="dialog"] img[src^="data:image/"], .modal img[src*="/api/images/"], .modal img[src^="data:image/"]').count();
      console.log(`モーダル内の商品画像数: ${modalProductImages}`);
    }
  });

  test('画像の読み込み状態を詳細に確認', async ({ page }) => {
    // スタッフとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/staff\/inventory$/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // 全ての画像要素を取得して詳細を確認
    const allImages = await page.locator('img').all();
    console.log(`\n=== 画像要素詳細確認 ===`);
    
    for (let i = 0; i < allImages.length; i++) {
      const img = allImages[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      const naturalHeight = await img.evaluate((el: HTMLImageElement) => el.naturalHeight);
      const complete = await img.evaluate((el: HTMLImageElement) => el.complete);
      
      console.log(`画像 ${i + 1}:`);
      console.log(`  src: ${src}`);
      console.log(`  alt: ${alt}`);
      console.log(`  naturalWidth: ${naturalWidth}`);
      console.log(`  naturalHeight: ${naturalHeight}`);
      console.log(`  complete: ${complete}`);
      console.log(`  ---`);
    }
    
    // 破損した画像（naturalWidth = 0）をカウント
    const brokenImages = await page.locator('img').evaluateAll((images: HTMLImageElement[]) => {
      return images.filter(img => img.complete && img.naturalWidth === 0).length;
    });
    
    console.log(`破損した画像の数: ${brokenImages}`);
    
    // 正常に読み込まれた画像をカウント
    const loadedImages = await page.locator('img').evaluateAll((images: HTMLImageElement[]) => {
      return images.filter(img => img.complete && img.naturalWidth > 0).length;
    });
    
    console.log(`正常に読み込まれた画像の数: ${loadedImages}`);
  });
});
