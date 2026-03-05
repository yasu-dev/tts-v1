'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createLogger } from '@/lib/utils/logger';

export default function LoginPage() {
  const logger = createLogger('app/login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ブラウザのオートフィルがReactのonChangeを発火しないケースに対応
      const formData = new FormData(e.currentTarget);
      const emailValue = (formData.get('email') as string) || email;
      const passwordValue = (formData.get('password') as string) || password;

      logger.info('Login attempt', { email: emailValue });
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailValue,
        password: passwordValue,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('ログインに失敗しました');
      }

      // ロールに基づいてリダイレクト
      // メタデータまたはuser_rolesテーブルからロールを取得
      // デモ用：メールアドレスから判定
      if (emailValue.includes('ic@')) {
        router.push('/command');
      } else if (emailValue.includes('tri@')) {
        router.push('/triage/scan');
      } else if (emailValue.includes('trn@')) {
        router.push('/transport-team');
      } else if (emailValue.includes('dmat@')) {
        router.push('/transport');
      } else if (emailValue.includes('hsp@')) {
        router.push('/hospital');
      } else {
        router.push('/command');
      }

      logger.info('Login success, redirected');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
      logger.error('Login failed', { message: err?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">トリアージタッグシステム</h1>
          <p className="text-gray-600">災害時トリアージ管理</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg">
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
