'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCard from '@/app/components/ui/NexusCard';
import PhotographyRequestDisplay from '@/app/components/features/photography/PhotographyRequestDisplay';

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

  // コンポーネント表示時にスクロール位置を最上部に設定 - 確実な実装
  useEffect(() => {
    console.log('[ConfirmationStep] 確認画面表示、スクロール最上部へ');
    
    const scrollToTop = () => {
      // DashboardLayout内のスクロールコンテナを取得
      const scrollContainer = document.querySelector('.page-scroll-container');
      if (scrollContainer) {
        console.log('[ConfirmationStep] スクロールコンテナ発見、最上部へ移動');
        // 即座に最上部に移動（確認画面なので確実性最優先）
        scrollContainer.scrollTop = 0;
        
        // 確実性のため追加でもう一度実行
        setTimeout(() => {
          scrollContainer.scrollTop = 0;
        }, 50);
      } else {
        console.log('[ConfirmationStep] スクロールコンテナ未発見、windowスクロール使用');
        // フォールバック
        window.scrollTo(0, 0);
      }
    };

    // 即座に実行
    scrollToTop();
    
    // DOM準備完了後に再実行（確実性を最大化）
    const timeoutId1 = setTimeout(scrollToTop, 100);
    const timeoutId2 = setTimeout(scrollToTop, 200);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, []);

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
        generateBarcodes: true // 常にtrue
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

  // 合計購入価格を計算する関数
  const getTotalPurchasePrice = () => {
    if (!Array.isArray(data.products)) {
      return 0;
    }
    return data.products.reduce((total: number, product: any) => {
      const price = typeof product?.purchasePrice === 'number' ? product.purchasePrice : 0;
      return total + price;
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
                    ¥{product.purchasePrice?.toLocaleString() || '0'}
                  </span>
                </div>
                
                {/* 商品基本情報 */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-nexus-text-secondary mb-4">
                  <div>
                    <span className="font-medium">カテゴリ:</span> 
                    {product.category === 'camera' ? 'カメラ' :
                     product.category === 'watch' ? '腕時計' : 'その他'}
                  </div>
                  <div>
                    <span className="font-medium">コンディション:</span> 
                    {product.condition === 'excellent' ? '優良' :
                     product.condition === 'very_good' ? '美品' :
                     product.condition === 'good' ? '良好' :
                     product.condition === 'fair' ? '普通' :
                     product.condition === 'poor' ? '要修理' : product.condition}
                  </div>
                  <div>
                    <span className="font-medium">購入価格:</span> 
                    ¥{product.purchasePrice?.toLocaleString() || '0'}
                  </div>
                  {product.purchaseDate && (
                    <div>
                      <span className="font-medium">仕入日:</span> {product.purchaseDate}
                    </div>
                  )}
                  {product.supplier && (
                    <div>
                      <span className="font-medium">仕入先:</span> {product.supplier}
                    </div>
                  )}
                </div>

                {/* 商品画像表示 */}
                {product.images && product.images.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-nexus-text-primary mb-2">商品画像</h5>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {product.images.map((image: any) => (
                        <div key={image.id} className="relative group border border-nexus-border rounded-lg overflow-hidden">
                          <img 
                            src={image.url} 
                            alt={image.filename}
                            className="w-full h-20 object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 text-center">
                            {image.category === 'product' ? '本体' :
                             image.category === 'package' ? '箱' :
                             image.category === 'accessory' ? '付属品' :
                             image.category === 'document' ? '書類' : 'その他'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 撮影要望表示 */}
                <div className="mb-4">
                  <PhotographyRequestDisplay
                    photographyRequests={product.photographyRequest || null}
                    className=""
                  />
                </div>

                {/* 検品チェックリスト表示 */}
                {product.inspectionChecklist && (
                  <div className="mb-4 border-t pt-4">
                    <h5 className="text-sm font-medium text-nexus-text-primary mb-2">検品チェックリスト（該当項目のみチェック）</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {/* 外装項目 */}
                      <div>
                        <h6 className="text-xs font-medium text-nexus-text-secondary mb-2">外装項目</h6>
                        <div className="space-y-1 text-xs">
                          <div className={product.inspectionChecklist.exterior?.scratches ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.exterior?.scratches ? '✓ 外装キズ' : '○ 外装キズなし'}
                          </div>
                          <div className={product.inspectionChecklist.exterior?.dents ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.exterior?.dents ? '✓ 打痕・へこみ' : '○ 打痕・へこみなし'}
                          </div>
                          <div className={product.inspectionChecklist.exterior?.discoloration ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.exterior?.discoloration ? '✓ 部品欠損' : '○ 部品欠損なし'}
                          </div>
                          <div className={product.inspectionChecklist.exterior?.dust ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.exterior?.dust ? '✓ 汚れ・ホコリ' : '○ 汚れ・ホコリなし'}
                          </div>
                        </div>
                      </div>
                      
                      {/* 機能項目 */}
                      <div>
                        <h6 className="text-xs font-medium text-nexus-text-secondary mb-2">機能項目</h6>
                        <div className="space-y-1 text-xs">
                          <div className={product.inspectionChecklist.functionality?.powerOn ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.functionality?.powerOn ? '✓ 動作不良' : '○ 動作不良なし'}
                          </div>
                          <div className={product.inspectionChecklist.functionality?.allButtonsWork ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.functionality?.allButtonsWork ? '✓ 操作系異常' : '○ 操作系異常なし'}
                          </div>
                          <div className={product.inspectionChecklist.functionality?.screenDisplay ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.functionality?.screenDisplay ? '✓ 表示異常' : '○ 表示異常なし'}
                          </div>
                          <div className={product.inspectionChecklist.functionality?.connectivity ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.functionality?.connectivity ? '✓ 防水性能劣化' : '○ 防水性能劣化なし'}
                          </div>
                        </div>
                      </div>

                      {/* 光学系・その他項目 */}
                      <div>
                        <h6 className="text-xs font-medium text-nexus-text-secondary mb-2">光学系・その他項目</h6>
                        <div className="space-y-1 text-xs">
                          <div className={product.inspectionChecklist.optical?.lensClarity ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.optical?.lensClarity ? '✓ 光学系/ムーブメント異常' : '○ 光学系/ムーブメント異常なし'}
                          </div>
                          <div className={product.inspectionChecklist.optical?.aperture ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.optical?.aperture ? '✓ 経年劣化' : '○ 経年劣化なし'}
                          </div>
                          <div className={product.inspectionChecklist.optical?.focusAccuracy ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.optical?.focusAccuracy ? '✓ 付属品相違' : '○ 付属品相違なし'}
                          </div>
                          <div className={product.inspectionChecklist.optical?.stabilization ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.optical?.stabilization ? '✓ 保証書・真贋問題' : '○ 保証書・真贋問題なし'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 検品メモ */}
                    {product.inspectionChecklist.notes && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <span className="text-xs font-medium text-yellow-800">検品メモ:</span>
                        <p className="text-xs text-yellow-700 mt-1">{product.inspectionChecklist.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 仕入詳細 */}
                {product.supplierDetails && (
                  <div className="mt-2 text-sm text-nexus-text-secondary border-t pt-2">
                    <span className="font-medium">仕入詳細:</span>
                    <p className="mt-1">{product.supplierDetails}</p>
                  </div>
                )}
              </NexusCard>
            ))}
            <NexusCard className="p-4 border-2 border-primary-blue bg-nexus-bg-tertiary">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-nexus-text-primary">合計購入価格:</span>
                <span className="text-xl font-bold text-primary-blue">
                  ¥{getTotalPurchasePrice().toLocaleString()}
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

      {/* 出力情報 */}
      <NexusCard className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-nexus-text-primary mb-4">出力内容</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-800">バーコードラベル</h4>
              <p className="text-sm text-blue-700">商品管理用のバーコードラベルPDFを自動生成します</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-800">納品プラン詳細</h4>
              <p className="text-sm text-blue-700">商品情報、検品チェックリスト等を含む納品プランを作成します</p>
            </div>
          </div>
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