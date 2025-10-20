'use client'

import { useState, useEffect } from 'react'
import { TriageTag, Hospital, TriageCategories } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import LogoutButton from '@/components/LogoutButton'
import PatientDetailModal from '@/components/PatientDetailModal'

interface TransportDashboardProps {
  initialTags: TriageTag[]
  hospitals: Hospital[]
}

export default function TransportDashboard({ initialTags, hospitals }: TransportDashboardProps) {
  const [tags, setTags] = useState<TriageTag[]>(initialTags)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedHospital, setSelectedHospital] = useState<string>('')
  const [selectedAmbulance, setSelectedAmbulance] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [isRealtime, setIsRealtime] = useState(false)
  const [selectedTagDetail, setSelectedTagDetail] = useState<TriageTag | null>(null)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [currentPage, setCurrentPage] = useState(1)
  
  const ITEMS_PER_PAGE = 10

  const supabase = createClient()

  // 新宿エリアの病院（デモ用ダミーデータ）
  const demoHospitals: Hospital[] = [
    {
      id: 'demo-1',
      name: '東京医科大学病院',
      location: {
        address: '東京都新宿区西新宿6-7-1',
        latitude: 35.6965,
        longitude: 139.6917,
      },
      contact: {
        main_phone: '03-3342-6111',
        emergency_phone: '03-3342-6111',
        fax: '03-3342-6111',
        email: ''
      },
      capacity: {
        emergency: { total: 50, available: 10 },
        icu: { total: 30, available: 5 },
        general: { total: 800, available: 100 },
        operating_rooms: { total: 20, available: 3 }
      },
      specialties: ['救急科', '外科', '脳神経外科', '整形外科'],
      current_load: {
        total_capacity: 880,
        current_patients: 770,
        accepting_status: 'limited' as const,
        last_updated: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-2',
      name: 'JCHO東京新宿メディカルセンター',
      location: {
        address: '東京都新宿区津久戸町5-1',
        latitude: 35.7025,
        longitude: 139.7412,
      },
      contact: {
        main_phone: '03-3269-8111',
        emergency_phone: '03-3269-8111',
        fax: '03-3269-8111',
        email: ''
      },
      capacity: {
        emergency: { total: 30, available: 8 },
        icu: { total: 10, available: 2 },
        general: { total: 500, available: 80 },
        operating_rooms: { total: 10, available: 2 }
      },
      specialties: ['救急科', '内科', '外科', '整形外科'],
      current_load: {
        total_capacity: 540,
        current_patients: 450,
        accepting_status: 'accepting' as const,
        last_updated: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-3',
      name: '東京都立大久保病院',
      location: {
        address: '東京都新宿区歌舞伎町2-44-1',
        latitude: 35.6973,
        longitude: 139.7014,
      },
      contact: {
        main_phone: '03-5273-7711',
        emergency_phone: '03-5273-7711',
        fax: '03-5273-7711',
        email: ''
      },
      capacity: {
        emergency: { total: 20, available: 5 },
        icu: { total: 8, available: 1 },
        general: { total: 300, available: 50 },
        operating_rooms: { total: 8, available: 1 }
      },
      specialties: ['救急科', '内科', '外科'],
      current_load: {
        total_capacity: 328,
        current_patients: 272,
        accepting_status: 'limited' as const,
        last_updated: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // 新宿エリアの病院を使用（デモデータを優先）
  const shinjukuHospitals = demoHospitals

  // 新宿エリアの救急隊
  const ambulanceTeams = [
    { id: 'amb-1', name: '新宿救急1' },
    { id: 'amb-2', name: '四谷救急1' },
    { id: 'amb-3', name: '牛込救急1' }
  ]

  // ページネーション計算
  const totalPages = Math.ceil(initialTags.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentPageTags = initialTags.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  
  const selectedTagData = tags.find(tag => tag.id === selectedTag)
  const selectedHospitalData = shinjukuHospitals.find(h => h.id === selectedHospital)
  const selectedAmbulanceData = ambulanceTeams.find(a => a.id === selectedAmbulance)

  // Supabase Realtimeでデータベース変更を購読
  useEffect(() => {
    const channel = supabase
      .channel('transport_triage_tags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'triage_tags',
        },
        async (payload) => {
          console.log('Realtime update (transport):', payload)

          // 搬送対象のデータを再取得
          const { data, error } = await supabase
            .from('triage_tags')
            .select('*')
            .in('triage_category->>final', ['red', 'yellow'])
            .in('transport->>status', ['not_transported', 'preparing'])
            .order('triage_category->>final', { ascending: true })

          if (!error && data) {
            setTags(data as TriageTag[])
            setIsRealtime(true)
            setTimeout(() => setIsRealtime(false), 2000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleStartTransport = async () => {
    if (!selectedTag || !selectedHospital || !selectedAmbulance) {
      alert('患者、搬送先、搬送救急隊を選択してください')
      return
    }

    setLoading(true)
    try {
      const selectedHospitalData = shinjukuHospitals.find(h => h.id === selectedHospital)

      const { error } = await supabase
        .from('triage_tags')
        .update({
          transport: {
            status: 'in_transit',
            destination: {
              hospital_id: selectedHospital,
              hospital_name: selectedHospitalData?.name || '',
              department: '',
            },
            departure_time: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTag)

      if (error) throw error

      alert(`${ambulanceTeams.find(a => a.id === selectedAmbulance)?.name}が搬送を開始しました`)
      setSelectedTag(null)
      setSelectedHospital('')
      setSelectedAmbulance('')
      setCurrentStep(1)
      setCurrentPage(1)
    } catch (error) {
      console.error('Error starting transport:', error)
      alert('搬送開始に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">DMATダッシュボード</h1>
            <p className="text-sm opacity-90">災害医療支援チーム・病院搬送管理</p>
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

      <main className="max-w-4xl mx-auto p-6">
        {/* プログレスバー */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between mb-4">
            <span className={`text-sm font-bold ${currentStep >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
              1. 患者選択
            </span>
            <span className={`text-sm font-bold ${currentStep >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
              2. 搬送先選択
            </span>
            <span className={`text-sm font-bold ${currentStep >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
              3. 救急隊選択
            </span>
            <span className={`text-sm font-bold ${currentStep >= 4 ? 'text-purple-600' : 'text-gray-400'}`}>
              4. 確認
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  currentStep === 1 ? 25 :
                  currentStep === 2 ? 50 :
                  currentStep === 3 ? 75 : 100
                }%`
              }}
            />
          </div>
        </div>

        {currentStep === 1 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">患者一覧（{initialTags.length}件）</h2>
            
            {initialTags.length === 0 ? (
              <p className="text-center text-gray-500 py-8">搬送待ちの患者はいません</p>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {currentPageTags.map(tag => {
                    const category = tag.triage_category.final
                    const categoryInfo = TriageCategories[category]

                    return (
                      <div key={tag.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className={`px-4 py-2 rounded-lg font-bold ${categoryInfo.color} ${categoryInfo.textColor}`}>
                            {tag.tag_number}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-700">
                                {tag.patient_info?.age && `${tag.patient_info.age}歳`}
                                {tag.patient_info?.sex && tag.patient_info?.age && ' | '}
                                {tag.patient_info?.sex && `${tag.patient_info.sex === 'male' ? '男性' : tag.patient_info.sex === 'female' ? '女性' : tag.patient_info.sex}`}
                                {(!tag.patient_info?.age && !tag.patient_info?.sex) && '詳細情報なし'}
                              </p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                tag.transport.status === 'not_transported' ? 'bg-gray-100 text-gray-800' :
                                tag.transport.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                                tag.transport.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                tag.transport.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {tag.transport.status === 'not_transported' ? '未搬送' :
                                 tag.transport.status === 'preparing' ? '搬送準備中' :
                                 tag.transport.status === 'in_transit' ? '病院搬送中' :
                                 tag.transport.status === 'completed' ? '搬送完了' : '不明'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              現在地: {tag.location.coordinates || '位置情報なし'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedTagDetail(tag)}
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                          >
                            詳細
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTag(tag.id)
                              setCurrentStep(2)
                            }}
                            className="btn-primary"
                          >
                            選択
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* ページネーション */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      前へ
                    </button>
                    <span className="px-4 py-2">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      次へ
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {currentStep === 2 && selectedTagData && (
          <div className="card">
            {/* 選択中の患者情報 */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold mb-2">選択中の患者</h3>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-lg font-bold ${TriageCategories[selectedTagData.triage_category.final].color} ${TriageCategories[selectedTagData.triage_category.final].textColor}`}>
                  {selectedTagData.tag_number}
                </span>
                <div>
                  <p className="font-semibold">{TriageCategories[selectedTagData.triage_category.final].label}</p>
                  <p className="text-sm text-gray-600">
                    患者ID: {selectedTagData.anonymous_id}
                    {selectedTagData.patient_info?.age && ` | ${selectedTagData.patient_info.age}歳`}
                    {selectedTagData.patient_info?.sex && ` ${selectedTagData.patient_info.sex === 'male' ? '男性' : selectedTagData.patient_info.sex === 'female' ? '女性' : ''}`}
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4">搬送先を選択してください</h2>
            
            {/* 凡例 */}
            <div className="flex gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-red-600 rounded-full"></span>
                <span className="font-semibold">三次救急</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-blue-600 rounded-full"></span>
                <span className="font-semibold">二次救急</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {shinjukuHospitals.map(hospital => {
                const acceptingStatus = hospital.current_load.accepting_status
                const statusText = acceptingStatus === 'accepting' ? '受入可' :
                                 acceptingStatus === 'limited' ? '制限あり' :
                                 acceptingStatus === 'full' ? '満床' : '不可'
                const statusColor = acceptingStatus === 'accepting' ? 'text-green-600' :
                                  acceptingStatus === 'limited' ? 'text-yellow-600' :
                                  'text-red-600'
                
                const isTertiary = hospital.name === '東京医科大学病院'

                return (
                  <div key={hospital.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        isTertiary ? 'bg-red-600' : 'bg-blue-600'
                      }`}></span>
                      <div>
                        <span className="font-semibold">{hospital.name}</span>
                        <span className={`ml-2 text-sm font-bold ${statusColor}`}>
                          {statusText}
                        </span>
                        <p className="text-sm text-gray-600">
                          空床: {hospital.current_load.total_capacity - hospital.current_load.current_patients}床
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedHospital(hospital.id)
                        setCurrentStep(3)
                      }}
                      className="btn-primary"
                    >
                      選択
                    </button>
                  </div>
                )
              })}
            </div>

            {/* ナビゲーション */}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setCurrentStep(1)
                  setSelectedTag(null)
                }}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                戻る
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && selectedTagData && selectedHospitalData && (
          <div className="card">
            {/* 選択中の患者・病院情報 */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold mb-2">選択中の内容</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 min-w-[60px]">患者:</span>
                  <span className={`px-3 py-1 rounded font-bold text-sm ${TriageCategories[selectedTagData.triage_category.final].color} ${TriageCategories[selectedTagData.triage_category.final].textColor}`}>
                    {selectedTagData.tag_number}
                  </span>
                  <span className="text-sm">{TriageCategories[selectedTagData.triage_category.final].label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 min-w-[60px]">搬送先:</span>
                  <span className="font-semibold">{selectedHospitalData.name}</span>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4">搬送救急隊を選択してください</h2>
            
            <div className="space-y-3 mb-6">
              {ambulanceTeams.map(ambulance => (
                <div key={ambulance.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">{ambulance.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAmbulance(ambulance.id)
                      setCurrentStep(4)
                    }}
                    className="btn-primary"
                  >
                    選択
                  </button>
                </div>
              ))}
            </div>

            {/* ナビゲーション */}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setCurrentStep(2)
                  setSelectedHospital('')
                }}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                戻る
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && selectedTagData && selectedHospitalData && selectedAmbulanceData && (
          <div className="card">
            <h2 className="text-xl font-bold mb-6">搬送内容を確認してください</h2>
            
            {/* 確認内容 */}
            <div className="space-y-4 mb-8">
              {/* 患者情報 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-blue-600">患者情報</h3>
                  <button
                    onClick={() => setSelectedTagDetail(selectedTagData)}
                    className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                  >
                    詳細
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <span className={`px-4 py-2 rounded-lg font-bold ${TriageCategories[selectedTagData.triage_category.final].color} ${TriageCategories[selectedTagData.triage_category.final].textColor}`}>
                    {selectedTagData.tag_number}
                  </span>
                  <span className="font-semibold text-lg">{TriageCategories[selectedTagData.triage_category.final].label}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>患者ID: {selectedTagData.anonymous_id}</p>
                  {selectedTagData.patient_info?.age && <p>年齢: {selectedTagData.patient_info.age}歳</p>}
                  {selectedTagData.patient_info?.sex && <p>性別: {selectedTagData.patient_info.sex === 'male' ? '男性' : selectedTagData.patient_info.sex === 'female' ? '女性' : 'その他'}</p>}
                  <p>登録: {new Date(selectedTagData.audit.created_at).toLocaleString('ja-JP')}</p>
                </div>
              </div>

              {/* 搬送先情報 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold mb-3 text-green-600">搬送先</h3>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`w-4 h-4 rounded-full ${
                    selectedHospitalData.name === '東京医科大学病院' ? 'bg-red-600' : 'bg-blue-600'
                  }`}></span>
                  <span className="font-semibold text-lg">{selectedHospitalData.name}</span>
                  <span className="text-sm text-gray-600">
                    ({selectedHospitalData.name === '東京医科大学病院' ? '三次救急' : '二次救急'})
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>住所: {selectedHospitalData.location.address}</p>
                  <p>電話: {selectedHospitalData.contact.emergency_phone}</p>
                  <p>空床: {selectedHospitalData.current_load.total_capacity - selectedHospitalData.current_load.current_patients}床</p>
                </div>
              </div>

              {/* 救急隊情報 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold mb-3 text-orange-600">搬送救急隊</h3>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-lg">{selectedAmbulanceData.name}</span>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setCurrentStep(3)
                  setSelectedAmbulance('')
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded hover:bg-gray-50"
              >
                戻る
              </button>
              <button
                onClick={handleStartTransport}
                disabled={loading}
                className="flex-1 btn-primary py-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '処理中...' : '搬送開始'}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 患者詳細モーダル */}
      <PatientDetailModal
        tag={selectedTagDetail}
        onClose={() => setSelectedTagDetail(null)}
      />
    </div>
  )
}
