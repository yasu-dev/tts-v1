import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

// 撮影済み画像データを取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const productId = params.id;
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

    // metadataから撮影データを取得
    const metadata = product.metadata ? JSON.parse(product.metadata) : {};
    const photos = metadata.photos || [];
    const photographyCompleted = metadata.photographyCompleted || false;

    return NextResponse.json({
      success: true,
      data: {
        productId,
        photos,
        photographyCompleted,
        photographyDate: metadata.photographyDate,
        photographyBy: metadata.photographyBy,
        totalCount: photos.length
      }
    });

  } catch (error) {
    console.error('[ERROR] Get Photography Data:', error);
    return NextResponse.json(
      { error: '撮影データの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

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

    // Update metadata to mark photography as completed and save photos
    const currentMetadata = product.metadata ? JSON.parse(product.metadata) : {};
    const updatedMetadata = {
      ...currentMetadata,
      photographyCompleted: true,
      photographyDate: new Date().toISOString(),
      photographyBy: user.username,
      photos: photos || [], // 撮影画像データを保存
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
        productId: productId,
        userId: user.id,
        type: 'photography_completed',
        description: `商品の撮影が完了しました（写真${photos?.length || 0}枚）`,
        metadata: JSON.stringify({
          photosCount: photos?.length || 0,
          notes: notes || '',
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: '撮影データが保存されました',
      data: {
        product: updatedProduct,
        photosCount: photos?.length || 0,
      },
    });

  } catch (error) {
    console.error('[ERROR] Save Photography Data:', error);
    return NextResponse.json(
      { error: '撮影データの保存中にエラーが発生しました' },
      { status: 500 }
    );
  }
}