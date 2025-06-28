'use client';

import React from 'react';
import { ReactNode } from 'react';

interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface HoloTableProps {
  columns: TableColumn[];
  data: Record<string, any>[];
  onRowClick?: (row: Record<string, any>, index: number) => void;
  className?: string;
  emptyMessage?: string;
  renderCell?: (value: any, column: TableColumn, row: Record<string, any>) => ReactNode;
}

export default function HoloTable({
  columns,
  data,
  onRowClick,
  className = '',
  emptyMessage = 'データがありません',
  renderCell
}: HoloTableProps) {

  const getAlignClass = (align?: string) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const renderCellContent = (value: any, column: TableColumn, row: Record<string, any>) => {
    if (renderCell) {
      return renderCell(value, column, row);
    }
    
    // デフォルトレンダリング
    if (value === null || value === undefined) {
      return <span className="text-nexus-text-muted">-</span>;
    }
    
    return <span className="text-nexus-text-primary font-medium">{value}</span>;
  };

  return (
    <div className={`holo-table-container ${className}`}>
      <table className="holo-table">
        {/* ヘッダー */}
        <thead className="holo-header">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-8 py-6 
                  font-display font-black text-xs uppercase tracking-widest
                  text-primary-blue 
                  border-b-[3px] border-nexus-border
                  relative
                  transition-all duration-300
                  hover:text-nexus-yellow
                  ${getAlignClass(column.align)}
                  group
                `}
                style={{ width: column.width }}
              >
                <span className="relative z-10 text-shadow-[0_0_8px_rgba(0,100,210,0.4)]">
                  {column.label}
                </span>
                
                {/* ホバー時のアンダーライン */}
                <div className="
                  absolute bottom-[-3px] left-0 w-0 h-1
                  bg-gradient-to-r from-primary-blue via-nexus-yellow to-nexus-red
                  transition-all duration-300 ease-out
                  group-hover:w-full
                " />
              </th>
            ))}
          </tr>
        </thead>

        {/* ボディ */}
        <tbody className="holo-body">
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length}
                className="px-8 py-16 text-center"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-nexus-border rounded-nexus flex items-center justify-center">
                    <svg className="w-8 h-8 text-nexus-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-nexus-text-muted font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`
                  holo-row
                  relative
                  transition-all duration-300 ease-out
                  hover:bg-primary-blue/5
                  hover:translate-x-2
                  hover:shadow-[0_6px_25px_rgba(0,100,210,0.15)]
                  ${onRowClick ? 'cursor-pointer' : ''}
                  group
                `}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {/* ホバー時の左側アクセント */}
                <div className="
                  absolute top-0 left-0 w-0 h-full
                  bg-gradient-to-r from-primary-blue/20 to-transparent
                  transition-all duration-300 ease-out
                  group-hover:w-full
                  pointer-events-none
                " />

                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      px-8 py-6
                      border-b-2 border-primary-blue/10
                      vertical-align-middle
                      relative z-10
                      ${getAlignClass(column.align)}
                    `}
                  >
                    {renderCellContent(row[column.key], column, row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}