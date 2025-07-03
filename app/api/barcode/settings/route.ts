import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const settings = await request.json();
    
    // モックデータでの処理
    const result = {
      success: true,
      settings,
      savedAt: new Date().toISOString(),
      message: 'バーコードスキャナー設定を保存しました'
    };
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: '設定の保存に失敗しました' },
      { status: 500 }
    );
  }
} 