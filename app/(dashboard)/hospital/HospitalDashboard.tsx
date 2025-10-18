'use client'

import { useState, useEffect } from 'react'
import { Hospital, TriageTag, TriageCategories } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import LogoutButton from '@/components/LogoutButton'

interface HospitalDashboardProps {
  hospital: Hospital
  incomingPatients: TriageTag[]
}

export default function HospitalDashboard({ hospital, incomingPatients }: HospitalDashboardProps) {
  const [acceptingStatus, setAcceptingStatus] = useState(hospital.current_load.accepting_status)
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<TriageTag[]>(incomingPatients)
  const [isRealtime, setIsRealtime] = useState(false)

  const supabase = createClient()

  // Supabase Realtimeでデータベース変更を購読
  useEffect(() => {
    const channel = supabase
      .channel('hospital_triage_tags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'triage_tags',
        },
        async (payload) => {
          console.log('Realtime update (hospital):', payload)

          // この病院向けの搬送中患者を再取得
          const { data, error } = await supabase
            .from('triage_tags')
            .select('*')
            .eq('transport->destination->>hospital_id', hospital.id)
            .eq('transport->>status', 'in_transit')
            .order('created_at', { ascending: false })

          if (!error && data) {
            setPatients(data as TriageTag[])
            setIsRealtime(true)
            setTimeout(() => setIsRealtime(false), 2000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, hospital.id])

  const availableBeds = hospital.current_load.total_capacity - hospital.current_load.current_patients

  const handleUpdateStatus = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('hospitals')
        .update({
          current_load: {
            ...hospital.current_load,
            accepting_status: acceptingStatus,
            last_updated: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', hospital.id)

      if (error) throw error

      alert('受入状況を更新しました')
      window.location.reload()
    } catch (error) {
      console.error('Error updating hospital status:', error)
      alert('更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleReceivePatient = async (tagId: string) => {
    setLoading(true)
    try {
      // Get the current tag data to preserve existing transport info
      const { data: currentTag } = await supabase
        .from('triage_tags')
        .select('transport')
        .eq('id', tagId)
        .single()

      const { error } = await supabase
        .from('triage_tags')
        .update({
          transport: {
            ...currentTag?.transport,
            status: 'completed',
            arrival_time: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', tagId)

      if (error) throw error

      // 病院の受入患者数を更新
      await supabase
        .from('hospitals')
        .update({
          current_load: {
            ...hospital.current_load,
            current_patients: hospital.current_load.current_patients + 1,
            last_updated: new Date().toISOString(),
          },
          transport_count: hospital.transport_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', hospital.id)

      alert('患者を受け入れました')
      window.location.reload()
    } catch (error) {
      console.error('Error receiving patient:', error)
      alert('受入処理に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">医療機関ダッシュボード</h1>
            <p className="text-sm opacity-90">{hospital.name}</p>
          </div>
          <div className="flex items-center gap-4">
            {isRealtime && (
              <div className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-lg animate-pulse">
                <span className="w-3 h-3 bg-white rounded-full"></span>
                <span className="text-sm font-bold">データ更新</span>
              </div>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-600">{hospital.current_load.total_capacity}</p>
            <p className="text-sm text-gray-600">総病床数</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">{availableBeds}</p>
            <p className="text-sm text-gray-600">空床数</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-orange-600">{hospital.current_load.current_patients}</p>
            <p className="text-sm text-gray-600">現在患者数</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-red-600">{patients.length}</p>
            <p className="text-sm text-gray-600">搬送中</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">搬送中患者（{patients.length}件）</h2>
          {patients.length === 0 ? (
            <p className="text-center text-gray-500 py-8">搬送中の患者はいません</p>
          ) : (
            <div className="space-y-3">
              {patients.map(tag => {
                const category = tag.triage_category.final
                const categoryInfo = TriageCategories[category]

                return (
                  <div key={tag.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-lg font-bold ${categoryInfo.color} ${categoryInfo.textColor}`}>
                          {tag.tag_number}
                        </span>
                        <div>
                          <p className="font-semibold">{categoryInfo.label}</p>
                          <p className="text-sm text-gray-600">
                            患者ID: {tag.anonymous_id}
                            {tag.patient_info?.age && ` | ${tag.patient_info.age}歳`}
                            {tag.patient_info?.sex && ` ${tag.patient_info.sex === 'male' ? '男性' : tag.patient_info.sex === 'female' ? '女性' : ''}`}
                          </p>
                          {tag.transport.departure_time && (
                            <p className="text-xs text-gray-500">
                              出発: {new Date(tag.transport.departure_time).toLocaleString('ja-JP')}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleReceivePatient(tag.id)}
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                      >
                        受入完了
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">受入状況更新</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">受入可否</label>
              <select
                className="input"
                value={acceptingStatus}
                onChange={(e) => setAcceptingStatus(e.target.value as any)}
              >
                <option value="accepting">受入可能</option>
                <option value="limited">制限あり</option>
                <option value="full">満床</option>
                <option value="not_accepting">受入不可</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              <p>現在の状態: <span className="font-semibold">
                {hospital.current_load.accepting_status === 'accepting' ? '受入可能' :
                 hospital.current_load.accepting_status === 'limited' ? '制限あり' :
                 hospital.current_load.accepting_status === 'full' ? '満床' : '受入不可'}
              </span></p>
              <p>最終更新: {new Date(hospital.current_load.last_updated).toLocaleString('ja-JP')}</p>
            </div>
            <button
              onClick={handleUpdateStatus}
              disabled={loading || acceptingStatus === hospital.current_load.accepting_status}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '更新中...' : '状況を更新'}
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">病院情報</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">所在地:</span> {hospital.location.address}</p>
            <p><span className="font-semibold">緊急電話:</span> {hospital.contact.emergency_phone || hospital.contact.phone}</p>
            <p><span className="font-semibold">一般電話:</span> {hospital.contact.phone}</p>
            {hospital.capabilities.has_er && (
              <p className="text-green-600 font-semibold">✓ 救命救急センター</p>
            )}
            {hospital.capabilities.has_heliport && (
              <p className="text-blue-600 font-semibold">✓ ヘリポート有</p>
            )}
            {hospital.capabilities.has_icu && (
              <p className="text-purple-600 font-semibold">✓ ICU有</p>
            )}
            <p className="text-sm text-gray-600 mt-2">
              診療科: {hospital.capabilities.departments?.map(d => d.name).join(', ') || '情報なし'}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
