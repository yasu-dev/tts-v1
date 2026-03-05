'use client';

import { logout } from '@/lib/auth/logout';
import { useState } from 'react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (!confirm('ログアウトしますか？')) return;

    setLoading(true);
    try {
      await logout();
    } catch (error) {
      alert('ログアウトに失敗しました');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
      style={{ minHeight: 44 }}
      aria-label="ログアウト"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      <span className="hidden text-sm font-medium sm:inline">
        {loading ? 'ログアウト中...' : 'ログアウト'}
      </span>
    </button>
  );
}
