'use client'

import React, { useState } from 'react'
import { Package, CheckCircle2, Store, DollarSign, Send } from 'lucide-react'
import BaseModal from './ui/BaseModal'
import NexusButton from './ui/NexusButton'

interface TimelineEvent {
  id: string
  title: string
  date: string
  time?: string
  description?: string
  details?: string[]
  icon: React.ReactNode
  color: string
  orbColor: string
}

interface ProductTimelineProps {
  productId: string
}

export function ProductTimeline({ productId }: ProductTimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // サンプルデータ（実際はAPIから取得）
  const events: TimelineEvent[] = [
    {
      id: '1',
      title: '入庫',
      date: '2024-01-01',
      time: '10:30',
      description: '商品を受領しました',
      details: ['担当: 山田太郎', 'ロケーション: A-123', '検品担当: 佐藤花子'],
      icon: <Package className="w-4 h-4" />,
      color: 'bg-blue-100',
      orbColor: 'blue'
    },
    {
      id: '2',
      title: '検品完了',
      date: '2024-01-02',
      time: '14:15',
      description: '商品の検品が完了しました',
      details: ['検品者: 佐藤花子', '状態: A (新品同様)', '品質スコア: 95/100'],
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'bg-yellow-100',
      orbColor: 'yellow'
    },
    {
      id: '3',
      title: '出品',
      date: '2024-01-05',
      time: '09:00',
      description: 'eBayに出品しました',
      details: ['価格: ¥250,000', '出品者: 田中次郎', 'プラットフォーム: eBay'],
      icon: <Store className="w-4 h-4" />,
      color: 'bg-nexus-blue/20',
      orbColor: 'blue'
    },
    {
      id: '4',
      title: '売却',
      date: '2024-01-15',
      time: '18:45',
      description: '商品が売却されました',
      details: ['購入者: John Smith', '最終価格: ¥248,000', '手数料: ¥24,800'],
      icon: <DollarSign className="w-4 h-4" />,
      color: 'bg-nexus-green/20',
      orbColor: 'green'
    },
    {
      id: '5',
      title: '発送',
      date: '2024-01-16',
      time: '11:20',
      description: '商品を発送しました',
      details: ['配送業者: FedEx', '追跡番号: 1234567890', '発送担当: 鈴木一郎'],
      icon: <Send className="w-4 h-4" />,
      color: 'bg-orange-100',
      orbColor: 'orange'
    }
  ]

  const handleDetailClick = (event: TimelineEvent) => {
    setSelectedEvent(event)
    setIsDetailModalOpen(true)
  }

  const closeDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedEvent(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-nexus-text-primary">商品履歴</h3>
        <span className="text-sm text-nexus-text-secondary">全{events.length}件</span>
      </div>
      
      <div className="relative">
        {/* タイムラインの線 - 完全に背面に固定 */}
        <div 
          className="absolute bg-nexus-border"
          style={{
            left: '24px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            zIndex: -1
          }}
        ></div>
        
        {/* イベント */}
        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={event.id} className="relative flex items-start group">
              {/* アイコン - 前面に配置、縦線を隠すように */}
              <div 
                className={`action-orb ${event.orbColor} w-12 h-12 shadow-md flex items-center justify-center`}
                style={{ 
                  zIndex: 10, 
                  position: 'relative',
                  backgroundColor: 'white',
                  border: '4px solid white',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {event.icon}
                </div>
              </div>
              
              {/* コンテンツ - コンパクトに */}
              <div className="ml-4 flex-1" style={{ zIndex: 5, position: 'relative' }}>
                <div className="holo-card p-3 hover:shadow-md transition-shadow bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-nexus-text-primary">{event.title}</h4>
                        <span className="text-xs text-nexus-text-secondary">
                          {event.date} {event.time && `${event.time}`}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-nexus-text-secondary mb-1">{event.description}</p>
                      )}
                      {event.details && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {event.details.slice(0, 2).map((detail, idx) => (
                            <span key={idx} className="text-xs text-nexus-text-secondary">
                              {detail}
                            </span>
                          ))}
                          {event.details.length > 2 && (
                            <span className="text-xs text-nexus-text-muted">
                              他{event.details.length - 2}件
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {/* アクションボタン - BaseModal統一 */}
                    <NexusButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDetailClick(event)}
                      className="text-xs"
                    >
                      詳細
                    </NexusButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* タイムライン終端 */}
        <div className="relative flex items-center mt-3">
          <div 
            className="w-12 h-12 rounded-full bg-nexus-bg-secondary flex items-center justify-center"
            style={{ 
              zIndex: 10, 
              position: 'relative',
              backgroundColor: 'white',
              border: '4px solid white',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          </div>
          <span className="ml-4 text-xs text-nexus-text-secondary">履歴の終了</span>
        </div>
      </div>

      {/* 詳細モーダル - UI統一性確保 */}
      <BaseModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        title={selectedEvent?.title || ''}
        subtitle={selectedEvent ? `${selectedEvent.date} ${selectedEvent.time || ''}` : ''}
        size="md"
      >
        {selectedEvent && (
          <div className="space-y-6">
            {/* 基本情報 */}
            <div>
              <h3 className="text-lg font-semibold text-nexus-text-primary mb-3">基本情報</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                    アクション
                  </label>
                  <p className="text-nexus-text-primary">{selectedEvent.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                    実行日時
                  </label>
                  <p className="text-nexus-text-primary">
                    {selectedEvent.date} {selectedEvent.time}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                    説明
                  </label>
                  <p className="text-nexus-text-primary">{selectedEvent.description}</p>
                </div>
              </div>
            </div>

            {/* 詳細情報 */}
            {selectedEvent.details && selectedEvent.details.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-nexus-text-primary mb-3">詳細情報</h3>
                <div className="space-y-2">
                  {selectedEvent.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-nexus-primary"></div>
                      <span className="text-sm text-nexus-text-primary">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* フッター */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-nexus-border">
              <NexusButton onClick={closeDetailModal}>
                閉じる
              </NexusButton>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  )
} 