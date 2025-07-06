import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);

    const body = await request.json();
    const { productId, inspectionNotes, condition, status, locationId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // Update product with inspection data
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        inspectedAt: new Date(),
        inspectedBy: user.username,
        inspectionNotes,
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
          productId,
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
        productId,
        metadata: JSON.stringify({
          condition,
          notes: inspectionNotes,
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

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
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
        productId,
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