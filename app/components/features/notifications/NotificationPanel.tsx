'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: string;
}

interface NotificationPanelProps {
  showAll?: boolean;
  limit?: number;
}

export default function NotificationPanel({ showAll = false, limit = 5 }: NotificationPanelProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetch('/api/reports/analytics');
        const data = await response.json();
        setNotifications(data.notifications);
      } catch (error) {
        console.error('Notifications loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // SSE接続の確立
  useEffect(() => {
    // SSE接続を作成
    const connectSSE = () => {
      try {
        const eventSource = new EventSource('/api/notifications/stream');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('SSE接続が確立されました');
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'connected') {
              console.log('通知チャンネルに接続されました:', data.userId);
            } else if (data.type === 'new_notification') {
              // 新しい通知を追加
              setNotifications(prev => [data.notification, ...prev]);
              
              // ブラウザ通知を表示（権限がある場合）
              if (Notification.permission === 'granted') {
                new Notification(data.notification.title, {
                  body: data.notification.message,
                  icon: '/icon.svg',
                  badge: '/icon.svg'
                });
              }
            }
          } catch (error) {
            console.error('メッセージ解析エラー:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE接続エラー:', error);
          setIsConnected(false);
          
          // 再接続の試行
          setTimeout(() => {
            console.log('SSE再接続を試行中...');
            connectSSE();
          }, 5000);
        };
      } catch (error) {
        console.error('SSE接続の確立に失敗:', error);
      }
    };

    // ブラウザ通知の権限をリクエスト
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    connectSSE();

    // クリーンアップ
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.action) {
      switch (notification.action) {
        case 'inventory':
          router.push('/inventory');
          break;
        case 'timeline':
          router.push('/timeline');
          break;
        case 'reports':
          router.push('/reports');
          break;
        case 'system':
          router.push('/staff/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}分前`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}時間前`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}日前`;
    }
  };

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.read)
    : notifications;

  const displayNotifications = showAll 
    ? filteredNotifications 
    : filteredNotifications.slice(0, limit);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">通知</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount}件の未読
              </span>
            )}
            {isConnected && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                リアルタイム
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                showUnreadOnly 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showUnreadOnly ? '全て表示' : '未読のみ'}
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                全て既読
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {displayNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {showUnreadOnly ? '未読の通知はありません' : '通知はありません'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                  p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50
                  ${!notification.read ? 'bg-blue-50 border-l-4 border-blue-400' : ''}
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center p-1.5
                    ${getTypeColor(notification.type)}
                  `}>
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`
                        text-sm font-medium truncate
                        ${!notification.read ? 'text-gray-900' : 'text-gray-700'}
                      `}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className={`
                      mt-1 text-sm truncate
                      ${!notification.read ? 'text-gray-700' : 'text-gray-500'}
                    `}>
                      {notification.message}
                    </p>
                    
                    {notification.action && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          クリックして詳細を確認
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!showAll && filteredNotifications.length > limit && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button
            onClick={() => router.push('/notifications')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            すべての通知を表示 ({filteredNotifications.length - limit}件の追加通知)
          </button>
        </div>
      )}
    </div>
  );
}