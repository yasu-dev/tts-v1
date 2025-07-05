'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
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
      // 簡易認証（テスト用）
      if (email === 'seller@example.com' && password === 'password123') {
        router.push('/dashboard');
      } else if (email === 'staff@example.com' && password === 'password123') {
        router.push('/staff/dashboard');
      } else {
        setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
      }
    } catch (error) {
      setError('ログインに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-nexus-background">
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
            <h2 className="text-4xl font-black text-nexus-text-primary mb-2 font-display">THE WORLD DOOR</h2>
            <p className="text-lg text-nexus-text-secondary font-primary">
              フルフィルメントサービス
            </p>
          </div>

          {/* Login Form */}
          <div className="intelligence-card global shadow-xl">
            <div className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-nexus-red/8 border-2 border-nexus-red/20 text-nexus-red p-4 rounded-lg text-sm font-medium flex items-center font-primary">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-nexus-text-primary mb-2 flex items-center font-primary">
                    <svg className="w-4 h-4 mr-2 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full px-4 py-3 border-2 border-nexus-border rounded-lg bg-white text-nexus-text-primary placeholder-nexus-text-muted focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-300 hover:border-primary-blue/30 font-primary"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-nexus-text-primary mb-2 flex items-center font-primary">
                    <svg className="w-4 h-4 mr-2 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full px-4 py-3 border-2 border-nexus-border rounded-lg bg-white text-nexus-text-primary placeholder-nexus-text-muted focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-300 hover:border-primary-blue/30 font-primary"
                    placeholder="••••••••"
                  />
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-2 border-nexus-border rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-nexus-text-secondary cursor-pointer select-none hover:text-nexus-text-primary transition-colors font-primary">
                    ログイン状態を保持する
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 font-primary ${
                      isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-primary-blue hover:bg-primary-blue-light hover:shadow-lg hover:shadow-primary-blue/30 active:scale-95'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin h-5 w-5 border-b-2 border-current rounded-full mr-3"></div>
                        <span className="font-primary">認証中...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-primary">ログイン</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Password Reset Link */}
                <div className="text-center pt-3">
                  <a 
                    href="#" 
                    className="text-sm font-medium text-primary-blue hover:text-primary-blue-light transition-colors inline-flex items-center gap-1 hover:underline font-primary"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 11-4 0 2 2 0 014 0zm0 0v1a2 2 0 01-2 2H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    パスワードをお忘れですか？
                  </a>
                </div>
              </form>

              {/* Demo Credentials */}
              <div className="mt-8 p-4 bg-primary-blue/5 rounded-xl border-2 border-primary-blue/15">
                <p className="text-xs text-nexus-text-secondary mb-3 font-bold flex items-center font-primary">
                  <svg className="w-4 h-4 mr-2 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  テスト用ログイン情報
                </p>
                <div className="space-y-2 text-xs font-primary">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/50">
                    <span className="text-nexus-text-secondary font-medium">セラー:</span>
                    <span className="text-nexus-text-primary font-mono bg-white px-2 py-1 rounded border border-primary-blue/10">seller@example.com / password123</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/50">
                    <span className="text-nexus-text-secondary font-medium">スタッフ:</span>
                    <span className="text-nexus-text-primary font-mono bg-white px-2 py-1 rounded border border-nexus-yellow/15">staff@example.com / password123</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-xs text-nexus-text-muted mt-8">
            <p className="font-primary">
              © 2024 THE WORLD DOOR. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}