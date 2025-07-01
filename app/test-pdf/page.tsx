'use client';

import { useState } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';

export default function TestPDFPage() {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('barcode-labels');
  const [previewData, setPreviewData] = useState<any>(null);
  const [generatedPDF, setGeneratedPDF] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const pdfTypes = [
    {
      id: 'barcode-labels',
      name: 'バーコードラベル',
      description: 'A4サイズ6面付けのバーコードラベル',
      icon: '🏷️'
    },
    {
      id: 'delivery-note',
      name: '納品書',
      description: '商品納品時の明細書',
      icon: '📄'
    },
    {
      id: 'picking-list',
      name: 'ピッキングリスト',
      description: '倉庫作業用のピッキングリスト',
      icon: '📋'
    }
  ];

  // プレビューデータの取得
  const loadPreviewData = async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/pdf/generate?type=${type}`);
      if (!response.ok) {
        throw new Error('プレビューデータの取得に失敗しました');
      }
      
      const data = await response.json();
      setPreviewData(data.sampleData);
    } catch (error) {
      console.error('Preview error:', error);
      setError('プレビューデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // PDF生成
  const generatePDF = async () => {
    try {
      setLoading(true);
      setError(null);
      setGeneratedPDF(null);

      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
          data: previewData || getSampleData(selectedType)
        }),
      });

      if (!response.ok) {
        throw new Error('PDF生成に失敗しました');
      }

      const result = await response.json();
      setGeneratedPDF(result);

      // PDFのダウンロード
      if (result.base64Data) {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${result.base64Data}`;
        link.download = result.fileName;
        link.click();
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      setError('PDF生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // サンプルデータの取得
  const getSampleData = (type: string) => {
    switch (type) {
      case 'barcode-labels':
        return [
          {
            sku: 'TWD-2024-001',
            barcode: '1234567890123',
            productName: 'Canon EOS R5 ボディ 美品',
            price: 450000
          },
          {
            sku: 'TWD-2024-002',
            barcode: '1234567890124',
            productName: 'Nikon Z9 ボディ 新品同様',
            price: 620000
          },
          {
            sku: 'TWD-2024-003',
            barcode: '1234567890125',
            productName: 'Sony α7R V ボディ',
            price: 480000
          },
          {
            sku: 'TWD-2024-004',
            barcode: '1234567890126',
            productName: 'Canon RF24-70mm F2.8',
            price: 280000
          },
          {
            sku: 'TWD-2024-005',
            barcode: '1234567890127',
            productName: 'Rolex Submariner Date',
            price: 1850000
          },
          {
            sku: 'TWD-2024-006',
            barcode: '1234567890128',
            productName: 'Omega Speedmaster',
            price: 980000
          }
        ];
      
      case 'delivery-note':
        return {
          deliveryId: `DN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          deliveryTo: {
            name: '山田太郎 様',
            address: '〒100-0001 東京都千代田区千代田1-1-1 千代田ビル5F'
          },
          items: [
            {
              sku: 'TWD-2024-001',
              productName: 'Canon EOS R5 ボディ',
              quantity: 1,
              unitPrice: 450000
            },
            {
              sku: 'TWD-2024-004',
              productName: 'Canon RF24-70mm F2.8 L IS USM',
              quantity: 1,
              unitPrice: 280000
            },
            {
              sku: 'TWD-2024-010',
              productName: 'SanDisk Extreme PRO 128GB',
              quantity: 2,
              unitPrice: 8500
            }
          ],
          notes: 'お買い上げありがとうございます。商品は丁寧に梱包してお送りいたします。'
        };

      case 'picking-list':
        return {
          listId: `PL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          assignedTo: '田中一郎',
          priority: 'high',
          items: [
            {
              location: 'A-01-03',
              sku: 'TWD-2024-001',
              productName: 'Canon EOS R5 ボディ',
              quantity: 1,
              isPicked: false
            },
            {
              location: 'B-02-15',
              sku: 'TWD-2024-004',
              productName: 'Canon RF24-70mm F2.8 L IS USM',
              quantity: 1,
              isPicked: false
            },
            {
              location: 'C-03-08',
              sku: 'TWD-2024-010',
              productName: 'SanDisk Extreme PRO 128GB',
              quantity: 2,
              isPicked: false
            },
            {
              location: 'D-01-01',
              sku: 'TWD-2024-005',
              productName: 'Rolex Submariner Date',
              quantity: 1,
              isPicked: false
            }
          ],
          qrCode: 'sample-qr-code'
        };

      default:
        return null;
    }
  };

  return (
    <DashboardLayout userType="staff">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">PDF帳票生成テスト</h1>
          <p className="text-gray-600">jsPDFを使用した各種帳票のPDF生成機能</p>
        </div>

        {/* PDFタイプ選択 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {pdfTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => {
                setSelectedType(type.id);
                loadPreviewData(type.id);
              }}
              className={`
                cursor-pointer border-2 rounded-lg p-4 transition-all
                ${selectedType === type.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <h3 className="font-semibold text-gray-900">{type.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{type.description}</p>
            </div>
          ))}
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* プレビューデータ */}
        {previewData && (
          <NexusCard className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">プレビューデータ</h3>
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-sm text-gray-700">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </div>
          </NexusCard>
        )}

        {/* アクションボタン */}
        <div className="flex gap-4 mb-6">
          <NexusButton
            onClick={() => loadPreviewData(selectedType)}
            disabled={loading}
            variant="default"
          >
            プレビューデータ読み込み
          </NexusButton>
          <NexusButton
            onClick={generatePDF}
            disabled={loading}
            variant="primary"
          >
            {loading ? '生成中...' : 'PDF生成・ダウンロード'}
          </NexusButton>
        </div>

        {/* 生成結果 */}
        {generatedPDF && (
          <NexusCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">生成結果</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">PDF生成成功</p>
                  <p className="text-sm text-green-600">
                    ファイル名: {generatedPDF.fileName}
                  </p>
                  <p className="text-sm text-green-600">
                    サイズ: {(generatedPDF.fileSize / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="text-green-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </NexusCard>
        )}

        {/* 機能説明 */}
        <NexusCard className="mt-6 p-6">
          <h3 className="text-lg font-semibold mb-4">実装機能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">🏷️ バーコードラベル</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• A4サイズに6面付け（2列×3行）</li>
                <li>• SKU、バーコード、商品名、価格を表示</li>
                <li>• 複数ページ対応</li>
                <li>• プリンタで直接印刷可能</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📄 納品書</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 会社情報・納品先情報</li>
                <li>• 商品明細テーブル</li>
                <li>• 小計・消費税・合計金額の自動計算</li>
                <li>• 備考欄</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📋 ピッキングリスト</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• ロケーション情報の強調表示</li>
                <li>• チェックボックス付き</li>
                <li>• 作業者・優先度情報</li>
                <li>• 完了状況のトラッキング</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔧 技術仕様</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• jsPDF ライブラリ使用</li>
                <li>• 日本語フォント対応</li>
                <li>• Base64エンコード出力</li>
                <li>• クライアントサイド生成可能</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              💡 <strong>活用シーン:</strong> 納品プラン作成時のバーコードラベル印刷、
              商品発送時の納品書発行、倉庫でのピッキング作業効率化など、
              様々な業務プロセスで活用できます。
            </p>
          </div>
        </NexusCard>
      </div>
    </DashboardLayout>
  );
} 