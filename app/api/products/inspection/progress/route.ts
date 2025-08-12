import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProgressData {
  productId: string;
  currentStep: number;
  checklist: any;
  photos: string[];
  notes: string;
  videoId?: string | null;
  lastUpdated: string;
  status: string;
}

export async function POST(request: NextRequest) {
  console.log('[DEBUG] POST /api/products/inspection/progress called');
  
  try {
    const progressData: ProgressData = await request.json();
    console.log('[DEBUG] Progress data received:', progressData);
    
    if (!progressData.productId) {
      console.log('[ERROR] Product ID is missing');
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('[DEBUG] Attempting to connect to database...');
    
    // データベース接続テスト
    await prisma.$connect();
    console.log('[DEBUG] Database connected successfully');

    // データベースに進捗データを保存（upsert: 存在すれば更新、なければ作成）
    console.log('[DEBUG] Attempting upsert operation...');
    const savedProgress = await prisma.inspectionProgress.upsert({
      where: {
        productId: progressData.productId
      },
      update: {
        currentStep: progressData.currentStep,
        checklist: JSON.stringify(progressData.checklist),
        photos: JSON.stringify(progressData.photos),
        notes: progressData.notes || '',
        videoId: progressData.videoId,
        updatedAt: new Date()
      },
      create: {
        productId: progressData.productId,
        currentStep: progressData.currentStep,
        checklist: JSON.stringify(progressData.checklist),
        photos: JSON.stringify(progressData.photos),
        notes: progressData.notes || '',
        videoId: progressData.videoId
      }
    });

    // 進捗ステップに応じて商品のメインステータスも更新
    console.log('[DEBUG] Updating main product status based on progress step:', progressData.currentStep);
    
    let newStatus = 'inspection';  // デフォルト
    if (progressData.currentStep >= 4) {
      newStatus = 'storage';  // ステップ4完了で保管可能
    } else if (progressData.currentStep >= 1) {
      newStatus = 'inspection';  // ステップ1以上で検品中
    }

    // 商品ステータスの更新（進捗と同期）
    try {
      // まず現在の商品データを取得
      const currentProduct = await prisma.product.findUnique({
        where: { id: progressData.productId }
      });

      if (currentProduct) {
        let updatedMetadata = {};
        try {
          if (currentProduct.metadata) {
            updatedMetadata = typeof currentProduct.metadata === 'string'
              ? JSON.parse(currentProduct.metadata)
              : currentProduct.metadata;
          }
        } catch (e) {
          console.warn('[WARN] Failed to parse existing metadata, using empty object');
          updatedMetadata = {};
        }

        // ステップ4完了時はメタデータも更新
        if (progressData.currentStep >= 4) {
          updatedMetadata = {
            ...updatedMetadata,
            inspectionCompleted: true,
            inspectionCompletedAt: new Date().toISOString()
          };
        }

        await prisma.product.update({
          where: { id: progressData.productId },
          data: {
            status: newStatus,
            ...(progressData.currentStep >= 4 && {
              inspectedAt: new Date(),
              metadata: JSON.stringify(updatedMetadata)
            })
          }
        });
        console.log(`[INFO] Product status updated to: ${newStatus} for product: ${progressData.productId}`);
      }
    } catch (statusUpdateError) {
      console.error('[WARN] Failed to update product status:', statusUpdateError);
      // 進捗保存は成功しているのでエラーにはしない
    }
    
    console.log(`[INFO] Progress saved to database for product ${progressData.productId}, step ${progressData.currentStep}`, savedProgress);
    
    return NextResponse.json({
      success: true,
      message: 'Progress saved successfully',
      data: {
        ...progressData,
        id: savedProgress.id
      }
    });
    
  } catch (error: any) {
    console.error('[ERROR] Progress save error - Full details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to save progress',
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