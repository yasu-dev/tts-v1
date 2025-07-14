import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    // 認証チェック
    const user = await AuthService.requireRole(request, ['seller']);

    const { planId } = params;

    if (!planId) {
      return NextResponse.json(
        { error: 'プランIDが必要です' },
        { status: 400 }
      );
    }

    // バーコードPDFのHTMLを生成
    const html = generateBarcodePDF(planId);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="delivery-plan-${planId}-barcodes.html"`
      }
    });

  } catch (error) {
    console.error('[ERROR] Barcode PDF generation:', error);
    return NextResponse.json(
      { error: 'PDFの生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

function generateBarcodePDF(planId: string): string {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>納品プラン バーコードラベル - ${planId}</title>
  <style>
    @media print {
      body { margin: 0; padding: 0; }
      .page-break { page-break-after: always; }
    }
    
    body {
      font-family: 'Noto Sans JP', sans-serif;
      margin: 0;
      padding: 20mm;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #0064D2;
      padding-bottom: 20px;
    }
    
    .company-logo {
      font-size: 28px;
      font-weight: bold;
      color: #0064D2;
      margin-bottom: 10px;
    }
    
    .plan-info {
      font-size: 16px;
      color: #666;
    }
    
    .barcode-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20mm;
      margin-top: 30px;
    }
    
    .barcode-label {
      border: 2px solid #0064D2;
      border-radius: 12px;
      padding: 15px;
      height: 120mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      background: #f8f9fa;
    }
    
    .label-header {
      text-align: center;
      margin-bottom: 15px;
    }
    
    .label-title {
      font-size: 14px;
      font-weight: bold;
      color: #0064D2;
      margin-bottom: 5px;
    }
    
    .product-info {
      text-align: center;
      margin-bottom: 15px;
    }
    
    .product-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    
    .sku {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .barcode-container {
      text-align: center;
      padding: 15px;
      background: white;
      border-radius: 8px;
      margin: 15px 0;
    }
    
    .barcode {
      font-family: 'Courier New', monospace;
      font-size: 28px;
      letter-spacing: 8px;
      font-weight: bold;
      background: repeating-linear-gradient(
        90deg,
        #000,
        #000 3px,
        #fff 3px,
        #fff 6px
      );
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      padding: 15px 0;
    }
    
    .barcode-text {
      font-size: 12px;
      margin-top: 8px;
      font-family: monospace;
      color: #333;
    }
    
    .footer {
      text-align: center;
      font-size: 10px;
      color: #999;
      margin-top: 15px;
    }
    
    .instructions {
      margin-top: 40px;
      padding: 20px;
      background: #f0f8ff;
      border-radius: 8px;
      border-left: 4px solid #0064D2;
    }
    
    .instructions h3 {
      color: #0064D2;
      margin-top: 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-logo">THE WORLD DOOR</div>
    <div class="plan-info">納品プラン: ${planId}</div>
    <div class="plan-info">生成日時: ${new Date().toLocaleDateString('ja-JP')}</div>
  </div>

  <div class="barcode-grid">
    <!-- サンプルバーコードラベル 1 -->
    <div class="barcode-label">
      <div class="label-header">
        <div class="label-title">商品ラベル #1</div>
      </div>
      
      <div class="product-info">
        <div class="product-name">Canon EOS R5 ボディ</div>
        <div class="sku">SKU: TWD-${planId}-001</div>
      </div>
      
      <div class="barcode-container">
        <div class="barcode">|||||||||||||||||||</div>
        <div class="barcode-text">*${planId}-001*</div>
      </div>
      
      <div class="footer">
        納品プラン: ${planId}<br>
        ${new Date().toLocaleDateString('ja-JP')}
      </div>
    </div>

    <!-- サンプルバーコードラベル 2 -->
    <div class="barcode-label">
      <div class="label-header">
        <div class="label-title">商品ラベル #2</div>
      </div>
      
      <div class="product-info">
        <div class="product-name">Nikon Z9 ボディ</div>
        <div class="sku">SKU: TWD-${planId}-002</div>
      </div>
      
      <div class="barcode-container">
        <div class="barcode">|||||||||||||||||||</div>
        <div class="barcode-text">*${planId}-002*</div>
      </div>
      
      <div class="footer">
        納品プラン: ${planId}<br>
        ${new Date().toLocaleDateString('ja-JP')}
      </div>
    </div>
  </div>

  <div class="instructions">
    <h3>ご利用方法</h3>
    <p>1. このページを印刷してください（A4用紙推奨）</p>
    <p>2. 各ラベルを商品に貼付してください</p>
    <p>3. バーコード部分が汚れないよう注意してください</p>
    <p>4. 納品時にバーコードスキャンで商品確認を行います</p>
  </div>

  <script>
    // ページ読み込み完了後に印刷ダイアログを表示
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 1000);
    };
  </script>
</body>
</html>
  `;
} 