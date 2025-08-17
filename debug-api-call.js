// APIコールをデバッグ
fetch('http://localhost:3002/api/orders/shipping?page=1&limit=20')
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    return response.text();
  })
  .then(text => {
    console.log('Raw response:', text);
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
      
      if (json.items) {
        console.log('Items count:', json.items.length);
        if (json.items.length > 0) {
          console.log('First item:', json.items[0]);
        }
      }
      
      if (json.pagination) {
        console.log('Pagination:', json.pagination);
      }
    } catch (e) {
      console.error('JSON parse error:', e);
    }
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });
