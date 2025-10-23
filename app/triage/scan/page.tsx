'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import QRScanner from '@/components/QRScanner'
import StartWizard, { StartTriageResult } from '@/components/StartWizard'
import VoiceInput from '@/components/VoiceInput'
import LogoutButton from '@/components/LogoutButton'
import ContactPointManager from '@/components/ContactPointManager'
import ImageUploader from '@/components/ImageUploader'
import { createLogger } from '@/lib/utils/logger'

type Step = 'qr' | 'start' | 'vitals' | 'info' | 'confirm'

// AVPUからJCS方式への変換
const mapAVPUtoJCS = (avpu: 'alert' | 'verbal' | 'pain' | 'unresponsive'): 'I' | 'II' | 'III' => {
  switch (avpu) {
    case 'alert':
      return 'I'
    case 'verbal':
      return 'II'
    case 'pain':
    case 'unresponsive':
      return 'III'
  }
}

export default function TriageScanPage() {
  const logger = createLogger('app/triage/scan')
  const router = useRouter()
  const supabase = createClient()

  // ステップ管理
  const [currentStep, setCurrentStepInternal] = useState<Step>('qr')
  const [currentUser, setCurrentUser] = useState<string>('')
  
  const setCurrentStep = (step: Step) => {
    setCurrentStepInternal(step)
  }

  // フォームデータ
  const [tagNumber, setTagNumber] = useState('')
  const [triageResult, setTriageResult] = useState<StartTriageResult | null>(null)
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    sex: '' as 'male' | 'female' | 'unknown',
  })
  const [vitalSigns, setVitalSigns] = useState({
    judger_name: '',
    judgment_location: '',
    judgment_time: '',
    consciousness: 'alert' as 'alert' | 'verbal' | 'pain' | 'unresponsive',
    respiratory_rate: '',
    pulse_rate: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    temperature: '',
  })
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
    accuracy: number
  } | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [networkStatus, setNetworkStatus] = useState(typeof window !== 'undefined' ? navigator.onLine : true)
  const [contactPoint, setContactPoint] = useState('')
  const [contactPoints, setContactPoints] = useState<string[]>([])
  const [eventId, setEventId] = useState<string | null>(null)
  const [isContactPointModalOpen, setIsContactPointModalOpen] = useState(false)
  const [isContactPointSectionExpanded, setIsContactPointSectionExpanded] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<Array<{
    id: string
    url: string
    type: 'wound' | 'scene' | 'body_diagram' | 'other'
    compressed_size: number
    taken_at: string
  }>>([])
  const [anonymousId, setAnonymousId] = useState('')

  // ログインユーザー情報を取得
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // デモ用: メールアドレスから名前を抽出（tri@demo.com → tri）
        const userName = user.email?.split('@')[0] || 'unknown'
        setCurrentUser(userName)
      }
    }
    getCurrentUser()
  }, [])

  // ネットワーク状態監視
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(true)
    const handleOffline = () => setNetworkStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // GPS位置情報を取得
  useEffect(() => {
    logger.debug('Init geolocation')
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        (error) => {
          // デモ用デフォルト位置（東京消防庁本部付近）
          logger.warn('Geolocation failed, fallback to default', { code: error.code })
          setLocation({
            latitude: 35.6895,
            longitude: 139.6917,
            accuracy: 100,
          })
        }
      )
    } else {
      // デモ用デフォルト位置
      logger.warn('Geolocation not available, use default')
      setLocation({
        latitude: 35.6895,
        longitude: 139.6917,
        accuracy: 100,
      })
    }
  }, [])


  // イベントIDと接触地点リストを取得
  useEffect(() => {
    loadEventData()
  }, [])

  const loadEventData = async () => {
    try {
      logger.debug('Load event data')
      // 最初のアクティブなイベントを取得
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, contact_points')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

      if (eventsError) throw eventsError

      if (events && events.length > 0) {
        setEventId(events[0].id)
        setContactPoints(events[0].contact_points || [])
        logger.info('Event loaded', { eventId: events[0].id, points: (events[0].contact_points || []).length })
      }
    } catch (err) {
      logger.error('Failed to load event data')
    }
  }

  const handleContactPointsUpdate = (updatedPoints: string[]) => {
    // モーダルで接触地点が更新されたら状態を更新
    setContactPoints(updatedPoints)
  }

  const handleQRScanSuccess = (decodedText: string) => {
    logger.info('QR scan success', { decodedText })
    // すでに処理済みの場合は無視
    if (currentStep !== 'qr') {
      logger.debug('Ignore QR: not in qr step')
      return
    }
    
    // QRコードから タグ番号を抽出
    // 想定フォーマット: "T-2025-001", "TAG-2025-001" または単純な番号
    
    // 既に正しいフォーマットの場合はそのまま使用
    if (decodedText.match(/^T-\d{4}-\d{3}$/)) {
      setTagNumber(decodedText)
      setCurrentStep('start')
      return
    }
    
    // TAG-付きのフォーマットの場合
    const tagMatch = decodedText.match(/^TAG-(\d{4}-\d{3})$/)
    if (tagMatch) {
      setTagNumber(`T-${tagMatch[1]}`)
      setCurrentStep('start')
      return
    }
    
    // 単純な番号の場合
    const numberMatch = decodedText.match(/^(\d+)$/)
    if (numberMatch) {
      const paddedNumber = String(numberMatch[1]).padStart(3, '0')
      setTagNumber(`T-2025-${paddedNumber}`)
      setCurrentStep('start')
      return
    }
    
    // どのパターンにもマッチしない場合はそのまま使用
    setTagNumber(decodedText)
    setCurrentStep('start')
  }

  const handleStartComplete = useCallback((result: StartTriageResult) => {
    logger.info('START result', { category: result.category })
    // 匿名IDを生成（まだ生成されていない場合）
    let finalAnonymousId = anonymousId
    if (!finalAnonymousId) {
      finalAnonymousId = `ANON-${Date.now().toString().slice(-6)}`
      setAnonymousId(finalAnonymousId)
    }

    // バイタルサインの自動入力
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM形式
    setVitalSigns(prev => ({
      ...prev,
      judger_name: currentUser || 'tri',
      judgment_location: '現場',
      judgment_time: currentTime,
    }))

    // 先にtriageResultを設定
    setTriageResult(result)
    // その後でcurrentStepを更新
    setCurrentStep('vitals')
  }, [anonymousId, currentUser])

  const handleVitalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    logger.debug('Vitals submit')
    setCurrentStep('info')
  }

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    logger.debug('Info submit')
    setCurrentStep('confirm')
  }

  const handleFinalSubmit = async () => {
    // １エラー防止：事前チェック
    if (!networkStatus) {
      setError('ネットワークに接続されていません。接続を確認してからやり直してください')
      return
    }

    if (!triageResult || !location) {
      setError('必須情報が不足しています（トリアージ判定または位置情報）')
      logger.warn('Submit blocked: missing triageResult or location')
      return
    }

    // 画像データの整合性チェック
    if (uploadedImages.length > 0) {
      const invalidImages = uploadedImages.filter(img => !img.url || !img.id)
      if (invalidImages.length > 0) {
        setError('画像データが不完全です。画像を削除して再度アップロードしてください')
        return
      }
    }

    // タグ番号の重複チェック（事前）
    if (tagNumber) {
      try {
        const { data: existing } = await supabase
          .from('triage_tags')
          .select('tag_number')
          .eq('tag_number', tagNumber)
          .limit(1)
        
        if (existing && existing.length > 0) {
          setError(`タグ番号 ${tagNumber} は既に使用されています。別の番号を入力してください`)
          return
        }
      } catch (err) {
        // 事前チェックエラーは警告レベル
        logger.warn('Pre-check failed, continuing with submission')
      }
    }

    setLoading(true)
    setError('')

    try {
      logger.info('Insert triage tag start')
      // デフォルトイベントID（デモ用に最初のイベントを使用）
      const { data: events, error: eventError } = await supabase
        .from('events')
        .select('id')
        .limit(1)
        .single()

      if (eventError || !events) {
        throw new Error('システムエラー: イベントデータを取得できません。管理者に連絡してください')
      }

      // 匿名IDを生成（または既存のものを使用）
      const finalAnonymousId = anonymousId || `ANON-${Date.now().toString().slice(-6)}`

      // データサイズチェック
      const dataToInsert = {
        event_id: events.id,
        anonymous_id: finalAnonymousId,
        tag_number: tagNumber,
        patient_info: {
          age: patientInfo.age ? parseInt(patientInfo.age) : null,
          sex: patientInfo.sex || 'unknown',
        },
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          method: 'gps',
          contact_point: contactPoint || null,
          timestamp: new Date().toISOString(),
        },
        vital_signs_records: {
          first: {
            judger_name: vitalSigns.judger_name || undefined,
            judgment_location: vitalSigns.judgment_location || undefined,
            judgment_time: vitalSigns.judgment_time || undefined,
            consciousness: mapAVPUtoJCS(vitalSigns.consciousness),
            respiratory_rate: vitalSigns.respiratory_rate ? parseInt(vitalSigns.respiratory_rate) : undefined,
            pulse_rate: vitalSigns.pulse_rate ? parseInt(vitalSigns.pulse_rate) : undefined,
            blood_pressure: (vitalSigns.blood_pressure_systolic && vitalSigns.blood_pressure_diastolic) ? {
              systolic: parseInt(vitalSigns.blood_pressure_systolic),
              diastolic: parseInt(vitalSigns.blood_pressure_diastolic)
            } : undefined,
            temperature: vitalSigns.temperature ? parseFloat(vitalSigns.temperature) : undefined,
          }
        },
        triage_category: {
          final: triageResult.category,
          initial: triageResult.category,
          start_steps: triageResult.steps,
          reasoning: triageResult.reasoning,
          timestamp: new Date().toISOString(),
        },
        attachments: {
          images: uploadedImages,
          audio_notes: [],
          drone_images: [],
        },
        treatments: notes
          ? [
              {
                type: 'observation',
                description: notes,
                timestamp: new Date().toISOString(),
              },
            ]
          : [],
        transport: {
          status: 'not_transported',
        },
        audit: {
          created_by: 'user-tri-001', // デモ用
          created_at: new Date().toISOString(),
          updated_by: 'user-tri-001',
          updated_at: new Date().toISOString(),
        },
      }

      // データサイズ制限チェック（JSON文字列で8MB以下）
      const dataString = JSON.stringify(dataToInsert)
      if (dataString.length > 8 * 1024 * 1024) {
        throw new Error('データサイズが大きすぎます。画像を減らすか、メモを短縮してください')
      }

      // トリアージタッグを登録
      const { error: insertError } = await supabase.from('triage_tags').insert(dataToInsert)

      if (insertError) {
        // ２明確なエラー原因と対処法
        if (insertError.message.includes('duplicate') || insertError.code === '23505') {
          throw new Error(`タグ番号 ${tagNumber} は既に使用されています。\n対処：異なるタグ番号を入力してください`)
        }
        if (insertError.message.includes('network') || insertError.code === 'PGRST301') {
          throw new Error('ネットワークエラーが発生しました。\n対処：接続を確認して再度お試しください')
        }
        if (insertError.message.includes('payload') || insertError.message.includes('too large')) {
          throw new Error('データサイズが大きすぎます。\n対処：画像を減らすかメモを短縮してください')
        }
        if (insertError.code === '42501') {
          throw new Error('データベースアクセス権限がありません。\n対処：管理者に連絡してください')
        }
        // 一般的なエラー
        throw new Error(`登録エラーが発生しました。\nエラー詳細: ${insertError.message}\n対処：画面を更新して再度お試しください`)
      }

      alert('トリアージタッグを登録しました')
      logger.info('Insert triage tag success')

      // フォームをリセットして最初の画面に戻る
      resetForm()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登録に失敗しました'
      setError(errorMessage)
      logger.error('Insert triage tag failed', { error: errorMessage })
      
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceTranscript = (text: string) => {
    logger.debug('Voice transcript received')
    setNotes((prev) => {
      const newNotes = prev ? `${prev} ${text}` : text
      return newNotes
    })
  }

  const resetForm = () => {
    setTagNumber('')
    setTriageResult(null)
    setPatientInfo({
      age: '',
      sex: 'unknown',
    })
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    setVitalSigns({
      judger_name: currentUser || 'tri',
      judgment_location: '現場',
      judgment_time: currentTime,
      consciousness: 'alert',
      respiratory_rate: '',
      pulse_rate: '',
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      temperature: '',
    })
    setNotes('')
    setContactPoint('')
    setUploadedImages([])
    setAnonymousId('')
    setCurrentStep('qr')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">トリアージ入力</h1>
            <p className="text-sm opacity-90">START法による傷病者トリアージ</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* プログレスバー */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-bold ${currentStep === 'qr' ? 'text-blue-600' : 'text-gray-400'}`}>
              1. QRスキャン
            </span>
            <span className={`text-sm font-bold ${currentStep === 'start' ? 'text-blue-600' : 'text-gray-400'}`}>
              2. START法
            </span>
            <span className={`text-sm font-bold ${currentStep === 'vitals' ? 'text-blue-600' : 'text-gray-400'}`}>
              3. バイタル
            </span>
            <span className={`text-sm font-bold ${currentStep === 'info' ? 'text-blue-600' : 'text-gray-400'}`}>
              4. 患者情報
            </span>
            <span className={`text-sm font-bold ${currentStep === 'confirm' ? 'text-blue-600' : 'text-gray-400'}`}>
              5. 確認
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  currentStep === 'qr'
                    ? 20
                    : currentStep === 'start'
                    ? 40
                    : currentStep === 'vitals'
                    ? 60
                    : currentStep === 'info'
                    ? 80
                    : 100
                }%`,
              }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">エラー</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* ステップ1: QRスキャン */}
        {currentStep === 'qr' && (
          <div>
            <QRScanner onScanSuccess={handleQRScanSuccess} onScanError={setError} />
            <div className="mt-4 p-4 bg-white rounded-lg shadow">
              <p className="text-sm font-bold mb-2">または手動入力:</p>
              <input
                type="text"
                value={tagNumber}
                onChange={(e) => setTagNumber(e.target.value)}
                placeholder="T-2025-XXX"
                className="input mb-2"
              />
              <button
                onClick={() => tagNumber && setCurrentStep('start')}
                disabled={!tagNumber}
                className="btn-primary w-full disabled:opacity-50"
              >
                次へ
              </button>
            </div>

            {/* 接触地点の登録ボタン */}
            <div className="mt-4 p-4 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">接触地点の管理</h3>
                  {contactPoints.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      登録済み: {contactPoints.length}件
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsContactPointSectionExpanded(!isContactPointSectionExpanded)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition"
                >
                  {isContactPointSectionExpanded ? (
                    <span>▲ 折りたたむ</span>
                  ) : (
                    <span>▼ 展開</span>
                  )}
                </button>
              </div>
              
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isContactPointSectionExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">
                    現場内での患者発見位置を登録・管理できます
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">接触地点設定</span>
                    <button
                      onClick={() => setIsContactPointModalOpen(true)}
                      className="bg-purple-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-purple-700 transition whitespace-nowrap"
                    >
                      管理
                    </button>
                  </div>
                  {contactPoints.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                      <p className="text-xs text-gray-600 mb-2">登録済み接触地点:</p>
                      <div className="flex flex-wrap gap-1">
                        {contactPoints.map((point, index) => (
                          <span
                            key={index}
                            className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold"
                          >
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ステップ2: START法ウィザード */}
        {currentStep === 'start' && (
          <div>
            <div className="mb-4 p-4 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600">タグ番号: {tagNumber}</p>
            </div>
            <StartWizard
              key={`start-wizard-${tagNumber}`}
              onComplete={handleStartComplete}
              onCancel={() => {
                resetForm()
              }}
            />
          </div>
        )}

        {/* ステップ3: バイタルサイン入力 */}
        {currentStep === 'vitals' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">バイタルサイン入力</h2>
                <button
                  onClick={() => setCurrentStep('qr')}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-bold hover:bg-gray-400 transition text-sm"
                >
                  最初からやり直す
                </button>
              </div>
              {triageResult && (
                <div className="inline-block px-4 py-2 rounded-lg font-bold" style={{
                  backgroundColor: ['black', 'red', 'yellow', 'green'][['black', 'red', 'yellow', 'green'].indexOf(triageResult.category)] === 'black' ? '#000' :
                                   ['black', 'red', 'yellow', 'green'][['black', 'red', 'yellow', 'green'].indexOf(triageResult.category)] === 'red' ? '#ef4444' :
                                   ['black', 'red', 'yellow', 'green'][['black', 'red', 'yellow', 'green'].indexOf(triageResult.category)] === 'yellow' ? '#eab308' : '#22c55e',
                  color: triageResult.category === 'yellow' ? '#000' : '#fff'
                }}>
                  判定: {triageResult.category === 'black' ? '黒（死亡）' :
                        triageResult.category === 'red' ? '赤（重症）' :
                        triageResult.category === 'yellow' ? '黄（中等症）' : '緑（軽症）'}
                </div>
              )}
            </div>

            <form onSubmit={handleVitalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">判定者名</label>
                <input
                  type="text"
                  value={vitalSigns.judger_name}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, judger_name: e.target.value })}
                  className="input"
                  placeholder="例: tri"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">判定場所</label>
                <input
                  type="text"
                  value={vitalSigns.judgment_location}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, judgment_location: e.target.value })}
                  className="input"
                  placeholder="例: 現場"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">判定時間</label>
                <input
                  type="time"
                  value={vitalSigns.judgment_time}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, judgment_time: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">意識レベル</label>
                <select
                  value={vitalSigns.consciousness}
                  onChange={(e) =>
                    setVitalSigns({
                      ...vitalSigns,
                      consciousness: e.target.value as any,
                    })
                  }
                  className="input"
                >
                  <option value="alert">清明（Alert）</option>
                  <option value="verbal">音声刺激で反応（Verbal）</option>
                  <option value="pain">痛み刺激で反応（Pain）</option>
                  <option value="unresponsive">無反応（Unresponsive）</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">呼吸数（回/分）</label>
                <input
                  type="number"
                  value={vitalSigns.respiratory_rate}
                  onChange={(e) =>
                    setVitalSigns({ ...vitalSigns, respiratory_rate: e.target.value })
                  }
                  className="input"
                  placeholder="例: 20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">脈拍数（回/分）</label>
                <input
                  type="number"
                  value={vitalSigns.pulse_rate}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, pulse_rate: e.target.value })}
                  className="input"
                  placeholder="例: 80"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">血圧（mmHg）</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={vitalSigns.blood_pressure_systolic}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, blood_pressure_systolic: e.target.value })}
                    className="input flex-1"
                    placeholder="収縮期"
                  />
                  <span className="self-center">/</span>
                  <input
                    type="number"
                    value={vitalSigns.blood_pressure_diastolic}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, blood_pressure_diastolic: e.target.value })}
                    className="input flex-1"
                    placeholder="拡張期"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">体温（°C）【任意】</label>
                <input
                  type="number"
                  step="0.1"
                  value={vitalSigns.temperature}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                  className="input"
                  placeholder="例: 36.5"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentStep('start')
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-bold hover:bg-gray-400"
                >
                  戻る
                </button>
                <button type="submit" className="flex-1 btn-primary py-3">
                  次へ
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ステップ4: 患者情報入力 */}
        {currentStep === 'info' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">患者情報・メモ</h2>
              <button
                onClick={() => {
                  resetForm()
                }}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-bold hover:bg-gray-400 transition text-sm"
              >
                最初からやり直す
              </button>
            </div>

            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">推定年齢</label>
                <input
                  type="number"
                  value={patientInfo.age}
                  onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                  className="input"
                  placeholder="例: 45"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">性別</label>
                <select
                  value={patientInfo.sex}
                  onChange={(e) =>
                    setPatientInfo({ ...patientInfo, sex: e.target.value as any })
                  }
                  className="input"
                >
                  <option value="unknown">不明</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                </select>
              </div>

              {/* 接触地点選択（登録済みの場合のみ表示） */}
              {contactPoints.length > 0 && (
                <div>
                  <label className="block text-sm font-bold mb-2">接触地点（任意）</label>
                  <select
                    value={contactPoint}
                    onChange={(e) => setContactPoint(e.target.value)}
                    className="input"
                  >
                    <option value="">選択しない</option>
                    {contactPoints.map((point, index) => (
                      <option key={index} value={point}>
                        {point}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    現場内での患者発見位置を選択できます
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-2">メモ・所見</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="外傷の状態、意識レベルの変化など"
                />
                <div className="mt-3">
                  <VoiceInput onTranscript={handleVoiceTranscript} />
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-bold mb-2">画像アップロード（任意）</label>
                <ImageUploader
                  tagId={anonymousId || tagNumber}
                  onUploadComplete={(images) => setUploadedImages(images)}
                />
              </div>

              {location && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm font-bold text-green-800">位置情報取得済み</p>
                  <p className="text-xs text-green-600 mt-1">
                    緯度: {location.latitude.toFixed(6)}, 経度: {location.longitude.toFixed(6)}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('vitals')}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-bold hover:bg-gray-400"
                >
                  戻る
                </button>
                <button type="submit" className="flex-1 btn-primary py-3">
                  確認画面へ
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ステップ5: 確認・登録 */}
        {currentStep === 'confirm' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">登録内容の確認</h2>
              <button
                onClick={() => {
                  resetForm()
                }}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-bold hover:bg-gray-400 transition text-sm"
              >
                最初からやり直す
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-3">
                <p className="text-sm text-gray-600">タグ番号</p>
                <p className="font-bold text-lg">{tagNumber}</p>
              </div>

              {triageResult && (
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-600">トリアージ判定</p>
                  <p className="font-bold text-lg" style={{
                    color: triageResult.category === 'black' ? '#000' :
                          triageResult.category === 'red' ? '#ef4444' :
                          triageResult.category === 'yellow' ? '#eab308' : '#22c55e'
                  }}>
                    {triageResult.category === 'black' ? '黒（死亡）' :
                     triageResult.category === 'red' ? '赤（重症）' :
                     triageResult.category === 'yellow' ? '黄（中等症）' : '緑（軽症）'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">理由: {triageResult.reasoning}</p>
                </div>
              )}

              <div className="border-b pb-3">
                <p className="text-sm text-gray-600">バイタルサイン</p>
                <ul className="text-sm mt-1">
                  {vitalSigns.judger_name && <li>判定者名: {vitalSigns.judger_name}</li>}
                  {vitalSigns.judgment_location && <li>判定場所: {vitalSigns.judgment_location}</li>}
                  {vitalSigns.judgment_time && <li>判定時間: {vitalSigns.judgment_time}</li>}
                  <li>意識: {vitalSigns.consciousness}</li>
                  {vitalSigns.respiratory_rate && (
                    <li>呼吸数: {vitalSigns.respiratory_rate} 回/分</li>
                  )}
                  {vitalSigns.pulse_rate && <li>脈拍数: {vitalSigns.pulse_rate} 回/分</li>}
                  {(vitalSigns.blood_pressure_systolic || vitalSigns.blood_pressure_diastolic) && (
                    <li>血圧: {vitalSigns.blood_pressure_systolic || '-'}/{vitalSigns.blood_pressure_diastolic || '-'} mmHg</li>
                  )}
                  {vitalSigns.temperature && <li>体温: {vitalSigns.temperature}°C</li>}
                </ul>
              </div>

              <div className="border-b pb-3">
                <p className="text-sm text-gray-600">患者情報</p>
                <ul className="text-sm mt-1">
                  {patientInfo.age && <li>年齢: {patientInfo.age}歳</li>}
                  <li>性別: {patientInfo.sex === 'male' ? '男性' : patientInfo.sex === 'female' ? '女性' : '不明'}</li>
                </ul>
              </div>

              {contactPoint && (
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-600">接触地点</p>
                  <p className="text-sm mt-1 font-bold text-purple-700">{contactPoint}</p>
                </div>
              )}

              {notes && (
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-600">メモ</p>
                  <p className="text-sm mt-1">{notes}</p>
                </div>
              )}

              {uploadedImages.length > 0 && (
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-600 mb-2">添付画像（{uploadedImages.length}枚）</p>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedImages.map((image, index) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt={`添付画像 ${index + 1}`}
                          className="w-full h-24 object-cover rounded border border-gray-200"
                        />
                        <span className="absolute top-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {image.type === 'wound' ? '外傷' :
                           image.type === 'scene' ? '現場' :
                           image.type === 'body_diagram' ? '身体図' : 'その他'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {location && (
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-600">位置情報</p>
                  <p className="text-sm mt-1">
                    緯度: {location.latitude.toFixed(6)}, 経度:{' '}
                    {location.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>

            {!networkStatus && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
                <p className="text-orange-800 font-medium">⚠️ オフラインです。登録にはネットワーク接続が必要です</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-800 font-medium whitespace-pre-line">{error}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCurrentStep('info')}
                disabled={loading}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-bold hover:bg-gray-400 disabled:opacity-50"
              >
                戻る
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={loading || !networkStatus}
                className={`flex-1 py-3 disabled:opacity-50 ${!networkStatus ? 'btn-disabled' : 'btn-primary'}`}
              >
                {loading ? '登録中...' : 
                 !networkStatus ? 'オフライン' :
                 '登録する'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 接触地点管理モーダル */}
      {eventId && isContactPointModalOpen && (
        <ContactPointManager
          eventId={eventId}
          contactPoints={contactPoints}
          onClose={() => setIsContactPointModalOpen(false)}
          onUpdate={handleContactPointsUpdate}
        />
      )}
    </div>
  )
}
