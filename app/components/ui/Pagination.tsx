'use client';

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  className?: string;
}

const itemsPerPageOptions = [10, 20, 50, 100];

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  className = ''
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* 件数表示 */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-nexus-text-secondary">
          {totalItems > 0 ? `${startItem}-${endItem}` : '0'} / {totalItems}件
        </span>
        
        {/* 表示件数選択 */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-nexus-text-secondary">表示件数:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-nexus-border rounded-md bg-nexus-bg-primary text-nexus-text-primary focus:outline-none focus:ring-2 focus:ring-nexus-blue focus:border-transparent"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ページネーション */}
      <div className="flex items-center gap-1">
        {/* 前へボタン */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            p-2 rounded-md transition-colors
            ${currentPage === 1 
              ? 'text-nexus-text-disabled cursor-not-allowed' 
              : 'text-nexus-text-primary hover:bg-nexus-bg-secondary'
            }
          `}
          aria-label="前のページ"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        {/* ページ番号 */}
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-nexus-text-secondary">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${page === currentPage
                    ? 'bg-nexus-blue text-white'
                    : 'text-nexus-text-primary hover:bg-nexus-bg-secondary'
                  }
                `}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* 次へボタン */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            p-2 rounded-md transition-colors
            ${currentPage === totalPages 
              ? 'text-nexus-text-disabled cursor-not-allowed' 
              : 'text-nexus-text-primary hover:bg-nexus-bg-secondary'
            }
          `}
          aria-label="次のページ"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 