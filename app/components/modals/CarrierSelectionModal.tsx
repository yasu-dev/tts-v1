import React, { useState, useEffect, useRef } from 'react';
import { BaseModal } from '@/app/components/ui';
import { NexusButton, NexusRadioGroup } from '@/app/components/ui';
import { TruckIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Carrier {
  id: string;
  name: string;
  active: boolean;
  defaultRate: number;
  trackingUrl: string;
  apiKey: string;
  notes: string;
  logo?: string;
  supportedServices?: string[];
}

interface CarrierSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCarrierSelect: (carrier: Carrier, service: string) => void;
  item?: any; // 配送対象の商品情報
}

export default function CarrierSelectionModal({
  isOpen,
  onClose,
  onCarrierSelect,
  item
}: CarrierSelectionModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedCarrierRef = useRef<HTMLDivElement>(null);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('standard');
  const [loading, setLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  // 利用可能な配送業者一覧
  const [carriers] = useState<Carrier[]>([
    {
      id: 'fedex',
      name: 'FedEx',
      active: true,
      defaultRate: 1200,
      trackingUrl: 'https://www.fedex.com/apps/fedextrack/',
      apiKey: 'configured', // 実際のAPIキーは環境変数から取得
      notes: 'API連携対応・国際配送対応',
      supportedServices: ['standard', 'express', 'priority']
    },
    {
      id: 'dhl',
      name: 'DHL',
      active: true,
      defaultRate: 1800,
      trackingUrl: 'https://www.dhl.com/jp-ja/home/tracking.html',
      apiKey: '',
      notes: '国際宅配便・伝票作成Webサイトにジャンプ',
      supportedServices: ['standard', 'express']
    },
    {
      id: 'ems',
      name: 'EMS',
      active: true,
      defaultRate: 1500,
      trackingUrl: 'https://trackings.post.japanpost.jp/services/srv/search/',
      apiKey: '',
      notes: '国際スピード郵便・伝票作成Webサイトにジャンプ',
      supportedServices: ['standard', 'express']
    },
    {
      id: 'others',
      name: 'その他（eBay SpeedPAK、クロネコヤマトなど）',
      active: true,
      defaultRate: 1000,
      trackingUrl: '',
      apiKey: '',
      notes: 'その他配送業者・各社伝票作成サイトを利用',
      supportedServices: ['standard']
    }
  ]);

  // アクティブな配送業者のみフィルタ
  const activeCarriers = carriers.filter(carrier => carrier.active);

  // スクロール位置のリセット
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // モーダルを開いた時の初期化
  useEffect(() => {
    if (isOpen) {
      setSelectedCarrierId('');
      setSelectedService('standard');
      setLoading(false);
    }
  }, [isOpen]);

  // 配送サービスのオプション取得
  const getServiceOptions = (carrierId: string) => {
    const carrier = carriers.find(c => c.id === carrierId);
    if (!carrier?.supportedServices) return [];

    const serviceNames: Record<string, string> = {
      standard: '通常配送',
      express: '速達配送',
      priority: '優先配送',
      cool: 'クール便',
      collect_on_delivery: '代金引換',
      large_item: '大型商品配送',
      fragile: '割れ物注意',
      security: 'セキュリティ配送'
    };

    return carrier.supportedServices.map(service => ({
      value: service,
      label: serviceNames[service] || service
    }));
  };

  const handleCarrierSelect = async () => {
    if (!selectedCarrierId) return;

    const selectedCarrier = carriers.find(c => c.id === selectedCarrierId);
    if (!selectedCarrier) return;

    setLoading(true);
    
    try {
      // 配送業者とサービスを返す
      onCarrierSelect(selectedCarrier, selectedService);
    } catch (error) {
      console.error('配送業者選択エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 配送業者の料金計算（商品価値に基づく）
  const calculateShippingRate = (carrier: Carrier) => {
    if (!item?.value) return carrier.defaultRate;
    
    // 商品価値に基づく配送料金調整
    const valueMultiplier = item.value > 50000 ? 1.5 : 1.0;
    return Math.ceil(carrier.defaultRate * valueMultiplier);
  };

  const selectedCarrier = carriers.find(c => c.id === selectedCarrierId);

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="配送業者選択"
      size="lg"
    >
      <div 
        ref={scrollContainerRef}
        className="space-y-6 max-h-[70vh] overflow-y-auto px-4"
      >
        {/* 商品情報 */}
        {item && (
          <div className="bg-nexus-bg-tertiary p-4 rounded-lg border border-nexus-border">
            <h4 className="text-sm font-medium text-nexus-text-primary mb-2">配送対象商品</h4>
            <div className="space-y-1 text-sm text-nexus-text-secondary">
              <div><span className="font-medium">商品名:</span> {item.productName}</div>
              <div><span className="font-medium">注文番号:</span> {item.orderNumber}</div>
              <div><span className="font-medium">配送先:</span> {item.shippingAddress}</div>
              {item.value && (
                <div><span className="font-medium">商品価値:</span> ¥{item.value.toLocaleString()}</div>
              )}
            </div>
          </div>
        )}

        {/* 配送業者選択 */}
        <div>
          <h3 className="text-lg font-semibold text-nexus-text-primary mb-4">
            配送業者を選択してください
          </h3>
          
          <div className="grid gap-3 p-4">
            {activeCarriers.map((carrier) => (
              <label
                key={carrier.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 transform ${
                  selectedCarrierId === carrier.id
                    ? 'border-nexus-primary bg-nexus-primary/10 shadow-lg shadow-nexus-primary/30 ring-2 ring-nexus-primary/30 scale-105'
                    : isSelecting && selectedCarrierId === carrier.id
                    ? 'border-nexus-primary bg-nexus-primary/5 scale-102'
                    : 'border-nexus-border hover:border-nexus-primary/50 hover:shadow-md hover:scale-101'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* 実際のラジオボタン - テキストの1行目と完全に中央揃え */}
                    <input
                      type="radio"
                      name="carrier-selection"
                      value={carrier.id}
                      checked={selectedCarrierId === carrier.id}
                      onChange={() => {
                        setIsSelecting(true);
                        setSelectedCarrierId(carrier.id);
                        
                        // 選択時のフィードバック効果
                        setTimeout(() => {
                          setIsSelecting(false);
                          // 選択された詳細情報にスクロール
                          setTimeout(() => {
                            if (selectedCarrierRef.current) {
                              selectedCarrierRef.current.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest'
                              });
                            }
                          }, 100);
                        }, 200);
                      }}
                      className="w-5 h-5 text-nexus-primary border-2 border-gray-300 focus:ring-2 focus:ring-nexus-primary focus:ring-opacity-50 checked:border-nexus-primary checked:bg-nexus-primary flex-shrink-0"
                    />
                    <TruckIcon className="w-5 h-5 text-nexus-text-secondary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-nexus-text-primary leading-5">
                        {carrier.name}
                      </div>
                      <div className="text-sm text-nexus-text-secondary leading-4 mt-1">
                        {carrier.notes}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-nexus-text-primary">
                      ¥{calculateShippingRate(carrier).toLocaleString()}
                    </div>
                    <div className="text-xs text-nexus-text-secondary">
                      {carrier.id === 'fedex' ? 'API連携' : '手動生成'}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>


        {/* 選択された配送業者の詳細 - 上部に移動して目立たせる */}
        {selectedCarrier && (
          <div 
            ref={selectedCarrierRef}
            className="bg-gradient-to-r from-nexus-primary/10 to-nexus-primary/5 p-4 rounded-lg border-2 border-nexus-primary/30 shadow-md animate-in slide-in-from-top duration-300"
          >
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-nexus-primary flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-nexus-text-primary text-lg">
                選択中: {selectedCarrier.name}
              </span>
              {getServiceOptions(selectedCarrierId).find(s => s.value === selectedService)?.label && (
                <span className="text-sm text-nexus-text-secondary">
                  ({getServiceOptions(selectedCarrierId).find(s => s.value === selectedService)?.label})
                </span>
              )}
            </div>
            <div className="text-sm text-nexus-text-secondary space-y-2">
              <div className="flex items-center justify-between">
                <span>配送料金:</span>
                <span className="font-medium text-nexus-text-primary">¥{calculateShippingRate(selectedCarrier).toLocaleString()}</span>
              </div>
              <div className="text-xs">
                追跡URL: <span className="text-nexus-primary underline">{selectedCarrier.trackingUrl}</span>
              </div>
              {selectedCarrier.id === 'fedex' && (
                <div className="flex items-center text-nexus-success font-medium">
                  <CheckIcon className="w-4 h-4 mr-1" />
                  API連携でラベル自動生成されます
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* フッターボタン */}
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-nexus-border">
        <NexusButton
          onClick={onClose}
          variant="default"
          disabled={loading}
        >
          キャンセル
        </NexusButton>
        <NexusButton
          onClick={handleCarrierSelect}
          variant="primary"
          disabled={!selectedCarrierId || loading}
        >
          {loading ? '生成中...' : 'ラベル生成'}
        </NexusButton>
      </div>
    </BaseModal>
  );
} 