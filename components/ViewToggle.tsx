'use client';

interface ViewToggleProps {
  viewMode: 'list' | 'panel';
  onToggle: (mode: 'list' | 'panel') => void;
}

export default function ViewToggle({ viewMode, onToggle }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onToggle('list')}
        className={`rounded-lg p-2 transition-colors ${
          viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-100'
        }`}
        title="リスト表示"
        aria-label="リスト表示"
        aria-pressed={viewMode === 'list'}
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <button
        onClick={() => onToggle('panel')}
        className={`rounded-lg p-2 transition-colors ${
          viewMode === 'panel' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-100'
        }`}
        title="パネル表示"
        aria-label="パネル表示"
        aria-pressed={viewMode === 'panel'}
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>
    </div>
  );
}
