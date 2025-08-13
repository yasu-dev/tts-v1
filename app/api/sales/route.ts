import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🚀 Sales API: Prismaクエリ開始');
    
    // 売上データをPrismaから取得
    const [
      totalSales,
      monthlySales,
      dailySales,
      recentOrders,
      topProducts,
      salesByCategory,
      salesByStatus
    ] = await Promise.all([
      // 総売上額
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['delivered', 'completed'] } }
      }),
      
      // 月次売上
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ['delivered', 'completed'] },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // 日次売上
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ['delivered', 'completed'] },
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // 最近の注文
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          customer: { select: { username: true } },
          items: {
            include: {
              product: { select: { name: true, category: true } }
            }
          }
        }
      }),
      
      // 人気商品（売上件数順）
      prisma.orderItem.groupBy({
        by: ['productId'],
        _count: { productId: true },
        _sum: { price: true, quantity: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 10
      }),
      
      // カテゴリ別売上（後で処理）
      Promise.resolve([]),
      
      // ステータス別注文数
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    console.log('✅ Sales API: Prisma基本クエリ完了');
    console.log(`注文データ取得件数: ${recentOrders.length}`);
    
    // 人気商品の詳細情報を取得
    const productIds = topProducts.map(item => item.productId);
    const productDetails = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, category: true, imageUrl: true }
    });

    console.log(`商品詳細取得件数: ${productDetails.length}`);

    // 売上データを構築
    const salesData = {
      _dataSource: 'prisma', // データソースを明示
      overview: {
        totalSales: totalSales._sum.totalAmount || 0,
        monthlySales: monthlySales._sum.totalAmount || 0,
        dailySales: dailySales._sum.totalAmount || 0,
        totalOrders: recentOrders.length,
        averageOrderValue: totalSales._sum.totalAmount && recentOrders.length 
          ? Math.round((totalSales._sum.totalAmount || 0) / recentOrders.length)
          : 0
      },
      recentOrders: recentOrders.map(order => {
        const orderData = {
          id: order.id,
          orderNumber: order.orderNumber,
          customer: order.customer.username,
          product: order.items[0]?.product.name || '商品なし', // 商品名を追加
          totalAmount: order.totalAmount,
          status: order.status,
          itemCount: order.items.length,
          orderDate: order.orderDate.toISOString(),
          trackingNumber: order.trackingNumber, // 追跡番号を追加
          carrier: order.carrier, // 配送業者を追加
          shippingAddress: order.shippingAddress, // 配送先住所を追加
          items: order.items.map(item => ({
            productName: item.product.name,
            category: item.product.category,
            quantity: item.quantity,
            price: item.price
          }))
        };
        console.log(`注文 ${orderData.orderNumber}: 商品「${orderData.product}」追跡番号「${orderData.trackingNumber}」`);
        return orderData;
      }),
      topProducts: topProducts.map(item => {
        const product = productDetails.find(p => p.id === item.productId);
        return {
          id: item.productId,
          name: product?.name || '商品名不明',
          category: product?.category || 'その他',
          imageUrl: product?.imageUrl || '/api/placeholder/150/150',
          salesCount: item._count.productId,
          totalSales: item._sum.price || 0,
          totalQuantity: item._sum.quantity || 0
        };
      }),
      salesByStatus: salesByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
        label: getStatusLabel(item.status)
      })),
      monthlyTrend: generateMonthlyTrend(), // 簡単な月次トレンド
      categoryBreakdown: await getCategoryBreakdown()
    };

    console.log('🎉 Sales API: Prismaデータ正常取得完了！');
    return NextResponse.json(salesData);
  } catch (error) {
    console.error('Sales API error - Prismaでのデータ取得に失敗:', error);
    console.error('エラーの詳細:', JSON.stringify(error, null, 2));
    
    // フォールバック用のモックデータを返す（Prismaでデータ取得できない場合）
    const mockSalesData = {
      _dataSource: 'mock', // データソースを明示
      overview: {
        totalSales: 15750000,
        monthlySales: 3200000,
        dailySales: 180000,
        totalOrders: 87,
        averageOrderValue: 181034
      },
      recentOrders: [
        {
          id: 'ORD-2024-COMP-0008',
          orderNumber: 'ORD-2024-COMP-0008',
          customer: '田中太郎',
          product: 'Canon EOS R5 Full Frame Mirrorless Camera Body - Excellent Condition',
          totalAmount: 450000,
          status: 'delivered',
          itemCount: 1,
          orderDate: '2024-01-15',
          labelGenerated: true,
          items: [{ productName: 'Canon EOS R5 Full Frame Mirrorless Camera Body - Excellent Condition', category: 'camera_body', quantity: 1, price: 450000, productImage: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300&h=300&fit=crop' }]
        },
        {
          id: 'ORD-2024-COMP-0007',
          orderNumber: 'ORD-2024-COMP-0007',
          customer: '佐藤花子',
          product: 'Sony Alpha a7R IV Mirrorless Camera - 61MP Full Frame',
          totalAmount: 398000,
          status: 'shipped',
          itemCount: 1,
          orderDate: '2024-01-14',
          labelGenerated: true,
          items: [{ productName: 'Sony Alpha a7R IV Mirrorless Camera - 61MP Full Frame', category: 'camera_body', quantity: 1, price: 398000, productImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop' }]
        },
        {
          id: 'ORD-2024-COMP-0006',
          orderNumber: 'ORD-2024-COMP-0006',
          customer: '鈴木一郎',
          product: 'Rolex Submariner Date 41mm Stainless Steel - Mint Condition',
          totalAmount: 1200000,
          status: 'cancelled',
          itemCount: 1,
          orderDate: '2024-01-13',
          labelGenerated: false,
          items: [{ productName: 'Rolex Submariner Date 41mm Stainless Steel - Mint Condition', category: 'watch', quantity: 1, price: 1200000, productImage: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=300&h=300&fit=crop' }]
        },
        {
          id: 'ORD-2024-COMP-0005',
          orderNumber: 'ORD-2024-COMP-0005',
          customer: '山田次郎',
          product: 'Nikon D850 DSLR Camera with 24-120mm Lens Kit - Professional Grade',
          totalAmount: 280000,
          status: 'processing',
          itemCount: 1,
          orderDate: '2024-01-13',
          labelGenerated: false,
          items: [{ productName: 'Nikon D850 DSLR Camera with 24-120mm Lens Kit - Professional Grade', category: 'lens', quantity: 1, price: 280000, productImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop' }]
        },
        {
          id: 'ORD-2024-COMP-0004',
          orderNumber: 'ORD-2024-COMP-0004',
          customer: '高橋美咲',
          product: 'TAG Heuer Carrera Calibre 16 Chronograph - Steel & Rose Gold',
          totalAmount: 350000,
          status: 'processing',
          itemCount: 1,
          orderDate: '2024-01-12',
          labelGenerated: false,
          items: [{ productName: 'TAG Heuer Carrera Calibre 16 Chronograph - Steel & Rose Gold', category: 'watch', quantity: 1, price: 350000, productImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=300&h=300&fit=crop' }]
        },
        {
          id: 'ORD-2024-COMP-0003',
          orderNumber: 'ORD-2024-COMP-0003',
          customer: '伊藤健太',
          product: 'IWC Portugieser Automatic 40mm Stainless Steel - Blue Dial',
          totalAmount: 680000,
          status: 'processing',
          itemCount: 1,
          orderDate: '2024-01-11',
          labelGenerated: false,
          items: [{ productName: 'IWC Portugieser Automatic 40mm Stainless Steel - Blue Dial', category: 'watch', quantity: 1, price: 680000, productImage: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=300&h=300&fit=crop' }]
        },
        {
          id: 'ORD-2024-COMP-0002',
          orderNumber: 'ORD-2024-COMP-0002',
          customer: '渡辺雄二',
          product: 'Fujifilm X-T4 Mirrorless Camera with 18-55mm Lens - Black',
          totalAmount: 220000,
          status: 'processing',
          itemCount: 1,
          orderDate: '2024-01-10',
          labelGenerated: false,
          items: [{ productName: 'Fujifilm X-T4 Mirrorless Camera with 18-55mm Lens - Black', category: 'camera', quantity: 1, price: 220000, productImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&h=300&fit=crop' }]
        },
        {
          id: 'ORD-2024-COMP-0001',
          orderNumber: 'ORD-2024-COMP-0001',
          customer: '中村麗子',
          product: 'Panasonic Lumix GH5 4K Video Camera - Content Creator Special',
          totalAmount: 598000,
          status: 'delivered',
          itemCount: 1,
          orderDate: '2024-01-09',
          labelGenerated: true,
          items: [{ productName: 'Panasonic Lumix GH5 4K Video Camera - Content Creator Special', category: 'camera_body', quantity: 1, price: 598000, productImage: 'https://images.unsplash.com/photo-1514016810987-c59c4e3d6d29?w=300&h=300&fit=crop' }]
        }
      ],
      topProducts: [],
      monthlyTrend: generateMonthlyTrend(),
      categoryBreakdown: [
        { category: 'camera_body', sales: 8900000, units: 22, percentage: 56.5 },
        { category: 'lens', sales: 4200000, units: 35, percentage: 26.7 },
        { category: 'watch', sales: 2650000, units: 7, percentage: 16.8 }
      ]
    };
    
    return NextResponse.json(mockSalesData);
  }
}

// ステータスラベルを取得
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '保留中',
    confirmed: '確認済み',
    processing: '処理中',
    shipped: '発送済み',
    delivered: '配送完了',
    completed: '完了',
    cancelled: 'キャンセル',
    returned: '返品'
  };
  return labels[status] || status;
}

// 月次トレンドを生成（過去12ヶ月）
function generateMonthlyTrend() {
  const months = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.toISOString().substring(0, 7), // YYYY-MM
      sales: Math.floor(Math.random() * 1000000) + 500000, // ダミーデータ
      orders: Math.floor(Math.random() * 100) + 50
    });
  }
  
  return months;
}

// カテゴリ別売上分析
async function getCategoryBreakdown() {
  try {
    const categoryStats = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { price: true, quantity: true }
    });

    // 商品情報を取得してカテゴリでグループ化
    const productIds = categoryStats.map(stat => stat.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: true }
    });

    const categoryMap: Record<string, { sales: number; quantity: number }> = {};
    
    categoryStats.forEach(stat => {
      const product = products.find(p => p.id === stat.productId);
      const category = product?.category || 'その他';
      
      if (!categoryMap[category]) {
        categoryMap[category] = { sales: 0, quantity: 0 };
      }
      
      categoryMap[category].sales += stat._sum.price || 0;
      categoryMap[category].quantity += stat._sum.quantity || 0;
    });

    return Object.entries(categoryMap).map(([category, data]) => ({
      category,
      sales: data.sales,
      quantity: data.quantity,
      percentage: 0 // 計算は後で追加可能
    }));
  } catch (error) {
    console.error('Category breakdown error:', error);
    return [];
  }
}