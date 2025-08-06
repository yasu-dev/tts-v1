import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    const body = await request.json();
    const { locationCode } = body;

    if (!locationCode) {
      return NextResponse.json(
        { error: '棚番号が必要です' },
        { status: 400 }
      );
    }

    // 棚情報を検索
    let location = await prisma.location.findUnique({
      where: { code: locationCode }
    });

    // 見つからない場合はモックデータで対応（開発用）
    if (!location) {
      // 棚番号のフォーマットをチェック（例: A-01-001）
      const locationPattern = /^[A-Z]-\d{2}-\d{3}$/;
      if (!locationPattern.test(locationCode)) {
        return NextResponse.json(
          { error: '無効な棚番号フォーマットです（例: A-01-001）' },
          { status: 400 }
        );
      }

      // モック棚データを生成
      const zone = locationCode.charAt(0);
      const shelf = locationCode.substring(2, 4);
      const position = locationCode.substring(5, 8);

      location = {
        id: `loc-${locationCode.replace(/[^A-Z0-9]/g, '').toLowerCase()}`,
        code: locationCode,
        name: `${zone}ゾーン ${shelf}番棚 ${position}`,
        zone: `${zone}ゾーン`,
        type: 'shelf',
        capacity: 20,
        currentCount: Math.floor(Math.random() * 15), // ランダムな現在数
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;
    }

    // 現在の商品数を取得（実際のDBから）
    const currentProducts = await prisma.product.findMany({
      where: { currentLocationId: location.id }
    });

    const locationData = {
      id: location.id,
      code: location.code,
      name: location.name,
      zone: location.zone || `${location.code.charAt(0)}ゾーン`,
      capacity: location.capacity || 20,
      currentCount: currentProducts.length
    };

    // アクティビティログ記録
    await prisma.activity.create({
      data: {
        type: 'location_validated',
        description: `棚番号 ${locationCode} を検証しました`,
        userId: user.id,
        metadata: JSON.stringify({
          locationCode,
          locationId: location.id,
          currentCount: locationData.currentCount,
          capacity: locationData.capacity
        })
      }
    });

    return NextResponse.json(locationData);

  } catch (error) {
    console.error('Location validation error:', error);
    return NextResponse.json(
      { 
        error: '棚番号検証中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}