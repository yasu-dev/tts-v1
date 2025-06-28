'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [userType, setUserType] = useState<'seller' | 'staff'>('seller');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      if (userType === 'staff') {
        router.push('/staff/dashboard');
      } else {
        router.push('/dashboard');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #0F1014 0%, #1A1A2E 50%, #0F1014 100%)' }}>
      <div className="absolute inset-0 circuit-pattern opacity-5"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto h-32 w-32 bg-gradient-radial-blue rounded-3xl flex items-center justify-center shadow-2xl mb-6 border-4 border-primary-blue/30">
            <i className="fas fa-globe-americas text-white text-5xl"></i>
          </div>
          <h2 className="text-5xl font-display font-black text-[#0064D2]">THE WORLD DOOR</h2>
          <p className="mt-2 text-lg text-nexus-text-secondary font-display">
            グローバル輸出インテリジェンスプラットフォーム
          </p>
        </div>

        {/* Login Form */}
        <div className="nexus-card rounded-3xl p-8 shadow-2xl border-2 border-nexus-border">
          {/* User Type Selector */}
          <div className="flex rounded-2xl bg-nexus-card-bg p-1 mb-8 border border-nexus-border">
            <button
              type="button"
              onClick={() => setUserType('seller')}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${
                userType === 'seller'
                  ? 'bg-gradient-radial-blue text-white shadow-lg transform scale-105'
                  : 'text-nexus-text-muted hover:text-nexus-text-primary'
              }`}
            >
              <i className="fas fa-store mr-2"></i>
              セラー
            </button>
            <button
              type="button"
              onClick={() => setUserType('staff')}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${
                userType === 'staff'
                  ? 'bg-gradient-radial-yellow text-[#0F1014] shadow-lg transform scale-105'
                  : 'text-nexus-text-muted hover:text-nexus-text-primary'
              }`}
            >
              <i className="fas fa-users mr-2"></i>
              スタッフ
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-nexus-text-primary mb-2">
                <i className="fas fa-envelope mr-2 text-[#0064D2]"></i>
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
                className="nexus-input w-full"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-nexus-text-primary mb-2">
                <i className="fas fa-lock mr-2 text-[#0064D2]"></i>
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
                className="nexus-input w-full"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#0064D2] focus:ring-[#0064D2] border-nexus-border rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-nexus-text-secondary">
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
                className={`nexus-button w-full flex justify-center items-center py-4 text-lg font-bold ${
                  userType === 'seller' ? 'primary' : 'bg-gradient-radial-yellow text-[#0F1014] hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full mr-3"></div>
                    認証中...
                  </div>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    ログイン
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-[rgba(248,250,254,0.97)] rounded-xl border border-nexus-border">
            <p className="text-xs text-nexus-text-muted text-center">
              <i className="fas fa-info-circle mr-1 text-[#0064D2]"></i>
              デモ用：任意のメールアドレスとパスワードでログイン可能
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-radial-green rounded-2xl flex items-center justify-center text-white mb-2 shadow-lg border-2 border-[#86B817]/30">
              <i className="fas fa-shield-alt text-2xl"></i>
            </div>
            <p className="text-xs text-white/80 font-bold">高セキュリティ</p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-radial-purple rounded-2xl flex items-center justify-center text-white mb-2 shadow-lg border-2 border-[#7B1FA2]/30">
              <i className="fas fa-bolt text-2xl"></i>
            </div>
            <p className="text-xs text-white/80 font-bold">高速処理</p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-radial-cyan rounded-2xl flex items-center justify-center text-white mb-2 shadow-lg border-2 border-[#00BCD4]/30">
              <i className="fas fa-clock text-2xl"></i>
            </div>
            <p className="text-xs text-white/80 font-bold">24時間対応</p>
          </div>
        </div>
      </div>
    </div>
  );
}