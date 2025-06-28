import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  // This is handled by Server Components for data fetching
  // Keeping existing static data for demo purposes
  const inventoryData = [
    {
      id: '1',
      name: 'Canon EOS R5',
      sku: 'CAM-001',
      category: 'カメラ本体',
      status: 'storage',
      location: 'A区画-01',
      price: 450000,
      condition: '極美品',
      entryDate: '2024-06-20',
      imageUrl: null,
    },
    {
      id: '2',
      name: 'Sony FE 24-70mm f/2.8',
      sku: 'LEN-002',
      category: 'レンズ',
      status: 'listing',
      location: 'A区画-05',
      price: 280000,
      condition: '美品',
      entryDate: '2024-06-22',
      imageUrl: null,
    },
    {
      id: '3',
      name: 'Rolex Submariner',
      sku: 'WAT-001',
      category: '腕時計',
      status: 'sold',
      location: 'V区画-12',
      price: 1200000,
      condition: '中古美品',
      entryDate: '2024-06-15',
      imageUrl: null,
    },
    {
      id: '4',
      name: 'Hermès Birkin 30',
      sku: 'ACC-003',
      category: 'アクセサリ',
      status: 'inspection',
      location: 'H区画-08',
      price: 2500000,
      condition: '新品同様',
      entryDate: '2024-06-28',
      imageUrl: null,
    },
    {
      id: '5',
      name: 'Leica M11',
      sku: 'CAM-005',
      category: 'カメラ本体',
      status: 'inbound',
      location: '入庫待ち',
      price: 980000,
      condition: '美品',
      entryDate: '2024-06-28',
      imageUrl: null,
    },
    {
      id: '6',
      name: 'Nikon Z9',
      sku: 'CAM-006',
      category: 'カメラ本体',
      status: 'storage',
      location: 'A区画-03',
      price: 520000,
      condition: '極美品',
      entryDate: '2024-06-25',
      imageUrl: null,
    },
    {
      id: '7',
      name: 'Canon EF 85mm f/1.4L',
      sku: 'LEN-007',
      category: 'レンズ',
      status: 'listing',
      location: 'A区画-07',
      price: 180000,
      condition: '美品',
      entryDate: '2024-06-23',
      imageUrl: null,
    },
    {
      id: '8',
      name: 'Omega Speedmaster',
      sku: 'WAT-008',
      category: '腕時計',
      status: 'storage',
      location: 'V区画-05',
      price: 650000,
      condition: '中古美品',
      entryDate: '2024-06-21',
      imageUrl: null,
    },
  ];

  return NextResponse.json(inventoryData);
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