'use client';

import { useEffect, useState } from 'react';
import { TriageTag, TriageCategories } from '@/lib/types';
import { getPhaseInfo } from '@/lib/utils/getPhaseInfo';

interface PatientPanelCardProps {
  tag: TriageTag;
  variant: 'command' | 'dmat' | 'transport-team';
  onDetailClick: (tag: TriageTag) => void;
  actions?: React.ReactNode;
  selected?: boolean;
}

const CONDITION_MAP: Record<string, string> = {
  contusion: '打撲',
  fracture: '骨折',
  sprain: '捻挫',
  amputation: '切断',
  burn: '熱傷',
  other: 'その他',
};

function formatConditions(tag: TriageTag): string {
  if (!tag.conditions || tag.conditions.length === 0) return '-';
  return tag.conditions
    .map((c) => {
      if (c === 'other') return tag.condition_other || 'その他';
      return CONDITION_MAP[c] || c;
    })
    .join(', ');
}

function getElapsedMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

function getElapsedColor(minutes: number): string {
  if (minutes >= 30) return 'text-red-600';
  if (minutes >= 15) return 'text-yellow-600';
  return 'text-gray-500';
}

function isSpO2Abnormal(val?: number): boolean {
  return val !== undefined && val <= 94;
}

function isBPAbnormal(bp?: { systolic: number; diastolic: number } | string): boolean {
  if (!bp || typeof bp === 'string') return false;
  return bp.systolic <= 89;
}

function isPulseAbnormal(val?: number): boolean {
  if (val === undefined) return false;
  return val <= 49 || val >= 121;
}

function isRespRateAbnormal(val?: number): boolean {
  if (val === undefined) return false;
  return val <= 9 || val >= 30;
}

function getAvpuDisplay(avpu: string): { label: string; className: string } {
  switch (avpu) {
    case 'alert':
      return { label: 'A', className: 'text-gray-900' };
    case 'voice':
      return { label: 'V', className: 'text-yellow-600' };
    case 'pain':
      return { label: 'P', className: 'text-red-600' };
    case 'unresponsive':
      return { label: 'U', className: 'text-red-600' };
    default:
      return { label: '-', className: 'text-gray-400' };
  }
}

function formatBP(bp?: { systolic: number; diastolic: number } | string): string {
  if (!bp) return '-';
  if (typeof bp === 'string') return bp;
  return `${bp.systolic}/${bp.diastolic}`;
}

const CARD_STYLES: Record<string, { border: string; bg: string; divider: string }> = {
  red: {
    border: 'border-red-500',
    bg: 'bg-red-50/60',
    divider: 'border-red-200',
  },
  yellow: {
    border: 'border-yellow-400',
    bg: 'bg-yellow-50/60',
    divider: 'border-yellow-200',
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-50/60',
    divider: 'border-green-200',
  },
  black: {
    border: 'border-gray-900',
    bg: 'bg-gray-100',
    divider: 'border-gray-300',
  },
};

