import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

interface MonthlyReportData {
  period: {
    year: number;
    month: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalRevenue: number;
    totalItems: number;
    averagePrice: number;
    revenueGrowth: number;
  };
  categories: {
    name: string;
    revenue: number;
    items: number;
    percentage: number;
  }[];
  inventory: {
    turnoverRate: number;
    averageDays: number;
    slowMovingCount: number;
    totalValue: number;
  };
  operations: {
    newListings: number;
    completedSales: number;
    returns: number;
    returnRate: number;
  };
  topProducts: {
    id: string;
    name: string;
    revenue: number;
    quantity: number;
  }[];
}

const generateMonthlyReportHTML = (data: MonthlyReportData) => {
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>月次レポート - ${data.period.year}年${monthNames[data.period.month - 1]}</title>
  <style>
    body {
      font-family: 'Noto Sans JP', Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f8fafe;
      color: #1a1a1a;
      line-height: 1.6;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 100, 210, 0.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #0064D2 0%, #0078FF 50%, #00A0FF 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
    }
    
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    
    .content {
      padding: 40px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section h2 {
      color: #0064D2;
      font-size: 24px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .metric-card {
      background: #f8fafe;
      border: 2px solid rgba(0, 100, 210, 0.15);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #0064D2;
      margin-bottom: 5px;
    }
    
    .metric-label {
      font-size: 14px;
      color: #666;
    }
    
    .metric-change {
      font-size: 12px;
      margin-top: 5px;
    }
    
    .metric-change.positive {
      color: #10b981;
    }
    
    .metric-change.negative {
      color: #ef4444;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    .table th,
    .table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .table th {
      background: #f8fafe;
      font-weight: bold;
      color: #0064D2;
    }
    
    .table tr:hover {
      background: #f8fafe;
    }
    
    .chart-placeholder {
      background: #f8fafe;
      border: 2px dashed #0064D2;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      color: #666;
      margin: 20px 0;
    }
    
    .alert {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    
    .alert-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 8px;
    }
    
    .footer {
      background: #f8fafe;
      padding: 30px 40px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    
    @media print {
      body {
        background: white;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>THE WORLD DOOR</h1>
      <p>月次パフォーマンスレポート</p>
      <p>${data.period.year}年${monthNames[data.period.month - 1]} (${data.period.startDate} ～ ${data.period.endDate})</p>
    </div>
    
    <div class="content">
      <!-- 業績サマリー -->
      <div class="section">
                  <h2>業績サマリー</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">¥${data.summary.totalRevenue.toLocaleString()}</div>
            <div class="metric-label">総売上高</div>
            <div class="metric-change ${data.summary.revenueGrowth >= 0 ? 'positive' : 'negative'}">
              ${data.summary.revenueGrowth >= 0 ? '+' : ''}${data.summary.revenueGrowth.toFixed(1)}% (前月比)
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.summary.totalItems}</div>
            <div class="metric-label">販売件数</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">¥${data.summary.averagePrice.toLocaleString()}</div>
            <div class="metric-label">平均販売価格</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.inventory.turnoverRate.toFixed(1)}</div>
            <div class="metric-label">在庫回転率</div>
          </div>
        </div>
      </div>
      
      <!-- カテゴリー分析 -->
      <div class="section">
        <h2>📈 カテゴリー別分析</h2>
        <table class="table">
          <thead>
            <tr>
              <th>カテゴリー</th>
              <th>売上高</th>
              <th>販売数</th>
              <th>構成比</th>
            </tr>
          </thead>
          <tbody>
            ${data.categories.map(category => `
              <tr>
                <td>${category.name}</td>
                <td>¥${category.revenue.toLocaleString()}</td>
                <td>${category.items}件</td>
                <td>${category.percentage.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <!-- 在庫分析 -->
      <div class="section">
                  <h2>在庫分析</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">${data.inventory.averageDays}</div>
            <div class="metric-label">平均在庫日数</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.inventory.slowMovingCount}</div>
            <div class="metric-label">滞留在庫数</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">¥${data.inventory.totalValue.toLocaleString()}</div>
            <div class="metric-label">総在庫価値</div>
          </div>
        </div>
        
        ${data.inventory.slowMovingCount > 0 ? `
        <div class="alert">
          <div class="alert-title">⚠️ 滞留在庫アラート</div>
          <p>90日以上在庫されている商品が${data.inventory.slowMovingCount}件あります。価格見直しやプロモーション実施を検討してください。</p>
        </div>
        ` : ''}
      </div>
      
      <!-- 運営分析 -->
      <div class="section">
        <h2>⚙️ 運営分析</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">${data.operations.newListings}</div>
            <div class="metric-label">新規出品数</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.operations.completedSales}</div>
            <div class="metric-label">成約件数</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.operations.returns}</div>
            <div class="metric-label">返品件数</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.operations.returnRate.toFixed(1)}%</div>
            <div class="metric-label">返品率</div>
          </div>
        </div>
      </div>
      
      <!-- トップ商品 -->
      <div class="section">
        <h2>🏆 売上トップ商品</h2>
        <table class="table">
          <thead>
            <tr>
              <th>商品名</th>
              <th>売上高</th>
              <th>販売数</th>
            </tr>
          </thead>
          <tbody>
            ${data.topProducts.map(product => `
              <tr>
                <td>${product.name}</td>
                <td>¥${product.revenue.toLocaleString()}</td>
                <td>${product.quantity}件</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="footer">
      <p>このレポートは${new Date().toLocaleDateString('ja-JP')}に生成されました。</p>
      <p>THE WORLD DOOR フルフィルメント・ビジネス・ターミナル</p>
    </div>
  </div>
</body>
</html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);

    const body = await request.json();
    const { year, month } = body;

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        { error: '有効な年月を指定してください' },
        { status: 400 }
      );
    }

    // Calculate date range
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Mock data generation - in production, query actual database
    const mockData: MonthlyReportData = {
      period: {
        year,
        month,
        startDate: startDate.toLocaleDateString('ja-JP'),
        endDate: endDate.toLocaleDateString('ja-JP')
      },
      summary: {
        totalRevenue: 12500000,
        totalItems: 182,
        averagePrice: 68681,
        revenueGrowth: 15.7
      },
      categories: [
        { name: 'カメラ本体', revenue: 5200000, items: 75, percentage: 41.6 },
        { name: 'レンズ', revenue: 3100000, items: 45, percentage: 24.8 },
        { name: '腕時計', revenue: 2800000, items: 35, percentage: 22.4 },
        { name: 'アクセサリ', revenue: 1400000, items: 27, percentage: 11.2 }
      ],
      inventory: {
        turnoverRate: 4.2,
        averageDays: 87,
        slowMovingCount: 23,
        totalValue: 45600000
      },
      operations: {
        newListings: 156,
        completedSales: 182,
        returns: 8,
        returnRate: 4.4
      },
      topProducts: [
        { id: 'TWD-CAM-001', name: 'Canon EOS R5', revenue: 1350000, quantity: 3 },
        { id: 'TWD-WAT-002', name: 'Rolex Submariner', revenue: 1200000, quantity: 1 },
        { id: 'TWD-LEN-003', name: 'Sony FE 24-70mm F2.8', revenue: 840000, quantity: 3 },
        { id: 'TWD-CAM-004', name: 'Leica M11', revenue: 680000, quantity: 1 },
        { id: 'TWD-ACC-005', name: 'Hermès Birkin 30', revenue: 650000, quantity: 1 }
      ]
    };

    // Generate HTML report
    const html = generateMonthlyReportHTML(mockData);

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'report',
        description: `${year}年${month}月の月次レポートが生成されました`,
        userId: user.id,
        metadata: JSON.stringify({
          reportType: 'monthly',
          period: `${year}-${month.toString().padStart(2, '0')}`
        })
      }
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="monthly-report-${year}-${month.toString().padStart(2, '0')}.html"`
      }
    });
  } catch (error) {
    console.error('Monthly report generation error:', error);
    return NextResponse.json(
      { error: '月次レポート生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);

    // Get available report periods
    const currentDate = new Date();
    const periods = [];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      periods.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: `${date.getFullYear()}年${date.getMonth() + 1}月`,
        value: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      });
    }

    return NextResponse.json({ periods });
  } catch (error) {
    console.error('Report periods error:', error);
    return NextResponse.json(
      { error: 'レポート期間の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}