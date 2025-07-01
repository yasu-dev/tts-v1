'use client';

import { useState } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';

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
      alert('必須項目を入力してください');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">基本情報</h2>
        <p className="text-gray-600 mb-6">納品プランの基本情報を入力してください</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            セラー名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.sellerName}
            onChange={(e) => handleInputChange('sellerName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="セラー名を入力"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            連絡先メール <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="メールアドレスを入力"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            納品先住所 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.deliveryAddress}
            onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="納品先住所を入力"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            電話番号
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="電話番号を入力"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            備考
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="その他の要望や注意事項があれば入力"
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