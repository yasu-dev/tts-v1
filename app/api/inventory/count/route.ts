import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { mode, locations, startedBy } = await request.json();
    
    // モックデータでの処理
    const countResult = {
      success: true,
      countId: `COUNT-${Date.now()}`,
      mode,
      locations,
      startedBy,
      startedAt: new Date().toISOString(),
      message: `棚卸しを開始しました (${mode === 'full' ? '全棚卸し' : '部分棚卸し'})`
    };
    
    return NextResponse.json(countResult);
  } catch (error) {
    return NextResponse.json(
      { error: '棚卸しの開始に失敗しました' },
      { status: 500 }
    );
  }
} 