export default function PatientPanelCard({
  tag,
  variant,
  onDetailClick,
  actions,
  selected,
}: PatientPanelCardProps) {
  const category = tag.triage_category.final;
  const categoryInfo = TriageCategories[category];
  const cardStyle = CARD_STYLES[category];
  const phaseInfo = getPhaseInfo(tag);

  const [elapsedMinutes, setElapsedMinutes] = useState(() => getElapsedMinutes(tag.created_at));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMinutes(getElapsedMinutes(tag.created_at));
    }, 60000);
    return () => clearInterval(interval);
  }, [tag.created_at]);

  const avpu = getAvpuDisplay(tag.vital_signs?.consciousness?.avpu ?? '');
  const conditions = formatConditions(tag);

  return (
    <div
      id={`patient-${tag.id}`}
      className={`border-l-4 ${cardStyle.border} ${cardStyle.bg} rounded-lg p-4 shadow-sm ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {/* Glance Zone */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-lg px-3 py-1 text-sm font-bold ${categoryInfo.color} ${categoryInfo.textColor}`}
          >
            {tag.tag_number}
          </span>
          {variant === 'transport-team' ? (
            <>
              <span className="text-sm">{phaseInfo.icon}</span>
              <span className="text-sm font-medium text-gray-900">{phaseInfo.phase}</span>
            </>
          ) : (
            <>
              <span className="text-sm">{phaseInfo.icon}</span>
              <span className="text-sm font-medium text-gray-900">{phaseInfo.phase}</span>
            </>
          )}
        </div>
        {variant !== 'transport-team' && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">経過</span>
            <span className={`text-sm font-bold ${getElapsedColor(elapsedMinutes)}`}>
              {elapsedMinutes}分
            </span>
          </div>
        )}
      </div>

      {/* Patient info + team name (transport-team only) */}
      {variant === 'transport-team' ? (
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {tag.patient_info?.age ? `${tag.patient_info.age}歳` : '--歳'}{' '}
            {tag.patient_info?.sex
              ? tag.patient_info.sex === 'male'
                ? '男性'
                : tag.patient_info.sex === 'female'
                  ? '女性'
                  : tag.patient_info.sex
              : '不明'}
          </span>
          <span className="text-sm font-medium text-orange-700">
            {tag.transport_assignment?.team || '-'}
          </span>
        </div>
      ) : (
        <p className="mb-3 text-sm text-gray-600">
          {tag.patient_info?.age ? `${tag.patient_info.age}歳` : '--歳'}{' '}
          {tag.patient_info?.sex
            ? tag.patient_info.sex === 'male'
              ? '男性'
              : tag.patient_info.sex === 'female'
                ? '女性'
                : tag.patient_info.sex
            : '不明'}
        </p>
      )}

      {/* Scan Zone: Vitals */}
      <div className={`border-t ${cardStyle.divider} mb-2 pt-2`}>
        {variant === 'command' && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div>
              SpO₂{' '}
              <span
                className={`font-bold ${isSpO2Abnormal(tag.vital_signs?.spo2) ? 'text-red-600' : 'text-gray-900'}`}
              >
                {tag.vital_signs?.spo2 !== undefined ? `${tag.vital_signs?.spo2}%` : '-'}
              </span>
            </div>
            <div>
              脈拍{' '}
              <span
                className={`font-bold ${isPulseAbnormal(tag.vital_signs?.pulse_rate) ? 'text-red-600' : 'text-gray-900'}`}
              >
                {tag.vital_signs?.pulse_rate ?? '-'}
              </span>
            </div>
            <div>
              血圧{' '}
              <span
                className={`font-bold ${isBPAbnormal(tag.vital_signs?.blood_pressure) ? 'text-red-600' : 'text-gray-900'}`}
              >
                {formatBP(tag.vital_signs?.blood_pressure)}
              </span>
            </div>
            <div>
              意識 <span className={`font-bold ${avpu.className}`}>{avpu.label}</span>
            </div>
          </div>
        )}

        {variant === 'dmat' && (
          <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-sm">
            <div>
              呼吸{' '}
              <span
                className={`font-bold ${isRespRateAbnormal(tag.vital_signs?.respiratory_rate) ? 'text-red-600' : 'text-gray-900'}`}
              >
                {tag.vital_signs?.respiratory_rate ?? '-'}
              </span>
            </div>
            <div>
              SpO₂{' '}
              <span
                className={`font-bold ${isSpO2Abnormal(tag.vital_signs?.spo2) ? 'text-red-600' : 'text-gray-900'}`}
              >
                {tag.vital_signs?.spo2 !== undefined ? `${tag.vital_signs?.spo2}%` : '-'}
              </span>
            </div>
            <div>
              意識 <span className={`font-bold ${avpu.className}`}>{avpu.label}</span>
            </div>
            <div>
              脈拍{' '}
              <span
                className={`font-bold ${isPulseAbnormal(tag.vital_signs?.pulse_rate) ? 'text-red-600' : 'text-gray-900'}`}
              >
                {tag.vital_signs?.pulse_rate ?? '-'}
              </span>
            </div>
            <div>
              血圧{' '}
              <span
                className={`font-bold ${isBPAbnormal(tag.vital_signs?.blood_pressure) ? 'text-red-600' : 'text-gray-900'}`}
              >
                {formatBP(tag.vital_signs?.blood_pressure)}
              </span>
            </div>
          </div>
        )}

        {variant === 'transport-team' && (
          <div className="grid grid-cols-2 gap-x-4 text-sm">
            <div>
              SpO₂{' '}
              <span
                className={`font-bold ${isSpO2Abnormal(tag.vital_signs?.spo2) ? 'text-red-600' : 'text-gray-900'}`}
              >
                {tag.vital_signs?.spo2 !== undefined ? `${tag.vital_signs?.spo2}%` : '-'}
              </span>
            </div>
            <div>
              意識 <span className={`font-bold ${avpu.className}`}>{avpu.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Read Zone */}
      <div className={`border-t ${cardStyle.divider} pt-2`}>
        {variant === 'command' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{conditions}</span>
            <span className="text-gray-500">{phaseInfo.responsible}</span>
          </div>
        )}

        {variant === 'dmat' && (
          <>
            <p className="text-sm text-gray-700">{conditions}</p>
            <p className="text-sm text-gray-500">主訴: {tag.chief_complaint?.primary || '-'}</p>
          </>
        )}

        {variant === 'transport-team' && (
          <>
            <p className="text-sm text-gray-700">{conditions}</p>
            <p className="flex items-center gap-1 text-sm text-gray-500">
              <span>📍</span> {tag.location?.address || '位置情報なし'}
            </p>
          </>
        )}

        {/* Action Zone */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onDetailClick(tag)}
            className="rounded border border-blue-600 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
          >
            詳細
          </button>
          {actions}
        </div>
      </div>
    </div>
  );
}
