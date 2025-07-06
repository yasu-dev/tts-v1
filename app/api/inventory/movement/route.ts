import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause = productId ? { productId } : {};

    const movements = await prisma.inventoryMovement.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        fromLocation: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        toLocation: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error('Movement history fetch error:', error);
    return NextResponse.json(
      { error: '移動履歴取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, toLocationId, notes } = body;

    if (!productId || !toLocationId) {
      return NextResponse.json(
        { error: '商品IDと移動先ロケーションが必要です' },
        { status: 400 }
      );
    }

    // Get current product location
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        currentLocation: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // Verify target location exists
    const targetLocation = await prisma.location.findUnique({
      where: { id: toLocationId },
    });

    if (!targetLocation) {
      return NextResponse.json(
        { error: '移動先ロケーションが見つかりません' },
        { status: 404 }
      );
    }

    // Check if already in target location
    if (product.currentLocationId === toLocationId) {
      return NextResponse.json(
        { error: '商品は既にそのロケーションにあります' },
        { status: 400 }
      );
    }

    // Create movement record
    const movement = await prisma.inventoryMovement.create({
      data: {
        productId,
        fromLocationId: product.currentLocationId,
        toLocationId,
        movedBy: user.username,
        notes,
      },
    });

    // Update product location
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        currentLocationId: toLocationId,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'movement',
        description: `商品 ${product.name} が ${product.currentLocation?.code || '未設定'} から ${targetLocation.code} に移動されました`,
        userId: user.id,
        productId,
        metadata: JSON.stringify({
          fromLocation: product.currentLocation?.code,
          toLocation: targetLocation.code,
          notes,
        }),
      },
    });

    return NextResponse.json({ 
      success: true, 
      movement,
      product: updatedProduct,
      message: '在庫移動を記録しました'
    }, { status: 201 });
  } catch (error) {
    console.error('Inventory movement error:', error);
    return NextResponse.json(
      { error: '在庫移動中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['admin']);
    if (!user) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const movementId = searchParams.get('id');

    if (!movementId) {
      return NextResponse.json(
        { error: '移動記録IDが必要です' },
        { status: 400 }
      );
    }

    const movement = await prisma.inventoryMovement.findUnique({
      where: { id: movementId },
      include: {
        product: true,
        fromLocation: true,
        toLocation: true,
      },
    });

    if (!movement) {
      return NextResponse.json(
        { error: '移動記録が見つかりません' },
        { status: 404 }
      );
    }

    // Check if this is the most recent movement for the product
    const latestMovement = await prisma.inventoryMovement.findFirst({
      where: { productId: movement.productId },
      orderBy: { createdAt: 'desc' },
    });

    if (latestMovement?.id !== movementId) {
      return NextResponse.json(
        { error: '最新の移動記録のみ削除できます' },
        { status: 400 }
      );
    }

    // Revert product location
    await prisma.product.update({
      where: { id: movement.productId },
      data: {
        currentLocationId: movement.fromLocationId,
      },
    });

    // Delete movement record
    await prisma.inventoryMovement.delete({
      where: { id: movementId },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'movement_delete',
        description: `商品 ${movement.product.name} の移動記録が削除されました`,
        userId: user.id,
        productId: movement.productId,
        metadata: JSON.stringify({
          deletedMovement: {
            from: movement.fromLocation?.code,
            to: movement.toLocation?.code,
          },
        }),
      },
    });

    return NextResponse.json({ success: true, message: '移動記録を削除しました' });
  } catch (error) {
    console.error('Movement deletion error:', error);
    return NextResponse.json(
      { error: '移動記録削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}