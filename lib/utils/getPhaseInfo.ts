import { TriageTag } from '@/lib/types';

export interface PhaseInfo {
  phase: string;
  icon: string;
  responsible: string;
  location: string;
}

export const getPhaseInfo = (tag: TriageTag): PhaseInfo => {
  // 病院到着
  if (tag.transport.status === 'completed' && tag.transport.destination) {
    return {
      phase: '病院',
      icon: '✅',
      responsible: `収容: ${tag.transport.destination.hospital_name}`,
      location: tag.transport.destination.hospital_name,
    };
  }

  // 病院へ搬送中
  if (tag.transport.status === 'in_transit' && tag.transport.destination) {
    return {
      phase: '病院へ',
      icon: '🚑',
      responsible: `救急隊 → ${tag.transport.destination.hospital_name}`,
      location: `搬送先: ${tag.transport.destination.hospital_name}`,
    };
  }

  // 病院搬送準備中
  if (tag.transport.status === 'preparing') {
    return {
      phase: '病院準備',
      icon: '📋',
      responsible: 'DMAT準備中',
      location: '現在地: 応急救護所',
    };
  }

  // 応急救護所到着
  if (tag.transport.status === 'arrived') {
    return {
      phase: '応急',
      icon: '🏥',
      responsible: '応急救護所待機',
      location: '現在地: 応急救護所',
    };
  }

  // 応急救護所へ搬送中
  if (tag.transport_assignment?.status === 'in_progress') {
    return {
      phase: '応急へ',
      icon: '🚑',
      responsible: `搬送: ${tag.transport_assignment.team}`,
      location: `発見位置: ${tag.location.address || '座標情報あり'}`,
    };
  }

  // 搬送部隊割当済
  if (tag.transport_assignment?.status === 'assigned') {
    return {
      phase: '割当済',
      icon: '⏳',
      responsible: `割当: ${tag.transport_assignment.team}`,
      location: `発見位置: ${tag.location.address || '座標情報あり'}`,
    };
  }

  // 現場待機
  return {
    phase: '現場',
    icon: '📍',
    responsible: `発見: ${tag.audit.created_by}`,
    location: `発見位置: ${tag.location.address || '座標情報あり'}`,
  };
};
