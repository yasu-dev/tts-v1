import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  console.log('[DEBUG] GET /api/products/inspection/progress/[productId] called with:', params);
  
  try {
    const { productId } = params;
    
    if (!productId) {
      console.log('[ERROR] Product ID is missing from params');
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('[DEBUG] Attempting to connect to database...');
    await prisma.$connect();
    console.log('[DEBUG] Database connected successfully');

    // データベースから進捗データを取得
    console.log(`[DEBUG] Searching for progress data for product: ${productId}`);
    const progressData = await prisma.inspectionProgress.findUnique({
      where: {
        productId: productId
      }
    });
    
    if (!progressData) {
      console.log(`[INFO] No progress data found for product ${productId}`);
      return NextResponse.json(
        { error: 'No progress data found' },
        { status: 404 }
      );
    }
    
    console.log(`[INFO] Progress loaded from database for product ${productId}, step ${progressData.currentStep}`);
    
    // レスポンス用にデータを整形
    const responseData = {
      productId: progressData.productId,
      currentStep: progressData.currentStep,
      checklist: progressData.checklist ? JSON.parse(progressData.checklist) : null,
      photos: progressData.photos ? JSON.parse(progressData.photos) : [],
      notes: progressData.notes || '',
      videoId: progressData.videoId,
      lastUpdated: progressData.updatedAt.toISOString(),
      status: 'inspecting'
    };
    
    return NextResponse.json(responseData);
    
  } catch (error: any) {
    console.error('[ERROR] Progress load error - Full details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to load progress',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  } finally {
    console.log('[DEBUG] Disconnecting from database...');
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // データベースから進捗データを削除（検品完了時などに使用）
    const deletedProgress = await prisma.inspectionProgress.delete({
      where: {
        productId: productId
      }
    }).catch(() => null); // エラーでも処理継続
    
    console.log(`[INFO] Progress cleared from database for product ${productId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Progress cleared successfully'
    });
    
  } catch (error) {
    console.error('[ERROR] Progress clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear progress' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}