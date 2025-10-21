'use client'

import { useState, useEffect } from 'react'
import { TriageCategories, TriageTag } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import LogoutButton from '@/components/LogoutButton'
import PatientDetailModal from '@/components/PatientDetailModal'
import TransportAssignButton from '@/components/TransportAssignButton'

// 地図コンポーネントを動的インポート（SSR無効化）
const TriageMap = dynamic(() => import('@/components/TriageMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center rounded-lg">
      <p className="text-gray-600">地図を読み込み中...</p>
    </div>
  ),
})

interface CommandDashboardProps {
  initialTags: TriageTag[]
}

export default function CommandDashboard({ initialTags }: CommandDashboardProps) {
  const [tags, setTags] = useState<TriageTag[]>(initialTags)
  const [filter, setFilter] = useState<'all' | 'black' | 'red' | 'yellow' | 'green'>('all')
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [isRealtime, setIsRealtime] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [selectedTagDetail, setSelectedTagDetail] = useState<TriageTag | null>(null)
  const [isMapCollapsed, setIsMapCollapsed] = useState(false)
  const supabase = createClient()

  // ローカルストレージから地図の折り畳み状態を復元
  useEffect(() => {
    const savedState = localStorage.getItem('commandDashboard_mapCollapsed')
    if (savedState !== null) {
      setIsMapCollapsed(savedState === 'true')
    }
  }, [])

  // Supabase Realtimeでデータベース変更を購読
  useEffect(() => {
    const channel = supabase
      .channel('triage_tags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'triage_tags',
        },
        async (payload) => {
          // console.log('Realtime update:', payload)

          // データを再取得
          const { data, error } = await supabase
            .from('triage_tags')
            .select('*')
            .order('created_at', { ascending: false })

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

  // 全ステータスを取得
  const getAllStatuses = () => {
    const statuses = new Set<string>()
    tags.forEach(tag => {
      if (tag.transport_assignment) {
        const status = tag.transport_assignment.status
        statuses.add(`transport_assignment:${status}`)
      } else {
        const status = tag.transport.status
        statuses.add(`transport:${status}`)
      }
    })
    return Array.from(statuses)
  }

  // ステータスフィルターの初期化（全てチェック状態）
  useEffect(() => {
    if (statusFilters.length === 0) {
      setStatusFilters(getAllStatuses())
    }
  }, [tags])

  // フィルタリング: トリアージカテゴリとステータスのAND条件
  const filteredTags = tags.filter(tag => {
    // トリアージカテゴリのフィルタリング
    const categoryMatch = filter === 'all' || tag.triage_category.final === filter
    
    // ステータスのフィルタリング
    let statusMatch = false
    if (tag.transport_assignment) {
      const status = `transport_assignment:${tag.transport_assignment.status}`
      statusMatch = statusFilters.includes(status)
    } else {
      const status = `transport:${tag.transport.status}`
      statusMatch = statusFilters.includes(status)
    }
    
    return categoryMatch && statusMatch
  })

  const stats = {
    total: tags.length,
    black: tags.filter(t => t.triage_category.final === 'black').length,
    red: tags.filter(t => t.triage_category.final === 'red').length,
    yellow: tags.filter(t => t.triage_category.final === 'yellow').length,
    green: tags.filter(t => t.triage_category.final === 'green').length,
  }

  // 地図の折り畳み/展開を切り替え
  const toggleMapCollapse = () => {
    const newState = !isMapCollapsed
    setIsMapCollapsed(newState)
    localStorage.setItem('commandDashboard_mapCollapsed', String(newState))
  }

  // ステータスフィルターの切り替え
  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  // ステータス表示用のヘルパー関数
  const getStatusDisplay = (statusKey: string) => {
    const [type, status] = statusKey.split(':')
    if (type === 'transport_assignment') {
      return {
        label: status === 'assigned' ? '搬送部隊割当済' :
               status === 'in_progress' ? '搬送中' :
               status === 'completed' ? '応急救護所到着' : '不明',
        color: status === 'assigned' ? 'bg-blue-100 text-blue-800' :
               status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
               status === 'completed' ? 'bg-green-100 text-green-800' :
               'bg-gray-100 text-gray-800'
      }
    } else {
      return {
        label: status === 'not_transported' ? '未搬送' :
               status === 'arrived' ? '応急救護所到着' :
               status === 'preparing' ? '搬送準備中' :
               status === 'in_transit' ? '病院搬送中' :
               status === 'completed' ? '搬送完了' : '不明',
        color: status === 'not_transported' ? 'bg-gray-100 text-gray-800' :
               status === 'arrived' ? 'bg-purple-100 text-purple-800' :
               status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
               status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
               status === 'completed' ? 'bg-green-100 text-green-800' :
               'bg-gray-100 text-gray-800'
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">指揮本部ダッシュボード</h1>
            <p className="text-sm opacity-90">リアルタイムトリアージ状況</p>
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

      <main className="max-w-7xl mx-auto p-6">
        {/* 統計カード（フィルター機能統合） */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`card text-center transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer ${
              filter === 'all' ? 'ring-4 ring-blue-500 shadow-xl' : ''
            }`}
          >
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-600">総数</p>
          </button>
          <button
            onClick={() => setFilter('black')}
            className={`card text-center bg-black text-white transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer ${
              filter === 'black' ? 'ring-4 ring-gray-400 shadow-xl' : ''
            }`}
          >
            <p className="text-3xl font-bold">{stats.black}</p>
            <p className="text-sm opacity-90">黒（死亡）</p>
          </button>
          <button
            onClick={() => setFilter('red')}
            className={`card text-center bg-red-500 text-white transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer ${
              filter === 'red' ? 'ring-4 ring-red-700 shadow-xl' : ''
            }`}
          >
            <p className="text-3xl font-bold">{stats.red}</p>
            <p className="text-sm opacity-90">赤（重症）</p>
          </button>
          <button
            onClick={() => setFilter('yellow')}
            className={`card text-center bg-yellow-400 transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer ${
              filter === 'yellow' ? 'ring-4 ring-yellow-600 shadow-xl' : ''
            }`}
          >
            <p className="text-3xl font-bold">{stats.yellow}</p>
            <p className="text-sm">黄（中等症）</p>
          </button>
          <button
            onClick={() => setFilter('green')}
            className={`card text-center bg-green-500 text-white transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer ${
              filter === 'green' ? 'ring-4 ring-green-700 shadow-xl' : ''
            }`}
          >
            <p className="text-3xl font-bold">{stats.green}</p>
            <p className="text-sm opacity-90">緑（軽症）</p>
          </button>
        </div>

        {/* ステータスフィルター */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">搬送ステータスフィルター</h3>
          <div className="flex flex-wrap gap-3">
            {getAllStatuses().map(statusKey => {
              const { label, color } = getStatusDisplay(statusKey)
              const isChecked = statusFilters.includes(statusKey)
              
              return (
                <label key={statusKey} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleStatusFilter(statusKey)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${color} ${
                    isChecked ? 'opacity-100' : 'opacity-50'
                  }`}>
                    {label}
                  </span>
                </label>
              )
            })}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            チェックしたステータスの患者のみ表示されます（トリアージカテゴリとのAND条件）
          </div>
        </div>

        {/* 地図表示（折り畳み可能） */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">患者位置マップ</h2>
            <button
              onClick={toggleMapCollapse}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition"
            >
              {isMapCollapsed ? (
                <>
                  <span>▼ 展開</span>
                </>
              ) : (
                <>
                  <span>▲ 折りたたむ</span>
                </>
              )}
            </button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isMapCollapsed ? 'max-h-0 opacity-0' : 'max-h-[600px] opacity-100'
            }`}
          >
            <TriageMap
              patients={filteredTags
                .filter(tag => tag.location && tag.location.latitude && tag.location.longitude)
                .map(tag => ({
                  id: tag.id,
                  position: [tag.location.latitude, tag.location.longitude] as [number, number],
                  category: tag.triage_category.final,
                  tagNumber: tag.tag_number,
                  anonymousId: tag.anonymous_id,
                }))}
              center={
                tags.length > 0 && tags[0].location
                  ? [tags[0].location.latitude, tags[0].location.longitude] as [number, number]
                  : undefined
              }
              onMarkerClick={(patientId) => {
                setSelectedPatientId(patientId)
                // スクロールして該当患者の詳細を表示
                const element = document.getElementById(`patient-${patientId}`)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  element.classList.add('ring-4', 'ring-blue-500')
                  setTimeout(() => {
                    element.classList.remove('ring-4', 'ring-blue-500')
                  }, 3000)
                }
              }}
            />
            <p className="text-sm text-gray-600 mt-2">
              地図上のマーカーをクリックすると、患者詳細が表示されます。
            </p>
          </div>
        </div>

        {/* トリアージタッグリスト */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">患者一覧（{filteredTags.length}件）</h2>
          {filteredTags.length === 0 ? (
            <p className="text-center text-gray-500 py-8">データがありません</p>
          ) : (
            <div className="space-y-3">
              {filteredTags.map(tag => {
                const category = tag.triage_category.final
                const categoryInfo = TriageCategories[category]

                return (
                  <div
                    key={tag.id}
                    id={`patient-${tag.id}`}
                    className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all ${selectedPatientId === tag.id ? 'ring-2 ring-blue-500' : ''}`}
                  >
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
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">
                            現在地: 
                            {tag.location.address ? (
                              <a 
                                href={`https://www.google.com/maps?q=${tag.location.latitude},${tag.location.longitude}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline ml-1"
                              >
                                {tag.location.address}
                              </a>
                            ) : tag.location.latitude && tag.location.longitude ? (
                              <a 
                                href={`https://www.google.com/maps?q=${tag.location.latitude},${tag.location.longitude}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline ml-1"
                              >
                                {tag.location.latitude}, {tag.location.longitude}
                              </a>
                            ) : (
                              <span className="ml-1">位置情報なし</span>
                            )}
                          </p>
                          {/* 搬送状態バッジ */}
                          {(() => {
                            let statusKey: string
                            if (tag.transport_assignment) {
                              statusKey = `transport_assignment:${tag.transport_assignment.status}`
                            } else {
                              statusKey = `transport:${tag.transport.status}`
                            }
                            const { label, color } = getStatusDisplay(statusKey)
                            
                            return (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
                                {label}
                              </span>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col gap-2">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setSelectedTagDetail(tag)}
                          className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                        >
                          詳細
                        </button>
                        {(tag.transport.status === 'not_transported' || tag.transport.status === 'preparing') && !tag.transport_assignment && (
                          <TransportAssignButton tag={tag} />
                        )}
                        {tag.transport_assignment && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            {tag.transport_assignment.team}割当済
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* 患者詳細モーダル */}
      <PatientDetailModal
        tag={selectedTagDetail}
        onClose={() => setSelectedTagDetail(null)}
        actions={selectedTagDetail && (
          <>
            {(selectedTagDetail.transport.status === 'not_transported' || selectedTagDetail.transport.status === 'preparing') && !selectedTagDetail.transport_assignment && (
              <TransportAssignButton tag={selectedTagDetail} />
            )}
            {selectedTagDetail.transport_assignment && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                {selectedTagDetail.transport_assignment.team}割当済
              </span>
            )}
          </>
        )}
      />
    </div>
  )
}
