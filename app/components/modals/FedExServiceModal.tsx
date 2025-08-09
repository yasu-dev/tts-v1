'use client';

import { useState } from 'react';
import { BaseModal, NexusButton } from '../ui';
import { useToast } from '../features/notifications/ToastProvider';
import { 
  TruckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface FedExService {
  id: string;
  name: string;
  description: string;
  deliveryTime: string;
  estimatedCost: string;
  features: string[];
  icon: React.ReactNode;
}

interface FedExServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceSelect: (serviceId: string) => void;
  orderDetails?: {
    orderId: string;
    product: string;
    weight?: string;
    destination?: string;
  };
}

const FEDEX_SERVICES: FedExService[] = [
  {
    id: 'ground',
    name: 'FedEx Ground',
    description: '陸送による経済的な配送サービス',
    deliveryTime: '1-5営業日',
    estimatedCost: '¥1,200-1,800',
    features: ['最も経済的', '陸送のため環境負荷軽減', '追跡サービス付き'],
    icon: <TruckIcon className="w-8 h-8" />
  },
  {
    id: '2day',
    name: 'FedEx 2Day',
    description: '2営業日確実配送サービス',
    deliveryTime: '2営業日',
    estimatedCost: '¥2,400-3,200',
    features: ['2営業日保証', '土曜日配送可能', 'マネーバック保証'],
    icon: <ClockIcon className="w-8 h-8" />
  },
  {
    id: 'express_saver',
    name: 'FedEx Express Saver',
    description: '翌日午後配達の速達サービス',
    deliveryTime: '翌営業日 午後3時まで',
    estimatedCost: '¥3,600-4,800',
    features: ['翌日配送', '午後3時まで配達', '優先取扱い'],
    icon: <ClockIcon className="w-8 h-8" />
  },
  {
    id: 'standard_overnight',
    name: 'FedEx Standard Overnight',
    description: '翌日午後3時まで確実配達',
    deliveryTime: '翌営業日 午後3時まで',
    estimatedCost: '¥4,800-6,400',
    features: ['翌日午後3時保証', '土曜日配送可能', 'プレミアムサービス'],
    icon: <ClockIcon className="w-8 h-8" />
  },
  {
    id: 'priority_overnight',
    name: 'FedEx Priority Overnight',
    description: '翌日午前10:30まで特急配達',
    deliveryTime: '翌営業日 午前10:30まで',
    estimatedCost: '¥6,400-8,000',
    features: ['翌日午前配達', '最高優先度', '土曜日配送可能'],
    icon: <ClockIcon className="w-8 h-8" />
  },
  {
    id: 'first_overnight',
    name: 'FedEx First Overnight',
    description: '翌日午前9時まで最速配達',
    deliveryTime: '翌営業日 午前9時まで',
    estimatedCost: '¥8,000-10,000',
    features: ['最速配送', '翌日午前9時保証', '最高優先サービス'],
    icon: <ClockIcon className="w-8 h-8" />
  }
];

