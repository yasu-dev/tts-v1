'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient, API_CONFIG } from '@/lib/api-config';

export default function LoginPage() {
  const [userType, setUserType] = useState<'seller' | 'staff'>('seller');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const data = await ApiClient.post<{ success: boolean; user?: any; error?: string }>(
        API_CONFIG.endpoints.auth.login,
        { email, password }
      );

      if (data.success && data.user) {
        // ユーザータイプに基づいてリダイレクト
        if (data.user.role === 'staff') {
          router.push('/staff/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'ログインに失敗しました');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFE]">
      {/* Global background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 15% 85%, rgba(0, 100, 210, 0.08) 0%, transparent 40%),
              radial-gradient(circle at 85% 15%, rgba(229, 50, 56, 0.06) 0%, transparent 40%),
              radial-gradient(circle at 35% 65%, rgba(255, 206, 0, 0.04) 0%, transparent 40%),
              radial-gradient(circle at 65% 35%, rgba(134, 184, 23, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 25% 25%, rgba(123, 31, 162, 0.03) 0%, transparent 40%),
              radial-gradient(circle at 75% 75%, rgba(0, 188, 212, 0.07) 0%, transparent 40%)
            `
          }}
        />
        <div className="absolute inset-0 opacity-40"
          style={{
            background: `
              linear-gradient(90deg, rgba(0, 100, 210, 0.04) 1px, transparent 1px),
              linear-gradient(0deg, rgba(0, 100, 210, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <h2 className="text-4xl font-black text-black mb-2" style={{fontFamily: 'Poppins, Montserrat, sans-serif'}}>THE WORLD DOOR</h2>
            <p className="text-lg text-[#666666]" style={{fontFamily: 'Noto Sans JP, ヒラギノ角ゴ W4 JIS2004, sans-serif'}}>
              フルフィルメントサービス
            </p>
          </div>

          {/* Login Form */}
          <div className="intelligence-card global">
            <div className="p-8">
              {/* User Type Selector */}
              <div className="flex rounded-2xl bg-[rgba(255,255,255,0.5)] p-1 mb-8 border border-[rgba(0,100,210,0.25)]">
                <button
                  type="button"
                  onClick={() => setUserType('seller')}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${
                    userType === 'seller'
                      ? 'bg-gradient-to-r from-[#0064D2] to-[#0078FF] text-white shadow-lg transform scale-105'
                      : 'text-[#999999] hover:text-[#1A1A1A]'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span style={{fontFamily: 'Noto Sans JP, ヒラギノ角ゴ W4 JIS2004, sans-serif'}}>セラー</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('staff')}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${
                    userType === 'staff'
                      ? 'bg-gradient-to-r from-[#FFCE00] to-[#E53238] text-[#1A1A1A] shadow-lg transform scale-105'
                      : 'text-[#999999] hover:text-[#1A1A1A]'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span style={{fontFamily: 'Noto Sans JP, ヒラギノ角ゴ W4 JIS2004, sans-serif'}}>スタッフ</span>
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-[rgba(229,50,56,0.1)] border border-[rgba(229,50,56,0.25)] text-[#E53238] p-4 rounded-lg text-sm font-medium">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-[#1A1A1A] mb-2" style={{fontFamily: 'Noto Sans JP, ヒラギノ角ゴ W4 JIS2004, sans-serif'}}>
                    <svg className="w-4 h-4 mr-2 inline-block text-[#0064D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-3 border-[rgba(0,100,210,0.35)] rounded-lg bg-[rgba(255,255,255,0.97)] text-[#1A1A1A] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0064D2] transition-all duration-300"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-[#1A1A1A] mb-2" style={{fontFamily: 'Noto Sans JP, ヒラギノ角ゴ W4 JIS2004, sans-serif'}}>
                    <svg className="w-4 h-4 mr-2 inline-block text-[#0064D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    パスワード
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-3 border-[rgba(0,100,210,0.35)] rounded-lg bg-[rgba(255,255,255,0.97)] text-[#1A1A1A] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0064D2] transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>

                {/* Remember Me Checkbox - Moved above */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#0064D2] focus:ring-[#0064D2] border-[rgba(0,100,210,0.25)] rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-[#666666] cursor-pointer select-none" style={{fontFamily: 'Noto Sans JP, ヒラギノ角ゴ W4 JIS2004, sans-serif'}}>
                    ログイン状態を保持する
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`nexus-button w-full flex justify-center items-center py-4 text-lg font-bold transition-all duration-300 ${
                      userType === 'seller' 
                        ? 'bg-gradient-to-r from-[#0064D2] to-[#0078FF] text-white border-3 border-[rgba(0,100,210,0.35)] hover:shadow-lg hover:transform hover:scale-105' 
                        : 'bg-gradient-to-r from-[#FFCE00] to-[#E53238] text-[#1A1A1A] border-3 border-[rgba(255,206,0,0.35)] hover:shadow-lg hover:transform hover:scale-105'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full mr-3"></div>
                        <span style={{fontFamily: 'Noto Sans JP, ヒラギノ角ゴ W4 JIS2004, sans-serif'}}>認証中...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span style={{fontFamily: 'Noto Sans JP, ヒラギノ角ゴ W4 JIS2004, sans-serif'}}>ログイン</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Password Reset Link - Moved below button */}
                <div className="text-center pt-3">
                  <a 
                    href="#" 
                    className="text-sm font-medium text-[#0064D2] hover:text-[#0078FF] transition-colors inline-flex items-center gap-1" 
                    style={{fontFamily: 'Noto Sans JP, ヒラギノ角ゴ W4 JIS2004, sans-serif'}}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 11-4 0 2 2 0 014 0zm0 0v1a2 2 0 01-2 2H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    パスワードをお忘れですか？
                  </a>
                </div>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-[rgba(248,250,254,0.97)] rounded-xl border border-[rgba(0,100,210,0.25)]">
                <p className="text-xs text-[#666666] mb-3 font-bold" style={{fontFamily: 'Noto Sans JP, ヒラギノ角ゴ W4 JIS2004, sans-serif'}}>
                  <svg className="w-4 h-4 mr-1 inline-block text-[#0064D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  テスト用ログイン情報
                </p>
                <div className="space-y-2 text-xs" style={{fontFamily: 'Noto Sans JP, ヒラギノ角ゴ W4 JIS2004, sans-serif'}}>
                  <div className="flex justify-between">
                    <span className="text-[#999999]">セラー:</span>
                    <span className="text-[#1A1A1A] font-mono">seller@example.com / password123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#999999]">スタッフ:</span>
                    <span className="text-[#1A1A1A] font-mono">staff@example.com / password123</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}