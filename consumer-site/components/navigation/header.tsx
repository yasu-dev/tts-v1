'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 text-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-900"
              aria-label="メニュー"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="font-bold text-xl text-green-600">
              献立ガチャ
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-gray-900">
            <Link href="/" className="hover:text-green-700">
              ガチャ
            </Link>
            <Link href="/search" className="hover:text-green-700">
              検索
            </Link>
            {user && (
              <>
                <Link href="/orders" className="hover:text-green-700">
                  注文履歴
                </Link>
                <Link href="/profile" className="hover:text-green-700">
                  マイページ
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    <Link href="/cart" className="p-2 relative text-gray-900">
                      <ShoppingCart className="w-6 h-6" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-900 hover:text-green-700"
                      title="ログアウト"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden md:inline">ログアウト</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <User className="w-4 h-4" />
                    <span>ログイン</span>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* モバイルメニュー → 左サイドドロワー */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* backdrop */}
            <button
              aria-label="メニューを閉じる"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-black/30"
            />
            {/* drawer */}
            <nav className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl border-r border-gray-200 p-6 flex flex-col gap-4 text-gray-900">
              <Link href="/" className="hover:text-green-700" onClick={() => setMenuOpen(false)}>
                ガチャ
              </Link>
              <Link href="/search" className="hover:text-green-700" onClick={() => setMenuOpen(false)}>
                検索
              </Link>
              {user ? (
                <>
                  <Link href="/orders" className="hover:text-green-700" onClick={() => setMenuOpen(false)}>
                    注文履歴
                  </Link>
                  <Link href="/profile" className="hover:text-green-700" onClick={() => setMenuOpen(false)}>
                    マイページ
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="text-left hover:text-green-700"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <Link href="/login" className="hover:text-green-700" onClick={() => setMenuOpen(false)}>
                  ログイン
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
