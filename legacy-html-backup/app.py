#!/usr/bin/env python3
import http.server
import socketserver
import json
from datetime import datetime
from urllib.parse import urlparse, parse_qs

PORT = 3000

class MyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)
        
        if parsed_url.path == '/' or parsed_url.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            
            html_content = f"""<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>THE WORLD DOOR フルフィルメントシステム</title>
    <style>
        body {{ 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0; 
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }}
        .container {{ 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 40px 20px;
        }}
        .card {{
            background: white; 
            padding: 40px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 20px;
        }}
        h1 {{ 
            color: #333; 
            text-align: center; 
            margin-bottom: 10px;
            font-size: 2.5em;
        }}
        .subtitle {{
            text-align: center;
            color: #666;
            font-size: 1.2em;
            margin-bottom: 30px;
        }}
        .status {{ 
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white; 
            padding: 15px 25px; 
            border-radius: 8px; 
            text-align: center; 
            margin: 20px 0;
            font-size: 1.1em;
            font-weight: bold;
        }}
        .info {{ 
            background: #f8f9fa; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }}
        .info h3 {{
            margin-top: 0;
            color: #333;
        }}
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }}
        .stat-item {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .stat-number {{
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }}
        .stat-label {{
            color: #666;
            margin-top: 5px;
        }}
        ul {{
            list-style: none;
            padding: 0;
        }}
        li {{
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }}
        li:before {{
            content: "✓";
            color: #4CAF50;
            font-weight: bold;
            margin-right: 10px;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            color: white;
            opacity: 0.8;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>THE WORLD DOOR</h1>
            <div class="subtitle">フルフィルメントシステム</div>
            <div class="status">🚀 正常に起動しました</div>
            
            <div class="info">
                <h3>📊 システム情報</h3>
                <p><strong>起動時刻:</strong> {datetime.now().strftime('%Y年%m月%d日 %H:%M:%S')}</p>
                <p><strong>ポート:</strong> {PORT}</p>
                <p><strong>ステータス:</strong> 稼働中</p>
                <p><strong>バージョン:</strong> v1.0.0</p>
            </div>
        </div>
        
        <div class="card">
            <h3>📈 ダッシュボード統計</h3>
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number">125</div>
                    <div class="stat-label">総商品数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">23</div>
                    <div class="stat-label">アクティブ注文</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">8</div>
                    <div class="stat-label">本日の出荷</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">15</div>
                    <div class="stat-label">検品待ち</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="info">
                <h3>🔧 主な機能</h3>
                <ul>
                    <li>商品管理・在庫追跡</li>
                    <li>注文処理・ステータス管理</li>
                    <li>検品・品質管理</li>
                    <li>配送・物流管理</li>
                    <li>レポート・分析</li>
                    <li>ユーザー管理</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 THE WORLD DOOR - All Rights Reserved</p>
        </div>
    </div>
</body>
</html>"""
            self.wfile.write(html_content.encode('utf-8'))
            
        elif parsed_url.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            status_data = {{
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'port': PORT,
                'version': '1.0.0'
            }}
            self.wfile.write(json.dumps(status_data, ensure_ascii=False).encode('utf-8'))
            
        else:
            self.send_response(404)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'404 Not Found')

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
        print(f"🚀 THE WORLD DOOR フルフィルメントシステム起動")
        print(f"🌐 URL: http://localhost:{PORT}")
        print(f"📊 API: http://localhost:{PORT}/api/status") 
        print(f"⏰ 起動時刻: {datetime.now().strftime('%Y年%m月%d日 %H:%M:%S')}")
        print("Ctrl+C で停止")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\\n👋 サーバーを停止します...")
            httpd.shutdown()
            print("✅ サーバーが停止しました")