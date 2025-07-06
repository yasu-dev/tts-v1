const { chromium } = require('playwright');

async function runDetailedBugVerification() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🔍 Detailed Bug Verification Test Starting...\n');
  
  const detailedBugs = [];
  
  try {
    // 1. Verify Login Redirect Issue
    console.log('=== 1. Login Redirect Bug Verification ===');
    await page.goto('http://localhost:3001/login');
    await page.waitForTimeout(2000);
    
    // Click seller login to populate fields
    await page.click('[data-testid="seller-login"]');
    await page.waitForTimeout(1000);
    
    // Click main login button
    await page.click('[data-testid="login-button"]');
    await page.waitForTimeout(5000);
    
    const finalUrl = page.url();
    console.log(`Final URL after login: ${finalUrl}`);
    if (finalUrl.includes('/login')) {
      detailedBugs.push({
        severity: 'CRITICAL',
        page: 'Login',
        issue: 'Login button does not redirect to dashboard',
        details: 'User remains on login page after clicking login button',
        reproSteps: '1. Click seller login 2. Click main login button 3. Observe URL remains /login'
      });
    }
    
    // 2. Verify Dashboard Missing Buttons
    console.log('\n=== 2. Dashboard Missing Buttons Verification ===');
    // Force navigate to dashboard
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForTimeout(5000);
    
    // Look for all button text content
    const allButtons = await page.locator('button').all();
    const buttonTexts = [];
    for (const button of allButtons) {
      const text = await button.textContent();
      if (text && text.trim()) {
        buttonTexts.push(text.trim());
      }
    }
    
    console.log('Dashboard buttons found:', buttonTexts);
    
    // Check for specific missing buttons
    const hasDatePicker = buttonTexts.some(text => text.includes('期間') || text.includes('レポート期間'));
    const hasDownload = buttonTexts.some(text => text.includes('ダウンロード') || text.includes('レポート'));
    
    if (!hasDatePicker) {
      detailedBugs.push({
        severity: 'HIGH',
        page: 'Dashboard',
        issue: 'Date picker button missing',
        details: 'Report period selection button not found in header actions',
        reproSteps: '1. Navigate to dashboard 2. Look for date picker button in header'
      });
    }
    
    if (!hasDownload) {
      detailedBugs.push({
        severity: 'HIGH',
        page: 'Dashboard',
        issue: 'Download report button missing',
        details: 'Report download button not found in header actions',
        reproSteps: '1. Navigate to dashboard 2. Look for download button in header'
      });
    }
    
    // 3. Verify Inventory Modal Issues
    console.log('\n=== 3. Inventory Modal Form Fields Verification ===');
    await page.goto('http://localhost:3001/inventory');
    await page.waitForTimeout(5000);
    
    const addButton = await page.locator('button:has-text("新規商品登録")');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(3000);
      
      const modal = await page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        // Look for all input fields in modal
        const inputs = await modal.locator('input').all();
        const inputTypes = [];
        for (const input of inputs) {
          const placeholder = await input.getAttribute('placeholder');
          const name = await input.getAttribute('name');
          const type = await input.getAttribute('type');
          inputTypes.push({ placeholder, name, type });
        }
        
        console.log('Modal input fields found:', inputTypes);
        
        const hasNameField = inputTypes.some(input => 
          input.placeholder?.includes('商品名') || 
          input.name?.includes('name') || 
          input.placeholder?.includes('name')
        );
        
        if (!hasNameField) {
          detailedBugs.push({
            severity: 'HIGH',
            page: 'Inventory',
            issue: 'Product name field missing in add modal',
            details: 'No product name input field found in product registration modal',
            reproSteps: '1. Navigate to inventory 2. Click add product 3. Look for name input field'
          });
        }
        
        // Close modal
        await page.keyboard.press('Escape');
      }
    }
    
    // 4. Verify Staff Shipping Page Issues
    console.log('\n=== 4. Staff Shipping Packing Materials Verification ===');
    await page.goto('http://localhost:3001/staff/shipping');
    await page.waitForTimeout(5000);
    
    const shippingButtons = await page.locator('button').all();
    const shippingButtonTexts = [];
    for (const button of shippingButtons) {
      const text = await button.textContent();
      if (text && text.trim()) {
        shippingButtonTexts.push(text.trim());
      }
    }
    
    console.log('Staff shipping buttons found:', shippingButtonTexts);
    
    const hasPackingMaterials = shippingButtonTexts.some(text => 
      text.includes('梱包材') || 
      text.includes('梱包設定') || 
      text.includes('packing')
    );
    
    if (!hasPackingMaterials) {
      detailedBugs.push({
        severity: 'MEDIUM',
        page: 'Staff Shipping',
        issue: 'Packing materials button missing',
        details: 'No packing materials configuration button found',
        reproSteps: '1. Navigate to staff shipping 2. Look for packing materials button'
      });
    }
    
    // 5. Verify Profile Page Issues
    console.log('\n=== 5. Profile Page Missing Features Verification ===');
    await page.goto('http://localhost:3001/profile');
    await page.waitForTimeout(5000);
    
    const profileButtons = await page.locator('button').all();
    const profileButtonTexts = [];
    for (const button of profileButtons) {
      const text = await button.textContent();
      if (text && text.trim()) {
        profileButtonTexts.push(text.trim());
      }
    }
    
    const profileInputs = await page.locator('input').all();
    const profileInputTypes = [];
    for (const input of profileInputs) {
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      profileInputTypes.push({ type, placeholder });
    }
    
    console.log('Profile buttons found:', profileButtonTexts);
    console.log('Profile inputs found:', profileInputTypes);
    
    const hasPasswordChange = profileButtonTexts.some(text => text.includes('パスワード')) ||
                             profileInputTypes.some(input => input.type === 'password');
    
    const hasNotificationSettings = profileButtonTexts.some(text => text.includes('通知')) ||
                                   profileInputTypes.some(input => input.type === 'checkbox');
    
    if (!hasPasswordChange) {
      detailedBugs.push({
        severity: 'HIGH',
        page: 'Profile',
        issue: 'Password change functionality missing',
        details: 'No password change button or password input fields found',
        reproSteps: '1. Navigate to profile 2. Look for password change section'
      });
    }
    
    if (!hasNotificationSettings) {
      detailedBugs.push({
        severity: 'MEDIUM',
        page: 'Profile',
        issue: 'Notification settings missing',
        details: 'No notification configuration options found',
        reproSteps: '1. Navigate to profile 2. Look for notification settings section'
      });
    }
    
    // 6. Additional Console Error Check
    console.log('\n=== 6. Console Error Detection ===');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Reload dashboard to trigger any console errors
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForTimeout(3000);
    
    if (consoleErrors.length > 0) {
      detailedBugs.push({
        severity: 'MEDIUM',
        page: 'Various',
        issue: 'Console errors detected',
        details: consoleErrors.join('; '),
        reproSteps: '1. Open developer console 2. Navigate through pages 3. Observe console errors'
      });
    }
    
  } catch (error) {
    detailedBugs.push({
      severity: 'CRITICAL',
      page: 'Test Execution',
      issue: 'Test execution failed',
      details: error.message,
      reproSteps: 'Run automated test suite'
    });
  } finally {
    await browser.close();
  }
  
  return detailedBugs;
}

// Run the detailed verification
runDetailedBugVerification().then(bugs => {
  console.log('\n' + '='.repeat(80));
  console.log('🚨 DETAILED BUG VERIFICATION REPORT');
  console.log('='.repeat(80));
  
  if (bugs.length === 0) {
    console.log('✅ No detailed bugs found.');
  } else {
    console.log(`❌ ${bugs.length} detailed bugs confirmed:\n`);
    
    bugs.forEach((bug, index) => {
      console.log(`${index + 1}. [${bug.severity}] ${bug.page} - ${bug.issue}`);
      console.log(`   Details: ${bug.details}`);
      console.log(`   Reproduction: ${bug.reproSteps}`);
      console.log('');
    });
  }
  
  console.log('='.repeat(80));
}).catch(console.error);