// Supabaseクライアント（ブラウザ用）
import { createBrowserClient } from '@supabase/ssr'
import { createLogger } from '@/lib/utils/logger'

const logger = createLogger('supabase/client')

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // ビルド時またはテスト時の環境変数チェック
  if (!supabaseUrl || !supabaseAnonKey) {
    logger.warn('Environment variables are not set')
    // ビルド時はダミー値を返す（実行時には環境変数が必要）
    return createBrowserClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-anon-key'
    )
  }

  logger.debug('Creating browser client')
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
