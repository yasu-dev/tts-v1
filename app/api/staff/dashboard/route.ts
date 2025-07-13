import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MockFallback } from '@/lib/mock-fallback';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Prismaを使用してスタッフダッシュボードデータを取得
    // TODO: 実際のPrismaクエリを実装する際は、以下のような構造になる
    // const tasks = await prisma.task.findMany({ where: { status: 'pending' } });
    // const stats = await prisma.staffActivity.aggregate(...);
    
    // 現在はモックデータを返す（Prismaスキーマが整備されるまで）
    const staffData = MockFallback.getStaffDashboardMockData();
    
    return NextResponse.json(staffData);
  } catch (error) {
    console.error('Staff dashboard data fetch error:', error);
    
    // Prismaエラーの場合はフォールバックデータを使用
    if (MockFallback.isPrismaError(error)) {
      console.log('Using fallback data for staff dashboard due to Prisma error');
      try {
        const fallbackData = MockFallback.getStaffDashboardMockData();
        return NextResponse.json(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback data error:', fallbackError);
      }
    }

    return NextResponse.json(
      { error: 'スタッフデータの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 