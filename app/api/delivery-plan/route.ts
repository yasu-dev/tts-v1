import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 認証チェック（セラーのみ）
    const user = await AuthService.requireRole(request, ['seller']);

    const planData = await request.json();

    // 基本的なバリデーション
    if (!planData.basicInfo?.sellerName || !planData.basicInfo?.deliveryAddress) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    if (!planData.products || planData.products.length === 0) {
      return NextResponse.json(
        { error: '商品が登録されていません' },
        { status: 400 }
      );
    }

    // 納品プランIDを生成
    const planId = `DP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // デモ用のレスポンス（実際の実装では、データベースに保存）
    const deliveryPlan = {
      id: planId,
      sellerId: user.id,
      basicInfo: planData.basicInfo,
      products: planData.products,
      confirmation: planData.confirmation,
      status: 'pending',
      createdAt: new Date().toISOString(),
      totalValue: planData.products.reduce((sum: number, product: any) => 
        sum + (product.estimatedValue || 0), 0
      ),
    };

    // バーコード生成フラグがtrueの場合、PDF URLを生成
    let pdfUrl = null;
    if (planData.confirmation?.generateBarcodes) {
      // 実際の実装では、PDFを生成してURLを返す
      pdfUrl = `/api/delivery-plan/${planId}/barcode-pdf`;
    }

    console.log('[INFO] 納品プラン作成成功:', {
      planId,
      sellerName: planData.basicInfo.sellerName,
      productCount: planData.products.length,
      totalValue: deliveryPlan.totalValue
    });

    return NextResponse.json({
      success: true,
      planId,
      pdfUrl,
      message: '納品プランが正常に作成されました',
      deliveryPlan
    });

  } catch (error) {
    console.error('[ERROR] 納品プラン作成エラー:', error);
    return NextResponse.json(
      { error: '納品プランの作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const user = await AuthService.requireRole(request, ['seller', 'staff']);

    // デモ用の納品プラン一覧
    const deliveryPlans = [
      {
        id: 'DP-1234567890-abc123',
        sellerId: user.id,
        sellerName: 'サンプルセラー',
        status: 'pending',
        productCount: 3,
        totalValue: 450000,
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'DP-1234567891-def456',
        sellerId: user.id,
        sellerName: 'サンプルセラー',
        status: 'processing',
        productCount: 1,
        totalValue: 120000,
        createdAt: '2024-01-14T14:20:00Z'
      }
    ];

    return NextResponse.json({
      success: true,
      deliveryPlans
    });

  } catch (error) {
    console.error('[ERROR] 納品プラン取得エラー:', error);
    return NextResponse.json(
      { error: '納品プランの取得に失敗しました' },
      { status: 500 }
    );
  }
} 