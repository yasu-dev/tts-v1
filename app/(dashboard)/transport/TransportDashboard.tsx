'use client'

import { useState } from 'react'
import { TriageTag, Hospital, TriageCategories } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface TransportDashboardProps {
  initialTags: TriageTag[]
  hospitals: Hospital[]
}

export default function TransportDashboard({ initialTags, hospitals }: TransportDashboardProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedHospital, setSelectedHospital] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleStartTransport = async () => {
    if (!selectedTag || !selectedHospital) {
      alert('患者と搬送先を選択してください')
      return
    }

    setLoading(true)
    try {
      const selectedHospitalData = hospitals.find(h => h.id === selectedHospital)

      const { error } = await supabase
        .from('triage_tags')
        .update({
          transport: {
            status: 'in_transit',
            hospital_id: selectedHospital,
            hospital_name: selectedHospitalData?.name,
            departed_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTag)

      if (error) throw error

      alert('搬送を開始しました')
      window.location.reload()
    } catch (error) {
      console.error('Error starting transport:', error)
      alert('搬送開始に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-orange-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">搬送管理</h1>
          <p className="text-sm opacity-90">搬送部隊</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">搬送待ち傷病者（{initialTags.length}件）</h2>
          {initialTags.length === 0 ? (
            <p className="text-center text-gray-500 py-8">搬送待ちの患者はいません</p>
          ) : (
            <div className="space-y-3">
              {initialTags.map(tag => {
                const category = tag.triage_category.final
                const categoryInfo = TriageCategories[category]
                const isSelected = selectedTag === tag.id

                return (
                  <div
                    key={tag.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedTag(tag.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-4 py-2 rounded-lg font-bold ${categoryInfo.color} ${categoryInfo.textColor}`}>
                        {tag.tag_number}
                      </span>
                      <span className="text-sm font-semibold">{categoryInfo.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      患者ID: {tag.anonymous_id}
                      {tag.patient_info?.age && ` | ${tag.patient_info.age}歳`}
                      {tag.patient_info?.sex && ` ${tag.patient_info.sex === 'male' ? '男性' : tag.patient_info.sex === 'female' ? '女性' : ''}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      位置: 緯度 {tag.location.latitude.toFixed(4)}, 経度 {tag.location.longitude.toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      登録: {new Date(tag.audit.created_at).toLocaleString('ja-JP')}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">搬送先選択</h2>
          <select
            className="input mb-3"
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            disabled={!selectedTag}
          >
            <option value="">搬送先を選択してください</option>
            {hospitals.map(hospital => {
              const acceptingStatus = hospital.current_load.accepting_status
              const statusText = acceptingStatus === 'accepting' ? '受入可' :
                               acceptingStatus === 'limited' ? '制限あり' :
                               acceptingStatus === 'full' ? '満床' : '不可'
              const statusColor = acceptingStatus === 'accepting' ? 'text-green-600' :
                                acceptingStatus === 'limited' ? 'text-yellow-600' :
                                'text-red-600'

              return (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name} - {statusText} (空床: {hospital.current_load.total_capacity - hospital.current_load.current_patients})
                </option>
              )
            })}
          </select>

          {selectedHospital && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              {(() => {
                const hospital = hospitals.find(h => h.id === selectedHospital)
                if (!hospital) return null

                return (
                  <div>
                    <p className="font-semibold mb-1">{hospital.name}</p>
                    <p className="text-sm text-gray-600">{hospital.location.address}</p>
                    <p className="text-sm text-gray-600">電話: {hospital.contact.emergency_phone}</p>
                    <p className="text-sm text-gray-600">
                      空床: {hospital.current_load.total_capacity - hospital.current_load.current_patients} / {hospital.current_load.total_capacity}
                    </p>
                  </div>
                )
              })()}
            </div>
          )}

          <button
            onClick={handleStartTransport}
            disabled={!selectedTag || !selectedHospital || loading}
            className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '処理中...' : '搬送開始'}
          </button>
        </div>
      </main>
    </div>
  )
}
