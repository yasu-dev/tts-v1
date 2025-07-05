'use client';

import { useEffect, useState } from 'react';

export default function Loading() {
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // ドットアニメーション
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // プログレスバーアニメーション
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="nexus-loading-container">
      {/* メインローディングエリア */}
      <div className="nexus-loading-content">
        
        {/* Nexusロゴ付きスピナー */}
        <div className="nexus-spinner-wrapper">
          <div className="nexus-spinner">
            <div className="nexus-spinner-ring nexus-ring-1"></div>
            <div className="nexus-spinner-ring nexus-ring-2"></div>
            <div className="nexus-spinner-ring nexus-ring-3"></div>
            <div className="nexus-logo-center">
              <span className="nexus-logo-text">W</span>
            </div>
          </div>
        </div>

        {/* ローディングテキスト */}
        <div className="nexus-loading-text">
          <h3 className="nexus-loading-title">
            データを読み込み中{dots}
          </h3>
          <p className="nexus-loading-subtitle">
            THE WORLD DOORシステムに接続しています
          </p>
        </div>

        {/* プログレスバー */}
        <div className="nexus-progress-container">
          <div className="nexus-progress-bar">
            <div 
              className="nexus-progress-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="nexus-progress-text">
            {Math.min(Math.round(progress), 100)}%
          </div>
        </div>

        {/* 回路パターン背景 */}
        <div className="nexus-circuit-pattern">
          <div className="circuit-line circuit-line-1"></div>
          <div className="circuit-line circuit-line-2"></div>
          <div className="circuit-line circuit-line-3"></div>
          <div className="circuit-node circuit-node-1"></div>
          <div className="circuit-node circuit-node-2"></div>
          <div className="circuit-node circuit-node-3"></div>
        </div>

      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .nexus-loading-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #F8FAFE 0%, #E3F2FD 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          overflow: hidden;
        }

        .nexus-loading-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          z-index: 10;
        }

        /* Nexusスピナー */
        .nexus-spinner-wrapper {
          position: relative;
          margin-bottom: 2rem;
        }

        .nexus-spinner {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nexus-spinner-ring {
          position: absolute;
          border-radius: 50%;
          border: 3px solid transparent;
          animation: nexus-spin 2s linear infinite;
        }

        .nexus-ring-1 {
          width: 120px;
          height: 120px;
          border-top: 3px solid #0064D2;
          border-right: 3px solid #0064D2;
          animation-duration: 1.5s;
          animation-direction: normal;
        }

        .nexus-ring-2 {
          width: 90px;
          height: 90px;
          border-top: 3px solid #FFCE00;
          border-left: 3px solid #FFCE00;
          animation-duration: 2s;
          animation-direction: reverse;
        }

        .nexus-ring-3 {
          width: 60px;
          height: 60px;
          border-top: 3px solid #86B817;
          border-right: 3px solid #86B817;
          animation-duration: 1.2s;
          animation-direction: normal;
        }

        .nexus-logo-center {
          position: absolute;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #0064D2, #0078FF, #00A0FF);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 0 20px rgba(0, 100, 210, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          animation: nexus-pulse 2s ease-in-out infinite;
        }

        .nexus-logo-text {
          font-family: 'Orbitron', monospace;
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
        }

        /* ローディングテキスト */
        .nexus-loading-text {
          margin-bottom: 2rem;
          animation: nexus-fade-in 1s ease-out;
        }

        .nexus-loading-title {
          font-family: 'Noto Sans JP', sans-serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #0064D2;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 100, 210, 0.1);
        }

        .nexus-loading-subtitle {
          font-family: 'Noto Sans JP', sans-serif;
          font-size: 0.875rem;
          color: #666666;
          opacity: 0.8;
        }

        /* プログレスバー */
        .nexus-progress-container {
          width: 300px;
          margin-bottom: 2rem;
        }

        .nexus-progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(0, 100, 210, 0.1);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
          margin-bottom: 0.5rem;
        }

        .nexus-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0064D2, #0078FF, #00A0FF);
          border-radius: 4px;
          transition: width 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .nexus-progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: nexus-shimmer 1.5s infinite;
        }

        .nexus-progress-text {
          font-family: 'Orbitron', monospace;
          font-size: 0.75rem;
          color: #0064D2;
          text-align: center;
          font-weight: 600;
        }

        /* 回路パターン背景 */
        .nexus-circuit-pattern {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          height: 400px;
          opacity: 0.1;
          z-index: -1;
        }

        .circuit-line {
          position: absolute;
          background: linear-gradient(90deg, #0064D2, #FFCE00);
          animation: nexus-circuit-flow 3s linear infinite;
        }

        .circuit-line-1 {
          width: 200px;
          height: 2px;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
        }

        .circuit-line-2 {
          width: 2px;
          height: 150px;
          top: 25%;
          left: 50%;
          transform: translateX(-50%);
          animation-delay: 1s;
        }

        .circuit-line-3 {
          width: 150px;
          height: 2px;
          top: 75%;
          right: 0;
          animation-delay: 2s;
        }

        .circuit-node {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #0064D2;
          border-radius: 50%;
          animation: nexus-node-pulse 2s ease-in-out infinite;
        }

        .circuit-node-1 {
          top: 50%;
          left: 0;
          transform: translate(-50%, -50%);
        }

        .circuit-node-2 {
          top: 25%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 0.7s;
        }

        .circuit-node-3 {
          top: 75%;
          right: 0;
          transform: translate(50%, -50%);
          animation-delay: 1.4s;
        }

        /* アニメーション定義 */
        @keyframes nexus-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes nexus-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 20px rgba(0, 100, 210, 0.6);
          }
          50% { 
            transform: scale(1.1);
            box-shadow: 0 0 30px rgba(0, 100, 210, 0.8);
          }
        }

        @keyframes nexus-fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes nexus-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes nexus-circuit-flow {
          0% { opacity: 0.3; }
          50% { opacity: 0.8; }
          100% { opacity: 0.3; }
        }

        @keyframes nexus-node-pulse {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 5px rgba(0, 100, 210, 0.5);
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.5);
            box-shadow: 0 0 15px rgba(0, 100, 210, 0.8);
          }
        }

        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          .nexus-spinner {
            width: 80px;
            height: 80px;
          }

          .nexus-ring-1 {
            width: 80px;
            height: 80px;
          }

          .nexus-ring-2 {
            width: 60px;
            height: 60px;
          }

          .nexus-ring-3 {
            width: 40px;
            height: 40px;
          }

          .nexus-logo-center {
            width: 30px;
            height: 30px;
          }

          .nexus-logo-text {
            font-size: 1.2rem;
          }

          .nexus-loading-title {
            font-size: 1.2rem;
          }

          .nexus-progress-container {
            width: 250px;
          }

          .nexus-circuit-pattern {
            width: 300px;
            height: 300px;
          }
        }
      `}</style>
    </div>
  );
} 