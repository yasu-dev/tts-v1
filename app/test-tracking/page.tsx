'use client';

import React from 'react';
import TrackingNumberDisplay, { AdvancedTrackingDisplay } from '@/app/components/ui/TrackingNumberDisplay';
import { generateTrackingUrl, formatTrackingNumber, isValidTrackingNumber } from '@/lib/utils/tracking';

// テスト用のトラッキング番号データ
const testTrackingData = [
  {
    carrier: 'fedx',
    trackingNumber: 'FX1234567890',
    carrierName: 'FedX',
    orderStatus: 'shipped'
  },
  {
    carrier: 'yamato',
    trackingNumber: '123456789012',
    carrierName: 'ヤマト運輸',
    orderStatus: 'shipped'
  },
  {
    carrier: 'sagawa',
    trackingNumber: '876543210987',
    carrierName: '佐川急便', 
    orderStatus: 'shipped'
  },
  {
    carrier: 'yupack',
    trackingNumber: '1A23456789012',
    carrierName: 'ゆうパック',
    orderStatus: 'shipped'
  },
  {
    carrier: 'other',
    trackingNumber: 'ABC123XYZ789',
    carrierName: 'その他',
    orderStatus: 'shipped'
  }
];

export default function TrackingTestPage() {
  const handleTestURL = (carrier: string, trackingNumber: string) => {
    const url = generateTrackingUrl(carrier, trackingNumber);
    console.log(`${carrier}: ${trackingNumber} -> ${url}`);
    return url;
  };

  return (
    <div className="min-h-screen bg-nexus-bg-primary p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-nexus-text-primary mb-2">
            追跡番号表示テスト
          </h1>
          <p className="text-nexus-text-secondary">
            各配送業者の追跡番号表示とリンク機能をテストします。
          </p>
        </div>

        {/* URL生成テスト */}
        <div className="bg-white rounded-lg p-6 border border-nexus-border">
          <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
            URL生成テスト
          </h2>
          <div className="space-y-3">
            {testTrackingData.map((data, index) => (
              <div key={index} className="p-4 bg-nexus-bg-secondary rounded border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">配送業者:</span> {data.carrierName} ({data.carrier})
                  </div>
                  <div>
                    <span className="font-medium">追跡番号:</span> {data.trackingNumber}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">生成URL:</span>
                    <div className="mt-1 p-2 bg-white rounded border font-mono text-xs break-all">
                      {handleTestURL(data.carrier, data.trackingNumber)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">有効性:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      isValidTrackingNumber(data.trackingNumber, data.carrier) 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isValidTrackingNumber(data.trackingNumber, data.carrier) ? '有効' : '無効'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">フォーマット:</span> {formatTrackingNumber(data.trackingNumber, data.carrier)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* コンパクト表示テスト */}
        <div className="bg-white rounded-lg p-6 border border-nexus-border">
          <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
            コンパクト表示テスト
          </h2>
          <div className="space-y-4">
            {testTrackingData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-nexus-bg-secondary rounded border">
                <div className="space-y-1">
                  <div className="font-medium text-nexus-text-primary">
                    {data.carrierName}
                  </div>
                  <div className="text-sm text-nexus-text-secondary">
                    注文番号: ORD-2024-{String(index + 1).padStart(3, '0')}
                  </div>
                </div>
                <TrackingNumberDisplay
                  trackingNumber={data.trackingNumber}
                  carrier={data.carrier}
                  size="sm"
                  displayFormat="short"
                  showCarrierName={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* フル表示テスト */}
        <div className="bg-white rounded-lg p-6 border border-nexus-border">
          <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
            フル表示テスト
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testTrackingData.map((data, index) => (
              <div key={index} className="p-4 bg-nexus-bg-secondary rounded border">
                <h3 className="font-medium text-nexus-text-primary mb-3">
                  {data.carrierName} - 注文 #{String(index + 1).padStart(3, '0')}
                </h3>
                <TrackingNumberDisplay
                  trackingNumber={data.trackingNumber}
                  carrier={data.carrier}
                  size="md"
                  displayFormat="full"
                  showCarrierName={true}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 高度な表示テスト */}
        <div className="bg-white rounded-lg p-6 border border-nexus-border">
          <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
            高度な表示テスト
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {testTrackingData.slice(0, 2).map((data, index) => (
              <div key={index} className="p-6 bg-nexus-bg-secondary rounded border">
                <h3 className="font-medium text-nexus-text-primary mb-4">
                  {data.carrierName} - 詳細追跡
                </h3>
                <AdvancedTrackingDisplay
                  trackingNumber={data.trackingNumber}
                  carrier={data.carrier}
                  orderStatus={data.orderStatus}
                  shippedAt={new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()} // 1日前
                  showCarrierName={true}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 実際のリンクテスト */}
        <div className="bg-white rounded-lg p-6 border border-nexus-border">
          <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
            実際のリンクテスト
          </h2>
          <div className="space-y-4">
            {testTrackingData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-nexus-bg-secondary rounded border">
                <div>
                  <div className="font-medium text-nexus-text-primary">
                    {data.carrierName}
                  </div>
                  <div className="text-sm text-nexus-text-secondary">
                    {data.trackingNumber}
                  </div>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      const url = generateTrackingUrl(data.carrier, data.trackingNumber);
                      console.log(`Opening: ${url}`);
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-4 py-2 bg-nexus-primary text-white rounded hover:bg-nexus-primary-dark transition-colors"
                  >
                    配送状況を確認
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(data.trackingNumber);
                      alert('コピーしました: ' + data.trackingNumber);
                    }}
                    className="px-4 py-2 bg-nexus-secondary text-nexus-text-primary rounded hover:bg-nexus-bg-tertiary transition-colors"
                  >
                    コピー
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 開発者情報 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">開発者向け情報</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• このページは開発・テスト用です</li>
            <li>• 実際のリンクは新しいタブで開かれます</li>
            <li>• コンソールでURL生成結果を確認できます</li>
            <li>• 各配送業者の追跡サイトの仕様により、実際の追跡結果は異なる場合があります</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
