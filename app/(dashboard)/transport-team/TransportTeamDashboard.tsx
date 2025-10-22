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
  const [selectedTeam, setSelectedTeam] = useState<string>('全チーム')
  const [selectedPatient, setSelectedPatient] = useState<TriageTag | null>(null)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isRealtime, setIsRealtime] = useState(false)
  const [filter, setFilter] = useState<'all' | 'black' | 'red' | 'yellow' | 'green'>('all')
  const [confirmingPatientId, setConfirmingPatientId] = useState<string | null>(null)

  const supabase = createClient()

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
          // console.log('Realtime update (transport team):', payload)

          // 搬送部隊に割り当てられた患者を再取得（作業中のもののみ）
          const { data, error } = await supabase
            .from('triage_tags')
            .select('*')
            .not('transport_assignment', 'is', null)
            .neq('transport->>status', 'arrived')
            .neq('transport->>status', 'completed')
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

  // カテゴリとチーム両方でフィルタリング
  const filteredPatients = patients
    .filter(patient => filter === 'all' || patient.triage_category.final === filter)
    .filter(patient => selectedTeam === '全チーム' 
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

      // 応急救護所到着時はtransport.statusのみ更新（統一）
      if (status === 'completed') {
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
      setPatients(prevPatients => 
        prevPatients.map(patient => {
          if (patient.id === tagId) {
            const updatedPatient = {
              ...patient,
              updated_at: new Date().toISOString(),
            }
            
            // 応急救護所到着時はtransport.statusのみ更新（統一）
            if (status === 'completed') {
              updatedPatient.transport = {
                ...patient.transport,
                status: 'arrived',
                arrival_time: new Date().toISOString(),
              }
            } else if (patient.transport_assignment) {
              // その他のステータス（assigned, in_progress）はtransport_assignmentで管理
              updatedPatient.transport_assignment = {
                ...patient.transport_assignment,
                status: status as 'assigned' | 'in_progress' | 'completed',
                updated_at: new Date().toISOString(),
              }
            }
            
            return updatedPatient
          }
          return patient
        })
      )

      if (status === 'in_progress') {
        setConfirmingPatientId(null)
        // 成功メッセージは表示しない（UIで即座に反映されるため）
      } else {
        alert(`搬送ステータスを${status === 'completed' ? '応急救護所到着' : status}に更新しました`)
      }
    } catch (error) {
      // console.error('Error updating transport status:', error)
      alert('ステータス更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // QRコードスキャン処理
  const handleQRScan = async (result: string) => {
    console.log('[TransportTeam] QR scan result:', result)

    try {
      let patientId = ''

      // 様々なQRコード形式に対応
      try {
        // JSON形式を試行
        const patientData = JSON.parse(result)
        patientId = patientData.id || patientData.patient_id || patientData.tag_id
        console.log('[TransportTeam] Parsed JSON patientId:', patientId)
      } catch {
        // 単純な文字列の場合
        patientId = result.trim()
        console.log('[TransportTeam] Direct string patientId:', patientId)
      }

      if (!patientId) {
        console.error('[TransportTeam] No patientId extracted')
        alert('❌ QRコード読み取りエラー\n\nQRコードから患者IDを取得できませんでした。\n正しいQRコードをスキャンしてください。')
        return
      }

      // 患者情報を取得
      console.log('[TransportTeam] Fetching patient by id:', patientId)
      const { data: patient, error } = await supabase
        .from('triage_tags')
        .select('*')
        .eq('id', patientId)
        .single()

      console.log('[TransportTeam] Patient by id result:', { patient, error })

      if (error || !patient) {
        // IDで見つからない場合、tag_numberやanonymous_idで検索
        console.log('[TransportTeam] Fetching patient by tag_number or anonymous_id:', patientId)
        const { data: patientByTag, error: tagError } = await supabase
          .from('triage_tags')
          .select('*')
          .or(`tag_number.eq.${patientId},anonymous_id.eq.${patientId}`)
          .single()

        console.log('[TransportTeam] Patient by tag result:', { patientByTag, tagError })

        if (tagError || !patientByTag) {
          console.error('[TransportTeam] Patient not found:', patientId)
          alert(`❌ 患者が見つかりません\n\nスキャンされたID: ${patientId}\n\nこのIDに該当する患者がデータベースに存在しません。\n・IDが正しいか確認してください\n・患者がまだ登録されていない可能性があります`)
          setShowQRScanner(false)
          return
        }

        // 搬送部隊割り当てチェック
        const patientByTagData = patientByTag as TriageTag
        console.log('[TransportTeam] Patient data (by tag):', {
          tag_number: patientByTagData.tag_number,
          anonymous_id: patientByTagData.anonymous_id,
          transport_assignment: patientByTagData.transport_assignment
        })

        // デバッグ情報を表示
        alert(`🔍 デバッグ情報 (by tag)\n\nタグ番号: ${patientByTagData.tag_number}\n患者ID: ${patientByTagData.anonymous_id}\ntransport_assignment:\n${JSON.stringify(patientByTagData.transport_assignment, null, 2)}`)

        if (!patientByTagData.transport_assignment) {
          console.warn('[TransportTeam] Patient has no transport_assignment')
          alert(`⚠️ 搬送未割当の患者です\n\nタグ番号: ${patientByTagData.tag_number}\n患者ID: ${patientByTagData.anonymous_id}\n\nこの患者はまだ搬送部隊に割り当てられていません。\n搬送調整ダッシュボードから割り当てを行ってください。`)
          setShowQRScanner(false)
          return
        }

        // completedステータスの患者をチェック
        if (patientByTagData.transport_assignment.status === 'completed') {
          console.warn('[TransportTeam] Patient already completed')
          alert(`✅ 搬送完了済みの患者です\n\nタグ番号: ${patientByTagData.tag_number}\n患者ID: ${patientByTagData.anonymous_id}\n割当チーム: ${patientByTagData.transport_assignment.team}\n\nこの患者は既に応急救護所に到着済みです。`)
          setShowQRScanner(false)
          return
        }

        // 患者詳細モーダルを表示
        console.log('[TransportTeam] Setting selected patient (by tag)')
        setShowQRScanner(false)
        // QRスキャナーモーダルが完全に閉じるのを待ってから患者モーダルを開く
        const teamName = patientByTagData.transport_assignment.team
        setTimeout(() => {
          setSelectedPatient(patientByTagData)
          alert(`✅ 患者情報を取得しました\n\nタグ番号: ${patientByTagData.tag_number}\n患者ID: ${patientByTagData.anonymous_id}\n割当チーム: ${teamName}`)
        }, 100)
        return
      }

      // 搬送部隊割り当てチェック
      const patientData = patient as TriageTag
      console.log('[TransportTeam] Patient data (by id):', {
        tag_number: patientData.tag_number,
        anonymous_id: patientData.anonymous_id,
        transport_assignment: patientData.transport_assignment
      })

      // デバッグ情報を表示
      alert(`🔍 デバッグ情報 (by id)\n\nタグ番号: ${patientData.tag_number}\n患者ID: ${patientData.anonymous_id}\ntransport_assignment:\n${JSON.stringify(patientData.transport_assignment, null, 2)}`)

      if (!patientData.transport_assignment) {
        console.warn('[TransportTeam] Patient has no transport_assignment')
        alert(`⚠️ 搬送未割当の患者です\n\nタグ番号: ${patientData.tag_number}\n患者ID: ${patientData.anonymous_id}\n\nこの患者はまだ搬送部隊に割り当てられていません。\n搬送調整ダッシュボードから割り当てを行ってください。`)
        setShowQRScanner(false)
        return
      }

      // completedステータスの患者をチェック
      if (patientData.transport_assignment.status === 'completed') {
        console.warn('[TransportTeam] Patient already completed')
        alert(`✅ 搬送完了済みの患者です\n\nタグ番号: ${patientData.tag_number}\n患者ID: ${patientData.anonymous_id}\n割当チーム: ${patientData.transport_assignment.team}\n\nこの患者は既に応急救護所に到着済みです。`)
        setShowQRScanner(false)
        return
      }

      // 患者詳細モーダルを表示
      console.log('[TransportTeam] Setting selected patient (by id)')
      setShowQRScanner(false)
      // QRスキャナーモーダルが完全に閉じるのを待ってから患者モーダルを開く
      const teamName = patientData.transport_assignment.team
      setTimeout(() => {
        setSelectedPatient(patientData)
        alert(`✅ 患者情報を取得しました\n\nタグ番号: ${patientData.tag_number}\n患者ID: ${patientData.anonymous_id}\n割当チーム: ${teamName}`)
      }, 100)

    } catch (error) {
      console.error('[TransportTeam] QR scan error:', error)
      const errorMsg = error instanceof Error ? error.message : '不明なエラー'
      const errorStack = error instanceof Error ? error.stack : ''
      console.error('[TransportTeam] Error details:', { errorMsg, errorStack })
      alert(`❌ QRコード処理エラー\n\nエラー詳細: ${errorMsg}\n\nもう一度スキャンしてください。問題が続く場合は手動入力をお試しください。`)
      setShowQRScanner(false)
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

        {/* チーム絞り込み */}
        <div className="card">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">チーム絞り込み:</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="input max-w-xs"
            >
              <option value="全チーム">全チーム</option>
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
              {selectedTeam === '全チーム' ? '搬送指示はありません' : `${selectedTeam}への搬送指示はありません`}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map(tag => {
                const category = tag.triage_category.final
                const categoryInfo = TriageCategories[category]
                const transportStatus = tag.transport_assignment?.status || 'assigned'

                return (
                  <div key={tag.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
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
                            {/* 搬送状態バッジ - 統一仕様 */}
                            {(() => {
                              // transport.statusが優先（arrived, completed）
                              if (tag.transport.status === 'arrived') {
                                return (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    応急救護所到着
                                  </span>
                                )
                              }
                              if (tag.transport.status === 'completed') {
                                return (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                    搬送完了
                                  </span>
                                )
                              }
                              // transport_assignment.statusを使用
                              const status = tag.transport_assignment?.status || 'assigned'
                              return (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  status === 'assigned' ? 'bg-indigo-100 text-indigo-800' :
                                  status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {status === 'assigned' ? '搬送部隊割当済' :
                                   status === 'in_progress' ? '搬送中' : '不明'}
                                </span>
                              )
                            })()}
                          </div>
                          <p className="text-xs text-gray-500">
現在地: 
                            {tag.location.address ? (
                              <a 
                                href={`https://www.google.com/maps?q=${tag.location.latitude},${tag.location.longitude}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {tag.location.address}
                              </a>
                            ) : tag.location.latitude && tag.location.longitude ? (
                              <a 
                                href={`https://www.google.com/maps?q=${tag.location.latitude},${tag.location.longitude}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {tag.location.latitude}, {tag.location.longitude}
                              </a>
                            ) : (
                              '位置情報なし'
                            )}
                            {' | 割当チーム: '}{tag.transport_assignment?.team || '未割当'}
                          </p>
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
                              <span className="text-orange-600 font-medium">搬送中</span>
                            </div>
                            <button
                              onClick={() => handleUpdateTransportStatus(tag.id, 'completed')}
                              disabled={loading}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            >
                              応急救護所到着
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
                      <span className="text-orange-600 font-medium">搬送中</span>
                    </div>
                    <button
                      onClick={() => {
                        handleUpdateTransportStatus(selectedPatient.id, 'completed')
                        setSelectedPatient(null)
                      }}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      応急救護所到着
                    </button>
                  </div>
                )}

                {transportStatus === 'completed' && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">応急救護所到着済み</span>
                  </div>
                )}
              </>
            )
          })()}
        />
      )}

      {/* QRスキャナーモーダル */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
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
                    // console.error('QR Scanner error:', error)
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