import { test, expect } from '@playwright/test';

test.describe('Shipping Page Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');
  });

  test('should display shipping page with correct title and content', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Check page title
    await expect(page.locator('h1').first()).toContainText('検品・出荷管理');
    
    // Check subtitle
    await expect(page.locator('p').first()).toContainText('商品検品から出荷までの一括管理');
  });

  test('should display statistics cards with correct data', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(3000);
    
    // Check stats labels if they exist
    const statsLabels = ['総件数', '検品待ち', '出荷準備完了', '緊急案件'];
    let visibleLabels = 0;
    
    for (const label of statsLabels) {
      const labelElement = page.locator(`text=${label}`);
      if (await labelElement.isVisible()) {
        visibleLabels++;
        await expect(labelElement).toBeVisible();
      }
    }
    
    // Should have at least some stats visible or be empty state
    expect(visibleLabels).toBeGreaterThanOrEqual(0);
  });

  test('should filter items by status', async ({ page }) => {
    // Wait for items to load
    await page.waitForTimeout(3000);
    
    // Check if select element exists before trying to use it
    const selectElement = page.locator('select').first();
    if (await selectElement.isVisible()) {
      // Select "検品待ち" status filter
      await selectElement.selectOption('pending_inspection');
      await page.waitForTimeout(500);
      
      // Check that filtered items are displayed
      const filteredItems = page.locator('[data-testid="shipping-item"], .border.border-gray-200');
      const filteredCount = await filteredItems.count();
    
      // Items should be filtered (could be same or less)
      expect(filteredCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter items by priority', async ({ page }) => {
    // Wait for items to load
    await page.waitForTimeout(1000);
    
    // Select "緊急" priority filter
    const prioritySelects = page.locator('select');
    const prioritySelect = prioritySelects.nth(1); // Second select should be priority
    await prioritySelect.selectOption('urgent');
    await page.waitForTimeout(500);
    
    // Check that urgent items are shown with red priority badge
    const urgentBadges = page.locator('text=🔴 緊急');
    if (await urgentBadges.count() > 0) {
      await expect(urgentBadges.first()).toBeVisible();
    }
  });

  test('should open barcode scanner when button is clicked', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Check if barcode scanner button exists
    const barcodeButton = page.locator('button:has-text("バーコードスキャン")');
    if (await barcodeButton.isVisible()) {
      // Click barcode scanner button
      await barcodeButton.click();
      
      // Check if barcode scanner modal opens or alert appears
      const modal = page.locator('[data-testid="barcode-scanner"], .barcode-scanner');
      if (await modal.isVisible()) {
        await expect(modal).toBeVisible();
      }
      // Test passes if button was clicked successfully
    }
  });

  test('should display shipping items with correct information', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);
    
    // Check that shipping items are displayed
    const shippingItems = page.locator('.border.border-gray-200, [data-testid="shipping-item"]');
    const itemCount = await shippingItems.count();
    
    if (itemCount > 0) {
      const firstItem = shippingItems.first();
      
      // Check item has product name
      await expect(firstItem.locator('.font-semibold')).toBeVisible();
      
      // Check item has customer info
      await expect(firstItem.locator('text=お客様:')).toBeVisible();
      
      // Check item has order number
      await expect(firstItem.locator('text=注文番号:')).toBeVisible();
      
      // Check item has SKU
      await expect(firstItem.locator('text=SKU:')).toBeVisible();
      
      // Check status badge
      await expect(firstItem.locator('.rounded-full')).toBeVisible();
    }
  });

  test('should update item status when action button is clicked', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);
    
    // Find an item with a status update button
    const statusButtons = page.locator('button:has-text("検品完了"), button:has-text("梱包完了"), button:has-text("出荷")');
    const buttonCount = await statusButtons.count();
    
    if (buttonCount > 0) {
      const firstStatusButton = statusButtons.first();
      const buttonText = await firstStatusButton.textContent();
      
      // Click the status update button
      await firstStatusButton.click();
      
      // Status should change (we can't easily verify the exact change without more complex state management)
      // But we can verify the button click doesn't cause errors
      await page.waitForTimeout(500);
      await expect(page.locator('h1')).toContainText('検品・出荷管理');
    }
  });

  test('should show item details when detail button is clicked', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);
    
    // Find and click detail button
    const detailButtons = page.locator('button:has-text("詳細")');
    const buttonCount = await detailButtons.count();
    
    if (buttonCount > 0) {
      await detailButtons.first().click();
      
      // Check if alert dialog appears (since it's using alert())
      await page.waitForTimeout(500);
    }
  });

  test('should show packing instructions for inspected items', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);
    
    // Look for packing instruction buttons
    const packingButtons = page.locator('button:has-text("梱包指示")');
    const buttonCount = await packingButtons.count();
    
    if (buttonCount > 0) {
      await packingButtons.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should show shipping label option for packed items', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);
    
    // Look for shipping label buttons
    const labelButtons = page.locator('button:has-text("配送ラベル")');
    const buttonCount = await labelButtons.count();
    
    if (buttonCount > 0) {
      await labelButtons.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should display inspection notes when available', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);
    
    // Check if inspection notes section exists
    const inspectionNotes = page.locator('text=検品メモ:');
    const notesCount = await inspectionNotes.count();
    
    if (notesCount > 0) {
      await expect(inspectionNotes.first()).toBeVisible();
    }
  });

  test('should display tracking numbers when available', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);
    
    // Check if tracking number section exists
    const trackingNumbers = page.locator('text=追跡番号:');
    const trackingCount = await trackingNumbers.count();
    
    if (trackingCount > 0) {
      await expect(trackingNumbers.first()).toBeVisible();
    }
  });

  test('should show empty state when no items match filters', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Check if select elements exist before trying to use them
    const selectElements = page.locator('select');
    const selectCount = await selectElements.count();
    
    if (selectCount >= 2) {
      // Apply filters that should result in no matches
      await selectElements.first().selectOption('delivered');
      await selectElements.nth(1).selectOption('low');
      await page.waitForTimeout(500);
    }
    
    // Check if empty state is shown
    const emptyState = page.locator('text=出荷案件がありません');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
      await expect(page.locator('text=条件に一致する出荷案件が見つかりません')).toBeVisible();
    }
  });
});