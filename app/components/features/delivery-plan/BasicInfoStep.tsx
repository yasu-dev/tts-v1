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
}: BasicInfoStepProps) {
  const [formData, setFormData] = useState(data.basicInfo || {
    sellerName: '',
    deliveryAddress: '',
    contactEmail: '',
    phoneNumber: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.sellerName.trim()) {
      newErrors.sellerName = '納品者名は必須です';
    }

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = '配送先住所は必須です';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'メールアドレスは必須です';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'メールアドレスの形式が正しくありません';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = '電話番号は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate({ basicInfo: formData });
      onNext();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: typeof formData) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">基本情報入力</h2>
        <p className="text-gray-600 mb-6">
          納品に必要な基本情報を入力してください。
        </p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            納品者名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.sellerName}
            onChange={(e) => handleInputChange('sellerName', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md 
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.sellerName ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="例: 田中太郎"
          />
          {errors.sellerName && (
            <p className="text-red-500 text-sm mt-1">{errors.sellerName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            配送先住所 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.deliveryAddress}
            onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
            rows={3}
            className={`
              w-full px-3 py-2 border rounded-md 
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.deliveryAddress ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="例: 〒100-0001 東京都千代田区千代田1-1-1"
          />
          {errors.deliveryAddress && (
            <p className="text-red-500 text-sm mt-1">{errors.deliveryAddress}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-md 
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="例: example@email.com"
            />
            {errors.contactEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              電話番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-md 
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="例: 090-1234-5678"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            備考
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="
              w-full px-3 py-2 border border-gray-300 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            placeholder="特記事項があれば入力してください"
          />
        </div>
      </form>

      <div className="flex justify-end pt-6">
        <NexusButton onClick={handleNext} className="px-6">
          次へ
        </NexusButton>
      </div>
    </div>
  );
} 