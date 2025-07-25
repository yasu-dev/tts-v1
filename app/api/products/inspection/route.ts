import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('Inspection POST request received');
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    console.log('User authenticated:', user?.username);

    const body = await request.json();
    const { productId, inspectionNotes, condition, status, locationId, skipPhotography, photographyDate } = body;

    if (!productId) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    // productIdまたはSKUで商品を検索
    let product = await prisma.product.findUnique({
      where: { id: productId },
    });

    // IDで見つからない場合、SKUで検索を試行
    if (!product) {
      product = await prisma.product.findUnique({
        where: { sku: productId },
      });
    }

    // それでも見つからない場合、SKUの末尾で検索（例：006 -> CAM-*-006）
    if (!product) {
      product = await prisma.product.findFirst({
        where: { 
          sku: { 
            endsWith: `-${productId}` 
          } 
        },
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // Prepare metadata for inspection and photography status tracking
    const currentMetadata = product.metadata ? JSON.parse(product.metadata) : {};
    const updatedMetadata = {
      ...currentMetadata,
      inspectionCompleted: true,
      inspectionDate: new Date().toISOString(),
      photographyCompleted: skipPhotography ? false : !!photographyDate,
      ...(photographyDate && { photographyDate }),
      skipPhotography: !!skipPhotography,
    };

    // Update product with inspection data
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        inspectedAt: new Date(),
        inspectedBy: user.username,
        inspectionNotes,
        metadata: JSON.stringify(updatedMetadata),
        ...(condition && {
          condition: condition.replace('新品', 'new')
                            .replace('新品同様', 'like_new')
                            .replace('極美品', 'excellent')
                            .replace('美品', 'very_good')
                            .replace('良品', 'good')
                            .replace('中古美品', 'fair')
                            .replace('中古', 'poor'),
        }),
        status: 'inspection',
        ...(locationId && { currentLocationId: locationId }),
      },
    });

    // Create inventory movement if location changed
    if (locationId && locationId !== product.currentLocationId) {
      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          fromLocationId: product.currentLocationId,
          toLocationId: locationId,
          movedBy: user.username,
          notes: '検品による移動',
        },
      });
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'inspection',
        description: `商品 ${product.name} の検品が完了しました`,
        userId: user.id,
        productId: product.id,
        metadata: JSON.stringify({
          condition,
          notes: inspectionNotes,
          skipPhotography,
          inspectionCompleted: true,
          photographyCompleted: !skipPhotography,
        }),
      },
    });

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct,
      message: '検品データを登録しました'
    });
  } catch (error) {
    console.error('Inspection registration error:', error);
    return NextResponse.json(
      { error: '検品データ登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);

    const body = await request.json();
    const { productId, status } = body;

    if (!productId || !status) {
      return NextResponse.json(
        { error: '商品IDとステータスが必要です' },
        { status: 400 }
      );
    }

    const validStatuses = ['inspection', 'storage', 'listing'];
    const mappedStatus = status.replace('検品', 'inspection')
                              .replace('保管', 'storage')
                              .replace('出品', 'listing');

    if (!validStatuses.includes(mappedStatus)) {
      return NextResponse.json(
        { error: '無効なステータスです' },
        { status: 400 }
      );
    }

    // productIdまたはSKUで商品を検索
    let product = await prisma.product.findUnique({
      where: { id: productId },
    });

    // IDで見つからない場合、SKUで検索を試行
    if (!product) {
      product = await prisma.product.findUnique({
        where: { sku: productId },
      });
    }

    // それでも見つからない場合、SKUの末尾で検索（例：006 -> CAM-*-006）
    if (!product) {
      product = await prisma.product.findFirst({
        where: { 
          sku: { 
            endsWith: `-${productId}` 
          } 
        },
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        status: mappedStatus,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'status_change',
        description: `商品 ${product.name} のステータスが ${status} に変更されました`,
        userId: user.id,
        productId: product.id,
        metadata: JSON.stringify({
          fromStatus: product.status,
          toStatus: mappedStatus,
        }),
      },
    });

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct,
      message: 'ステータスを更新しました'
    });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { error: 'ステータス更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}