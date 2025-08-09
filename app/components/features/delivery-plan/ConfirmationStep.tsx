'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusCheckbox from '@/app/components/ui/NexusCheckbox';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { ExternalLink } from 'lucide-react';

interface ConfirmationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onPrev: () => void;
  onSubmit: () => void;
  isLastStep: boolean;
  loading: boolean;
}

export default function ConfirmationStep({ 
  data, 
  onUpdate, 
  onPrev, 
  onSubmit,
  isLastStep,
  loading
}: ConfirmationStepProps) {
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(data.confirmation?.agreedToTerms || false);
  const [generateBarcodes, setGenerateBarcodes] = useState(data.confirmation?.generateBarcodes ?? true);

  // ログイン中のユーザー情報を取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const result = await response.json();
        
        if (result.success && result.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('[ERROR] ユーザー情報の取得に失敗しました:', error);
      }
    };

    fetchUserInfo().catch(error => {
      console.error('[ERROR] fetchUserInfo Promise rejection:', error);
    });
  }, []);

  const handleTermsChange = (checked: boolean) => {
    setAgreedToTerms(checked);
    onUpdate({ 
      confirmation: { 
        agreedToTerms: checked, 
        generateBarcodes 
      } 
    });
  };

  const handleBarcodesChange = (checked: boolean) => {
    setGenerateBarcodes(checked);
    onUpdate({ 
      confirmation: { 
        agreedToTerms, 
        generateBarcodes: checked 
      } 
    });
  };

  const handleSubmit = () => {
    if (!agreedToTerms) {
      showToast({
        type: 'warning',
        title: '同意が必要',
        message: '利用規約に同意してください'
      });
      return;
    }
    onSubmit();
  };

  const getTotalValue = () => {
    if (!Array.isArray(data.products)) {
      return 0;
    }
    return data.products.reduce((total: number, product: any) => {
      const value = typeof product?.estimatedValue === 'number' ? product.estimatedValue : 0;
      return total + value;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-nexus-text-primary mb-4">確認・出力</h2>
        <p className="text-nexus-text-secondary mb-6">入力内容を確認して、納品プランを作成してください</p>
      </div>

      {/* 基本情報確認 */}
      <NexusCard className="p-6">
        <h3 className="text-lg font-medium text-nexus-text-primary mb-4">基本情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-nexus-text-secondary">セラー名:</span>
            <span className="ml-2 text-nexus-text-primary">{user?.fullName || user?.username || '未取得'}</span>
          </div>
          <div>
            <span className="font-medium text-nexus-text-secondary">連絡先メール:</span>
            <span className="ml-2 text-nexus-text-primary">{user?.email || '未取得'}</span>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-nexus-text-secondary">配送先倉庫:</span>
            <span className="ml-2 text-nexus-text-primary">{data.basicInfo?.warehouseName || '未選択'}</span>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-nexus-text-secondary">納品先住所:</span>
            <span className="ml-2 text-nexus-text-primary">{data.basicInfo?.deliveryAddress || '未入力'}</span>
          </div>
          {user?.phoneNumber && (
            <div>
              <span className="font-medium text-nexus-text-secondary">電話番号:</span>
              <span className="ml-2 text-nexus-text-primary">{user.phoneNumber}</span>
            </div>
          )}
          {data.basicInfo?.notes && (
            <div className="md:col-span-2">
              <span className="font-medium text-nexus-text-secondary">備考:</span>
              <span className="ml-2 text-nexus-text-primary">{data.basicInfo.notes}</span>
            </div>
          )}
        </div>
      </NexusCard>

      {/* 商品一覧確認 */}
      <NexusCard className="p-6">
        <h3 className="text-lg font-medium text-nexus-text-primary mb-4">登録商品一覧</h3>
        {data.products && data.products.length > 0 ? (
          <div className="space-y-4">
            {data.products.map((product: any, index: number) => (
              <NexusCard key={index} className="p-4 border-l-4 border-primary-blue bg-nexus-bg-tertiary">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-nexus-text-primary">{product.name}</h4>
                  <span className="text-lg font-bold text-primary-blue">
                    ¥{product.estimatedValue?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-nexus-text-secondary">
                  <div>
                    <span className="font-medium">ブランド:</span> {product.brand}
                  </div>
                  <div>
                    <span className="font-medium">モデル:</span> {product.model}
                  </div>
                  <div>
                    <span className="font-medium">カテゴリ:</span> 
                    {product.category === 'camera' ? 'カメラ' :
                     product.category === 'watch' ? '腕時計' : 'その他'}
                  </div>
                  {product.serialNumber && (
                    <div>
                      <span className="font-medium">S/N:</span> {product.serialNumber}
                    </div>
                  )}
                </div>
                {product.description && (
                  <div className="mt-2 text-sm text-nexus-text-secondary">
                    <span className="font-medium">説明:</span> {product.description}
                  </div>
                )}
              </NexusCard>
            ))}
            <NexusCard className="p-4 border-2 border-primary-blue bg-nexus-bg-tertiary">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-nexus-text-primary">合計予想価格:</span>
                <span className="text-xl font-bold text-primary-blue">
                  ¥{getTotalValue().toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-nexus-text-secondary mt-1">
                登録商品数: {data.products.length}点
              </p>
            </NexusCard>
          </div>
        ) : (
          <p className="text-nexus-text-secondary">商品が登録されていません</p>
        )}
      </NexusCard>

      {/* オプション設定 */}
      <NexusCard className="p-6 bg-nexus-bg-tertiary">
        <h3 className="text-lg font-medium text-nexus-text-primary mb-4">出力オプション</h3>
        <div className="space-y-4">
          <NexusCheckbox
            checked={generateBarcodes}
            onChange={(e) => handleBarcodesChange(e.target.checked)}
            label="バーコードラベルを生成する（推奨）"
            description="商品管理用のバーコードラベルPDFを自動生成します"
            variant="nexus"
          />
        </div>
      </NexusCard>

      {/* 利用規約同意 */}
      <NexusCard className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-medium text-nexus-text-primary mb-4">利用規約</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => handleTermsChange(e.target.checked)}
              className="w-4 h-4 text-primary-blue border-nexus-border rounded focus:ring-primary-blue flex-shrink-0"
            />
            <label className="ml-3 text-sm text-nexus-text-primary leading-relaxed">
              <span className="text-red-500">*</span> 
              THE WORLD DOORの利用規約および
              <Link 
                href="/privacy-policy" 
                target="_blank" 
                className="text-primary-blue hover:text-blue-700 underline inline-flex items-center mx-1"
              >
                プライバシーポリシー
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
              に同意します
            </label>
          </div>
        </div>
      </NexusCard>

      <div className="flex justify-between pt-6">
        <NexusButton variant="default" onClick={onPrev} disabled={loading}>
          前に戻る
        </NexusButton>
        <NexusButton 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading || !agreedToTerms}
        >
          {loading ? '作成中...' : '納品プランを作成'}
        </NexusButton>
      </div>
    </div>
  );
} 