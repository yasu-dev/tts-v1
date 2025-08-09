'use client';

import { useState, useEffect } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import NexusSelect from '@/app/components/ui/NexusSelect';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface BasicInfoStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  isFirstStep: boolean;
}

export default function BasicInfoStep({ 
  data, 
  onUpdate, 
  onNext, 
  isFirstStep 
}: BasicInfoStepProps) {
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [formData, setFormData] = useState(data.basicInfo || {
    warehouseId: '',
    warehouseName: '',
    deliveryAddress: '',
    phoneNumber: '',
    notes: ''
  });

  // ログイン中のユーザー情報と倉庫情報を取得
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // ユーザー情報取得
        const userResponse = await fetch('/api/auth/session');
        const userResult = await userResponse.json();
        
        if (userResult.success && userResult.user) {
          setUser(userResult.user);
        }

        // 倉庫情報取得
        const warehouseResponse = await fetch('/api/delivery-warehouses');
        const warehouseResult = await warehouseResponse.json();
        
        if (Array.isArray(warehouseResult)) {
          setWarehouses(warehouseResult);
        }

        // フォームの初期化
        const initialData = {
          warehouseId: data.basicInfo?.warehouseId || '',
          warehouseName: data.basicInfo?.warehouseName || '',
          deliveryAddress: data.basicInfo?.deliveryAddress || '',

          phoneNumber: data.basicInfo?.phoneNumber || userResult.user?.phoneNumber || '',
          notes: data.basicInfo?.notes || ''
        };
        setFormData(initialData);
        onUpdate({ basicInfo: initialData });
        
      } catch (error) {
        console.error('[ERROR] 初期データの取得に失敗しました:', error);
        showToast({
          type: 'error',
          title: 'エラー',
          message: '初期データの取得に失敗しました'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData().catch(error => {
      console.error('[ERROR] fetchInitialData Promise rejection:', error);
    });
  }, []);

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate({ basicInfo: updatedData });
  };

  const handleWarehouseChange = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    if (warehouse) {
      setSelectedWarehouse(warehouse);
      const updatedData = {
        ...formData,
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        deliveryAddress: warehouse.address || ''
      };
      setFormData(updatedData);
      onUpdate({ basicInfo: updatedData });
    }
  };

  const handleNext = () => {
    if (formData.deliveryAddress.trim()) {
      onNext();
    } else {
      showToast({
        type: 'warning',
        title: '入力エラー',
        message: '納品先住所を入力してください。',
        duration: 3000
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
        <span className="ml-2 text-nexus-text-secondary">ユーザー情報を読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-nexus-text-primary mb-4">基本情報</h2>
        <p className="text-nexus-text-secondary mb-6">納品プランの基本情報を入力してください</p>
      </div>

      {/* セラー情報表示 */}
      {user && (
        <div className="bg-nexus-bg-tertiary p-4 rounded-lg border border-nexus-border">
          <h3 className="text-lg font-medium text-nexus-text-primary mb-3">セラー情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-nexus-text-secondary">セラー名:</span>
              <span className="ml-2 text-nexus-text-primary">{user.fullName || user.username}</span>
            </div>
            <div>
              <span className="font-medium text-nexus-text-secondary">連絡先メール:</span>
              <span className="ml-2 text-nexus-text-primary">{user.email}</span>
            </div>
            {user.phoneNumber && (
              <div>
                <span className="font-medium text-nexus-text-secondary">電話番号:</span>
                <span className="ml-2 text-nexus-text-primary">{user.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <NexusSelect
          label="配送先倉庫"
          value={formData.warehouseId}
          onChange={(e) => handleWarehouseChange(e.target.value)}
          options={[
            { value: '', label: '配送先倉庫を選択してください' },
            ...warehouses.map(warehouse => ({
              value: warehouse.id,
              label: warehouse.name
            }))
          ]}
          required
          variant="nexus"
        />

        {selectedWarehouse && (
          <div className="bg-nexus-bg-tertiary p-4 rounded-lg border border-nexus-border">
            <h4 className="text-sm font-medium text-nexus-text-primary mb-2">選択された倉庫情報</h4>
            <div className="space-y-1 text-sm text-nexus-text-secondary">
              <div><span className="font-medium">倉庫名:</span> {selectedWarehouse.name}</div>
              <div><span className="font-medium">住所:</span> {selectedWarehouse.address}</div>
              {selectedWarehouse.phone && (
                <div><span className="font-medium">電話:</span> {selectedWarehouse.phone}</div>
              )}
              {selectedWarehouse.email && (
                <div><span className="font-medium">メール:</span> {selectedWarehouse.email}</div>
              )}
            </div>
          </div>
        )}

        <NexusTextarea
          label="納品先住所"
          value={formData.deliveryAddress}
          onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
          rows={3}
          placeholder="倉庫を選択すると自動入力されます"
          required
          variant="nexus"
          disabled={!selectedWarehouse}
        />



        <NexusInput
          label="電話番号（任意）"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          placeholder="電話番号（任意）"
          variant="nexus"
        />

        <NexusTextarea
          label="備考"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          placeholder="その他の要望や注意事項があれば入力"
          variant="nexus"
        />
      </div>

      <div className="flex justify-end pt-6">
        <NexusButton variant="primary" onClick={handleNext}>
          次へ進む
        </NexusButton>
      </div>
    </div>
  );
} 