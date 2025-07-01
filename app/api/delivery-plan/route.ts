import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { basicInfo, products, confirmation } = body;

    // バリデーション
    if (!basicInfo || !products || products.length === 0) {
      return NextResponse.json(
        { error: '必須情報が不足しています' },
        { status: 400 }
      );
    }

    // SKU生成とDB保存（実際の実装では Prisma を使用）
    const generatedProducts = products.map((product: any, index: number) => ({
      ...product,
      sku: `TWD-${Date.now()}-${index.toString().padStart(3, '0')}`,
      barcode: `${Date.now()}${index.toString().padStart(3, '0')}`,
    }));

    // PDF生成
    let pdfUrl = null;
    if (confirmation.generateBarcodes) {
      const labels = generatedProducts.map((p: any) => ({
        sku: p.sku,
        name: p.name,
        barcode: p.barcode,
      }));
      
      // 実際の実装では、生成したPDFをS3等にアップロード
      pdfUrl = `/api/delivery-plan/pdf/${Date.now()}`;
    }

    return NextResponse.json({
      success: true,
      planId: `PLAN-${Date.now()}`,
      products: generatedProducts,
      pdfUrl,
    });
  } catch (error) {
    console.error('[ERROR] Delivery Plan:', error);
    return NextResponse.json(
      { error: '納品プランの作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 