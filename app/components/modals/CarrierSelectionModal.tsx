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
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('standard');
  const [loading, setLoading] = useState(false);

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
      id: 'yamato',
      name: 'ヤマト運輸',
      active: true,
      defaultRate: 800,
      trackingUrl: 'https://toi.kuronekoyamato.co.jp/cgi-bin/tneko',
      apiKey: '',
      notes: '通常配送・国内専用',
      supportedServices: ['standard', 'cool', 'collect_on_delivery']
    },
    {
      id: 'sagawa',
      name: '佐川急便',  
      active: true,
      defaultRate: 750,
      trackingUrl: 'https://k2k.sagawa-exp.co.jp/p/sagawa/web/okurijoinput.jsp',
      apiKey: '',
      notes: '大型商品対応・国内専用',
      supportedServices: ['standard', 'large_item', 'fragile']
    },
    {
      id: 'yupack',
      name: 'ゆうパック',
      active: true,
      defaultRate: 700,
      trackingUrl: 'https://trackings.post.japanpost.jp/services/srv/search/',
      apiKey: '',
      notes: '離島配送可能・国内専用',
      supportedServices: ['standard', 'cool', 'security']
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

  const selectedCarrier = carriers.find(c => c.key === selectedCarrierId);

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
        className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
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
          
          <div className="grid gap-3">
            {activeCarriers.map((carrier) => (
              <div
                key={carrier.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedCarrierId === carrier.id
                    ? 'border-nexus-primary bg-nexus-primary/5'
                    : 'border-nexus-border hover:border-nexus-primary/50'
                }`}
                onClick={() => setSelectedCarrierId(carrier.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedCarrierId === carrier.id
                        ? 'border-nexus-primary bg-nexus-primary'
                        : 'border-nexus-border'
                    }`}>
                      {selectedCarrierId === carrier.id && (
                        <CheckIcon className="w-3 h-3 text-white m-0.5" />
                      )}
                    </div>
                    <TruckIcon className="w-5 h-5 text-nexus-text-secondary" />
                    <div>
                      <div className="font-medium text-nexus-text-primary">
                        {carrier.name}
                      </div>
                      <div className="text-sm text-nexus-text-secondary">
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
              </div>
            ))}
          </div>
        </div>

        {/* 配送サービス選択 */}
        {selectedCarrier && getServiceOptions(selectedCarrierId).length > 0 && (
          <div>
            <h4 className="text-md font-medium text-nexus-text-primary mb-3">
              配送サービス
            </h4>
            <NexusRadioGroup
              options={getServiceOptions(selectedCarrierId)}
              value={selectedService}
              onChange={setSelectedService}
              name="shipping-service"
            />
          </div>
        )}

        {/* 選択された配送業者の詳細 */}
        {selectedCarrier && (
          <div className="bg-nexus-bg-secondary p-4 rounded-lg border border-nexus-border">
            <div className="flex items-center space-x-2 mb-2">
              <TruckIcon className="w-4 h-4 text-nexus-primary" />
              <span className="font-medium text-nexus-text-primary">
                {selectedCarrier.name} - {getServiceOptions(selectedCarrierId).find(s => s.value === selectedService)?.label || '通常配送'}
              </span>
            </div>
            <div className="text-sm text-nexus-text-secondary space-y-1">
              <div>配送料金: ¥{calculateShippingRate(selectedCarrier).toLocaleString()}</div>
              <div>追跡URL: <span className="text-nexus-primary underline">{selectedCarrier.trackingUrl}</span></div>
              {selectedCarrier.id === 'fedex' && (
                <div className="text-nexus-success">✓ API連携でラベル自動生成されます</div>
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