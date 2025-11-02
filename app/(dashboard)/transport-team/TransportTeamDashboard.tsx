'use client'

import { useState, useEffect } from 'react'
import { TriageTag, TriageCategories } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import LogoutButton from '@/components/LogoutButton'
import PatientDetailModal from '@/components/PatientDetailModal'
import QRScanner from '@/components/QRScanner'

interface TransportTeamDashboardProps {
  assignedPatients: TriageTag[]
}

const TRANSPORT_TEAMS = [
  '新宿ポンプ1',
  '新宿ポンプ2', 
  '新宿救助1',
  '三本部機動'
]

export default function TransportTeamDashboard({ assignedPatients }: TransportTeamDashboardProps) {
  const [patients, setPatients] = useState<TriageTag[]>(assignedPatients)
  const [selectedTeam, setSelectedTeam] = useState<string>('全搬送部隊')
  const [selectedPatient, setSelectedPatient] = useState<TriageTag | null>(null)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isRealtime, setIsRealtime] = useState(false)
  const [filter, setFilter] = useState<'all' | 'black' | 'red' | 'yellow' | 'green'>('all')
  const [confirmingPatientId, setConfirmingPatientId] = useState<string | null>(null)

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

  // Supabase Realtimeでデータベース変更を購読
  useEffect(() => {
    const channel = supabase
      .channel('transport_team_triage_tags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'triage_tags',
        },
        async (payload) => {
          // 搬送部隊に割り当てられた患者を再取得（作業中のもののみ）
          const { data, error } = await supabase
            .from('triage_tags')
            .select('*')
            .not('transport_assignment', 'is', null)
            .neq('transport_assignment->>status', 'completed')
            .order('triage_category->final', { ascending: true })
            .order('created_at', { ascending: true })

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
  }, [supabase])

  // トリアージカテゴリ別の統計
  const stats = {
    total: patients.length,
    black: patients.filter(p => p.triage_category.final === 'black').length,
    red: patients.filter(p => p.triage_category.final === 'red').length,
    yellow: patients.filter(p => p.triage_category.final === 'yellow').length,
    green: patients.filter(p => p.triage_category.final === 'green').length,
  }

  // カテゴリと搬送部隊両方でフィルタリング
  const filteredPatients = patients
    .filter(patient => filter === 'all' || patient.triage_category.final === filter)
    .filter(patient => selectedTeam === '全搬送部隊'
      ? patient.transport_assignment?.team || !patient.transport_assignment
      : patient.transport_assignment?.team === selectedTeam)

  // 搬送ステータス更新
  const handleUpdateTransportStatus = async (tagId: string, status: string) => {
    setLoading(true)
    try {
      // 現在のタグデータを取得
      const { data: currentTag } = await supabase
        .from('triage_tags')
        .select('transport_assignment, transport')
        .eq('id', tagId)
        .single()

      let updateData: any = {
        updated_at: new Date().toISOString(),
      }

      // 応急救護所到着時はtransport_assignmentとtransportの両方を更新
      if (status === 'completed') {
        updateData.transport_assignment = {
          ...currentTag?.transport_assignment,
          status: 'completed',
          updated_at: new Date().toISOString(),
        }
        updateData.transport = {
          ...currentTag?.transport,
          status: 'arrived',
          arrival_time: new Date().toISOString(),
        }
      } else {
        // その他のステータス（assigned, in_progress）はtransport_assignmentで管理
        updateData.transport_assignment = {
          ...currentTag?.transport_assignment,
          status: status,
          updated_at: new Date().toISOString(),
        }
      }

      const { error } = await supabase
        .from('triage_tags')
        .update(updateData)
        .eq('id', tagId)

      if (error) throw error

      // ローカル状態を即座に更新
      setPatients(prevPatients => {
        // 応急救護所到着の場合は一覧から削除
        if (status === 'completed') {
          return prevPatients.filter(patient => patient.id !== tagId)
        }

        // その他のステータスは更新
        return prevPatients.map(patient => {
          if (patient.id === tagId && patient.transport_assignment) {
            return {
              ...patient,
              transport_assignment: {
                ...patient.transport_assignment,
                status: status as 'assigned' | 'in_progress' | 'completed',
                updated_at: new Date().toISOString(),
              },
              updated_at: new Date().toISOString(),
            }
          }
          return patient
        })
      })

      if (status === 'in_progress') {
        setConfirmingPatientId(null)
        // 成功メッセージは表示しない（UIで即座に反映されるため）
      } else {
        alert(`搬送ステータスを${status === 'completed' ? '応急' : status}に更新しました`)
      }
    } catch (error) {
      alert('ステータス更新に失敗しました')
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
        setSelectedPatient(patientByTag as TriageTag)
        setShowQRScanner(false)
        return
      }

      // 患者詳細モーダルを表示
      setSelectedPatient(patient as TriageTag)
      setShowQRScanner(false)

    } catch (error) {
      alert('QRコードの読み取りに失敗しました')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-orange-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">搬送部隊ダッシュボード</h1>
            <p className="text-sm opacity-90">搬送指示・患者搬送管理</p>
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
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors"
            >
              QRスキャン
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 統計カード（フィルター機能統合） */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`card text-center transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer ${
              filter === 'all' ? 'ring-4 ring-orange-500 shadow-xl' : ''
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

        {/* 搬送部隊絞り込み */}
        <div className="card">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">搬送部隊絞り込み:</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="input max-w-xs"
            >
              <option value="全搬送部隊">全搬送部隊</option>
              {TRANSPORT_TEAMS.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600 ml-auto">
              表示中: {filteredPatients.length}件 / 全{patients.length}件
            </span>
          </div>
        </div>

        {/* 搬送指示一覧 */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">患者一覧（{filteredPatients.length}件）</h2>
          {filteredPatients.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {selectedTeam === '全搬送部隊' ? '搬送指示はありません' : `${selectedTeam}への搬送指示はありません`}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map(tag => {
                const category = tag.triage_category.final
                const categoryInfo = TriageCategories[category]
                const transportStatus = tag.transport_assignment?.status || 'assigned'

                return (
                  <div key={tag.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-lg font-bold ${categoryInfo.color} ${categoryInfo.textColor}`}>
                          {tag.tag_number}
                        </span>
                        <div>
                          {/* 1行目: フェーズ + 患者属性 */}
                          <div className="flex items-center gap-2 mb-1">
                            {(() => {
                              const phaseInfo = getPhaseInfo(tag)
                              return (
                                <>
                                  <span className="text-base">{phaseInfo.icon}</span>
                                  <span className="text-sm font-medium text-gray-900">{phaseInfo.phase}</span>
                                  <span className="text-gray-400">|</span>
                                  <span className="text-sm text-gray-700">
                                    {tag.patient_info?.age && `${tag.patient_info.age}歳`}
                                    {tag.patient_info?.sex && tag.patient_info?.age && ' '}
                                    {tag.patient_info?.sex && `${tag.patient_info.sex === 'male' ? '男性' : tag.patient_info.sex === 'female' ? '女性' : tag.patient_info.sex}`}
                                    {(!tag.patient_info?.age && !tag.patient_info?.sex) && '詳細情報なし'}
                                  </span>
                                </>
                              )
                            })()}
                          </div>
                          {/* 2行目: 担当者 + 位置情報 */}
                          <div className="flex items-center gap-2">
                            {(() => {
                              const phaseInfo = getPhaseInfo(tag)
                              return (
                                <>
                                  <span className="text-xs text-gray-600">{phaseInfo.responsible}</span>
                                  <span className="text-gray-400">|</span>
                                  <span className="text-xs text-gray-500">
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
                                        {phaseInfo.location}
                                      </a>
                                    ) : (
                                      <span>位置情報なし</span>
                                    )}
                                  </span>
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPatient(tag)}
                          className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                        >
                          詳細
                        </button>
                        
                        {transportStatus === 'assigned' && confirmingPatientId !== tag.id && (
                          <button
                            onClick={() => setConfirmingPatientId(tag.id)}
                            disabled={loading}
                            className="btn-primary disabled:opacity-50"
                          >
                            搬送開始
                          </button>
                        )}
                        
                        {transportStatus === 'assigned' && confirmingPatientId === tag.id && (
                          <div className="flex gap-2 items-center">
                            <span className="text-sm text-gray-600">本当に開始？</span>
                            <button
                              onClick={() => handleUpdateTransportStatus(tag.id, 'in_progress')}
                              disabled={loading}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => setConfirmingPatientId(null)}
                              className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm font-medium"
                            >
                              キャンセル
                            </button>
                          </div>
                        )}
                        
                        {transportStatus === 'in_progress' && (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                              <span className="text-orange-600 font-medium">応急へ</span>
                            </div>
                            <button
                              onClick={() => handleUpdateTransportStatus(tag.id, 'completed')}
                              disabled={loading}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            >
                              応急到着
                            </button>
                          </div>
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
      {selectedPatient && (
        <PatientDetailModal
          tag={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          actions={(() => {
            const transportStatus = selectedPatient.transport_assignment?.status || 'assigned'
            return (
              <>
                {transportStatus === 'assigned' && confirmingPatientId !== selectedPatient.id && (
                  <button
                    onClick={() => setConfirmingPatientId(selectedPatient.id)}
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    搬送開始
                  </button>
                )}
                
                {transportStatus === 'assigned' && confirmingPatientId === selectedPatient.id && (
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-600">本当に開始？</span>
                    <button
                      onClick={() => {
                        handleUpdateTransportStatus(selectedPatient.id, 'in_progress')
                        setSelectedPatient(null)
                      }}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setConfirmingPatientId(null)}
                      className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm font-medium"
                    >
                      キャンセル
                    </button>
                  </div>
                )}
                
                {transportStatus === 'in_progress' && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-orange-600 font-medium">応急へ</span>
                    </div>
                    <button
                      onClick={() => {
                        handleUpdateTransportStatus(selectedPatient.id, 'completed')
                        setSelectedPatient(null)
                      }}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      応急到着
                    </button>
                  </div>
                )}
              </>
            )
          })()}
        />
      )}

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
                    className="text-blue-600 hover:underline text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50"
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