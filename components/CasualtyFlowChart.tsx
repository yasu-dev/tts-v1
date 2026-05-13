'use client';

import { useState, useEffect, useMemo } from 'react';
import { TriageTag } from '@/lib/types';

type LocationCategory =
  | 'disaster'
  | 'transitToCollection'
  | 'collection'
  | 'transitToHospital'
  | 'hospital';

type TriageColor = 'black' | 'red' | 'yellow' | 'green';

interface LocationCounts {
  black: number;
  red: number;
  yellow: number;
  green: number;
  total: number;
}

interface Props {
  tags: TriageTag[];
  storageKey: string;
}

const TRIAGE_COLORS: { key: TriageColor; hex: string; bg: string }[] = [
  { key: 'black', hex: '#1f2937', bg: 'bg-gray-800' },
  { key: 'red', hex: '#ef4444', bg: 'bg-red-500' },
  { key: 'yellow', hex: '#facc15', bg: 'bg-yellow-400' },
  { key: 'green', hex: '#22c55e', bg: 'bg-green-500' },
];

const GRAY_HEX = '#f3f4f6';

function classifyLocation(tag: TriageTag): LocationCategory {
  const transportStatus = tag.transport?.status;
  const assignmentStatus = tag.transport_assignment?.status;

  if (transportStatus === 'completed') return 'hospital';
  if (transportStatus === 'in_transit') return 'transitToHospital';
  if (transportStatus === 'arrived') return 'collection';
  if (transportStatus === 'preparing') return 'collection';
  if (assignmentStatus === 'in_progress') return 'transitToCollection';
  if (assignmentStatus === 'assigned') return 'disaster';
  return 'disaster';
}

function getTriageColor(tag: TriageTag): TriageColor {
  const cat = tag.triage_category?.final;
  if (cat === 'black' || cat === 'red' || cat === 'yellow' || cat === 'green') {
    return cat;
  }
  return 'green';
}

function emptyCounts(): LocationCounts {
  return { black: 0, red: 0, yellow: 0, green: 0, total: 0 };
}

function buildConicGradient(segments: { color: string; percent: number }[]): string {
  if (segments.length === 0) return `conic-gradient(${GRAY_HEX} 0% 100%)`;

  let acc = 0;
  const parts: string[] = [];
  for (const seg of segments) {
    const start = acc;
    acc += seg.percent;
    const end = acc;
    if (seg.percent > 0) {
      parts.push(`${seg.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`);
    }
  }
  if (parts.length === 0) return `conic-gradient(${GRAY_HEX} 0% 100%)`;
  return `conic-gradient(${parts.join(', ')})`;
}

function CategoryBadges({
  counts,
  size = 'normal',
}: {
  counts: LocationCounts;
  size?: 'normal' | 'small';
}) {
  const dotSize = size === 'normal' ? 'w-[10px] h-[10px]' : 'w-[8px] h-[8px]';
  const textSize = size === 'normal' ? 'text-[11px]' : 'text-[10px]';

  return (
    <div className="flex items-center gap-1.5">
      {TRIAGE_COLORS.map(
        ({ key, bg }) =>
          counts[key] > 0 && (
            <span
              key={key}
              className={`inline-flex items-center gap-[2px] ${textSize} leading-none`}
            >
              <span className={`${dotSize} rounded-sm ${bg} inline-block`} />
              {counts[key]}
            </span>
          )
      )}
    </div>
  );
}

