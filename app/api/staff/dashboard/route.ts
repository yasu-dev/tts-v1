import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // 開発環境では、モックデータファイルを読み込む
    // 本番環境では、Prismaクエリに置き換える
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // モックデータファイルを読み込む
      const filePath = path.join(process.cwd(), 'data', 'staff-mock.json');
      const fileContents = await fs.readFile(filePath, 'utf8');
      const staffData = JSON.parse(fileContents);
      
      return NextResponse.json(staffData);
    } else {
      // 本番環境用のデータ（将来的にPrismaクエリに置き換え）
      const staffData = {
        staffTasks: {
          urgentTasks: [],
          normalTasks: []
        },
        staffStats: {
          daily: {
            tasksCompleted: 0,
            inspectionsCompleted: 0,
            shipmentsProcessed: 0,
            returnsProcessed: 0,
            totalRevenue: '¥0'
          },
          weekly: {
            efficiency: 0,
            qualityScore: 0,
            customerSatisfaction: 0
          }
        }
      };
      
      return NextResponse.json(staffData);
    }
  } catch (error) {
    console.error('Staff dashboard data fetch error:', error);
    return NextResponse.json(
      { error: 'スタッフデータの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 