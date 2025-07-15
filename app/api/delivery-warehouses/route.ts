import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { MockFallback } from '@/lib/mock-fallback';

const mockWarehouses = [
  {
    id: 'warehouse-001',
    code: 'D-TOKYO-01',
    name: 'THE WORLD DOOR 東京本社倉庫',
    zone: 'D',
    address: '東京都渋谷区神宮前1-1-1 TWDビル B1F',
    phone: '03-1234-5678',
    email: 'tokyo@theworlddoor.com',
    notes: 'カメラ・レンズ専用倉庫',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'warehouse-002',
    code: 'D-OSAKA-01',
    name: 'THE WORLD DOOR 大阪支社倉庫',
    zone: 'D',
    address: '大阪府大阪市北区梅田2-2-2 TWD関西ビル 3F',
    phone: '06-5678-9012',
    email: 'osaka@theworlddoor.com',
    notes: '時計・アクセサリー専用倉庫',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'warehouse-003',
    code: 'D-NAGOYA-01',
    name: 'THE WORLD DOOR 名古屋営業所',
    zone: 'D',
    address: '愛知県名古屋市中区栄3-3-3 TWD中部ビル 2F',
    phone: '052-9876-5432',
    email: 'nagoya@theworlddoor.com',
    notes: '中部地区集約倉庫',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export async function GET() {
  try {
    // 現在はモックデータを返す
    console.log('Using mock data for delivery warehouses');
    return NextResponse.json(mockWarehouses);
  } catch (error) {
    console.error('Delivery warehouse fetch error:', error);
    return NextResponse.json(
      { error: '配送先倉庫取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '権限が不足しています' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, address, phone, email, notes } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: '倉庫名と住所は必須です' },
        { status: 400 }
      );
    }

    // モックの場合は成功として扱う
    const newWarehouse = {
      id: 'mock-' + Date.now(),
      code: `D-MOCK-${Date.now()}`,
      name,
      zone: 'D',
      address,
      phone: phone || null,
      email: email || null,
      notes: notes || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json({ 
      success: true, 
      warehouse: newWarehouse,
      message: '倉庫が正常に作成されました（デモモード）'
    }, { status: 201 });

  } catch (error) {
    console.error('Delivery warehouse creation error:', error);
    return NextResponse.json(
      { error: '倉庫作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '権限が不足しています' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, address, phone, email, notes, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: '倉庫IDが必要です' },
        { status: 400 }
      );
    }

    // モックの場合は成功として扱う
    const updatedWarehouse = {
      id,
      code: `D-UPDATED-${Date.now()}`,
      name: name || 'テスト倉庫',
      zone: 'D',
      address: address || 'テスト住所',
      phone: phone || null,
      email: email || null,
      notes: notes || null,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date()
    };

    return NextResponse.json({ 
      success: true, 
      warehouse: updatedWarehouse,
      message: '倉庫情報が正常に更新されました（デモモード）'
    });

  } catch (error) {
    console.error('Delivery warehouse update error:', error);
    return NextResponse.json(
      { error: '倉庫更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '権限が不足しています' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '倉庫IDが必要です' },
        { status: 400 }
      );
    }

    // モックの場合は成功として扱う
    return NextResponse.json({ 
      success: true,
      message: '倉庫が正常に削除されました（デモモード）'
    });

  } catch (error) {
    console.error('Delivery warehouse deletion error:', error);
    return NextResponse.json(
      { error: '倉庫削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 