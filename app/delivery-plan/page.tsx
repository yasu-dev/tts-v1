import { Metadata } from 'next';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import DeliveryPlanWizard from '@/app/components/features/delivery-plan/DeliveryPlanWizard';

export const metadata: Metadata = {
  title: '納品プラン作成 - THE WORLD DOOR',
  description: '新規納品プランの作成',
};

export default function DeliveryPlanPage() {
  return (
    <DashboardLayout userType="seller">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">納品プラン作成</h1>
          <p className="text-gray-600">商品の納品プランを作成し、バーコードラベルを発行します</p>
        </div>
        <DeliveryPlanWizard />
      </div>
    </DashboardLayout>
  );
} 