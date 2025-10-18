import { createClient } from '@/lib/supabase/server'
import { Hospital, TriageTag } from '@/lib/types'
import HospitalDashboard from './HospitalDashboard'

export const dynamic = 'force-dynamic'

export default async function HospitalPage() {
  const supabase = createClient()

  // デモ用：最初の病院を取得（本来は認証ユーザーの病院IDを使用）
  const { data: hospitals, error: hospitalError } = await supabase
    .from('hospitals')
    .select('*')
    .limit(1)
    .single()

  if (hospitalError || !hospitals) {
    console.error('Error fetching hospital:', hospitalError)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="card max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">病院情報取得エラー</h2>
          <p className="text-gray-600">{hospitalError?.message || '病院が見つかりません'}</p>
        </div>
      </div>
    )
  }

  const hospital = hospitals as Hospital

  // この病院への搬送中の患者を取得
  const { data: triageTags, error: tagsError } = await supabase
    .from('triage_tags')
    .select('*')
    .eq('transport->>hospital_id', hospital.id)
    .eq('transport->>status', 'in_transit')
    .order('created_at', { ascending: true })

  if (tagsError) {
    console.error('Error fetching triage tags:', tagsError)
  }

  const incomingPatients = (triageTags || []) as TriageTag[]

  return <HospitalDashboard hospital={hospital} incomingPatients={incomingPatients} />
}
