import { NextResponse } from 'next/server';

export async function GET() {
  // モックデータ
  const salesData = {
    totalSales: 15678900,
    totalOrders: 234,
    averageOrderValue: 67000,
    conversionRate: 12.5,
    topProducts: [
      { id: 1, name: 'Canon EOS R5', sales: 4500000, orders: 15, category: 'カメラ本体' },
      { id: 2, name: 'Sony FE 24-70mm', sales: 2800000, orders: 20, category: 'レンズ' },
      { id: 3, name: 'Nikon D850', sales: 2100000, orders: 12, category: 'カメラ本体' },
      { id: 4, name: 'Canon RF 85mm', sales: 1800000, orders: 18, category: 'レンズ' },
      { id: 5, name: 'Sony A7R V', sales: 1600000, orders: 8, category: 'カメラ本体' },
    ],
    recentOrders: [
      { id: 'ORD-2024-001', customer: '田中太郎', product: 'Canon EOS R5', amount: 450000, status: '配送中', date: '2024-01-15' },
      { id: 'ORD-2024-002', customer: '佐藤花子', product: 'Sony FE 24-70mm', amount: 280000, status: '配送完了', date: '2024-01-14' },
      { id: 'ORD-2024-003', customer: '鈴木一郎', product: 'Nikon D850', amount: 320000, status: '準備中', date: '2024-01-13' },
      { id: 'ORD-2024-004', customer: '山田美咲', product: 'Canon RF 85mm', amount: 180000, status: '配送完了', date: '2024-01-12' },
      { id: 'ORD-2024-005', customer: '高橋健太', product: 'Sony A7R V', amount: 520000, status: '配送中', date: '2024-01-11' },
    ],
    salesTrend: [
      { month: '2023-08', sales: 12000000 },
      { month: '2023-09', sales: 13500000 },
      { month: '2023-10', sales: 11800000 },
      { month: '2023-11', sales: 14200000 },
      { month: '2023-12', sales: 16800000 },
      { month: '2024-01', sales: 15678900 },
    ],
    categoryBreakdown: [
      { category: 'カメラ本体', sales: 8900000, percentage: 56.8 },
      { category: 'レンズ', sales: 4800000, percentage: 30.6 },
      { category: 'アクセサリー', sales: 1200000, percentage: 7.6 },
      { category: 'その他', sales: 778900, percentage: 5.0 },
    ]
  };

  return NextResponse.json(salesData);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // 出品設定やプロモーション作成の処理
  if (body.type === 'listing') {
    // 出品設定の処理
    console.log('出品設定:', body);
    return NextResponse.json({ 
      success: true, 
      message: '出品設定が保存されました',
      listingId: `LST-${Date.now()}`
    });
  } else if (body.type === 'promotion') {
    // プロモーション作成の処理
    console.log('プロモーション作成:', body);
    return NextResponse.json({ 
      success: true, 
      message: 'プロモーションが作成されました',
      promotionId: `PROMO-${Date.now()}`
    });
  }

  return NextResponse.json({ success: false, message: '無効なリクエストです' }, { status: 400 });
} 