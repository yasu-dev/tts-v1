'use client';

import { useState } from 'react';

interface BarcodePrintButtonProps {
  productIds: string[];
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export default function BarcodePrintButton({ 
  productIds, 
  className = '',
  variant = 'secondary',
  size = 'md'
}: BarcodePrintButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrint = async () => {
    if (productIds.length === 0) {
      setError('印刷する商品を選択してください');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/products/barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds }),
      });

      if (!response.ok) {
        throw new Error('バーコード生成に失敗しました');
      }

      // Get HTML content
      const html = await response.text();

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
          printWindow.print();
          // Optional: Close window after printing
          // printWindow.onafterprint = () => printWindow.close();
        };
      }
    } catch (err) {
      console.error('Barcode print error:', err);
      setError('バーコード印刷中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-3 py-1.5 text-sm';
      case 'lg': return 'px-6 py-3 text-lg';
      default: return 'px-4 py-2';
    }
  };

  return (
    <>
      <button
        onClick={handlePrint}
        disabled={isGenerating || productIds.length === 0}
        className={`
          nexus-button ${variant} ${getSizeClasses()} ${className}
          ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
          ${productIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin h-4 w-4 border-b-2 border-current rounded-full mr-2 inline-block"></div>
            生成中...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            バーコード印刷 {productIds.length > 0 && `(${productIds.length}件)`}
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </>
  );
}