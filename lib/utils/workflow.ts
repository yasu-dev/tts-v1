// 出荷ワークフローのステップ定義
export const SHIPPING_WORKFLOW_STEPS = [
  {
    id: 'storage',
    label: '保管中',
    icon: 'inspection',  // 既存のアイコンを流用
    order: 1
  },
  {
    id: 'workstation',
    label: '梱包作業中',
    icon: 'shipping',
    order: 2
  },
  {
    id: 'packed',
    label: '梱包完了',
    icon: 'shipping',
    order: 3
  },
  {
    id: 'ready_for_pickup',
    label: '出荷済み',
    icon: 'shipping',
    order: 4
  }
];

export type ShippingStatus = 'storage' | 'picked' | 'workstation' | 'packed' | 'ready_for_pickup';

/**
 * 商品のステータスに基づいてワークフローのプログレス情報を生成
 */
export function getWorkflowProgress(currentStatus: ShippingStatus) {
  // picked ステータスは workstation ステップにマッピング
  const mappedStatus = currentStatus === 'picked' ? 'workstation' : currentStatus;
  const currentStep = SHIPPING_WORKFLOW_STEPS.find(step => step.id === mappedStatus);
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
  'picked': '梱包作業中',
  'workstation': '梱包作業中',
  'packed': '梱包済み',
  'ready_for_pickup': '出荷済み'
};

/**
 * 次のアクションを取得
 */
export function getNextAction(currentStatus: ShippingStatus): string {
  switch (currentStatus) {
    case 'storage':
      return '商品をピッキングして梱包してください';
    case 'picked':
    case 'workstation':
      return '梱包作業を完了してください';
    case 'packed':
      return '出荷処理を行ってください';
    case 'ready_for_pickup':
      return '配送業者による集荷待ち';
    default:
      return '次の作業を確認してください';
  }
}