export default function CasualtyFlowChart({ tags, storageKey }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'true') setIsCollapsed(true);
    } catch {}
  }, [storageKey]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem(storageKey, String(next));
    } catch {}
  };

  const data = useMemo(() => {
    const locations: Record<LocationCategory, LocationCounts> = {
      disaster: emptyCounts(),
      transitToCollection: emptyCounts(),
      collection: emptyCounts(),
      transitToHospital: emptyCounts(),
      hospital: emptyCounts(),
    };

    for (const tag of tags) {
      const loc = classifyLocation(tag);
      const color = getTriageColor(tag);
      locations[loc][color]++;
      locations[loc].total++;
    }

    const total = tags.length;

    // Disaster donut
    const disasterCounts = locations.disaster;
    const disasterGray = total - disasterCounts.total; // dispatched from disaster
    const disasterDenom = total;

    // Collection donut
    const collectionCounts = locations.collection;
    const collectionDispatched = locations.transitToHospital.total + locations.hospital.total;
    const collectionDenom = collectionCounts.total + collectionDispatched;
    const collectionGray = collectionDispatched;
    const collectionIncoming = disasterCounts.total + locations.transitToCollection.total;

    // Hospital donut
    const hospitalCounts = locations.hospital;
    const hospitalGray = total - hospitalCounts.total;

    return {
      total,
      locations,
      disaster: {
        counts: disasterCounts,
        gray: disasterGray,
        denom: disasterDenom,
      },
      collection: {
        counts: collectionCounts,
        gray: collectionGray,
        denom: collectionDenom,
        incoming: collectionIncoming,
      },
      hospital: {
        counts: hospitalCounts,
        gray: hospitalGray,
        denom: total,
      },
    };
  }, [tags]);

  // Donut gradient builders
  const disasterGradient = useMemo(() => {
    const denom = data.disaster.denom || 1;
    const segments = [
      ...TRIAGE_COLORS.map((c) => ({
        color: c.hex,
        percent: (data.disaster.counts[c.key] / denom) * 100,
      })),
      { color: GRAY_HEX, percent: (data.disaster.gray / denom) * 100 },
    ];
    return buildConicGradient(segments);
  }, [data]);

  const collectionGradient = useMemo(() => {
    const denom = data.collection.denom || 1;
    const segments = [
      ...TRIAGE_COLORS.map((c) => ({
        color: c.hex,
        percent: (data.collection.counts[c.key] / denom) * 100,
      })),
      { color: GRAY_HEX, percent: (data.collection.gray / denom) * 100 },
    ];
    return buildConicGradient(segments);
  }, [data]);

  const hospitalGradient = useMemo(() => {
    const denom = data.hospital.denom || 1;
    // Hospital: gray first, then triage colors
    const segments = [
      { color: GRAY_HEX, percent: (data.hospital.gray / denom) * 100 },
      ...TRIAGE_COLORS.filter((c) => c.key !== 'black').map((c) => ({
        color: c.hex,
        percent: (data.hospital.counts[c.key] / denom) * 100,
      })),
      // black for hospital (usually 0, but include for completeness)
      {
        color: TRIAGE_COLORS[0].hex,
        percent: (data.hospital.counts.black / denom) * 100,
      },
    ];
    return buildConicGradient(segments);
  }, [data]);

  const maskStyle = {
    WebkitMask: 'radial-gradient(circle, transparent 58%, black 60%)',
    mask: 'radial-gradient(circle, transparent 58%, black 60%)',
  };

  const transitToCollection = data.locations.transitToCollection;
  const transitToHospital = data.locations.transitToHospital;

  // Pipeline info for hospital
  const hospitalPipelineInTransit = transitToHospital.total;
  const hospitalPipelineWaiting =
    data.total - data.hospital.counts.total - hospitalPipelineInTransit;

  if (!isClient) return null;

  return (
    <div className="card mb-6">
      {/* Header - always visible */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">搬送進捗</h2>
        <button
          onClick={toggleCollapse}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-bold text-gray-700 transition hover:bg-gray-200"
        >
          {isCollapsed ? '▼ 展開' : '▲ 折りたたむ'}
        </button>
      </div>

      {/* Collapsible content */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isCollapsed ? '0px' : '500px',
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        <div className="flex flex-col items-start justify-center gap-2 py-4 md:flex-row md:items-start md:gap-4">
          {/* === Disaster Donut === */}
          <div className="flex min-w-[140px] flex-col items-center">
            <h3 className="mb-2 text-sm font-bold text-gray-700">災害点</h3>
            <div
              className="relative h-[100px] w-[100px] md:h-[120px] md:w-[120px]"
              role="img"
              aria-label={`災害点: 残存${data.disaster.counts.total}人 / ${data.disaster.denom}人`}
            >
              <div
                className="h-full w-full rounded-full"
                style={{ background: disasterGradient, ...maskStyle }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold leading-none text-gray-800">
                  {data.disaster.counts.total}
                </span>
                <span className="mt-0.5 text-xs text-gray-500">残</span>
              </div>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">/ {data.disaster.denom}人</p>
            <div className="mt-1">
              <CategoryBadges counts={data.disaster.counts} />
            </div>
            <p className="mt-1 text-[11px] text-gray-400">搬出済 {data.disaster.gray}人</p>
          </div>

          {/* === Arrow 1: Disaster → Collection === */}
          <div className="flex flex-col items-center justify-center self-center py-2 md:mt-10 md:py-0">
            <span
              className={`hidden text-xl font-bold text-gray-400 md:block ${transitToCollection.total > 0 ? 'animate-pulse' : 'opacity-40'}`}
            >
              →
            </span>
            <span
              className={`text-xl font-bold text-gray-400 md:hidden ${transitToCollection.total > 0 ? 'animate-pulse' : 'opacity-40'}`}
            >
              ↓
            </span>
            <span className="text-sm font-semibold text-gray-600">
              {transitToCollection.total}人
            </span>
            {transitToCollection.total > 0 && (
              <div className="mt-0.5">
                <CategoryBadges counts={transitToCollection} size="small" />
              </div>
            )}
          </div>

          {/* === Collection Donut === */}
          <div className="flex min-w-[140px] flex-col items-center">
            <h3 className="mb-2 text-sm font-bold text-gray-700">集積場所</h3>
            <div
              className="relative h-[100px] w-[100px] md:h-[120px] md:w-[120px]"
              role="img"
              aria-label={`集積場所: 残存${data.collection.counts.total}人 / ${data.collection.denom}人到着`}
            >
              <div
                className="h-full w-full rounded-full"
                style={{ background: collectionGradient, ...maskStyle }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold leading-none text-gray-800">
                  {data.collection.counts.total}
                </span>
                <span className="mt-0.5 text-xs text-gray-500">残</span>
              </div>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">/ {data.collection.denom}人到着</p>
            <div className="mt-1">
              <CategoryBadges counts={data.collection.counts} />
            </div>
            <p className="mt-1 text-[11px] text-gray-400">送出済 {data.collection.gray}人</p>
            {data.collection.incoming > 0 && (
              <p className="mt-0.5 text-[11px] text-blue-500">
                到着見込 +{data.collection.incoming}人
              </p>
            )}
          </div>

          {/* === Arrow 2: Collection → Hospital === */}
          <div className="flex flex-col items-center justify-center self-center py-2 md:mt-10 md:py-0">
            <span
              className={`hidden text-xl font-bold text-gray-400 md:block ${transitToHospital.total > 0 ? 'animate-pulse' : 'opacity-40'}`}
            >
              →
            </span>
            <span
              className={`text-xl font-bold text-gray-400 md:hidden ${transitToHospital.total > 0 ? 'animate-pulse' : 'opacity-40'}`}
            >
              ↓
            </span>
            <span className="text-sm font-semibold text-gray-600">{transitToHospital.total}人</span>
            {transitToHospital.total > 0 && (
              <div className="mt-0.5">
                <CategoryBadges counts={transitToHospital} size="small" />
              </div>
            )}
          </div>

          {/* === Hospital Donut === */}
          <div className="flex min-w-[140px] flex-col items-center">
            <h3 className="mb-2 text-sm font-bold text-gray-700">医療機関</h3>
            <div
              className="relative h-[100px] w-[100px] md:h-[120px] md:w-[120px]"
              role="img"
              aria-label={`医療機関: 搬送済${data.hospital.counts.total}人 / ${data.total}人`}
            >
              <div
                className="h-full w-full rounded-full"
                style={{ background: hospitalGradient, ...maskStyle }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold leading-none text-gray-800">
                  {data.hospital.counts.total}
                  <span className="text-base font-normal text-gray-400"> / {data.total}</span>
                </span>
                <span className="mt-0.5 text-xs text-gray-500">済</span>
              </div>
            </div>
            {/* Empty spacer to align with other donuts */}
            <p className="mt-1.5 text-xs text-gray-400">&nbsp;</p>
            <div className="mt-1">
              <CategoryBadges counts={data.hospital.counts} />
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              搬送中 <strong>{hospitalPipelineInTransit}</strong>人 | 待機{' '}
              <strong>{hospitalPipelineWaiting < 0 ? 0 : hospitalPipelineWaiting}</strong>人
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
