import { createClient } from '@/lib/supabase/server'
import { TriageTag, Hospital } from '@/lib/types'
import TransportDashboard from './TransportDashboard'

export const dynamic = 'force-dynamic'

export default async function TransportPage() {
  const supabase = createClient()

  // 搬送待ちのトリアージタッグを取得（赤・黄タグで未搬送、搬送準備中、病院搬送中のもの）
  const { data: triageTags, error: tagsError } = await supabase
    .from('triage_tags')
    .select('*')
    .in('triage_category->>final', ['red', 'yellow'])
    .in('transport->>status', ['not_transported', 'preparing', 'in_transit'])
    .order('triage_category->>final', { ascending: true }) // 赤を優先
    .order('created_at', { ascending: true })

  // 病院一覧を取得
  const { data: hospitals, error: hospitalsError } = await supabase
    .from('hospitals')
    .select('*')
    .order('name')

  if (tagsError || hospitalsError) {
    // console.error('Error fetching data:', tagsError || hospitalsError)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="card max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">データ取得エラー</h2>
          <p className="text-gray-600">{(tagsError || hospitalsError)?.message}</p>
        </div>
      </div>
    )
  }

  const tags = (triageTags || []) as TriageTag[]
  const hospitalsList = (hospitals || []) as Hospital[]

  return <TransportDashboard initialTags={tags} hospitals={hospitalsList} />
}
