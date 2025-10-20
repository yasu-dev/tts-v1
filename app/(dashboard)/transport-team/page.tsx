import { createClient } from '@/lib/supabase/server'
import { TriageTag } from '@/lib/types'
import TransportTeamDashboard from './TransportTeamDashboard'

export const dynamic = 'force-dynamic'

export default async function TransportTeamPage() {
  const supabase = createClient()

  // 搬送部隊に割り当てられた患者を取得
  const { data: triageTags, error: tagsError } = await supabase
    .from('triage_tags')
    .select('*')
    .not('transport_assignment', 'is', null)
    .order('triage_category->final', { ascending: true })
    .order('created_at', { ascending: true })

  if (tagsError) {
    // console.error('Error fetching triage tags:', tagsError)
  }

  const assignedPatients = (triageTags || []) as TriageTag[]

  return <TransportTeamDashboard assignedPatients={assignedPatients} />
}