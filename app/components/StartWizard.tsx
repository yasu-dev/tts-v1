'use client'

import { useState } from 'react'
import { TriageTag } from '@/lib/types'

interface StartWizardProps {
  onComplete: (result: {
    category: 'black' | 'red' | 'yellow' | 'green'
    steps: TriageTag['triage_category']['start_steps']
    reasoning: string
  }) => void
}

export function StartWizard({ onComplete }: StartWizardProps) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<TriageTag['triage_category']['start_steps']>({
    can_walk: null,
    has_respiration: null,
    respiratory_rate_range: null,
    radial_pulse: null,
    follows_commands: null,
  })

  const handleAnswer = (key: keyof typeof answers, value: any) => {
    const newAnswers = { ...answers, [key]: value }
    setAnswers(newAnswers)

    // START法判定ロジック
    if (key === 'can_walk' && value === true) {
      onComplete({ category: 'green', steps: newAnswers, reasoning: '歩行可能のため緑区分' })
      return
    }

    if (key === 'has_respiration' && value === false) {
      onComplete({ category: 'black', steps: newAnswers, reasoning: '呼吸停止のため黒区分' })
      return
    }

    if (key === 'respiratory_rate_range') {
      if (value === '0' || value === '<10' || value === '>=30') {
        onComplete({ category: 'red', steps: newAnswers, reasoning: '呼吸数異常のため赤区分' })
        return
      }
      setStep(4)
      return
    }

    if (key === 'radial_pulse' && value === false) {
      onComplete({ category: 'red', steps: newAnswers, reasoning: '橈骨動脈触知不可のため赤区分' })
      return
    }

    if (key === 'follows_commands') {
      if (value === false) {
        onComplete({ category: 'red', steps: newAnswers, reasoning: '意識レベル低下のため赤区分' })
      } else {
        onComplete({ category: 'yellow', steps: newAnswers, reasoning: 'バイタル安定、処置遅延可能のため黄区分' })
      }
      return
    }

    setStep(step + 1)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex justify-between mb-6">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold $${
              s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">歩行できますか？</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer('can_walk', true)}
              className="flex-1 bg-green-500 text-white py-12 rounded-lg text-2xl font-bold hover:bg-green-600"
            >
              はい
            </button>
            <button
              onClick={() => handleAnswer('can_walk', false)}
              className="flex-1 bg-red-500 text-white py-12 rounded-lg text-2xl font-bold hover:bg-red-600"
            >
              いいえ
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">呼吸はありますか？</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer('has_respiration', true)}
              className="flex-1 bg-green-500 text-white py-12 rounded-lg text-2xl font-bold hover:bg-green-600"
            >
              あり
            </button>
            <button
              onClick={() => handleAnswer('has_respiration', false)}
              className="flex-1 bg-black text-white py-12 rounded-lg text-2xl font-bold hover:bg-gray-800"
            >
              なし
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">呼吸数の範囲は？</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleAnswer('respiratory_rate_range', '<10')} className="bg-red-500 text-white py-8 rounded-lg text-xl font-bold hover:bg-red-600">
              10回/分未満
            </button>
            <button onClick={() => handleAnswer('respiratory_rate_range', '10-29')} className="bg-green-500 text-white py-8 rounded-lg text-xl font-bold hover:bg-green-600">
              10〜29回/分
            </button>
            <button onClick={() => handleAnswer('respiratory_rate_range', '>=30')} className="bg-red-500 text-white py-8 rounded-lg text-xl font-bold hover:bg-red-600">
              30回/分以上
            </button>
            <button onClick={() => handleAnswer('respiratory_rate_range', '0')} className="bg-black text-white py-8 rounded-lg text-xl font-bold hover:bg-gray-800">
              無呼吸
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">橈骨動脈は触知できますか？</h2>
          <div className="flex gap-4">
            <button onClick={() => handleAnswer('radial_pulse', true)} className="flex-1 bg-green-500 text-white py-12 rounded-lg text-2xl font-bold hover:bg-green-600">
              触知可能
            </button>
            <button onClick={() => handleAnswer('radial_pulse', false)} className="flex-1 bg-red-500 text-white py-12 rounded-lg text-2xl font-bold hover:bg-red-600">
              触知不可
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">簡単な指示に従えますか？</h2>
          <div className="flex gap-4">
            <button onClick={() => handleAnswer('follows_commands', true)} className="flex-1 bg-yellow-500 text-white py-12 rounded-lg text-2xl font-bold hover:bg-yellow-600">
              従える
            </button>
            <button onClick={() => handleAnswer('follows_commands', false)} className="flex-1 bg-red-500 text-white py-12 rounded-lg text-2xl font-bold hover:bg-red-600">
              従えない
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
