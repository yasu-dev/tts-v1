'use client';

import { useState, useEffect } from 'react';
import { BaseModal, NexusButton, NexusSelect, NexusInput, NexusTextarea } from '@/app/components/ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline';

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

interface Template {
  id: string;
  name: string;
  template: {
    title: string;
    description: string;
  };
}

interface ListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess?: (listing: any) => void;
}

export default function ListingFormModal({ 
  isOpen, 
  onClose, 
  product, 
  onSuccess 
}: ListingFormModalProps) {
  const { showToast } = useToast();
  
  // フォーム状態
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState(0);
  const [buyItNowPrice, setBuyItNowPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 商品変更時の価格初期化
  useEffect(() => {
    if (product) {
      setStartingPrice(Math.floor(product.price * 0.8));
      setBuyItNowPrice(product.price);
    }
  }, [product]);

  // テンプレート取得
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/ebay/listing');
      if (!response.ok) throw new Error('テンプレートの取得に失敗しました');
      
      const data = await response.json();
      setTemplates(data.templates || []);
      
      // 商品カテゴリに応じた推奨テンプレートを自動選択
      if (data.templates && product) {
        const recommendedTemplate = data.templates.find((t: Template) => 
          t.name.toLowerCase().includes(product.category.toLowerCase()) ||
          (product.category === 'カメラ本体' && t.name.includes('Camera Body')) ||
          (product.category === 'レンズ' && t.name.includes('Lens')) ||
          (product.category === '腕時計' && t.name.includes('Watch'))
        );
        
        if (recommendedTemplate) {
          setSelectedTemplate(recommendedTemplate.id);
        }
      }
    } catch (error) {
      console.error('テンプレート取得エラー:', error);
      setError('テンプレートの読み込みに失敗しました');
    }
  };

  const handleSubmit = async () => {
    if (!product || !selectedTemplate) {
      setError('必要な情報が不足しています');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
      if (!selectedTemplateData) {
        throw new Error('選択されたテンプレートが見つかりません');
      }

      const listingData = {
        productId: product.id,
        templateId: selectedTemplate,
        customTitle: customTitle || undefined,
        customDescription: customDescription || undefined,
        startingPrice,
        buyItNowPrice,
        title: customTitle || selectedTemplateData.template.title.replace('{productName}', product.name),
        description: customDescription || selectedTemplateData.template.description.replace('{productDescription}', product.description || ''),
      };

      const response = await fetch('/api/ebay/listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '出品処理に失敗しました');
      }

      const result = await response.json();

      showToast({
        title: '出品完了',
        message: `${product.name} をeBayに出品しました`,
        type: 'success'
      });

      // 成功コールバックを呼び出し
      if (onSuccess) {
        onSuccess(result);
      }

      // フォームリセット
      resetForm();
      onClose();

    } catch (error: any) {
      console.error('出品エラー:', error);
      setError(error.message || '出品処理中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate('');
    setCustomTitle('');
    setCustomDescription('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const generatePreview = () => {
    if (!product || !selectedTemplate) return null;

    const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
    if (!selectedTemplateData) return null;

    const title = customTitle || selectedTemplateData.template.title.replace('{productName}', product.name);
    const description = customDescription || selectedTemplateData.template.description.replace('{productDescription}', product.description || '');

    return { title, description };
  };

  if (!isOpen || !product) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="eBay出品"
      size="lg"
    >
      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            {product.name} ({product.sku}) を出品します
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* テンプレート選択 */}
          <div>
            <NexusSelect
              label="出品テンプレート *"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              required
              options={[
                { value: '', label: 'テンプレートを選択してください' },
                ...templates.map(template => ({
                  value: template.id,
                  label: template.name
                }))
              ]}
            />
          </div>

          {/* 価格設定 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <NexusInput
                label="開始価格 (¥) *"
                type="number"
                value={startingPrice}
                onChange={(e) => setStartingPrice(Number(e.target.value))}
                min="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                推奨: 商品価格の80% (¥{Math.floor(product.price * 0.8).toLocaleString()})
              </p>
            </div>
            <div>
              <NexusInput
                label="即決価格 (¥) *"
                type="number"
                value={buyItNowPrice}
                onChange={(e) => setBuyItNowPrice(Number(e.target.value))}
                min={startingPrice}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                推奨: 商品価格の100% (¥{product.price.toLocaleString()})
              </p>
            </div>
          </div>

          {/* カスタマイズ */}
          <div>
            <NexusInput
              label="カスタムタイトル (任意)"
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="空欄の場合はテンプレートのタイトルを使用"
            />
          </div>

          <div>
            <NexusTextarea
              label="カスタム説明（オプション）"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              rows={4}
              placeholder="空欄の場合はテンプレートの説明文を使用"
            />
          </div>
        </div>

        {/* フッター */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="flex space-x-2">
            <NexusButton
              onClick={handleClose}
              disabled={isSubmitting}
            >
              キャンセル
            </NexusButton>
          </div>
          <NexusButton
            onClick={handleSubmit}
            variant="primary"
            icon={<ShoppingCartIcon className="w-4 h-4" />}
            disabled={!selectedTemplate || isSubmitting}
          >
            {isSubmitting ? '出品中...' : 'eBayに出品'}
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
}