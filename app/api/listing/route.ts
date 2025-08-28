import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 出品管理API
export async function GET(request: NextRequest) {
  try {
    // Prismaを使用して出品データを取得
    const templates = await prisma.listingTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const products = await prisma.product.findMany({
      where: { status: { in: ['storage', 'listing'] } },
      include: {
        listings: true,
        currentLocation: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // 統計データを計算
    const totalActiveListings = await prisma.listing.count({
      where: { status: 'active' }
    });

    const pendingListingProducts = await prisma.product.count({
      where: { status: 'storage' }
    });

    const soldThisMonth = await prisma.listing.count({
      where: {
        status: 'sold',
        soldAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    const avgPriceResult = await prisma.listing.aggregate({
      _avg: { price: true },
      where: { status: 'active' }
    });

    const platformStats = await prisma.listing.groupBy({
      by: ['platform'],
      _count: { _all: true },
      where: { status: 'active' }
    });

    const platformCounts = platformStats.reduce((acc, stat) => {
      acc[stat.platform] = stat._count._all;
      return acc;
    }, {} as Record<string, number>);

    const listings = {
      templates: templates.map(template => ({
        ...template,
        fields: template.fields ? JSON.parse(template.fields) : null,
      })),
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        status: product.status === 'storage' ? 'ready' : product.status,
        listingStatus: {
          ebay: product.listings.some(l => l.platform === 'ebay' && l.status === 'active'),
          amazon: product.listings.some(l => l.platform === 'amazon' && l.status === 'active'),
          mercari: product.listings.some(l => l.platform === 'mercari' && l.status === 'active'),
          yahoo: product.listings.some(l => l.platform === 'yahoo' && l.status === 'active'),
        },
        price: product.price,
        images: [product.imageUrl || '/api/placeholder/150/150'],
        condition: product.condition,
        description: product.description,
      })),
      stats: {
        totalActive: totalActiveListings,
        pendingListing: pendingListingProducts,
        soldThisMonth: soldThisMonth,
        averagePrice: Math.round(avgPriceResult._avg.price || 0),
        platforms: {
          ebay: platformCounts.ebay || 0,
          amazon: platformCounts.amazon || 0,
          mercari: platformCounts.mercari || 0,
          yahoo: platformCounts.yahoo || 0,
        },
      },
    };

    return NextResponse.json(listings);
  } catch (error) {
    console.error('[ERROR] GET /api/listing:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch listing data' },
      { status: 500 }
    );
  }
}

// 新規出品作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, platform, templateId, customSettings, productUpdates } = body;

    console.log('🚀 /api/listing POST: 出品処理開始', { productId, platform, customSettings, productUpdates });

    // 商品情報を取得
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      console.error('❌ 商品が見つかりません:', productId);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // トランザクションで商品更新と出品作成を行う
    const result = await prisma.$transaction(async (tx) => {
      // 商品情報を更新（customSettingsまたはproductUpdatesから）
      const updateData: any = { status: 'listing' };
      
      if (customSettings?.title) {
        updateData.name = customSettings.title;
      }
      if (customSettings?.description) {
        updateData.description = customSettings.description;
      }
      if (customSettings?.price) {
        updateData.price = customSettings.price;
      }
      
      // 追加の商品更新データがある場合
      if (productUpdates) {
        Object.assign(updateData, productUpdates);
      }

      console.log('🔄 商品テーブル更新データ:', updateData);

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: updateData
      });

      console.log('✅ 商品テーブル更新完了');

      // テンプレート情報を取得（指定されている場合）
      let template = null;
      if (templateId) {
        template = await tx.listingTemplate.findUnique({
          where: { id: templateId }
        });
      }

      // 新規出品を作成
      const newListing = await tx.listing.create({
        data: {
          productId,
          templateId,
          platform: platform || 'ebay',
          listingId: `${(platform || 'ebay').toUpperCase()}-${Date.now()}`,
          title: customSettings?.title || updatedProduct.name || `${product.name} - ${product.condition}`,
          description: customSettings?.description || updatedProduct.description || product.description || '',
          price: customSettings?.price || updatedProduct.price || product.price,
          status: 'active',
          listedAt: new Date(),
        }
      });

      console.log('✅ Listing作成完了:', newListing.id);

      // テンプレートの使用回数を更新
      if (template) {
        await tx.listingTemplate.update({
          where: { id: templateId },
          data: { appliedCount: { increment: 1 } }
        });
      }

      return { listing: newListing, product: updatedProduct };
    });

    console.log('🎉 出品処理完了');
    return NextResponse.json({ 
      success: true, 
      data: result.listing,
      product: result.product 
    }, { status: 201 });
  } catch (error) {
    console.error('[ERROR] POST /api/listing:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create listing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 出品更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, updates } = body;

    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        ...updates,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('[ERROR] PUT /api/listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

// 出品削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('id');

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // 出品を削除
    const deletedListing = await prisma.listing.delete({
      where: { id: listingId }
    });

    // 商品ステータスを保管中に戻す
    await prisma.product.update({
      where: { id: deletedListing.productId },
      data: { status: 'storage' }
    });

    return NextResponse.json({ success: true, id: listingId });
  } catch (error) {
    console.error('[ERROR] DELETE /api/listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}