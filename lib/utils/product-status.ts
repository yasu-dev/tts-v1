import { ProductMetadata } from '@/types/api';

// 商品のメタデータを解析して検品・撮影状況を判定するユーティリティ

export function parseProductMetadata(metadataJson?: string | any): ProductMetadata {
  if (!metadataJson) return {};
  
  // すでにオブジェクトの場合はそのまま返す
  if (typeof metadataJson === 'object') {
    return metadataJson as ProductMetadata;
  }
  
  // 文字列の場合はJSONパースを試行
  if (typeof metadataJson === 'string') {
    try {
      return JSON.parse(metadataJson) as ProductMetadata;
    } catch (error) {
      console.error('Failed to parse product metadata:', error);
      return {};
    }
  }
  
  console.warn('Invalid metadata format:', typeof metadataJson, metadataJson);
  return {};
}

export function isInspectionCompleted(metadata: ProductMetadata): boolean {
  return metadata.inspectionCompleted === true;
}

export function isPhotographyCompleted(metadata: ProductMetadata): boolean {
  return metadata.photographyCompleted === true;
}

export function isPhotographySkipped(metadata: ProductMetadata): boolean {
  return metadata.skipPhotography === true;
}

export function isPhotographyPending(metadata: ProductMetadata): boolean {
  return isInspectionCompleted(metadata) && 
         !isPhotographyCompleted(metadata) && 
         !isPhotographySkipped(metadata);
}

export function getInspectionPhotographyStatus(metadata: ProductMetadata): {
  inspectionStatus: 'pending' | 'completed';
  photographyStatus: 'pending' | 'completed' | 'skipped' | 'not_required';
  canStartPhotography: boolean;
  displayStatus: string;
} {
  const inspectionCompleted = isInspectionCompleted(metadata);
  const photographyCompleted = isPhotographyCompleted(metadata);
  const photographySkipped = isPhotographySkipped(metadata);

  return {
    inspectionStatus: inspectionCompleted ? 'completed' : 'pending',
    photographyStatus: photographyCompleted 
      ? 'completed' 
      : photographySkipped 
        ? 'skipped' 
        : inspectionCompleted 
          ? 'pending' 
          : 'not_required',
    canStartPhotography: inspectionCompleted && !photographyCompleted && !photographySkipped,
    displayStatus: inspectionCompleted
      ? photographyCompleted
        ? '検品・撮影完了'
        : photographySkipped
          ? '検品完了（撮影スキップ）'
          : '撮影待ち'
      : '検品待ち'
  };
}

// 検品・撮影フローの進行状況を%で取得
export function getInspectionPhotographyProgress(metadata: ProductMetadata): {
  percentage: number;
  description: string;
} {
  const inspectionCompleted = isInspectionCompleted(metadata);
  const photographyCompleted = isPhotographyCompleted(metadata);
  const photographySkipped = isPhotographySkipped(metadata);

  if (!inspectionCompleted) {
    return { percentage: 0, description: '検品待ち' };
  }

  if (photographySkipped) {
    return { percentage: 100, description: '検品完了（撮影スキップ）' };
  }

  if (photographyCompleted) {
    return { percentage: 100, description: '検品・撮影完了' };
  }

  return { percentage: 50, description: '撮影待ち' };
}

// 商品ステータスのフィルタリング用
export function filterProductsByInspectionPhotographyStatus(
  products: any[],
  filter: 'all' | 'inspection_pending' | 'photography_pending' | 'completed'
): any[] {
  return products.filter(product => {
    const metadata = parseProductMetadata(product.metadata);
    const status = getInspectionPhotographyStatus(metadata);

    switch (filter) {
      case 'inspection_pending':
        return status.inspectionStatus === 'pending';
      case 'photography_pending':
        return status.photographyStatus === 'pending';
      case 'completed':
        return status.inspectionStatus === 'completed' && 
               (status.photographyStatus === 'completed' || status.photographyStatus === 'skipped');
      case 'all':
      default:
        return true;
    }
  });
}