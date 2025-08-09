import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 一時的な固定トークン認証
    const token = request.cookies.get('auth-token')?.value;
    
    if (token === 'fixed-auth-token-12345') {
      // 固定ユーザー情報を返す
      const mockUser = {
        id: 'seller-1',
        email: 'seller@example.com',
        username: 'seller',
        role: 'seller',
        fullName: 'テストセラー',
        phoneNumber: '090-1234-5678',
        address: '東京都渋谷区1-1-1',
      };

      return NextResponse.json({
        success: true,
        user: mockUser,
      });
    }

    const user = await AuthService.getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: '認証が必要です',
          authenticated: false 
        },
        { status: 200 }
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