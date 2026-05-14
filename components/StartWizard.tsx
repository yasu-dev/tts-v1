'use client';

import { useState } from 'react';
import { TriageTag } from '@/lib/types';

export interface StartTriageResult {
  category: 'black' | 'red' | 'yellow' | 'green';
  steps: TriageTag['triage_category']['start_steps'];
  reasoning: string;
}

interface StartWizardProps {
  onComplete: (result: StartTriageResult) => void;
  onCancel?: () => void;
}

type AnswerHistory = {
  step: number;
  question: string;
  answer: boolean;
};

export default function StartWizard({ onComplete, onCancel }: StartWizardProps) {
  const [step, setStep] = useState(1);
  const [answerHistory, setAnswerHistory] = useState<AnswerHistory[]>([]);
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
  });

  const handleAnswer = (answer: boolean) => {
    const newResult = { ...result };
    const newHistory = [
      ...answerHistory,
      {
        step,
        question: getStepQuestion(),
        answer,
      },
    ];
    setAnswerHistory(newHistory);

    switch (step) {
      case 1: // 歩行可能か
        newResult.steps.can_walk = answer;
        if (answer) {
          newResult.category = 'green';
          newResult.reasoning = '歩行可能';
          onComplete(newResult);
          return;
        } else {
          setResult(newResult);
          setStep(2);
        }
        break;

      case 2: // 呼吸があるか
        newResult.steps.has_respiration = answer;
        if (!answer) {
          newResult.category = 'black';
          newResult.reasoning = '呼吸なし';
          onComplete(newResult);
          return;
        } else {
          setResult(newResult);
          setStep(3);
        }
        break;

      case 3: // 呼吸数が正常か（30回/分未満）
        if (!answer) {
          newResult.steps.respiratory_rate_range = '>=30';
          newResult.category = 'red';
          newResult.reasoning = '呼吸数異常（30回/分以上）';
          onComplete(newResult);
          return;
        } else {
          newResult.steps.respiratory_rate_range = '10-29';
          setResult(newResult);
          setStep(4);
        }
        break;

      case 4: // 橈骨動脈触知可能か
        newResult.steps.radial_pulse = answer;
        if (!answer) {
          newResult.category = 'red';
          newResult.reasoning = '橈骨動脈触知不可';
          onComplete(newResult);
          return;
        } else {
          setResult(newResult);
          setStep(5);
        }
        break;

      case 5: // 簡単な指示に従えるか
        newResult.steps.follows_commands = answer;
        if (!answer) {
          newResult.category = 'red';
          newResult.reasoning = '意識レベル低下';
          onComplete(newResult);
          return;
        } else {
          newResult.category = 'yellow';
          newResult.reasoning = '全項目該当せず、遅延治療群';
          onComplete(newResult);
          return;
        }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      // 前のステップに戻る
      const previousStep = step - 1;
      setStep(previousStep);

      // 履歴から最後の回答を削除
      const newHistory = answerHistory.slice(0, -1);
      setAnswerHistory(newHistory);

      // resultをリセット
      const newResult = { ...result };
      switch (step) {
        case 2:
          newResult.steps.can_walk = null;
          break;
        case 3:
          newResult.steps.has_respiration = null;
          break;
        case 4:
          newResult.steps.respiratory_rate_range = null;
          break;
        case 5:
          newResult.steps.radial_pulse = null;
          break;
      }
      setResult(newResult);
    }
  };

  const getStepQuestion = () => {
    switch (step) {
      case 1:
        return '患者は歩行可能ですか？';
      case 2:
        return '自発呼吸はありますか？';
      case 3:
        return '呼吸数は30回/分未満ですか？';
      case 4:
        return '橈骨動脈は触知できますか？';
      case 5:
        return '簡単な指示に従えますか？';
      default:
        return '';
    }
  };

  const getStepHint = () => {
    switch (step) {
      case 1:
        return '自力で歩ける場合は「はい」';
      case 2:
        return '気道確保後も呼吸がない場合は「いいえ」';
      case 3:
        return '1分間の呼吸数を測定してください';
      case 4:
        return '手首の動脈で脈が触れるか確認';
      case 5:
        return '「手を握ってください」などの簡単な指示に反応するか';
      default:
        return '';
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">START法トリアージ</h3>
          <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-bold">
            ステップ {step}/5
          </span>
        </div>

        <div className="mb-4 h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* 回答履歴 */}
      {answerHistory.length > 0 && (
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <p className="mb-2 text-sm font-bold text-gray-700">回答履歴:</p>
          <div className="space-y-1">
            {answerHistory.map((history, index) => (
              <div key={index} className="text-sm text-gray-600">
                <span className="font-semibold">Q{history.step}:</span> {history.question} →{' '}
                <span
                  className={history.answer ? 'font-bold text-green-600' : 'font-bold text-red-600'}
                >
                  {history.answer ? 'はい' : 'いいえ'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <p className="mb-2 text-2xl font-bold text-gray-800">{getStepQuestion()}</p>
        <p className="text-sm text-gray-600">{getStepHint()}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAnswer(true)}
          className="transform rounded-lg bg-green-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-green-700 active:scale-95 active:bg-green-800"
        >
          ✓ はい
        </button>
        <button
          onClick={() => handleAnswer(false)}
          className="transform rounded-lg bg-red-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-red-700 active:scale-95 active:bg-red-800"
        >
          ✗ いいえ
        </button>
      </div>

      {/* 戻るボタンとキャンセルボタン */}
      <div className="flex gap-3">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="flex-1 rounded-lg bg-gray-400 px-4 py-2 font-bold text-white transition hover:bg-gray-500"
          >
            ← 前の質問に戻る
          </button>
        )}
        {onCancel && (
          <button
            onClick={onCancel}
            className={`${step > 1 ? 'flex-1' : 'w-full'} rounded-lg bg-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-400`}
          >
            QRスキャンに戻る
          </button>
        )}
      </div>

      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <p className="mb-2 text-xs font-bold text-gray-600">START法判定基準:</p>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>🟢 緑（軽症）: 歩行可能</li>
          <li>🟡 黄（中等症）: 全項目該当せず</li>
          <li>🔴 赤（重症）: 呼吸数30以上 OR 脈拍触知不可 OR 意識障害</li>
          <li>⚫ 黒（死亡）: 呼吸なし</li>
        </ul>
      </div>
    </div>
  );
}
