'use client';

import { useState, useEffect } from 'react';
import { ebayAdapter } from '@/lib/services/adapters/ebay.adapter';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  condition: string;
  description?: string;
  imageUrl?: string;
}

interface EbayListingFormProps {
  product: Product;
  onSuccess?: (listing: any) => void;
  onCancel?: () => void;
}

interface Template {
  id: string;
  name: string;
  template: {
    title: string;
    description: string;
  };
}

export default function EbayListingForm({ product, onSuccess, onCancel }: EbayListingFormProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState(Math.floor(product.price * 0.8));
  const [buyItNowPrice, setBuyItNowPrice] = useState(product.price);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/ebay/listing');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data.templates);
      if (data.templates.length > 0) {
        setSelectedTemplate(data.templates[0].id);
      }
    } catch (err) {
      setError('テンプレートの取得に失敗しました');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) {
        throw new Error('テンプレートが選択されていません');
      }

      const title = customTitle || template.template.title
        .replace('{name}', product.name)
        .replace('{sku}', product.sku);
        
      const description = customDescription || template.template.description
        .replace(/{name}/g, product.name)
        .replace(/{sku}/g, product.sku)
        .replace(/{condition}/g, product.condition)
        .replace(/{description}/g, product.description || '詳細は画像をご確認ください');

      // eBayアダプターを使用して出品
      const result = await ebayAdapter.createListing({
        title,
        description,
        price: buyItNowPrice,
        currency: 'JPY',
        categoryId: getCategoryId(product.category),
        condition: product.condition,
        images: product.imageUrl ? [product.imageUrl] : [],
        duration: 10, // 10日間
        shippingOptions: [
          {
            service: 'FedEx International',
            cost: 0, // Free shipping
            type: 'Flat'
          }
        ]
      });

      if (!result.success) {
        throw new Error(result.error || 'eBay出品に失敗しました');
      }

      // 出品成功後、ローカルデータベースに記録
      const response = await fetch('/api/ebay/listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          ebayListingId: result.listingId,
          ebayUrl: result.url,
          template: selectedTemplate,
          title,
          description,
          startingPrice,
          buyItNowPrice
        }),
      });

      if (!response.ok) {
        console.error('Failed to save listing to database');
      }

      if (onSuccess) {
        onSuccess({
          ...result,
          productId: product.id,
          title,
          price: buyItNowPrice
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'eBay出品中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryId = (category: string): string => {
    // カテゴリーマッピング（実際のeBayカテゴリーIDに変更する必要があります）
    const categoryMap: Record<string, string> = {
      'camera_body': '625', // Cameras & Photo > Digital Cameras
      'lens': '3323', // Lenses & Filters
      'watch': '14324', // Watches
      'accessory': '15200' // Camera Accessories
    };
    return categoryMap[category] || '625';
  };

  const getPreviewData = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return { title: '', description: '' };

    const title = customTitle || template.template.title
      .replace('{name}', product.name)
      .replace('{sku}', product.sku);
      
    const description = customDescription || template.template.description
      .replace(/{name}/g, product.name)
      .replace(/{sku}/g, product.sku)
      .replace(/{condition}/g, product.condition)
      .replace(/{description}/g, product.description || '詳細は画像をご確認ください');

    return { title, description };
  };

  return (
    <div className="intelligence-card global">
      <div className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-display font-bold text-nexus-text-primary">
            eBay出品設定
          </h3>
          <p className="text-nexus-text-secondary mt-1">
            商品: {product.name} (SKU: {product.sku})
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
            出品テンプレート
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200
                  ${selectedTemplate === template.id 
                                    ? 'border-primary-blue bg-primary-blue/5'
                : 'border-nexus-border hover:border-primary-blue/50'
                  }
                `}
              >
                <div className="text-sm font-medium text-nexus-text-primary">
                  {template.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Price Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
              開始価格
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nexus-text-secondary">
                ¥
              </span>
              <input
                type="number"
                value={startingPrice}
                onChange={(e) => setStartingPrice(parseInt(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-[#0064D2] text-nexus-text-primary"
              />
            </div>
            <p className="text-xs text-nexus-text-muted mt-1">
              推奨: ¥{Math.floor(product.price * 0.8).toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
              即決価格
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nexus-text-secondary">
                ¥
              </span>
              <input
                type="number"
                value={buyItNowPrice}
                onChange={(e) => setBuyItNowPrice(parseInt(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-[#0064D2] text-nexus-text-primary"
              />
            </div>
            <p className="text-xs text-nexus-text-muted mt-1">
              定価: ¥{product.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Custom Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
            カスタムタイトル（オプション）
          </label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="テンプレートのタイトルを使用"
            className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-[#0064D2] text-nexus-text-primary"
          />
        </div>

        {/* Custom Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
            カスタム説明（オプション）
          </label>
          <textarea
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="テンプレートの説明文を使用"
            rows={4}
            className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-[#0064D2] text-nexus-text-primary"
          />
        </div>

        {/* Preview Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="nexus-button"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            プレビュー{previewMode ? 'を隠す' : 'を表示'}
          </button>
        </div>

        {/* Preview */}
        {previewMode && (
          <div className="mb-6 p-6 bg-nexus-bg-secondary rounded-lg border border-nexus-border">
            <h4 className="font-medium text-nexus-text-primary mb-4">出品プレビュー</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-nexus-text-secondary mb-1">タイトル:</p>
                <p className="font-medium text-nexus-text-primary">{getPreviewData().title}</p>
              </div>
              <div>
                <p className="text-sm text-nexus-text-secondary mb-1">説明:</p>
                <div 
                  className="prose prose-sm max-w-none text-nexus-text-primary"
                  dangerouslySetInnerHTML={{ __html: getPreviewData().description }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-nexus-text-secondary">開始価格:</p>
                  <p className="font-display font-bold text-lg text-nexus-text-primary">
                    ¥{startingPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-nexus-text-secondary">即決価格:</p>
                  <p className="font-display font-bold text-lg text-nexus-text-primary">
                    ¥{buyItNowPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="nexus-button"
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="nexus-button primary"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2 inline-block"></div>
                出品中...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                eBayに出品
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}