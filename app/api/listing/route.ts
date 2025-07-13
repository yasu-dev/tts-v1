import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MockFallback } from '@/lib/mock-fallback';

const prisma = new PrismaClient();

// 出品管理API
export async function GET(request: NextRequest) {
  try {
    // Prismaを使用して出品データを取得
    // TODO: 実際のPrismaクエリを実装する際は、以下のような構造になる
    // const templates = await prisma.listingTemplate.findMany(...);
    // const products = await prisma.product.findMany({ where: { status: 'ready' } });
    
    // 現在はモックデータを返す（Prismaスキーマが整備されるまで）
    const listings = {
      templates: [
        {
          id: 'TPL-001',
          name: 'カメラボディ標準テンプレート',
          category: 'camera_body',
          platform: 'ebay',
          basePrice: 100000,
          currency: 'JPY',
          condition: 'Used - Excellent',
          shippingMethod: 'FedEx International',
          isActive: true,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          appliedCount: 45,
          fields: {
            title: '{BRAND} {MODEL} {CONDITION} - Japan Seller',
            description: 'Professional camera body in excellent condition...',
            shippingTime: '3-5 business days',
            returnPolicy: '30 days',
          },
        },
      ],
      products: [
        {
          id: 'TWD-2024-001',
          name: 'Canon EOS R5 ボディ',
          sku: 'CAM-001',
          category: 'camera_body',
          status: 'ready',
          listingStatus: {
            ebay: false,
            amazon: false,
            mercari: false,
            yahoo: false,
          },
          price: 280000,
          images: ['/api/placeholder/150/150'],
          condition: 'Excellent',
          description: 'Mint condition, low shutter count',
        },
      ],
      stats: {
        totalActive: 156,
        pendingListing: 24,
        soldThisMonth: 89,
        averagePrice: 215000,
        platforms: {
          ebay: 89,
          amazon: 45,
          mercari: 12,
          yahoo: 10,
        },
      },
    };

    return NextResponse.json(listings);
  } catch (error) {
    console.error('[ERROR] GET /api/listing:', error);
    
    // Prismaエラーの場合はフォールバックデータを使用
    if (MockFallback.isPrismaError(error)) {
      console.log('Using fallback data for listing due to Prisma error');
      try {
        const fallbackData = {
          templates: [],
          products: [],
          stats: {
            totalActive: 0,
            pendingListing: 0,
            soldThisMonth: 0,
            averagePrice: 0,
            platforms: {
              ebay: 0,
              amazon: 0,
              mercari: 0,
              yahoo: 0,
            },
          },
        };
        return NextResponse.json(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback data error:', fallbackError);
      }
    }
    
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
    const { productId, platform, templateId, customSettings } = body;

    // 実際の実装では:
    // 1. 商品情報を取得
    // 2. テンプレートを適用
    // 3. プラットフォームAPIに出品
    // 4. DBに記録

    const newListing = {
      id: `LIST-${Date.now()}`,
      productId,
      platform,
      templateId,
      status: 'active',
      listedAt: new Date().toISOString(),
      url: `https://${platform}.com/item/${Date.now()}`,
      ...customSettings,
    };

    return NextResponse.json(newListing, { status: 201 });
  } catch (error) {
    console.error('[ERROR] POST /api/listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

// 出品更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, updates } = body;

    // 実際の実装では:
    // 1. 既存の出品情報を取得
    // 2. プラットフォームAPIで更新
    // 3. DBを更新

    const updatedListing = {
      id: listingId,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

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

    // 実際の実装では:
    // 1. プラットフォームAPIから削除
    // 2. DBから削除

    return NextResponse.json({ success: true, id: listingId });
  } catch (error) {
    console.error('[ERROR] DELETE /api/listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
} 