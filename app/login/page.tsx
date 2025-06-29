'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'ログインに失敗しました');
        setIsLoading(false);
        return;
      }

      // ログイン成功 - ユーザーのロールに基づいてリダイレクト
      if (data.user.role === 'staff') {
        router.push('/staff/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
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
            <div className="mx-auto h-24 w-24 rounded-2xl flex items-center justify-center shadow-2xl mb-6 border-4 border-[rgba(0,100,210,0.25)]"
              style={{
                background: 'linear-gradient(135deg, #FFCE00 0%, #E53238 20%, #86B817 40%, #7B1FA2 60%, #00BCD4 80%, #0064D2 100%)',
                boxShadow: '0 0 30px rgba(255, 206, 0, 0.6), 0 8px 32px rgba(0, 100, 210, 0.4)'
              }}
            >
              <div className="text-white text-3xl font-black font-display">TWD</div>
            </div>
            <h2 className="text-4xl font-display font-black text-[#0064D2] mb-2">THE WORLD DOOR</h2>
            <p className="text-lg text-[#666666] font-display">
              フルフィルメント・ビジネス・ターミナル
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
                  セラー
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
                  スタッフ
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
                  <label htmlFor="email" className="block text-sm font-bold text-[#1A1A1A] mb-2">
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
                  <label htmlFor="password" className="block text-sm font-bold text-[#1A1A1A] mb-2">
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-[#0064D2] focus:ring-[#0064D2] border-[rgba(0,100,210,0.25)] rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-[#666666]">
                      ログイン状態を保持
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-[#0064D2] hover:text-[#0078FF] transition-colors">
                      パスワードを忘れた？
                    </a>
                  </div>
                </div>

                <div>
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
                        認証中...
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        ログイン
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-[rgba(248,250,254,0.97)] rounded-xl border border-[rgba(0,100,210,0.25)]">
                <p className="text-xs text-[#666666] mb-3 font-bold">
                  <svg className="w-4 h-4 mr-1 inline-block text-[#0064D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  テスト用ログイン情報
                </p>
                <div className="space-y-2 text-xs">
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

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center">
              <div className="action-orb green mx-auto mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-xs text-[#666666] font-bold">高セキュリティ</p>
            </div>
            <div className="text-center">
              <div className="action-orb blue mx-auto mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-xs text-[#666666] font-bold">高速処理</p>
            </div>
            <div className="text-center">
              <div className="action-orb red mx-auto mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-[#666666] font-bold">24時間対応</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}