'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import NexusCheckbox from '@/app/components/ui/NexusCheckbox';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showToast({ type: 'success', title: 'ログイン成功', message: 'ダッシュボードへようこそ！' });
          if (data.user.role === 'staff') {
            router.push('/staff/dashboard');
          } else {
            router.push('/dashboard');
          }
        } else {
          throw new Error(data.error || 'ログインに失敗しました。');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'サーバーエラーが発生しました。');
      }
    } catch (error: any) {
      setError(error.message || 'ログインに失敗しました。');
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
            <p className="text-lg text-nexus-text-secondary">
              フルフィルメントサービス
            </p>
          </div>

          {/* Login Form */}
          <div className="intelligence-card global shadow-xl">
            <div className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-nexus-red/8 border-2 border-nexus-red/20 text-nexus-red p-4 rounded-lg text-sm font-medium flex items-center">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-nexus-text-secondary mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    メールアドレス
                  </label>
                  <NexusInput
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    variant="enterprise"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-nexus-text-secondary mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    パスワード
                  </label>
                  <NexusInput
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    variant="enterprise"
                  />
                </div>

                {/* Remember Me Checkbox */}
                <NexusCheckbox
                  id="remember-me"
                  name="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  label="ログイン状態を保持する"
                  variant="nexus"
                  size="md"
                />

                <div className="pt-2">
                  <NexusButton
                    type="submit"
                    disabled={isLoading}
                    variant="primary"
                    size="lg"
                    className="w-full login-button"
                    data-testid="login-button"
                    icon={
                      isLoading ? (
                        <div className="animate-spin h-5 w-5 border-b-2 border-current rounded-full"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      )
                    }
                  >
                    {isLoading ? '認証中...' : 'ログイン'}
                  </NexusButton>
                </div>

                {/* Password Reset Link */}
                <div className="text-center pt-3">
                  <button 
                    type="button"
                    onClick={() => {
                      // TODO: BaseModalを使用した統一されたメッセージダイアログに変更
        showToast({
          title: 'パスワードリセット',
          message: 'パスワードリセット機能は開発中です。システム管理者にお問い合わせください。',
          type: 'info'
        });
                    }}
                    className="text-sm font-medium text-primary-blue hover:text-primary-blue-light transition-colors inline-flex items-center gap-1 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 11-4 0 2 2 0 014 0zm0 0v1a2 2 0 01-2 2H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    パスワードをお忘れですか？
                  </button>
                </div>
              </form>

              {/* Demo Credentials */}
              <div className="mt-8 p-4 bg-primary-blue/10 rounded-xl border-2 border-primary-blue/25">
                <p className="text-sm text-primary-blue mb-3 font-bold flex items-center">
                  <svg className="w-4 h-4 mr-2 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  テスト用ログイン情報
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/70 border border-primary-blue/20">
                    <span className="text-primary-blue font-medium">セラー:</span>
                    <NexusButton
                      type="button"
                      data-testid="seller-login"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEmail('seller@example.com');
                        setPassword('password123');
                        // 値が設定されることを確実にするため少し待つ
                        setTimeout(() => {
                          console.log('セラーログイン情報設定完了');
                        }, 100);
                      }}
                      variant="secondary"
                      size="sm"
                      className="font-mono text-xs text-primary-blue hover:text-primary-blue-light"
                    >
                      seller@example.com / password123
                    </NexusButton>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/70 border border-primary-blue/20">
                    <span className="text-primary-blue font-medium">スタッフ:</span>
                    <NexusButton
                      type="button"
                      data-testid="staff-login"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEmail('staff@example.com');
                        setPassword('password123');
                        // 値が設定されることを確実にするため少し待つ
                        setTimeout(() => {
                          console.log('スタッフログイン情報設定完了');
                        }, 100);
                      }}
                      variant="secondary"
                      size="sm"
                      className="font-mono text-xs text-primary-blue hover:text-primary-blue-light"
                    >
                      staff@example.com / password123
                    </NexusButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-xs text-nexus-text-muted mt-8">
            <p className="">
              © 2025 THE WORLD DOOR. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}