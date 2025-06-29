'use client';

import { useState, useEffect } from 'react';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
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
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
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