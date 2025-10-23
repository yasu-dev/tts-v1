'use client'

import { useState, useEffect } from 'react'
import { TriageTag, Hospital, TriageCategories } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import LogoutButton from '@/components/LogoutButton'
import PatientDetailModal from '@/components/PatientDetailModal'
import QRScanner from '@/components/QRScanner'

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
  const [hospitalStatuses, setHospitalStatuses] = useState<{[key: string]: any}>({})
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  
  const ITEMS_PER_PAGE = 10

  const supabase = createClient()

  // 搬送フェーズと担当者を取得（CommandDashboardと統一）
  const getPhaseInfo = (tag: TriageTag) => {
    // 病院到着
    if (tag.transport.status === 'completed' && tag.transport.destination) {
      return {
        phase: '病院',
        icon: '✅',
        responsible: `収容: ${tag.transport.destination.hospital_name}`,
        location: tag.transport.destination.hospital_name,
      }
    }

    // 病院へ搬送中
    if (tag.transport.status === 'in_transit' && tag.transport.destination) {
      return {
        phase: '病院へ',
        icon: '🚑',
        responsible: `救急隊 → ${tag.transport.destination.hospital_name}`,
        location: `搬送先: ${tag.transport.destination.hospital_name}`,
      }
    }

    // 病院搬送準備中
    if (tag.transport.status === 'preparing') {
      return {
        phase: '病院準備',
        icon: '📋',
        responsible: 'DMAT準備中',
        location: '現在地: 応急救護所',
      }
    }

    // 応急救護所到着
    if (tag.transport.status === 'arrived') {
      return {
        phase: '応急',
        icon: '🏥',
        responsible: '応急救護所待機',
        location: '現在地: 応急救護所',
      }
    }

    // 応急救護所へ搬送中
    if (tag.transport_assignment?.status === 'in_progress') {
      return {
        phase: '応急へ',
        icon: '🚑',
        responsible: `搬送: ${tag.transport_assignment.team}`,
        location: `発見位置: ${tag.location.address || '座標情報あり'}`,
      }
    }

    // 搬送部隊割当済
    if (tag.transport_assignment?.status === 'assigned') {
      return {
        phase: '割当済',
        icon: '⏳',
        responsible: `割当: ${tag.transport_assignment.team}`,
        location: `発見位置: ${tag.location.address || '座標情報あり'}`,
      }
    }

    // 現場待機
    return {
      phase: '現場',
      icon: '📍',
      responsible: `発見: ${tag.audit.created_by}`,
      location: `発見位置: ${tag.location.address || '座標情報あり'}`,
    }
  }

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
      transport_count: 45,
      current_load: {
        total_capacity: 880,
        current_patients: 763,
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
        phone: '03-3269-8111',
        emergency_phone: '03-3269-8111',
        email: ''
      },
      capabilities: {
        departments: [
          { name: '救急科', available_beds: 8, occupied_beds: 22, specialties: ['救急科'] },
          { name: '内科', available_beds: 80, occupied_beds: 420, specialties: ['内科', '外科', '整形外科'] }
        ],
        has_er: true,
        has_icu: true,
        has_heliport: false
      },
      transport_count: 0,
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
        phone: '03-5273-7711',
        emergency_phone: '03-5273-7711',
        email: ''
      },
      capabilities: {
        departments: [
          { name: '救急科', available_beds: 5, occupied_beds: 15, specialties: ['救急科'] },
          { name: '内科', available_beds: 50, occupied_beds: 250, specialties: ['内科', '外科'] }
        ],
        has_er: true,
        has_icu: true,
        has_heliport: false
      },
      transport_count: 0,
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
    // 患者データの変更を監視
    const triageChannel = supabase
      .channel('transport_triage_tags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'triage_tags',
        },
        async (payload) => {
          // console.log('Realtime update (transport):', payload)

          if (payload.eventType === 'INSERT') {
            // 新規患者: DMAT対象なら追加
            const newTag = payload.new as TriageTag
            const isTargetPatient =
              ['red', 'yellow'].includes(newTag.triage_category?.final) &&
              newTag.transport_assignment?.status === 'completed'

            if (isTargetPatient) {
              setTags(prevTags => [newTag, ...prevTags])
              setIsRealtime(true)
              setTimeout(() => setIsRealtime(false), 2000)
            }
          } else if (payload.eventType === 'UPDATE') {
            // 更新: 既存の患者を更新
            const updatedTag = payload.new as TriageTag
            setTags(prevTags => {
              const existingIndex = prevTags.findIndex(t => t.id === updatedTag.id)

              if (existingIndex >= 0) {
                // 既存患者を更新
                const newTags = [...prevTags]
                newTags[existingIndex] = updatedTag
                return newTags
              } else {
                // 新たにDMAT対象になった患者を追加
                const isTargetPatient =
                  ['red', 'yellow'].includes(updatedTag.triage_category?.final) &&
                  updatedTag.transport_assignment?.status === 'completed'

                if (isTargetPatient) {
                  return [updatedTag, ...prevTags]
                }
                return prevTags
              }
            })
            setIsRealtime(true)
            setTimeout(() => setIsRealtime(false), 2000)
          } else if (payload.eventType === 'DELETE') {
            // 削除: tags配列から削除
            const deletedId = payload.old.id
            setTags(prevTags => prevTags.filter(t => t.id !== deletedId))
            setIsRealtime(true)
            setTimeout(() => setIsRealtime(false), 2000)
          }
        }
      )
      .subscribe()

    // 病院データの変更を監視
    const hospitalChannel = supabase
      .channel('transport_hospitals_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'hospitals',
        },
        async (payload) => {
          // console.log('Realtime update (hospitals):', payload)
          // 病院ステータスを更新
          if (payload.new) {
            setHospitalStatuses(prev => ({
              ...prev,
              [payload.new.id]: payload.new.current_load
            }))
            setIsRealtime(true)
            setTimeout(() => setIsRealtime(false), 2000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(triageChannel)
      supabase.removeChannel(hospitalChannel)
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

      // 現在のタグデータを取得
      const currentTag = tags.find(tag => tag.id === selectedTag)
      
      const { error } = await supabase
        .from('triage_tags')
        .update({
          transport: {
            ...currentTag?.transport,
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

      // ローカルステートを即座に更新
      setTags(prevTags => 
        prevTags.map(tag => 
          tag.id === selectedTag 
            ? {
                ...tag,
                transport: {
                  ...tag.transport,
                  status: 'in_transit',
                  destination: {
                    hospital_id: selectedHospital,
                    hospital_name: selectedHospitalData?.name || '',
                    department: '',
                  },
                  departure_time: new Date().toISOString(),
                },
                updated_at: new Date().toISOString(),
              }
            : tag
        )
      )

      alert(`${ambulanceTeams.find(a => a.id === selectedAmbulance)?.name}が搬送を開始しました`)
      setSelectedTag(null)
      setSelectedHospital('')
      setSelectedAmbulance('')
      setCurrentStep(1)
      setCurrentPage(1)
    } catch (error) {
      // console.error('Error starting transport:', error)
      alert('搬送開始に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // QRコードスキャン処理
  const handleQRScan = async (result: string) => {    
    try {
      let patientId = ''
      
      // 様々なQRコード形式に対応
      try {
        // JSON形式を試行
        const patientData = JSON.parse(result)
        patientId = patientData.id || patientData.patient_id || patientData.tag_id
      } catch {
        // 単純な文字列の場合
        patientId = result.trim()
      }
      
      if (!patientId) {
        alert('QRコードから患者IDを取得できませんでした')
        return
      }

      // 患者情報を取得
      const { data: patient, error } = await supabase
        .from('triage_tags')
        .select('*')
        .eq('id', patientId)
        .single()

      if (error || !patient) {
        // IDで見つからない場合、tag_numberやanonymous_idで検索
        const { data: patientByTag, error: tagError } = await supabase
          .from('triage_tags')
          .select('*')
          .or(`tag_number.eq.${patientId},anonymous_id.eq.${patientId}`)
          .single()
          
        if (tagError || !patientByTag) {
          alert(`患者が見つかりません: ${patientId}`)
          return
        }
        
        // 患者詳細モーダルを表示
        setSelectedTagDetail(patientByTag as TriageTag)
        setShowQRScanner(false)
        return
      }

      // 患者詳細モーダルを表示
      setSelectedTagDetail(patient as TriageTag)
      setShowQRScanner(false)
      
    } catch (error) {
      alert('QRコードの読み取りに失敗しました')
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
            <button
              onClick={() => setShowQRScanner(true)}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
            >
              QRスキャン
            </button>
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
                    const phaseInfo = getPhaseInfo(tag)

                    return (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <span className={`px-4 py-2 rounded-lg font-bold ${categoryInfo.color} ${categoryInfo.textColor}`}>
                            {tag.tag_number}
                          </span>
                          <div className="flex-1">
                            {/* Line 1: Icon + Phase + Patient attributes */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base">{phaseInfo.icon}</span>
                              <span className="font-semibold text-gray-900">{phaseInfo.phase}</span>
                              <span className="text-gray-400">|</span>
                              <p className="text-sm text-gray-700">
                                {tag.patient_info?.age && `${tag.patient_info.age}歳`}
                                {tag.patient_info?.sex && tag.patient_info?.age && ' | '}
                                {tag.patient_info?.sex && `${tag.patient_info.sex === 'male' ? '男性' : tag.patient_info.sex === 'female' ? '女性' : tag.patient_info.sex}`}
                                {(!tag.patient_info?.age && !tag.patient_info?.sex) && '詳細情報なし'}
                              </p>
                            </div>
                            {/* Line 2: Responsible party + Location */}
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-500">{phaseInfo.responsible}</p>
                              <span className="text-gray-300">•</span>
                              <p className="text-xs text-gray-500">
                                {tag.location.address ? (
                                  <a
                                    href={`https://www.google.com/maps?q=${tag.location.latitude},${tag.location.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {phaseInfo.location}
                                  </a>
                                ) : tag.location.latitude && tag.location.longitude ? (
                                  <a
                                    href={`https://www.google.com/maps?q=${tag.location.latitude},${tag.location.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    座標情報あり
                                  </a>
                                ) : (
                                  '位置情報なし'
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Right side: Action buttons only */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedTagDetail(tag)}
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                          >
                            詳細
                          </button>
                          <button
                            onClick={async () => {
                              // 搬送ステータスを準備中に更新
                              const { error } = await supabase
                                .from('triage_tags')
                                .update({
                                  transport: {
                                    ...tag.transport,
                                    status: 'preparing',
                                  },
                                  updated_at: new Date().toISOString(),
                                })
                                .eq('id', tag.id)

                              if (!error) {
                                // ローカルステートを即座に更新
                                setTags(prevTags =>
                                  prevTags.map(t =>
                                    t.id === tag.id
                                      ? {
                                          ...t,
                                          transport: {
                                            ...t.transport,
                                            status: 'preparing',
                                          },
                                          updated_at: new Date().toISOString(),
                                        }
                                      : t
                                  )
                                )
                                setSelectedTag(tag.id)
                                setCurrentStep(2)
                              }
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
                // リアルタイム更新されたステータスがあればそれを使用
                const currentStatus = hospitalStatuses[hospital.id] || hospital.current_load
                const acceptingStatus = currentStatus.accepting_status
                const currentPatients = currentStatus.current_patients
                const totalCapacity = currentStatus.total_capacity
                
                const statusText = acceptingStatus === 'accepting' ? '受入可' :
                                 acceptingStatus === 'limited' ? '制限あり' :
                                 acceptingStatus === 'full' ? '満床' : '不可'
                const statusColor = acceptingStatus === 'accepting' ? 'text-green-600' :
                                  acceptingStatus === 'limited' ? 'text-yellow-600' :
                                  'text-red-600'
                
                const isTertiary = hospital.name === '東京医科大学病院'
                const availableBeds = totalCapacity - currentPatients
                const isDisabled = acceptingStatus === 'full' || acceptingStatus === 'not_accepting'

                return (
                  <div key={hospital.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        isTertiary ? 'bg-red-600' : 'bg-blue-600'
                      }`}></span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{hospital.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            acceptingStatus === 'accepting' ? 'bg-green-100 text-green-800' :
                            acceptingStatus === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                            acceptingStatus === 'full' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {statusText}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          空床: {availableBeds}床 / 総{totalCapacity}床
                        </p>
                        {hospitalStatuses[hospital.id] && (
                          <p className="text-xs text-blue-600 font-medium">リアルタイム更新</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedHospital(hospital.id)
                        setCurrentStep(3)
                      }}
                      disabled={isDisabled}
                      className={`btn-primary ${
                        isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''
                      }`}
                    >
                      {isDisabled ? '選択不可' : '選択'}
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
                  <p>緊急電話: {selectedHospitalData.contact.emergency_phone}</p>
                  <p>空床: {selectedHospitalData.current_load.total_capacity - selectedHospitalData.current_load.current_patients}床 / 総{selectedHospitalData.current_load.total_capacity}床</p>
                  {selectedHospitalData.name === '東京医科大学病院' && (
                    <div className="mt-2 pt-2 border-t space-y-1">
                      <p className="text-green-600 font-semibold">✓ 救命救急センター</p>
                      <p className="text-blue-600 font-semibold">✓ ヘリポート有</p>
                      <p className="text-purple-600 font-semibold">✓ ICU有</p>
                      <p className="text-xs">公式サイト: https://tokyo-med-er.jp/</p>
                    </div>
                  )}
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
        actions={selectedTagDetail && (
          <button
            onClick={async () => {
              // 搬送ステータスを準備中に更新
              const { error } = await supabase
                .from('triage_tags')
                .update({
                  transport: {
                    ...selectedTagDetail.transport,
                    status: 'preparing',
                  },
                  updated_at: new Date().toISOString(),
                })
                .eq('id', selectedTagDetail.id)

              if (!error) {
                // tags配列にこの患者が含まれているか確認
                const existingTag = tags.find(t => t.id === selectedTagDetail.id)

                if (existingTag) {
                  // 既存の場合はステータスを更新
                  setTags(prevTags =>
                    prevTags.map(t =>
                      t.id === selectedTagDetail.id
                        ? {
                            ...t,
                            transport: {
                              ...t.transport,
                              status: 'preparing',
                            },
                            updated_at: new Date().toISOString(),
                          }
                        : t
                    )
                  )
                } else {
                  // tags配列に追加
                  setTags(prevTags => [
                    {
                      ...selectedTagDetail,
                      transport: {
                        ...selectedTagDetail.transport,
                        status: 'preparing',
                      },
                      updated_at: new Date().toISOString(),
                    },
                    ...prevTags
                  ])
                }

                setSelectedTag(selectedTagDetail.id)
                setCurrentStep(2)
                setSelectedTagDetail(null)
              } else {
                alert('ステータス更新に失敗しました')
              }
            }}
            className="btn-primary"
            disabled={loading}
          >
            搬送先を選択
          </button>
        )}
      />

      {/* QRスキャナーモーダル */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">QRコードスキャン</h3>
              <button
                onClick={() => {
                  setShowQRScanner(false)
                  setShowManualInput(false)
                  setManualInput('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {!showManualInput ? (
              <>
                <QRScanner
                  onScanSuccess={handleQRScan}
                  onScanError={(error) => {
                    alert('QRスキャンでエラーが発生しました')
                  }}
                />
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowManualInput(true)}
                    className="text-purple-600 hover:underline text-sm"
                  >
                    手動入力に切り替え
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    患者IDまたはタグ番号を入力
                  </label>
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="T-2025-001 または ANON-123456"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (manualInput.trim()) {
                        handleQRScan(manualInput.trim())
                        setManualInput('')
                      }
                    }}
                    disabled={!manualInput.trim()}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                  >
                    検索
                  </button>
                  <button
                    onClick={() => {
                      setShowManualInput(false)
                      setManualInput('')
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    QRスキャンに戻る
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
