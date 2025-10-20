import { createClient } from '@/lib/supabase/server'
import { Hospital, TriageTag } from '@/lib/types'
import HospitalDashboard from './HospitalDashboard'

export const dynamic = 'force-dynamic'

export default async function HospitalPage() {
  const supabase = createClient()

  // デモ用：東京医科大学病院の固定データを使用
  const tokyoMedHospital: Hospital = {
    id: 'demo-1',
    name: '東京医科大学病院',
    location: {
      address: '東京都新宿区西新宿6-7-1',
      latitude: 35.6965,
      longitude: 139.6917
    },
    contact: {
      phone: '03-3342-6111',
      emergency_phone: '03-3342-6111',
      email: 'info@tokyo-med.ac.jp'
    },
    capabilities: {
      departments: [
        { name: '救命救急センター', available_beds: 10, occupied_beds: 40, specialties: ['救急科', '外傷外科'] },
        { name: '心臓血管外科', available_beds: 15, occupied_beds: 25, specialties: ['心臓血管外科', '循環器内科'] },
        { name: '脳神経外科', available_beds: 12, occupied_beds: 18, specialties: ['脳神経外科', '脳神経内科'] },
        { name: '整形外科', available_beds: 20, occupied_beds: 30, specialties: ['整形外科', 'リハビリテーション科'] },
        { name: '一般病棟', available_beds: 100, occupied_beds: 650, specialties: ['内科', '外科', '小児科'] }
      ],
      has_er: true,
      has_icu: true,
      has_heliport: true
    },
    current_load: {
      total_capacity: 880,
      current_patients: 763,
      accepting_status: 'limited' as const,
      last_updated: new Date().toISOString()
    },
    transport_count: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const hospital = tokyoMedHospital

  // この病院への搬送中の患者を取得
  const { data: triageTags, error: tagsError } = await supabase
    .from('triage_tags')
    .select('*')
    .eq('transport->destination->>hospital_id', hospital.id)
    .eq('transport->>status', 'in_transit')
    .order('created_at', { ascending: true })

  if (tagsError) {
    console.error('Error fetching triage tags:', tagsError)
  }

  const incomingPatients = (triageTags || []) as TriageTag[]

  return <HospitalDashboard hospital={hospital} incomingPatients={incomingPatients} />
}
