'use client'

import { useState } from 'react'
import { TriageTag } from '@/lib/types'

export interface StartTriageResult {
  category: 'black' | 'red' | 'yellow' | 'green'
  steps: TriageTag['triage_category']['start_steps']
  reasoning: string
}

interface StartWizardProps {
  onComplete: (result: StartTriageResult) => void
  onCancel?: () => void
}

export default function StartWizard({ onComplete, onCancel }: StartWizardProps) {
  const [step, setStep] = useState(1)
  const [result, setResult] = useState<StartTriageResult>({
    category: 'green',
    steps: {
      can_walk: null,
      has_respiration: null,
      respiratory_rate_range: null,
      radial_pulse: null,
      follows_commands: null,
    },
    reasoning: '',
  })

  const handleAnswer = (answer: boolean) => {
    const newResult = { ...result }

    switch (step) {
      case 1: // 歩行可能か
        newResult.steps.can_walk = answer
        if (answer) {
          newResult.category = 'green'
          newResult.reasoning = '歩行可能'
          onComplete(newResult)
          return
        } else {
          setStep(2)
        }
        break

      case 2: // 呼吸があるか
        newResult.steps.has_respiration = answer
        if (!answer) {
          newResult.category = 'black'
          newResult.reasoning = '呼吸なし'
          onComplete(newResult)
          return
        } else {
          setStep(3)
        }
        break

      case 3: // 呼吸数が正常か（30回/分未満）
        if (!answer) {
          newResult.steps.respiratory_rate_range = '>=30'
          newResult.category = 'red'
          newResult.reasoning = '呼吸数異常（30回/分以上）'
          onComplete(newResult)
          return
        } else {
          newResult.steps.respiratory_rate_range = '10-29'
          setStep(4)
        }
        break

      case 4: // 橈骨動脈触知可能か
        newResult.steps.radial_pulse = answer
        if (!answer) {
          newResult.category = 'red'
          newResult.reasoning = '橈骨動脈触知不可'
          onComplete(newResult)
          return
        } else {
          setStep(5)
        }
        break

      case 5: // 簡単な指示に従えるか
        newResult.steps.follows_commands = answer
        if (!answer) {
          newResult.category = 'red'
          newResult.reasoning = '意識レベル低下'
          onComplete(newResult)
          return
        } else {
          newResult.category = 'yellow'
          newResult.reasoning = '全項目該当せず、遅延治療群'
          onComplete(newResult)
          return
        }
    }

    setResult(newResult)
  }

  const getStepQuestion = () => {
    switch (step) {
      case 1:
        return '患者は歩行可能ですか？'
      case 2:
        return '自発呼吸はありますか？'
      case 3:
        return '呼吸数は30回/分未満ですか？'
      case 4:
        return '橈骨動脈は触知できますか？'
      case 5:
        return '簡単な指示に従えますか？'
      default:
        return ''
    }
  }

  const getStepHint = () => {
    switch (step) {
      case 1:
        return '自力で歩ける場合は「はい」'
      case 2:
        return '気道確保後も呼吸がない場合は「いいえ」'
      case 3:
        return '1分間の呼吸数を測定してください'
      case 4:
        return '手首の動脈で脈が触れるか確認'
      case 5:
        return '「手を握ってください」などの簡単な指示に反応するか'
      default:
        return ''
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">START法トリアージ</h3>
          <span className="bg-gray-200 px-3 py-1 rounded-full text-sm font-bold">
            ステップ {step}/5
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <p className="text-2xl font-bold text-gray-800 mb-2">{getStepQuestion()}</p>
        <p className="text-sm text-gray-600">{getStepHint()}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAnswer(true)}
          className="bg-green-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-green-700 transition"
        >
          ✓ はい
        </button>
        <button
          onClick={() => handleAnswer(false)}
          className="bg-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-red-700 transition"
        >
          ✗ いいえ
        </button>
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full mt-4 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
        >
          キャンセル
        </button>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-xs text-gray-600 font-bold mb-2">START法判定基準:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>🟢 緑（軽症）: 歩行可能</li>
          <li>🟡 黄（中等症）: 全項目該当せず</li>
          <li>🔴 赤（重症）: 呼吸数30以上 OR 脈拍触知不可 OR 意識障害</li>
          <li>⚫ 黒（死亡）: 呼吸なし</li>
        </ul>
      </div>
    </div>
  )
}
