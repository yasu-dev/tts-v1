'use client'

import React from 'react'
import { Package, CheckCircle2, Store, DollarSign, Send } from 'lucide-react'

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
  // サンプルデータ（実際はAPIから取得）
  const events: TimelineEvent[] = [
    {
      id: '1',
      title: '入庫',
      date: '2024-01-01',
      time: '10:30',
      description: '商品を受領しました',
      details: ['担当: 山田太郎', 'ロケーション: A-123'],
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
      details: ['検品者: 佐藤花子', '状態: A (新品同様)'],
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
      details: ['価格: ¥250,000', '出品者: 田中次郎'],
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
      details: ['購入者: John Smith', '最終価格: ¥248,000'],
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
      details: ['配送業者: FedEx', '追跡番号: 1234567890'],
      icon: <Send className="w-4 h-4" />,
      color: 'bg-orange-100',
      orbColor: 'orange'
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-nexus-text-primary">商品履歴</h3>
        <span className="text-sm text-nexus-text-secondary">全{events.length}件</span>
      </div>
      
      <div className="relative">
        {/* タイムラインの線 */}
        <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-nexus-border"></div>
        
        {/* イベント */}
        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={event.id} className="relative flex items-start group">
              {/* アイコン - より小さく */}
              <div className={`action-orb ${event.orbColor} w-10 h-10 shadow-md`}>
                {event.icon}
              </div>
              
              {/* コンテンツ - コンパクトに */}
              <div className="ml-4 flex-1">
                <div className="holo-card p-3 hover:shadow-md transition-shadow">
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
                          {event.details.map((detail, idx) => (
                            <span key={idx} className="text-xs text-nexus-text-secondary">
                              {detail}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* アクションボタン */}
                    <button className="text-xs text-nexus-primary hover:underline">
                      詳細
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* タイムライン終端 */}
        <div className="relative flex items-center mt-3">
                          <div className="w-10 h-10 rounded-full bg-nexus-bg-secondary flex items-center justify-center border border-nexus-border">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          </div>
          <span className="ml-4 text-xs text-nexus-text-secondary">履歴の終了</span>
        </div>
      </div>
    </div>
  )
} 