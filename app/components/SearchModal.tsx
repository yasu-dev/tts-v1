'use client';

import { useState, useEffect } from 'react';

interface SearchResult {
  id: string;
  title: string;
  type: 'product' | 'task' | 'customer';
  description: string;
  url: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
}

export default function SearchModal({ isOpen, onClose, query }: SearchModalProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query && query.length > 2) {
      setLoading(true);
      // デモ検索結果
      setTimeout(() => {
        const demoResults: SearchResult[] = [
          {
            id: '1',
            title: 'Canon EOS R5',
            type: 'product' as const,
            description: 'カメラ本体 - SKU: CAM-001',
            url: '/inventory',
          },
          {
            id: '2',
            title: 'Canon EOS R5 検品作業',
            type: 'task' as const,
            description: '検品タスク - 担当: 田中',
            url: '/staff/tasks',
          },
          {
            id: '3',
            title: '山田太郎',
            type: 'customer' as const,
            description: '顧客 - 注文: ORD-2024-001',
            url: '/dashboard',
          },
        ].filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
        );
        
        setResults(demoResults);
        setLoading(false);
      }, 500);
    } else {
      setResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return '📦';
      case 'task':
        return '📋';
      case 'customer':
        return '👤';
      default:
        return '🔍';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product':
        return '商品';
      case 'task':
        return 'タスク';
      case 'customer':
        return '顧客';
      default:
        return 'その他';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              検索結果: "{query}"
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result) => (
                <a
                  key={result.id}
                  href={result.url}
                  onClick={() => onClose()}
                  className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(result.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {result.title}
                        </h4>
                        <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {result.description}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          ) : query.length > 2 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">検索結果がありません</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                別のキーワードで検索してみてください
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                3文字以上入力して検索してください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}