'use client';

import { useState, useEffect, useRef } from 'react';

interface TimelineEvent {
  id: string;
  type: string;
  timestamp: string;
  title: string;
  status: string;
  user?: string;
  notes?: string;
  metadata?: any;
}

interface ProductTimelineProps {
  productId: string;
}

export default function ProductTimeline({ productId }: ProductTimelineProps) {
  const [product, setProduct] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}/history`);
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      setProduct(data.product);
      setTimeline(data.timeline);
      setError(null);
    } catch (err) {
      setError('履歴データの取得に失敗しました');
      console.error('History fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchHistory();
    }
  }, [productId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inbound': return 'bg-blue-500 border-blue-200';
      case 'inspection': return 'bg-yellow-500 border-yellow-200';
      case 'storage': return 'bg-green-500 border-green-200';
      case 'listing': return 'bg-purple-500 border-purple-200';
      case 'ordered': return 'bg-orange-500 border-orange-200';
      case 'shipping': return 'bg-indigo-500 border-indigo-200';
      case 'delivery': return 'bg-cyan-500 border-cyan-200';
      case 'sold': return 'bg-gray-500 border-gray-200';
      case 'returned': return 'bg-red-500 border-red-200';
      case 'movement': return 'bg-teal-500 border-teal-200';
      default: return 'bg-gray-400 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'inbound':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        );
      case 'inspection':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'storage':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'listing':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'movement':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ja-JP'),
      time: date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (isLoading) {
    return (
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="text-red-500 text-center">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
            <button 
              onClick={fetchHistory}
              className="mt-4 nexus-button primary"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="intelligence-card global">
      <div className="p-8">
        {/* Product Header */}
        {product && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-nexus-border"
                />
              )}
              <div>
                <h3 className="text-2xl font-display font-bold text-nexus-text-primary">
                  {product.name}
                </h3>
                <p className="text-nexus-text-secondary">
                  SKU: {product.sku} | {product.category} | {product.condition}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`status-badge ${product.status === '売約済み' ? 'success' : 'info'}`}>
                    {product.status}
                  </span>
                  <span className="text-lg font-display font-bold text-nexus-text-primary">
                    ¥{product.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Header */}
        <div className="mb-6">
          <h4 className="text-xl font-display font-bold text-nexus-text-primary">商品履歴タイムライン</h4>
          <p className="text-nexus-text-secondary mt-1">
            入庫から現在までの全ての履歴を時系列で表示
          </p>
        </div>

        {/* Timeline */}
        <div className="relative" ref={timelineRef}>
          {timeline.length === 0 ? (
            <div className="text-center text-nexus-text-muted py-8">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>履歴データがありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((event, index) => {
                const { date, time } = formatDateTime(event.timestamp);
                const isLast = index === timeline.length - 1;
                
                return (
                  <div key={event.id} className="relative">
                    {/* Timeline line */}
                    {!isLast && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-nexus-border"></div>
                    )}
                    
                    {/* Event content */}
                    <div className="flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className={`
                        flex-shrink-0 w-12 h-12 rounded-full border-4 
                        ${getStatusColor(event.status)} 
                        flex items-center justify-center text-white shadow-lg
                      `}>
                        {getStatusIcon(event.status)}
                      </div>
                      
                      {/* Event details */}
                      <div className="flex-1 min-w-0">
                        <div className="intelligence-card americas">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-bold text-nexus-text-primary">
                                {event.title}
                              </h5>
                              <div className="text-sm text-nexus-text-muted">
                                <div>{date}</div>
                                <div>{time}</div>
                              </div>
                            </div>
                            
                            {event.user && (
                              <p className="text-sm text-nexus-text-secondary mb-2">
                                実行者: {event.user}
                              </p>
                            )}
                            
                            {event.notes && (
                              <p className="text-sm text-nexus-text-secondary mb-2">
                                備考: {event.notes}
                              </p>
                            )}
                            
                            {event.metadata && (
                              <div className="text-xs text-nexus-text-muted bg-nexus-card-bg p-2 rounded">
                                <pre>{JSON.stringify(event.metadata, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}