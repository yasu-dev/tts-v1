import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    
    // 商品のeBay出品情報をPrismaから取得
    const [
      product,
      listings,
      listingTemplates,
      listingHistory
    ] = await Promise.all([
      // 商品情報
      prisma.product.findUnique({
        where: { id: productId },
        include: {
          seller: { select: { username: true, email: true } },
          listings: {
            where: { platform: 'ebay' },
            orderBy: { createdAt: 'desc' }
          }
        }
      }),
      
      // eBay出品一覧
      prisma.listing.findMany({
        where: { 
          productId,
          platform: 'ebay'
        },
        orderBy: { createdAt: 'desc' },
        include: {
          template: true
        }
      }),
      
      // 出品テンプレート
      prisma.listingTemplate.findMany({
        where: { platform: 'ebay' },
        orderBy: { name: 'asc' }
      }),
      
      // 出品履歴
      prisma.activity.findMany({
        where: {
          productId,
          type: { contains: 'listing' }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { username: true } }
        }
      })
    ]);

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // レスポンスデータ構築
    const ebayListingData = {
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        brand: 'Unknown',
        model: 'Unknown',
        condition: product.condition,
        price: product.price,
        imageUrl: product.imageUrl,
        seller: product.seller?.username || 'システム',
        status: product.status,
        location: product.location
      },
      listings: listings.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        currency: listing.currency,
        status: listing.status,
        platform: listing.platform,
        externalId: listing.externalId,
        templateName: listing.template?.name,
        startDate: listing.startDate?.toISOString(),
        endDate: listing.endDate?.toISOString(),
        views: listing.views,
        watchers: listing.watchers,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString()
      })),
      templates: listingTemplates.map(template => ({
        id: template.id,
        name: template.name,
        platform: template.platform,
        category: template.category,
        titleTemplate: template.titleTemplate,
        descriptionTemplate: template.descriptionTemplate,
        shippingPolicy: template.shippingPolicy,
        returnPolicy: template.returnPolicy,
        isActive: template.isActive
      })),
      history: listingHistory.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        user: activity.user?.username || 'システム',
        timestamp: activity.createdAt.toISOString()
      })),
      eligibility: {
        canList: product.status === 'storage' || product.status === 'listing',
        reasons: product.status !== 'storage' && product.status !== 'listing'
          ? [`商品ステータスが「${product.status}」のため出品できません`]
          : [],
        requirements: [
          { name: '商品画像', status: product.imageUrl ? 'completed' : 'required' },
          { name: '商品説明', status: product.description ? 'completed' : 'required' },
          { name: '価格設定', status: product.price > 0 ? 'completed' : 'required' },
          { name: '在庫状態', status: product.status === 'storage' ? 'completed' : 'pending' }
        ]
      },
      recommendations: {
        suggestedPrice: Math.round(product.price * 1.1), // 10%マークアップ
        competitorPrices: generateCompetitorPrices(product.price),
        optimalTiming: '平日 10:00-16:00',
        suggestedDuration: '7日間'
      }
    };

    return NextResponse.json(ebayListingData);
  } catch (error) {
    console.error('[ERROR] eBay listing API:', error);
    
    return NextResponse.json(
      { error: 'eBay出品データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    const body = await request.json();
    
    const { 
      title, 
      description, 
      price, 
      currency = 'JPY',
      templateId,
      duration = 7,
      startDate,
      shippingCost = 0
    } = body;

    // 新しいeBay出品を作成
    const newListing = await prisma.listing.create({
      data: {
        productId,
        templateId,
        title,
        description,
        price,
        currency,
        platform: 'ebay',
        status: 'draft',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        shippingCost,
        views: 0,
        watchers: 0
      },
      include: {
        product: true,
        template: true
      }
    });

    // 商品ステータスを更新
    await prisma.product.update({
      where: { id: productId },
      data: { status: 'listing' }
    });

    // アクティビティログを作成
    await prisma.activity.create({
      data: {
        type: 'listing_created',
        description: `eBay出品「${title}」が作成されました`,
        productId,
        metadata: JSON.stringify({ listingId: newListing.id, price, platform: 'ebay' })
      }
    });

    return NextResponse.json(newListing, { status: 201 });
  } catch (error) {
    console.error('[ERROR] eBay listing creation:', error);
    
    return NextResponse.json(
      { error: 'eBay出品の作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    const body = await request.json();
    
    const { listingId, title, description, price, status } = body;

    // eBay出品を更新
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        title,
        description,
        price,
        status,
        updatedAt: new Date()
      },
      include: {
        product: true
      }
    });

    // アクティビティログを作成
    await prisma.activity.create({
      data: {
        type: 'listing_updated',
        description: `eBay出品「${title}」が更新されました`,
        productId,
        metadata: JSON.stringify({ listingId, newStatus: status })
      }
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('[ERROR] eBay listing update:', error);
    
    return NextResponse.json(
      { error: 'eBay出品の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// 競合価格を生成（ダミーデータ）
function generateCompetitorPrices(basePrice: number) {
  return [
    { seller: '競合A', price: Math.round(basePrice * 0.95) },
    { seller: '競合B', price: Math.round(basePrice * 1.05) },
    { seller: '競合C', price: Math.round(basePrice * 0.98) }
  ];
}