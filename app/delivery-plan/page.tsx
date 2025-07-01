import { Metadata } from 'next';
import DeliveryPlanPageClient from './DeliveryPlanPageClient';

export const metadata: Metadata = {
  title: '納品プラン作成 - THE WORLD DOOR',
  description: '新規納品プランの作成',
};

export default function DeliveryPlanPage() {
  return <DeliveryPlanPageClient />;
} 