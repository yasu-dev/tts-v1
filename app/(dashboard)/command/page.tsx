import { createClient } from '@/lib/supabase/server'
import { TriageTag } from '@/lib/types'
import CommandDashboard from './CommandDashboard'

export const dynamic = 'force-dynamic'

export default async function CommandPage() {
  const supabase = createClient()

  // トリアージタッグを取得
  const { data: triageTags, error } = await supabase
    .from('triage_tags')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    // console.error('Error fetching triage tags:', error)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="card max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">データ取得エラー</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  const tags = (triageTags || []) as TriageTag[]

  return <CommandDashboard initialTags={tags} />
}
