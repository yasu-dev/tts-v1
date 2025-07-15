'use client';

import { useState, useEffect } from 'react';
import { BaseModal, NexusButton, NexusSelect, NexusTextarea, BusinessStatusIndicator } from './ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { 
  ArrowPathIcon, 
  MapPinIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ProductMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    sku: string;
    category: string;
    status: string;
    location: string;
    price: number;
    condition: string;
    imageUrl?: string;
    entryDate: string;
    assignedStaff?: string;
    lastModified: string;
    qrCode?: string;
    notes?: string;
  } | null;
  onMove: (itemId: string, newLocation: string, reason: string) => void;
}

export default function ProductMoveModal({ 
  isOpen, 
  onClose, 
  item,
  onMove 
}: ProductMoveModalProps) {
  const { showToast } = useToast();
  const [newLocation, setNewLocation] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setNewLocation('');
      setReason('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // バリデーション
      if (!newLocation) {
        showToast({
          type: 'error',
          title: '入力エラー',
          message: '移動先を選択してください'
        });
        return;
      }

      if (newLocation === item.location) {
        showToast({
          type: 'error',
          title: '移動エラー',
          message: '現在の場所と同じ場所は選択できません'
        });
        return;
      }

      if (!reason.trim()) {
        showToast({
          type: 'error',
          title: '入力エラー',
          message: '移動理由を入力してください'
        });
        return;
      }

      // 親コンポーネントに移動を通知
      onMove(item.id, newLocation, reason);

      showToast({
        type: 'success',
        title: '移動完了',
        message: `商品を${newLocation}に移動しました`
      });

      onClose();
    } catch (error) {
      console.error('商品移動エラー:', error);
      showToast({
        type: 'error',
        title: '移動エラー',
        message: '商品の移動に失敗しました'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const locationOptions = [
    { value: 'A区画', label: 'A区画' },
    { value: 'H区画', label: 'H区画' },
    { value: 'V区画', label: 'V区画' },
    { value: 'メンテナンス室', label: 'メンテナンス室' },
    { value: '出荷準備エリア', label: '出荷準備エリア' },
    { value: '検品エリア', label: '検品エリア' },
    { value: '一時保管エリア', label: '一時保管エリア' }
  ].filter(option => option.value !== item.location);

  const reasonOptions = [
    { value: '検品のため', label: '検品のため' },
    { value: '出荷準備のため', label: '出荷準備のため' },
    { value: 'メンテナンスのため', label: 'メンテナンスのため' },
    { value: '在庫整理のため', label: '在庫整理のため' },
    { value: '保管場所変更のため', label: '保管場所変更のため' },
    { value: 'その他', label: 'その他' }
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="商品移動"
      subtitle={`${item.name} (${item.sku})`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 商品情報 */}
        <div className="bg-nexus-bg-secondary rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-nexus-text-primary">移動する商品</h3>
            <BusinessStatusIndicator status={item.status as any} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-nexus-text-secondary">商品名:</span>
              <p className="font-medium text-nexus-text-primary">{item.name}</p>
            </div>
            <div>
              <span className="text-nexus-text-secondary">SKU:</span>
              <p className="font-medium text-nexus-text-primary">{item.sku}</p>
            </div>
            <div>
              <span className="text-nexus-text-secondary">カテゴリ:</span>
              <p className="font-medium text-nexus-text-primary">{item.category}</p>
            </div>
            <div>
              <span className="text-nexus-text-secondary">状態:</span>
              <p className="font-medium text-nexus-text-primary">{item.condition}</p>
            </div>
          </div>
        </div>

        {/* 移動先選択 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-nexus-text-primary flex items-center gap-2">
            <MapPinIcon className="w-5 h-5" />
            移動先選択
          </h3>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="font-medium">現在の保管場所</span>
            </div>
            <p className="text-yellow-700 mt-1">{item.location}</p>
          </div>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-nexus-border"></div>
            <ArrowRightIcon className="w-6 h-6 text-nexus-text-secondary" />
            <div className="flex-1 h-px bg-nexus-border"></div>
          </div>

          <NexusSelect
            label="新しい保管場所"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            options={[{ value: '', label: '移動先を選択してください' }, ...locationOptions]}
            required
          />
        </div>

        {/* 移動理由 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-nexus-text-primary">
            移動理由
          </h3>
          
          <NexusSelect
            label="移動理由（選択）"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={[{ value: '', label: '理由を選択してください' }, ...reasonOptions]}
          />
          
          {reason === 'その他' && (
            <NexusTextarea
              label="詳細な理由"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="移動の詳細な理由を入力してください"
              required
            />
          )}
        </div>

        {/* 注意事項 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">移動時の注意事項</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 移動前に商品の状態を確認してください</li>
            <li>• 移動後は新しい場所で商品を確認してください</li>
            <li>• 移動履歴は自動的に記録されます</li>
          </ul>
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-3 pt-6 border-t border-nexus-border">
          <NexusButton
            type="button"
            onClick={onClose}
            variant="default"
            disabled={isSubmitting}
          >
            キャンセル
          </NexusButton>
          
          <NexusButton
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            icon={isSubmitting ? undefined : <ArrowPathIcon className="w-4 h-4" />}
          >
            {isSubmitting ? '移動中...' : '移動実行'}
          </NexusButton>
        </div>
      </form>
    </BaseModal>
  );
} 