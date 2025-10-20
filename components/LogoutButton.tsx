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
      className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10 disabled:opacity-50"
      title={loading ? 'ログアウト中...' : 'ログアウト'}
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
        />
      </svg>
    </button>
  )
}
