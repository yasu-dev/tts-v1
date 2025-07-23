// 出荷ワークフローのステップ定義
export const SHIPPING_WORKFLOW_STEPS = [
  {
    id: 'pending_inspection',
    label: '検品待ち',
    icon: '📋',
    order: 1
  },
  {
    id: 'inspected',
    label: '検品完了',
    icon: '✅',
    order: 2
  },
  {
    id: 'packed',
    label: '梱包完了',
    icon: '📦',
    order: 3
  },
  {
    id: 'shipped',
    label: '出荷済み',
    icon: '🚚',
    order: 4
  },
  {
    id: 'delivered',
    label: '配送完了',
    icon: '🎯',
    order: 5
  }
];

export type ShippingStatus = 'pending_inspection' | 'inspected' | 'packed' | 'shipped' | 'delivered';

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
  'pending_inspection': '検品待ち',
  'inspected': '検品済み',
  'packed': '梱包済み',
  'shipped': '発送済み',
  'delivered': '配送完了'
};

/**
 * 次のアクションを取得
 */
export function getNextAction(currentStatus: ShippingStatus): string {
  switch (currentStatus) {
    case 'pending_inspection':
      return '商品を検品してください';
    case 'inspected':
      return '商品を梱包してください';
    case 'packed':
      return '出荷処理を行ってください';
    case 'shipped':
      return '配送完了をお待ちください';
    case 'delivered':
      return '作業完了';
    default:
      return '次の作業を確認してください';
  }
}