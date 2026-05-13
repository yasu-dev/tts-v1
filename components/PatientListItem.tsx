'use client';

import { TriageTag, TriageCategories } from '@/lib/types';
import { getPhaseInfo } from '@/lib/utils/getPhaseInfo';

interface PatientListItemProps {
  tag: TriageTag;
  onDetailClick: (tag: TriageTag) => void;
  actions?: React.ReactNode;
  selected?: boolean;
}

export default function PatientListItem({
  tag,
  onDetailClick,
  actions,
  selected,
}: PatientListItemProps) {
  const category = tag.triage_category.final;
  const categoryInfo = TriageCategories[category];
  const phaseInfo = getPhaseInfo(tag);

  return (
    <div
      id={`patient-${tag.id}`}
      className={`flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-100 ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`rounded-lg px-4 py-2 font-bold ${categoryInfo.color} ${categoryInfo.textColor}`}
        >
          {tag.tag_number}
        </span>
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-base">{phaseInfo.icon}</span>
            <span className="text-sm font-medium text-gray-900">{phaseInfo.phase}</span>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-700">
              {tag.patient_info?.age && `${tag.patient_info.age}歳`}
              {tag.patient_info?.sex && tag.patient_info?.age && ' '}
              {tag.patient_info?.sex &&
                `${tag.patient_info.sex === 'male' ? '男性' : tag.patient_info.sex === 'female' ? '女性' : tag.patient_info.sex}`}
              {!tag.patient_info?.age && !tag.patient_info?.sex && '詳細情報なし'}
            </span>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onDetailClick(tag)}
          className="rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
        >
          詳細
        </button>
        {actions}
      </div>
    </div>
  );
}