export default function FedExServiceModal({
  isOpen,
  onClose,
  onServiceSelect,
  orderDetails
}: FedExServiceModalProps) {
  const { showToast } = useToast();
  const [selectedService, setSelectedService] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState(false);

  const selectedServiceData = FEDEX_SERVICES.find(s => s.id === selectedService);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleContinue = () => {
    if (!selectedService) {
      showToast({
        title: 'サービス未選択',
        message: 'FedExサービスを選択してください',
        type: 'warning'
      });
      return;
    }
    setIsConfirming(true);
  };

  const handleConfirm = () => {
    onServiceSelect(selectedService);
    showToast({
      title: 'FedXサービス選択完了',
      message: `${selectedServiceData?.name}を選択しました`,
      type: 'success'
    });
    onClose();
    // Reset states
    setSelectedService('');
    setIsConfirming(false);
  };

  const handleBack = () => {
    if (isConfirming) {
      setIsConfirming(false);
    } else {
      onClose();
      setSelectedService('');
      setIsConfirming(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleBack}
      title={isConfirming ? 'サービス選択の確認' : 'FedX配送サービス選択'}
      size="lg"
    >
      <div className="space-y-6">
        {/* 注文情報表示 */}
        {orderDetails && (
          <div className="bg-nexus-bg-secondary rounded-lg p-4">
            <h3 className="font-semibold text-nexus-text-primary mb-2 flex items-center gap-2">
              <InformationCircleIcon className="w-5 h-5" />
              注文情報
            </h3>
            <div className="text-sm text-nexus-text-secondary space-y-1">
              <p><span className="font-medium">注文ID:</span> {orderDetails.orderId}</p>
              <p><span className="font-medium">商品:</span> {orderDetails.product}</p>
              {orderDetails.weight && <p><span className="font-medium">重量:</span> {orderDetails.weight}</p>}
              {orderDetails.destination && <p><span className="font-medium">配送先:</span> {orderDetails.destination}</p>}
            </div>
          </div>
        )}

        {!isConfirming ? (
          // サービス選択画面
          <>
            <div className="text-center">
              <p className="text-nexus-text-secondary">
                配送の緊急度と予算に応じて最適なサービスをお選びください
              </p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {FEDEX_SERVICES.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className={`
                    relative border rounded-lg p-4 cursor-pointer transition-all
                    ${selectedService === service.id 
                      ? 'border-nexus-blue bg-nexus-blue/5' 
                      : 'border-nexus-border hover:border-nexus-blue/50 hover:bg-nexus-bg-secondary'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      p-2 rounded-lg
                      ${selectedService === service.id ? 'text-nexus-blue' : 'text-nexus-text-secondary'}
                    `}>
                      {service.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-nexus-text-primary">{service.name}</h3>
                        <span className="font-bold text-lg text-nexus-blue">{service.estimatedCost}</span>
                      </div>
                      
                      <p className="text-nexus-text-secondary mb-2">{service.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <span className="flex items-center gap-1 text-green-600">
                          <ClockIcon className="w-4 h-4" />
                          {service.deliveryTime}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {service.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-nexus-text-secondary">
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {selectedService === service.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircleIcon className="w-6 h-6 text-nexus-blue" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">ご注意</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 料金は概算です。実際の料金は重量・サイズ・配送先により変動します</li>
                    <li>• 配送時間は営業日ベースです（土日祝日除く）</li>
                    <li>• 悪天候等により遅延する場合があります</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-nexus-border">
              <NexusButton
                onClick={handleBack}
                variant="secondary"
              >
                キャンセル
              </NexusButton>
              <NexusButton
                onClick={handleContinue}
                variant="primary"
                disabled={!selectedService}
                icon={<TruckIcon className="w-5 h-5" />}
              >
                選択したサービスで続行
              </NexusButton>
            </div>
          </>
        ) : (
          // 確認画面
          <>
            <div className="text-center">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-nexus-text-primary mb-2">サービス選択の確認</h2>
              <p className="text-nexus-text-secondary">
                以下の内容でFedXラベルを生成します
              </p>
            </div>

            {selectedServiceData && (
              <div className="bg-nexus-bg-secondary rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-nexus-blue">
                    {selectedServiceData.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-nexus-text-primary">
                      {selectedServiceData.name}
                    </h3>
                    <p className="text-nexus-text-secondary">{selectedServiceData.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-nexus-text-primary">配送時間:</span>
                    <p className="text-green-600">{selectedServiceData.deliveryTime}</p>
                  </div>
                  <div>
                    <span className="font-medium text-nexus-text-primary">概算料金:</span>
                    <p className="text-nexus-blue font-bold text-lg">{selectedServiceData.estimatedCost}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="font-medium text-nexus-text-primary">サービス特徴:</span>
                  <div className="mt-2 space-y-1">
                    {selectedServiceData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-nexus-text-secondary">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">最終確認</p>
                  <p>「ラベル生成を開始」をクリックすると、FedXラベルの生成処理が開始されます。生成後の変更はできませんのでご注意ください。</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-nexus-border">
              <NexusButton
                onClick={handleBack}
                variant="secondary"
              >
                戻る
              </NexusButton>
              <NexusButton
                onClick={handleConfirm}
                variant="primary"
                icon={<CurrencyDollarIcon className="w-5 h-5" />}
              >
                ラベル生成を開始
              </NexusButton>
            </div>
          </>
        )}
      </div>
    </BaseModal>
  );
}

