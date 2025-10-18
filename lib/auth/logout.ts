import { createClient } from '@/lib/supabase/client'

export async function logout() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Logout error:', error)
    throw error
  }

  // ログインページにリダイレクト
  window.location.href = '/login'
}
