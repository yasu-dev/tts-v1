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

    // 商品情報を取得
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // ラベルデータを生成（実際のラベル生成ロジックはここに実装）
    const labelData = {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      model: product.model,
      barcode: product.sku, // SKUをバーコードとして使用
      generatedAt: new Date().toISOString(),
      generatedBy: user.username
    };

    // ラベルPDF生成（モック実装）
    const labelUrl = `/api/pdf/generate?type=product_label&productId=${productId}`;

    // アクティビティログ記録
    await prisma.activity.create({
      data: {
        type: 'label_generated',
        description: `商品 ${product.name} のラベルを生成しました`,
        userId: user.id,
        productId: product.id,
        metadata: JSON.stringify(labelData)
      }
    });

    return NextResponse.json({
      success: true,
      labelData,
      labelUrl,
      message: '商品ラベルを生成しました'
    });

  } catch (error) {
    console.error('Label generation error:', error);
    return NextResponse.json(
      { 
        error: 'ラベル生成中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}