import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

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
    console.log('[DEBUG] 下書き保存データ:', JSON.stringify(planData, null, 2));

    // 下書きIDを生成
    const draftId = `DRAFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 基本情報の最小限バリデーション（下書きなので緩い）
    const deliveryAddress = planData.basicInfo?.deliveryAddress || '';
    const contactEmail = planData.basicInfo?.contactEmail || '';

    // データベースに下書きとして保存
    const draftPlan = await prisma.deliveryPlan.create({
      data: {
        id: draftId,
        planNumber: draftId,
        sellerId: user.id,
        sellerName: user.username || user.email,
        status: '下書き',
        deliveryAddress: deliveryAddress || '未入力',
        contactEmail: contactEmail || user.email, // デフォルトはユーザーのメール
        phoneNumber: planData.basicInfo?.phoneNumber || null,
        notes: planData.confirmation?.notes || null,
        totalItems: Array.isArray(planData.products) ? planData.products.length : 0,
        totalValue: Array.isArray(planData.products) 
          ? planData.products.reduce((sum: number, product: any) => 
              sum + (typeof product?.purchasePrice === 'number' ? product.purchasePrice : 0), 0
            )
          : 0,
        draftData: JSON.stringify(planData), // 下書きデータを JSON で保存
      }
    });

    console.log('[INFO] 下書き保存成功:', {
      draftId,
      sellerId: user.id,
      totalItems: draftPlan.totalItems,
      totalValue: draftPlan.totalValue
    });

    return NextResponse.json({
      success: true,
      draftId: draftPlan.id,
      message: '納品プランが下書きとして保存されました',
      plan: {
        id: draftPlan.id,
        status: draftPlan.status,
        createdAt: draftPlan.createdAt
      }
    });

  } catch (error) {
    console.error('[ERROR] 下書き保存エラー:', error);
    
    let errorMessage = '下書きの保存に失敗しました';
    let statusCode = 500;
    
    if (error instanceof Error) {
      console.error('[ERROR] 詳細:', error.stack);
      
      // データベース関連のエラー
      if (error.message.includes('database') || error.message.includes('prisma')) {
        errorMessage = 'データベースへの保存に失敗しました。しばらくしてから再度お試しください。';
      }
      // データ形式エラー
      else if (error.message.includes('JSON') || error.message.includes('parse')) {
        errorMessage = 'データの形式に問題があります。';
        statusCode = 400;
      }
      // 認証エラー
      else if (error.message.includes('auth') || error.message.includes('permission')) {
        errorMessage = '認証に失敗しました。再度ログインしてください。';
        statusCode = 401;
      }
      else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

// 下書きの更新
export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['seller']);
    const { draftId, planData } = await request.json();

    if (!draftId) {
      return NextResponse.json(
        { error: '下書きIDが必要です' },
        { status: 400 }
      );
    }

    // 既存の下書きを確認
    const existingDraft = await prisma.deliveryPlan.findFirst({
      where: {
        id: draftId,
        sellerId: user.id,
        status: '下書き'
      }
    });

    if (!existingDraft) {
      return NextResponse.json(
        { error: '下書きが見つかりません' },
        { status: 404 }
      );
    }

    // 下書きを更新
    const updatedDraft = await prisma.deliveryPlan.update({
      where: { id: draftId },
      data: {
        deliveryAddress: planData.basicInfo?.deliveryAddress || existingDraft.deliveryAddress,
        contactEmail: planData.basicInfo?.contactEmail || existingDraft.contactEmail,
        phoneNumber: planData.basicInfo?.phoneNumber,
        notes: planData.confirmation?.notes,
        totalItems: Array.isArray(planData.products) ? planData.products.length : 0,
        totalValue: Array.isArray(planData.products) 
          ? planData.products.reduce((sum: number, product: any) => 
              sum + (typeof product?.purchasePrice === 'number' ? product.purchasePrice : 0), 0
            )
          : 0,
        draftData: JSON.stringify(planData),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: '下書きが更新されました',
      plan: {
        id: updatedDraft.id,
        status: updatedDraft.status,
        updatedAt: updatedDraft.updatedAt
      }
    });

  } catch (error) {
    console.error('[ERROR] 下書き更新エラー:', error);
    
    let errorMessage = '下書きの更新に失敗しました';
    let statusCode = 500;
    
    if (error instanceof Error) {
      console.error('[ERROR] 更新詳細:', error.stack);
      
      // データベース関連のエラー
      if (error.message.includes('database') || error.message.includes('prisma')) {
        errorMessage = 'データベースの更新に失敗しました。しばらくしてから再度お試しください。';
      }
      // データ形式エラー
      else if (error.message.includes('JSON') || error.message.includes('parse')) {
        errorMessage = 'データの形式に問題があります。';
        statusCode = 400;
      }
      // レコードが見つからない
      else if (error.message.includes('not found')) {
        errorMessage = '更新対象の下書きが見つかりません。';
        statusCode = 404;
      }
      else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
