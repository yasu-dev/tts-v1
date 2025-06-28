'use client';

import React from 'react';

interface PageWrapperProps {
  title: string;
  description?: string;
  icon?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function PageWrapper({ 
  title, 
  description, 
  icon = '',
  children,
  actions 
}: PageWrapperProps) {
  return (
    <div className="nexus-page-wrapper">
      {/* ページヘッダー */}
      <div className="nexus-page-header">
        <div className="nexus-page-header-content">
          <div className="nexus-page-header-text">
            <h1 className="nexus-page-title">
              {icon && <span className="nexus-page-icon">{icon}</span>}
              {title}
            </h1>
            {description && (
              <p className="nexus-page-description">{description}</p>
            )}
          </div>
          {actions && (
            <div className="nexus-page-actions">{actions}</div>
          )}
        </div>
      </div>

      {/* ページコンテンツ */}
      <div className="nexus-page-content">
        {children}
      </div>

      <style jsx>{`
        .nexus-page-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .nexus-page-header {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.97) 0%, rgba(248, 250, 254, 0.95) 100%);
          backdrop-filter: blur(25px) saturate(180%);
          border: 1px solid rgba(0, 100, 210, 0.15);
          border-radius: 24px;
          padding: 2rem 2.5rem;
          margin-bottom: 2rem;
          box-shadow: 
            0 8px 32px rgba(0, 100, 210, 0.08),
            inset 0 0 0 1px rgba(255, 255, 255, 0.5);
          position: relative;
          overflow: hidden;
        }

        .nexus-page-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, 
            #0064D2 0%, 
            #E53238 20%, 
            #FFCE00 40%, 
            #86B817 60%, 
            #00BCD4 80%, 
            #7B1FA2 100%
          );
        }

        .nexus-page-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .nexus-page-header-text {
          flex: 1;
        }

        .nexus-page-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1A1A1A;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: 'Orbitron', 'Noto Sans JP', sans-serif;
          letter-spacing: -0.02em;
        }

        .nexus-page-icon {
          font-size: 2.5rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .nexus-page-description {
          margin-top: 0.5rem;
          color: #666666;
          font-size: 0.9rem;
          font-family: 'Noto Sans JP', sans-serif;
        }

        .nexus-page-actions {
          display: flex;
          gap: 1rem;
        }

        .nexus-page-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          min-height: 0;
        }

        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          .nexus-page-header {
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .nexus-page-header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .nexus-page-title {
            font-size: 1.5rem;
          }

          .nexus-page-icon {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
} 