'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import QRScanner from '@/components/QRScanner'
import StartWizard, { StartTriageResult } from '@/components/StartWizard'
import VoiceInput from '@/components/VoiceInput'
import LogoutButton from '@/components/LogoutButton'

type Step = 'qr' | 'start' | 'vitals' | 'info' | 'confirm'

export default function TriageScanPage() {
  const router = useRouter()
  const supabase = createClient()

  // ステップ管理
  const [currentStep, setCurrentStep] = useState<Step>('qr')

  // フォームデータ
  const [tagNumber, setTagNumber] = useState('')
  const [triageResult, setTriageResult] = useState<StartTriageResult | null>(null)
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    sex: '' as 'male' | 'female' | 'unknown',
  })
  const [vitalSigns, setVitalSigns] = useState({
    respiratory_rate: '',
    pulse_rate: '',
    systolic_bp: '',
    consciousness: 'alert' as 'alert' | 'verbal' | 'pain' | 'unresponsive',
  })
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
    accuracy: number
  } | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // GPS位置情報を取得
  useEffect(() => {
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
          console.error('位置情報取得エラー:', error)
          // デモ用デフォルト位置（東京消防庁本部付近）
          setLocation({
            latitude: 35.6895,
            longitude: 139.6917,
            accuracy: 100,
          })
        }
      )
    } else {
      // デモ用デフォルト位置
      setLocation({
        latitude: 35.6895,
        longitude: 139.6917,
        accuracy: 100,
      })
    }
  }, [])

  const handleQRScanSuccess = (decodedText: string) => {
    // QRコードから タグ番号を抽出
    // 想定フォーマット: "TAG-2025-001" または単純な番号
    const tagMatch = decodedText.match(/(?:TAG-)?(\d{4}-\d{3})/) || decodedText.match(/(\d+)/)
    if (tagMatch) {
      const extractedTag = tagMatch[1]
      setTagNumber(`T-2025-${String(extractedTag).padStart(3, '0')}`)
      setCurrentStep('start')
    } else {
      // デモ用：QRコードの内容をそのまま使用
      setTagNumber(decodedText)
      setCurrentStep('start')
    }
  }

  const handleStartComplete = (result: StartTriageResult) => {
    setTriageResult(result)
    setCurrentStep('vitals')
  }

  const handleVitalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep('info')
  }

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep('confirm')
  }

  const handleFinalSubmit = async () => {
    if (!triageResult || !location) {
      setError('必須情報が不足しています')
      return
    }

    setLoading(true)
    setError('')

    try {
      // デフォルトイベントID（デモ用に最初のイベントを使用）
      const { data: events } = await supabase
        .from('events')
        .select('id')
        .limit(1)
        .single()

      if (!events) {
        throw new Error('イベントが見つかりません')
      }

      // 匿名IDを生成
      const anonymousId = `ANON-${Date.now().toString().slice(-6)}`

      // トリアージタグを登録
      const { error: insertError } = await supabase.from('triage_tags').insert({
        event_id: events.id,
        anonymous_id: anonymousId,
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
          timestamp: new Date().toISOString(),
        },
        vital_signs: {
          respiratory_rate: vitalSigns.respiratory_rate ? parseInt(vitalSigns.respiratory_rate) : null,
          pulse_rate: vitalSigns.pulse_rate ? parseInt(vitalSigns.pulse_rate) : null,
          systolic_bp: vitalSigns.systolic_bp ? parseInt(vitalSigns.systolic_bp) : null,
          consciousness: vitalSigns.consciousness,
          timestamp: new Date().toISOString(),
        },
        triage_category: {
          final: triageResult.category,
          initial: triageResult.category,
          start_steps: triageResult.steps,
          reasoning: triageResult.reasoning,
          timestamp: new Date().toISOString(),
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
      })

      if (insertError) {
        throw insertError
      }

      alert('トリアージタグを登録しました')

      // フォームをリセットして最初の画面に戻る
      setTagNumber('')
      setTriageResult(null)
      setPatientInfo({
        age: '',
        sex: 'unknown',
      })
      setVitalSigns({
        respiratory_rate: '',
        pulse_rate: '',
        systolic_bp: '',
        consciousness: 'alert',
      })
      setNotes('')
      setCurrentStep('qr')
    } catch (err) {
      console.error('Registration error:', err)
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceTranscript = (text: string) => {
    setNotes((prev) => (prev ? `${prev} ${text}` : text))
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
          </div>
        )}

        {/* ステップ2: START法ウィザード */}
        {currentStep === 'start' && (
          <div>
            <div className="mb-4 p-4 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600">タグ番号: {tagNumber}</p>
            </div>
            <StartWizard
              onComplete={handleStartComplete}
              onCancel={() => setCurrentStep('qr')}
            />
          </div>
        )}

        {/* ステップ3: バイタルサイン入力 */}
        {currentStep === 'vitals' && triageResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">バイタルサイン入力</h2>
              <div className="inline-block px-4 py-2 rounded-lg font-bold" style={{
                backgroundColor: ['black', 'red', 'yellow', 'green'][['black', 'red', 'yellow', 'green'].indexOf(triageResult.category)] === 'black' ? '#000' :
                                 ['black', 'red', 'yellow', 'green'][['black', 'red', 'yellow', 'green'].indexOf(triageResult.category)] === 'red' ? '#ef4444' :
                                 ['black', 'red', 'yellow', 'green'][['black', 'red', 'yellow', 'green'].indexOf(triageResult.category)] === 'yellow' ? '#eab308' : '#22c55e',
                color: triageResult.category === 'yellow' ? '#000' : '#fff'
              }}>
                判定: {triageResult.category === 'black' ? '⚫ 黒（死亡）' :
                      triageResult.category === 'red' ? '🔴 赤（重症）' :
                      triageResult.category === 'yellow' ? '🟡 黄（中等症）' : '🟢 緑（軽症）'}
              </div>
            </div>

            <form onSubmit={handleVitalSubmit} className="space-y-4">
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
                <label className="block text-sm font-bold mb-2">収縮期血圧（mmHg）</label>
                <input
                  type="number"
                  value={vitalSigns.systolic_bp}
                  onChange={(e) =>
                    setVitalSigns({ ...vitalSigns, systolic_bp: e.target.value })
                  }
                  className="input"
                  placeholder="例: 120"
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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('start')}
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
            <h2 className="text-xl font-bold mb-6">患者情報・メモ</h2>

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

              <div>
                <label className="block text-sm font-bold mb-2">メモ・所見</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="外傷の状態、意識レベルの変化など"
                />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-bold mb-2">音声入力</label>
                <VoiceInput onTranscript={handleVoiceTranscript} />
              </div>

              {location && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm font-bold text-green-800">📍 位置情報取得済み</p>
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
        {currentStep === 'confirm' && triageResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">登録内容の確認</h2>

            <div className="space-y-4">
              <div className="border-b pb-3">
                <p className="text-sm text-gray-600">タグ番号</p>
                <p className="font-bold text-lg">{tagNumber}</p>
              </div>

              <div className="border-b pb-3">
                <p className="text-sm text-gray-600">トリアージ判定</p>
                <p className="font-bold text-lg" style={{
                  color: triageResult.category === 'black' ? '#000' :
                        triageResult.category === 'red' ? '#ef4444' :
                        triageResult.category === 'yellow' ? '#eab308' : '#22c55e'
                }}>
                  {triageResult.category === 'black' ? '⚫ 黒（死亡）' :
                   triageResult.category === 'red' ? '🔴 赤（重症）' :
                   triageResult.category === 'yellow' ? '🟡 黄（中等症）' : '🟢 緑（軽症）'}
                </p>
                <p className="text-sm text-gray-600 mt-1">理由: {triageResult.reasoning}</p>
              </div>

              <div className="border-b pb-3">
                <p className="text-sm text-gray-600">バイタルサイン</p>
                <ul className="text-sm mt-1">
                  {vitalSigns.respiratory_rate && (
                    <li>呼吸数: {vitalSigns.respiratory_rate} 回/分</li>
                  )}
                  {vitalSigns.pulse_rate && <li>脈拍数: {vitalSigns.pulse_rate} 回/分</li>}
                  {vitalSigns.systolic_bp && <li>血圧: {vitalSigns.systolic_bp} mmHg</li>}
                  <li>意識: {vitalSigns.consciousness}</li>
                </ul>
              </div>

              <div className="border-b pb-3">
                <p className="text-sm text-gray-600">患者情報</p>
                <ul className="text-sm mt-1">
                  {patientInfo.age && <li>年齢: {patientInfo.age}歳</li>}
                  <li>性別: {patientInfo.sex === 'male' ? '男性' : patientInfo.sex === 'female' ? '女性' : '不明'}</li>
                </ul>
              </div>

              {notes && (
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-600">メモ</p>
                  <p className="text-sm mt-1">{notes}</p>
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
                disabled={loading}
                className="flex-1 btn-primary py-3 disabled:opacity-50"
              >
                {loading ? '登録中...' : '登録する'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
