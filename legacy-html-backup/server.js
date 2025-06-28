const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>THE WORLD DOOR フルフィルメントシステム</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 50px; 
            background: #f5f5f5; 
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 40px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        h1 { color: #333; text-align: center; }
        .status { 
            background: #4CAF50; 
            color: white; 
            padding: 10px 20px; 
            border-radius: 4px; 
            text-align: center; 
            margin: 20px 0; 
        }
        .info { 
            background: #f0f0f0; 
            padding: 20px; 
            border-radius: 4px; 
            margin: 20px 0; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>THE WORLD DOOR フルフィルメントシステム</h1>
        <div class="status">✅ 正常に起動しました</div>
        <div class="info">
            <h3>システム情報</h3>
            <p><strong>起動時刻:</strong> ${new Date().toLocaleString('ja-JP')}</p>
            <p><strong>ポート:</strong> ${PORT}</p>
            <p><strong>ステータス:</strong> 稼働中</p>
        </div>
        <div class="info">
            <h3>機能</h3>
            <ul>
                <li>商品管理</li>
                <li>在庫管理</li>
                <li>注文処理</li>
                <li>配送管理</li>
            </ul>
        </div>
    </div>
</body>
</html>
    `);
  } else if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(\`🚀 THE WORLD DOOR フルフィルメントシステム起動\`);
  console.log(\`🌐 URL: http://localhost:\${PORT}\`);
  console.log(\`📊 API: http://localhost:\${PORT}/api/status\`);
  console.log(\`⏰ 起動時刻: \${new Date().toLocaleString('ja-JP')}\`);
});

process.on('SIGINT', () => {
  console.log('\\n👋 サーバーを停止します...');
  server.close(() => {
    console.log('✅ サーバーが停止しました');
    process.exit(0);
  });
});