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
    
    if (!planData.basicInfo?.deliveryAddress) {
      return NextResponse.json(
        { error: '納品先住所は必須です。' },
        { status: 400 }
      );
    }

    if (!planData.basicInfo?.contactEmail) {
      return NextResponse.json(
        { error: '連絡先メールアドレスは必須です。' },
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

    // データベーストランザクション内で納品プランと商品を保存
    const deliveryPlan = await prisma.$transaction(async (tx) => {
      // 1. 納品プランをデータベースに保存
      const savedPlan = await tx.deliveryPlan.create({
        data: {
          id: planId,
          planNumber: planId,
          sellerId: user.id,
          sellerName: user.username || user.email,
          deliveryAddress: planData.basicInfo.deliveryAddress,
          contactEmail: planData.basicInfo.contactEmail,
          phoneNumber: planData.basicInfo.phoneNumber || null,
          status: '作成完了',
          totalItems: planData.products.length,
          totalValue: planData.products.reduce((sum: number, product: any) => 
            sum + (product.estimatedValue || 0), 0
          ),
          notes: planData.confirmation?.notes
        }
      });

      // 2. 納品プランの商品をDeliveryPlanProductテーブルに保存
      const planProducts = await Promise.all(
        planData.products.map((product: any) => 
          tx.deliveryPlanProduct.create({
            data: {
              deliveryPlanId: planId,
              name: product.name,
              category: product.category,
              brand: product.brand || '',
              model: product.model || '',
              serialNumber: product.serialNumber,
              estimatedValue: product.estimatedValue || 0,
              description: product.description
            }
          })
        )
      );

      // 3. スタッフの在庫管理画面用にProductテーブルに「入荷待ち」商品を生成
      const createdProducts = await Promise.all(
        planData.products.map((product: any) => {
          const sku = `${planId}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
          
          return tx.product.create({
            data: {
              name: product.name,
              sku: sku,
              category: product.category,
              status: 'inbound', // 入荷待ちステータス
              price: product.estimatedValue || 0,
              condition: 'unknown', // 検品前なので状態不明
              description: `納品プラン ${planId} からの入庫予定商品。${product.description || ''}`,
              sellerId: user.id,
              metadata: JSON.stringify({
                deliveryPlanId: planId,
                brand: product.brand,
                model: product.model,
                serialNumber: product.serialNumber
              })
            }
          });
        })
      );

      return {
        ...savedPlan,
        products: planProducts,
        createdInventoryItems: createdProducts
      };
    });

    // バーコード生成フラグがtrueの場合、PDF URLを生成
    let pdfUrl = null;
    if (planData.confirmation?.generateBarcodes) {
      // 実際の実装では、PDFを生成してURLを返す
      pdfUrl = `/api/delivery-plan/${planId}/barcode-pdf`;
    }

    console.log('[INFO] 納品プラン作成成功:', {
      planId,
      deliveryAddress: planData.basicInfo.deliveryAddress,
      productCount: planData.products.length,
      totalValue: deliveryPlan.totalValue,
      createdInventoryItems: deliveryPlan.createdInventoryItems.length
    });

    return NextResponse.json({
      success: true,
      planId,
      pdfUrl,
      message: '納品プランが正常に作成されました。スタッフの在庫管理画面に「入荷待ち」商品が登録されました。',
      deliveryPlan: {
        id: deliveryPlan.id,
        sellerId: deliveryPlan.sellerId,
        status: deliveryPlan.status,
        totalValue: deliveryPlan.totalValue,
        createdAt: deliveryPlan.createdAt,
        inventoryItemsCreated: deliveryPlan.createdInventoryItems.length
      }
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