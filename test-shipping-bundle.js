const fetch = require('node-fetch');

async function testShippingBundleDisplay() {
  console.log('🧪 Testing shipping bundle display...');
  
  try {
    const response = await fetch('http://localhost:3002/api/orders/shipping?page=1&limit=50&status=all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(`📦 Total items returned: ${data.items.length}`);
    console.log(`📊 Stats:`, data.stats);
    
    // Look for Sony FX3 and ABC products
    const sonyFX3 = data.items.find(item => item.productName.includes('Sony FX3'));
    const abc = data.items.find(item => item.productName.includes('ABC'));
    
    console.log('\n🎯 Target Products Found:');
    
    if (sonyFX3) {
      console.log('✅ Sony FX3 found:');
      console.log(`   - Name: ${sonyFX3.productName}`);
      console.log(`   - Status: ${sonyFX3.status}`);
      console.log(`   - Is Bundle: ${sonyFX3.isBundle}`);
      console.log(`   - Is Bundled: ${sonyFX3.isBundled}`);
      console.log(`   - Bundle ID: ${sonyFX3.bundleId}`);
      console.log(`   - Bundle Items: ${sonyFX3.bundleItemCount}`);
      if (sonyFX3.bundledItems && sonyFX3.bundledItems.length > 0) {
        console.log(`   - Bundled with: ${sonyFX3.bundledItems.map(bi => bi.product || bi.productName).join(', ')}`);
      }
    } else {
      console.log('❌ Sony FX3 not found');
    }
    
    if (abc) {
      console.log('✅ ABC found:');
      console.log(`   - Name: ${abc.productName}`);
      console.log(`   - Status: ${abc.status}`);
      console.log(`   - Is Bundle: ${abc.isBundle}`);
      console.log(`   - Is Bundled: ${abc.isBundled}`);
      console.log(`   - Bundle ID: ${abc.bundleId}`);
      console.log(`   - Bundle Items: ${abc.bundleItemCount}`);
      if (abc.bundledItems && abc.bundledItems.length > 0) {
        console.log(`   - Bundled with: ${abc.bundledItems.map(bi => bi.product || bi.productName).join(', ')}`);
      }
    } else {
      console.log('❌ ABC not found');
    }
    
    // Show first 5 items with bundle info
    console.log('\n📋 All items (first 5):');
    data.items.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.productName}`);
      console.log(`   - Bundle: ${item.isBundle ? 'Yes' : 'No'}, Bundled: ${item.isBundled ? 'Yes' : 'No'}`);
      if (item.bundleId) console.log(`   - Bundle ID: ${item.bundleId}`);
    });
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testShippingBundleDisplay();