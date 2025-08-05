import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 全ての進捗データを取得
    const allProgress = await prisma.inspectionProgress.findMany({
      select: {
        productId: true,
        currentStep: true,
        updatedAt: true
      }
    });
    
    // productIdをキーとするMapに変換
    const progressMap = new Map();
    allProgress.forEach(progress => {
      progressMap.set(progress.productId, {
        currentStep: progress.currentStep,
        lastUpdated: progress.updatedAt.toISOString()
      });
    });
    
    console.log(`[INFO] Loaded ${allProgress.length} progress records from database`);
    
    return NextResponse.json({
      success: true,
      data: Object.fromEntries(progressMap)
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to load all progress data:', error);
    return NextResponse.json(
      { error: 'Failed to load progress data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}