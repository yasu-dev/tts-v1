'use client';

import { useState } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
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
  const [formData, setFormData] = useState(data.basicInfo || {
    sellerName: '',
    deliveryAddress: '',
    contactEmail: '',
    phoneNumber: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate({ basicInfo: updatedData });
  };

  const handleNext = () => {
    if (formData.sellerName && formData.deliveryAddress && formData.contactEmail) {
      onNext();
    } else {
      showToast({
        type: 'warning',
        title: '入力エラー',
        message: '必須項目（セラー名、納品先住所、連絡先メール）を入力してください。',
        duration: 3000
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-nexus-text-primary mb-4">基本情報</h2>
        <p className="text-nexus-text-secondary mb-6">納品プランの基本情報を入力してください</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NexusInput
          label="セラー名"
          value={formData.sellerName}
          onChange={(e) => handleInputChange('sellerName', e.target.value)}
          placeholder="セラー名を入力"
          required
          variant="nexus"
        />

        <NexusInput
          label="連絡先メール"
          type="email"
          value={formData.contactEmail}
          onChange={(e) => handleInputChange('contactEmail', e.target.value)}
          placeholder="メールアドレスを入力"
          required
          variant="nexus"
        />

        <div className="md:col-span-2">
          <NexusTextarea
            label="納品先住所"
            value={formData.deliveryAddress}
            onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
            rows={3}
            placeholder="納品先住所を入力"
            required
            variant="nexus"
          />
        </div>

        <NexusInput
          label="電話番号"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          placeholder="電話番号を入力"
          variant="nexus"
        />

        <div className="md:col-span-2">
          <NexusTextarea
            label="備考"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            placeholder="その他の要望や注意事項があれば入力"
            variant="nexus"
          />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <NexusButton variant="primary" onClick={handleNext}>
          次へ進む
        </NexusButton>
      </div>
    </div>
  );
} 