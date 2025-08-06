'use client';

import { useState, useEffect } from 'react';
import { BaseModal, NexusButton, NexusInput, NexusSelect, NexusTextarea, BusinessStatusIndicator } from './ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { 
  PencilIcon, 
  TagIcon,
  MapPinIcon,
  CurrencyYenIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ProductEditModalProps {
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
  onSave: (updatedItem: any) => void;
}

export default function ProductEditModal({ 
  isOpen, 
  onClose, 
  item,
  onSave 
}: ProductEditModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    status: '',
    location: '',
    price: 0,
    condition: '',
    notes: '',
    assignedStaff: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        status: item.status,
        location: item.location,
        price: item.price,
        condition: item.condition,
        notes: item.notes || '',
        assignedStaff: item.assignedStaff || ''
      });
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // バリデーション
      if (!formData.name.trim()) {
        showToast({
          type: 'error',
          title: '入力エラー',
          message: '商品名を入力してください'
        });
        return;
      }

      if (formData.price < 0) {
        showToast({
          type: 'error',
          title: '入力エラー',
          message: '価格は0以上を入力してください'
        });
        return;
      }

      // 更新されたアイテムデータ
      const updatedItem = {
        ...item,
        ...formData,
        lastModified: new Date().toISOString()
      };

      // 親コンポーネントに保存を通知
      onSave(updatedItem);

      showToast({
        type: 'success',
        title: '保存完了',
        message: '商品情報を更新しました'
      });

      onClose();
    } catch (error) {
      console.error('商品更新エラー:', error);
      showToast({
        type: 'error',
        title: '保存エラー',
        message: '商品情報の更新に失敗しました'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'inbound', label: '入荷待ち' },
    { value: 'inspection', label: '検品中' },
    { value: 'storage', label: '保管中' },
    { value: 'listing', label: '出品中' },
    { value: 'sold', label: '売約済み' },
    { value: 'maintenance', label: 'メンテナンス' }
  ];

  const categoryOptions = [
    { value: 'カメラ本体', label: 'カメラ本体' },
    { value: 'レンズ', label: 'レンズ' },
    { value: '腕時計', label: '腕時計' },
    { value: 'アクセサリ', label: 'アクセサリ' }
  ];

  const conditionOptions = [
    { value: '新品', label: '新品' },
    { value: '美品', label: '美品' },
    { value: '良品', label: '良品' },
    { value: '可', label: '可' },
    { value: '要修理', label: '要修理' }
  ];

  const locationOptions = [
    { value: 'A区画', label: 'A区画' },
    { value: 'H区画', label: 'H区画' },
    { value: 'V区画', label: 'V区画' },
    { value: 'メンテナンス室', label: 'メンテナンス室' }
  ];

  const staffOptions = [
    { value: '山本 達也', label: '山本 達也' },
    { value: '田中 太郎', label: '田中 太郎' },
    { value: '佐藤 花子', label: '佐藤 花子' }
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="商品情報編集"
      subtitle={`${item.name} (${item.sku})`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-nexus-text-primary flex items-center gap-2">
            <TagIcon className="w-5 h-5" />
            基本情報
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NexusInput
              label="商品名"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            
            <NexusSelect
              label="カテゴリ"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              options={categoryOptions}
              required
            />
            
            <NexusSelect
              label="状態"
              value={formData.condition}
              onChange={(e) => setFormData({...formData, condition: e.target.value})}
              options={conditionOptions}
              required
            />
            
            <NexusInput
              label="価格"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              min="0"
              step="1"
              required
            />
          </div>
        </div>

        {/* ステータス・保管情報 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-nexus-text-primary flex items-center gap-2">
            <MapPinIcon className="w-5 h-5" />
            ステータス・保管情報
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                現在のステータス
              </label>
              <div className="mb-2">
                <BusinessStatusIndicator status={formData.status as any} />
              </div>
              <NexusSelect
                label="新しいステータス"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                options={statusOptions}
                required
              />
            </div>
            
            <NexusSelect
              label="保管場所"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              options={locationOptions}
              required
            />
            
            <NexusSelect
              label="担当者"
              value={formData.assignedStaff}
              onChange={(e) => setFormData({...formData, assignedStaff: e.target.value})}
              options={staffOptions}
            />
          </div>
        </div>

        {/* 備考 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-nexus-text-primary">
            備考
          </h3>
          
          <NexusTextarea
            label="メモ・備考"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={4}
            placeholder="商品に関する追加情報や注意事項を入力してください"
          />
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
            icon={isSubmitting ? undefined : <CheckCircleIcon className="w-4 h-4" />}
          >
            {isSubmitting ? '保存中...' : '保存'}
          </NexusButton>
        </div>
      </form>
    </BaseModal>
  );
} 