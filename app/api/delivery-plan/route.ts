import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';
import { MockFallback } from '@/lib/mock-fallback';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

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

    // Prismaを使用して納品プランデータを取得
    // TODO: 実際のPrismaクエリを実装する際は、以下のような構造になる
    // const deliveryPlans = await prisma.deliveryPlan.findMany({
    //   where: { sellerId: user.id },
    //   include: { products: true }
    // });

    // 現在はJSONファイルからデータを読み込む（Prismaスキーマが整備されるまで）
    const filePath = path.join(process.cwd(), 'data', 'seller-mock.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const sellerData = JSON.parse(fileContents);
    
    // 納品プランデータを抽出
    const deliveryPlans = sellerData.delivery.plans;

    return NextResponse.json({
      success: true,
      deliveryPlans
    });

  } catch (error) {
    console.error('[ERROR] 納品プラン取得エラー:', error);
    
    // Prismaエラーやファイル読み込みエラーの場合はフォールバックデータを使用
    if (MockFallback.isPrismaError(error)) {
      console.log('Using fallback data for delivery plans due to Prisma error');
      try {
        const fallbackData = {
          success: true,
          deliveryPlans: []
        };
        return NextResponse.json(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback data error:', fallbackError);
      }
    }
    
    return NextResponse.json(
      { error: '納品プランの取得に失敗しました' },
      { status: 500 }
    );
  }
} 