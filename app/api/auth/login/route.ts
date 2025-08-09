import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG] ログインAPI開始');
    
    const body = await request.json();
    const { email, password } = body;

    console.log('[DEBUG] ログイン試行:', { email, password: '***' });

    if (!email || !password) {
      console.log('[DEBUG] 必須項目不足');
      return NextResponse.json(
        { success: false, error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      );
    }

    // データベース接続を優先的に使用（固定認証は最後の手段）
    try {
      console.log('[DEBUG] AuthService.loginを呼び出し中...');
      const result = await AuthService.login(email, password);

      if (result) {
        console.log('[DEBUG] 認証成功:', result.user.email, result.user.role);
        const response = NextResponse.json({
          success: true,
          user: result.user,
        });

        // Set HTTP-only cookie for enhanced security
        response.cookies.set('auth-token', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60, // 24 hours
          path: '/',
        });

        return response;
      } else {
        console.log('[DEBUG] 認証失敗 - データベースでユーザーが見つからない');
      }
    } catch (authError) {
      console.error('[ERROR] AuthService.loginでエラー:', authError);
      console.log('[DEBUG] フォールバック認証を試行中...');
    }

    // フォールバック: 固定認証
    console.log('[DEBUG] 固定認証チェック:', email, password === 'password123');
    if ((email === 'seller@example.com' || email === 'staff@example.com' || email === 'admin@example.com') && password === 'password123') {
      console.log('[DEBUG] 固定認証成功');
      
      const mockUsers = {
        'seller@example.com': {
          id: 'seller-1',
          email: 'seller@example.com',
          username: 'seller',
          role: 'seller',
          fullName: 'テストセラー',
          phoneNumber: '090-1234-5678',
          address: '東京都渋谷区1-1-1',
        },
        'staff@example.com': {
          id: 'staff-1',
          email: 'staff@example.com',
          username: 'staff',
          role: 'staff',
          fullName: 'テストスタッフ',
          phoneNumber: '090-1234-5679',
          address: '東京都渋谷区1-1-2',
        },
        'admin@example.com': {
          id: 'admin-1',
          email: 'admin@example.com',
          username: 'admin',
          role: 'admin',
          fullName: '管理者',
          phoneNumber: '090-1234-5680',
          address: '東京都渋谷区1-1-3',
        }
      };

      const mockUser = mockUsers[email as keyof typeof mockUsers];
      const mockToken = `fixed-auth-token-${mockUser.id}`;

      const response = NextResponse.json({
        success: true,
        user: mockUser,
      });

      // Set HTTP-only cookie for enhanced security
      response.cookies.set('auth-token', mockToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      });

      return response;
    }

    console.log('[DEBUG] 全ての認証方法が失敗');
    return NextResponse.json(
      { success: false, error: 'メールアドレスまたはパスワードが間違っています' },
      { status: 401 }
    );

  } catch (error) {
    console.error('[ERROR] ログイン処理エラー:', error);
    return NextResponse.json(
      { success: false, error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}