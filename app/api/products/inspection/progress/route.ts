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