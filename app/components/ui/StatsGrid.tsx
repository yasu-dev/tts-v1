'use client';

import React from 'react';

type RegionColor = 'americas' | 'europe' | 'asia' | 'africa' | 'oceania' | 'global';

interface StatItem {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  color?: RegionColor;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

export default function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  const gridColsClass = {
    2: 'nexus-stats-grid-2',
    3: 'nexus-stats-grid-3',
    4: 'nexus-stats-grid-4'
  };

  return (
    <div className={`nexus-stats-grid ${gridColsClass[columns]}`}>
      {stats.map((stat, index) => (
        <div key={index} className={`nexus-stat-card nexus-region-${stat.color || 'default'}`}>
          <div className="nexus-stat-header">
            {stat.icon && <span className="nexus-stat-icon">{stat.icon}</span>}
            <span className="nexus-stat-title">{stat.title}</span>
          </div>
          <div className="nexus-stat-value">{stat.value}</div>
          {stat.change && (
            <div className={`nexus-stat-change nexus-trend-${stat.trend || 'neutral'}`}>
              {stat.trend === 'up' && '↑'}
              {stat.trend === 'down' && '↓'}
              {stat.change}
            </div>
          )}
        </div>
      ))}

      <style jsx>{`
        .nexus-stats-grid {
          display: grid;
          gap: 1.5rem;
        }

        .nexus-stats-grid-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        .nexus-stats-grid-3 {
          grid-template-columns: repeat(3, 1fr);
        }

        .nexus-stats-grid-4 {
          grid-template-columns: repeat(4, 1fr);
        }

        .nexus-stat-card {
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(25px) saturate(180%);
          border-radius: 20px;
          border: 3px solid rgba(0, 100, 210, 0.25);
          padding: 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .nexus-stat-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
        }

        /* 地域別カラーリング */
        .nexus-region-americas {
          border-color: rgba(0, 100, 210, 0.35);
          background: linear-gradient(135deg, rgba(0, 100, 210, 0.05) 0%, rgba(255, 255, 255, 0.97) 100%);
        }

        .nexus-region-europe {
          border-color: rgba(229, 50, 56, 0.35);
          background: linear-gradient(135deg, rgba(229, 50, 56, 0.05) 0%, rgba(255, 255, 255, 0.97) 100%);
        }

        .nexus-region-asia {
          border-color: rgba(255, 206, 0, 0.35);
          background: linear-gradient(135deg, rgba(255, 206, 0, 0.05) 0%, rgba(255, 255, 255, 0.97) 100%);
        }

        .nexus-region-africa {
          border-color: rgba(134, 184, 23, 0.35);
          background: linear-gradient(135deg, rgba(134, 184, 23, 0.05) 0%, rgba(255, 255, 255, 0.97) 100%);
        }

        .nexus-region-oceania {
          border-color: rgba(0, 188, 212, 0.35);
          background: linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(255, 255, 255, 0.97) 100%);
        }

        .nexus-region-global {
          border-color: rgba(123, 31, 162, 0.35);
          background: linear-gradient(135deg, rgba(123, 31, 162, 0.05) 0%, rgba(255, 255, 255, 0.97) 100%);
        }

        .nexus-stat-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .nexus-stat-icon {
          font-size: 1.5rem;
          opacity: 0.8;
        }

        .nexus-stat-title {
          font-size: 0.875rem;
          color: #666666;
          font-weight: 600;
          font-family: 'Noto Sans JP', sans-serif;
        }

        .nexus-stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #1A1A1A;
          margin-bottom: 0.5rem;
          font-family: 'Orbitron', monospace;
          letter-spacing: -0.02em;
        }

        .nexus-stat-change {
          font-size: 0.875rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .nexus-trend-up {
          color: #86B817;
        }

        .nexus-trend-down {
          color: #E53238;
        }

        .nexus-trend-neutral {
          color: #666666;
        }

        /* レスポンシブ対応 */
        @media (max-width: 1200px) {
          .nexus-stats-grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .nexus-stats-grid-3,
          .nexus-stats-grid-4 {
            grid-template-columns: 1fr;
          }

          .nexus-stat-card {
            padding: 1.5rem;
          }

          .nexus-stat-value {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
} 