import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    const productId = params.id;

    const body = await request.json();
    const { photos, notes } = body;

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

    // Update metadata to mark photography as completed
    const currentMetadata = product.metadata ? JSON.parse(product.metadata) : {};
    const updatedMetadata = {
      ...currentMetadata,
      photographyCompleted: true,
      photographyDate: new Date().toISOString(),
      photographyBy: user.username,
    };

    // Update product with photography data
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        metadata: JSON.stringify(updatedMetadata),
        // Add photography-related fields if needed
        ...(notes && { 
          inspectionNotes: (product.inspectionNotes || '') + 
            (product.inspectionNotes ? '\n\n【撮影メモ】\n' : '【撮影メモ】\n') + notes 
        }),
      },
    });

    // Log photography completion activity
    await prisma.activity.create({
      data: {
        type: 'photography',
        description: `商品 ${product.name} の撮影が完了しました`,
        userId: user.id,
        productId,
        metadata: JSON.stringify({
          photosCount: photos?.length || 0,
          notes,
        }),
      },
    });

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct,
      message: '撮影データを登録しました'
    });
  } catch (error) {
    console.error('Photography registration error:', error);
    return NextResponse.json(
      { error: '撮影データ登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    const productId = params.id;

    const body = await request.json();
    const { photographyCompleted } = body;

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

    // Update metadata
    const currentMetadata = product.metadata ? JSON.parse(product.metadata) : {};
    const updatedMetadata = {
      ...currentMetadata,
      photographyCompleted: !!photographyCompleted,
      ...(photographyCompleted && {
        photographyDate: new Date().toISOString(),
        photographyBy: user.username,
      }),
    };

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        metadata: JSON.stringify(updatedMetadata),
      },
    });

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct,
      message: '撮影ステータスを更新しました'
    });
  } catch (error) {
    console.error('Photography status update error:', error);
    return NextResponse.json(
      { error: '撮影ステータス更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}