import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/utils/logger'

const logger = createLogger('auth/logout')

export async function logout() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    logger.error('Logout failed', { message: error.message })
    throw error
  }

  // ログインページにリダイレクト
  logger.info('Logout succeeded, redirecting to /login')
  window.location.href = '/login'
}
