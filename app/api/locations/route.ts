import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      orderBy: [
        { zone: 'asc' },
        { code: 'asc' },
      ],
      include: {
        _count: {
          select: { products: true },
        },
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
            createdAt: true,
            seller: {
              select: { username: true }
            }
          }
        }
      },
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Location fetch error:', error);
    
    return NextResponse.json(
      { error: 'ロケーション取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, name, zone, capacity } = body;

    if (!code || !name || !zone) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // Check for duplicate location code
    const existingLocation = await prisma.location.findUnique({
      where: { code },
    });

    if (existingLocation) {
      return NextResponse.json(
        { error: 'ロケーションコードが既に存在します' },
        { status: 409 }
      );
    }

    const location = await prisma.location.create({
      data: {
        code,
        name,
        zone,
        capacity: capacity ? parseInt(capacity) : null,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'location_create',
        description: `新しいロケーション ${code} (${name}) が作成されました`,
        userId: user.id,
        metadata: JSON.stringify({
          locationCode: code,
          zone,
        }),
      },
    });

    return NextResponse.json({ success: true, location }, { status: 201 });
  } catch (error) {
    console.error('Location creation error:', error);
    
    return NextResponse.json(
      { error: 'ロケーション作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, capacity, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ロケーションIDが必要です' },
        { status: 400 }
      );
    }

    const existingLocation = await prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      return NextResponse.json(
        { error: 'ロケーションが見つかりません' },
        { status: 404 }
      );
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(capacity !== undefined && { capacity: capacity ? parseInt(capacity) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'location_update',
        description: `ロケーション ${existingLocation.code} が更新されました`,
        userId: user.id,
        metadata: JSON.stringify({
          locationCode: existingLocation.code,
          changes: { name, capacity, isActive },
        }),
      },
    });

    return NextResponse.json({ success: true, location: updatedLocation });
  } catch (error) {
    console.error('Location update error:', error);
    
    return NextResponse.json(
      { error: 'ロケーション更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}