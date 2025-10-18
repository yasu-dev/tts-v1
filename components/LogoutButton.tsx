'use client'

import { logout } from '@/lib/auth/logout'
import { useState } from 'react'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    if (!confirm('ログアウトしますか？')) return

    setLoading(true)
    try {
      await logout()
    } catch (error) {
      alert('ログアウトに失敗しました')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
    >
      {loading ? 'ログアウト中...' : 'ログアウト'}
    </button>
  )
}
