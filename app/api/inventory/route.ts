import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status.replace('入庫', 'inbound')
                          .replace('検品', 'inspection')
                          .replace('保管', 'storage')
                          .replace('出品', 'listing')
                          .replace('受注', 'ordered')
                          .replace('出荷', 'shipping')
                          .replace('配送', 'delivery')
                          .replace('売約済み', 'sold')
                          .replace('返品', 'returned');
    }
    
    if (category) {
      where.category = category.replace('カメラ本体', 'camera_body')
                              .replace('レンズ', 'lens')
                              .replace('腕時計', 'watch')
                              .replace('アクセサリ', 'accessory');
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          currentLocation: true,
          seller: {
            select: { id: true, username: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.product.count({ where })
    ]);

    // Transform to match UI expectations
    const inventoryData = products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category.replace('camera_body', 'カメラ本体')
                               .replace('lens', 'レンズ')
                               .replace('watch', '腕時計')
                               .replace('accessory', 'アクセサリ'),
      status: product.status.replace('inbound', '入庫')
                           .replace('inspection', '検品')
                           .replace('storage', '保管')
                           .replace('listing', '出品')
                           .replace('ordered', '受注')
                           .replace('shipping', '出荷')
                           .replace('delivery', '配送')
                           .replace('sold', '売約済み')
                           .replace('returned', '返品'),
      location: product.currentLocation?.code || '未設定',
      price: product.price,
      condition: product.condition.replace('new', '新品')
                                 .replace('like_new', '新品同様')
                                 .replace('excellent', '極美品')
                                 .replace('very_good', '美品')
                                 .replace('good', '良品')
                                 .replace('fair', '中古美品')
                                 .replace('poor', '中古'),
      entryDate: product.entryDate.toISOString().split('T')[0],
      imageUrl: product.imageUrl,
      seller: product.seller,
    }));

    return NextResponse.json({
      data: inventoryData,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json(
      { error: '在庫データの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireAuth(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, sku, category, price, condition, description, imageUrl } = body;

    if (!name || !sku || !category || !price || !condition) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // Check for duplicate SKU
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'SKUが既に存在します' },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category: category.replace('カメラ本体', 'camera_body')
                          .replace('レンズ', 'lens')
                          .replace('腕時計', 'watch')
                          .replace('アクセサリ', 'accessory'),
        price: parseInt(price),
        condition: condition.replace('新品', 'new')
                           .replace('新品同様', 'like_new')
                           .replace('極美品', 'excellent')
                           .replace('美品', 'very_good')
                           .replace('良品', 'good')
                           .replace('中古美品', 'fair')
                           .replace('中古', 'poor'),
        description,
        imageUrl,
        sellerId: user.id,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'inbound',
        description: `商品 ${name} が新規登録されました`,
        userId: user.id,
        productId: product.id,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: '商品登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.requireAuth(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, price, condition, description, imageUrl, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price && { price: parseInt(price) }),
        ...(condition && { 
          condition: condition.replace('新品', 'new')
                             .replace('新品同様', 'like_new')
                             .replace('極美品', 'excellent')
                             .replace('美品', 'very_good')
                             .replace('良品', 'good')
                             .replace('中古美品', 'fair')
                             .replace('中古', 'poor')
        }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(status && { 
          status: status.replace('入庫', 'inbound')
                        .replace('検品', 'inspection')
                        .replace('保管', 'storage')
                        .replace('出品', 'listing')
                        .replace('受注', 'ordered')
                        .replace('出荷', 'shipping')
                        .replace('配送', 'delivery')
                        .replace('売約済み', 'sold')
                        .replace('返品', 'returned')
        }),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'update',
        description: `商品 ${updatedProduct.name} が更新されました`,
        userId: user.id,
        productId: updatedProduct.id,
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: '商品更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await AuthService.requireAuth(request, ['admin']);
    if (!user) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // Check if product is in active order
    const activeOrder = await prisma.orderItem.findFirst({
      where: {
        productId: id,
        order: {
          status: {
            in: ['pending', 'confirmed', 'processing', 'shipped'],
          },
        },
      },
    });

    if (activeOrder) {
      return NextResponse.json(
        { error: 'アクティブな注文に含まれている商品は削除できません' },
        { status: 409 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'delete',
        description: `商品 ${existingProduct.name} が削除されました`,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, message: '商品を削除しました' });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: '商品削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}