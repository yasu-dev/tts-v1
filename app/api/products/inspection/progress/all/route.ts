import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);

    // 進行中の検品作業を取得（すべての進捗記録）
    const progressRecords = await prisma.inspectionProgress.findMany({
      orderBy: {
        updatedAt: 'desc'
      },
      take: 50 // 最大50件まで
    });

    // 商品情報を含めて返却
    const progressWithProducts = await Promise.all(
      progressRecords.map(async (progress) => {
        const product = await prisma.product.findUnique({
          where: { id: progress.productId },
          select: {
            id: true,
            name: true,
            sku: true,
            brand: true,
            model: true
          }
        });

        return {
          productId: progress.productId,
          currentStep: progress.currentStep,
          lastUpdated: progress.updatedAt.toISOString(),
          product
        };
      })
    );

    return NextResponse.json(progressWithProducts);

  } catch (error) {
    console.error('Get all progress error:', error);
    
    // 開発環境ではモックデータを返す
    if (process.env.NODE_ENV === 'development') {
      const mockProgress = [
        {
          productId: '002',
          currentStep: 2,
          lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分前
          product: {
            id: '002',
            name: 'Sony FE 24-70mm F2.8 GM',
            sku: 'TWD-2024-002',
            brand: 'Sony',
            model: 'SEL2470GM'
          }
        },
        {
          productId: '006',
          currentStep: 3,
          lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15分前
          product: {
            id: '006',
            name: 'Omega Seamaster Planet Ocean',
            sku: 'TWD-2024-006',
            brand: 'Omega',
            model: 'Seamaster'
          }
        }
      ];
      
      return NextResponse.json(mockProgress);
    }

    return NextResponse.json(
      { 
        error: '進行中作業の取得中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}