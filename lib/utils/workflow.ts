// 出荷ワークフローのステップ定義
export const SHIPPING_WORKFLOW_STEPS = [
  {
    id: 'storage',
    label: '保管中',
    icon: 'inspection',  // 既存のアイコンを流用
    order: 1
  },
  {
    id: 'packed',
    label: '梱包完了',
    icon: 'shipping',
    order: 2
  },
  {
    id: 'shipped',
    label: '出荷済み',
    icon: 'shipping',
    order: 3
  }
];

export type ShippingStatus = 'storage' | 'packed' | 'shipped';

/**
 * 商品のステータスに基づいてワークフローのプログレス情報を生成
 */
export function getWorkflowProgress(currentStatus: ShippingStatus) {
  const currentStep = SHIPPING_WORKFLOW_STEPS.find(step => step.id === currentStatus);
  const currentOrder = currentStep?.order || 1;

  return SHIPPING_WORKFLOW_STEPS.map(step => ({
    id: step.id,
    label: step.label,
    icon: step.icon,
    status: step.order < currentOrder 
      ? 'completed' as const
      : step.order === currentOrder 
      ? 'active' as const
      : 'pending' as const
  }));
}

/**
 * ステータスラベルのマッピング
 */
export const STATUS_LABELS: Record<ShippingStatus, string> = {
  'storage': '保管中',
  'packed': '梱包済み',
  'shipped': '出荷済み'
};

/**
 * 次のアクションを取得
 */
export function getNextAction(currentStatus: ShippingStatus): string {
  switch (currentStatus) {
    case 'storage':
      return '商品をピッキングして梱包してください';
    case 'packed':
      return '出荷処理を行ってください';
    case 'shipped':
      return '作業完了';
    default:
      return '次の作業を確認してください';
  }
}