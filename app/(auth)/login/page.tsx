'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Supabase Auth でログイン
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('ログインに失敗しました')
      }

      // ロールに基づいてリダイレクト
      // メタデータまたはuser_rolesテーブルからロールを取得
      // デモ用：メールアドレスから判定
      if (email.includes('ic@')) {
        router.push('/command')
      } else if (email.includes('tri@')) {
        router.push('/triage/scan')
      } else if (email.includes('trn@')) {
        router.push('/transport-team')
      } else if (email.includes('dmat@')) {
        router.push('/transport')
      } else if (email.includes('hsp@')) {
        router.push('/hospital')
      } else {
        router.push('/command')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            トリアージタッグシステム
          </h1>
          <p className="text-gray-600">災害時トリアージ管理</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-700 mb-2">デモアカウント:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>指揮本部: ic@demo.com</li>
            <li>タッグ付け: tri@demo.com</li>
            <li>搬送部隊: trn@demo.com</li>
            <li>DMAT: dmat@demo.com</li>
            <li>医療機関: hsp@demo.com</li>
            <li>パスワード: password</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
