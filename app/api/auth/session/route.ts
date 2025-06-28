import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'セッション確認中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clean up expired sessions (maintenance endpoint)
    await AuthService.cleanExpiredSessions();

    return NextResponse.json({
      success: true,
      message: '期限切れセッションを削除しました',
    });
  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json(
      { error: 'セッション削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}