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
    let user;
    try {
      user = await AuthService.requireRole(request, ['seller']);
    } catch (authError) {
      console.error('[ERROR] 認証エラー:', authError);
      return NextResponse.json(
        { error: 'ログインが必要です。再度ログインしてください。' },
        { status: 401 }
      );
    }

    const planData = await request.json();

    // 基本的なバリデーション（デモ環境対応）
    console.log('[DEBUG] 受信データ:', JSON.stringify(planData, null, 2));
    
    if (!planData.basicInfo?.warehouseId || !planData.basicInfo?.deliveryAddress) {
      return NextResponse.json(
        { error: '配送先倉庫と納品先住所は必須です。倉庫を選択してください。' },
        { status: 400 }
      );
    }

    if (!planData.products || planData.products.length === 0) {
      return NextResponse.json(
        { error: '商品が登録されていません。商品登録ステップで商品を追加してください。' },
        { status: 400 }
      );
    }

    // 商品データのバリデーション（デモ環境対応）
    const validProducts = planData.products.filter((product: any) => 
      product && typeof product === 'object' && product.name
    );
    
    if (validProducts.length === 0) {
      return NextResponse.json(
        { error: '有効な商品データがありません。商品登録ステップで商品名を入力してください。' },
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
      warehouseName: planData.basicInfo.warehouseName,
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
    // 認証チェック（セラーのみ）
    let user;
    try {
      user = await AuthService.requireRole(request, ['seller', 'staff']);
    } catch (authError) {
      console.error('[ERROR] 認証エラー:', authError);
      return NextResponse.json(
        { error: 'ログインが必要です。再度ログインしてください。' },
        { status: 401 }
      );
    }

    // URLパラメータを解析
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    // Prismaを使用して納品プランデータを取得
    const where: any = {};
    
    // スタッフの場合は全データ、セラーの場合は自分のデータのみ
    if (user.role === 'seller') {
      where.sellerId = user.id;
    }

    // ステータスフィルター
    if (status) {
      where.status = status;
    }

    // 検索フィルター（SQLiteでは contains の代わりに contains を使用）
    if (search) {
      where.OR = [
        { planNumber: { contains: search, mode: 'insensitive' } },
        { sellerName: { contains: search, mode: 'insensitive' } },
        { deliveryAddress: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [deliveryPlans, totalCount] = await Promise.all([
      prisma.deliveryPlan.findMany({
        where,
        include: {
          products: true,
          seller: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.deliveryPlan.count({ where })
    ]);

    // フロントエンドで期待される形式に変換
    const formattedPlans = deliveryPlans.map(plan => ({
      id: plan.id,
      deliveryId: plan.planNumber,
      date: plan.createdAt.toISOString().split('T')[0],
      status: plan.status,
      items: plan.totalItems,
      value: plan.totalValue,
      sellerName: plan.sellerName,
      sellerId: plan.sellerId,
      deliveryAddress: plan.deliveryAddress,
      contactEmail: plan.contactEmail,
      phoneNumber: plan.phoneNumber,
      notes: plan.notes,
      products: plan.products.map(product => ({
        name: product.name,
        category: product.category,
        brand: product.brand,
        model: product.model,
        serialNumber: product.serialNumber,
        estimatedValue: product.estimatedValue,
        description: product.description
      }))
    }));

    return NextResponse.json({
      success: true,
      deliveryPlans: formattedPlans,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('[ERROR] 納品プラン取得エラー:', error);
    
    // Prismaエラーの場合はフォールバックデータを使用
    if (MockFallback.isPrismaError(error)) {
      console.log('Using fallback data for delivery plans due to Prisma error');
      try {
        const fallbackData = {
          success: true,
          deliveryPlans: [],
          pagination: {
            total: 0,
            limit: 20,
            offset: 0,
            hasMore: false
          }
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