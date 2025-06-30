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
  priority?: 'high' | 'medium' | 'low';
}

interface EnhancedNotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'seller' | 'staff';
  anchorRef?: React.RefObject<HTMLElement>;
}

export default function EnhancedNotificationPanel({ 
  isOpen, 
  onClose, 
  userType,
  anchorRef 
}: EnhancedNotificationPanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 0, right: 0 });

  // 通知を取得
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/notifications?role=${userType}`);
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, userType]);

  // パネルの位置を計算
  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPanelPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isOpen, anchorRef]);

  // 外側をクリックしたときにパネルを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) &&
          anchorRef?.current && !anchorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: string) => {
    // 全て統一されたグレー系の色に変更
    switch (type) {
      case 'error':
      case 'warning':
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // 既読にする
    await markAsRead(notification.id);
    
    // アクションに基づいてナビゲート
    if (notification.action) {
      const routes: { [key: string]: string } = {
        inventory: '/inventory',
        sales: '/sales',
        reports: '/reports',
        billing: '/billing',
        tasks: userType === 'staff' ? '/staff/tasks' : '/dashboard',
        returns: userType === 'staff' ? '/staff/returns' : '/returns',
        shipping: userType === 'staff' ? '/staff/shipping' : '/delivery',
        system: userType === 'staff' ? '/staff/dashboard' : '/dashboard'
      };
      
      if (routes[notification.action]) {
        router.push(routes[notification.action]);
        onClose();
      }
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-read', role: userType })
      });
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'たった今';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分前`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}時間前`;
    } else if (diffInMinutes < 10080) {
      return `${Math.floor(diffInMinutes / 1440)}日前`;
    } else {
      return date.toLocaleDateString('ja-JP');
    }
  };

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      style={{ top: `${panelPosition.top}px`, right: `${panelPosition.right}px` }}
    >
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">
              通知
            </h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                {unreadCount}件
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                showUnreadOnly 
                  ? 'bg-gray-200 text-gray-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showUnreadOnly ? '全て' : '未読'}
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
              >
                既読
              </button>
            )}
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-6">
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-2 bg-gray-200 rounded w-5/6 animate-pulse"></div>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              {showUnreadOnly ? '未読の通知はありません' : '通知がありません'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                  p-3 cursor-pointer transition-colors hover:bg-gray-50
                  ${!notification.read ? 'bg-gray-50' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 ${getTypeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium truncate ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className={`mt-0.5 text-xs line-clamp-2 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                    
                    {notification.priority === 'high' && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                          重要
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {!notification.read && (
                    <div className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredNotifications.length > 5 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <button
            onClick={() => {
              router.push('/notifications');
              onClose();
            }}
            className="text-xs text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            すべての通知を見る
          </button>
        </div>
      )}
    </div>
  );
} 