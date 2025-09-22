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
  userType: 'staff' | 'seller';
  anchorRef?: React.RefObject<HTMLButtonElement>;
  onNotificationUpdate?: (unreadCount: number) => void;
}

export default function EnhancedNotificationPanel({ 
  isOpen, 
  onClose, 
  userType,
  anchorRef,
  onNotificationUpdate
}: EnhancedNotificationPanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 0, right: 0 });

  // 通知を取得する関数
  const fetchNotifications = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      // セラーは本番用エンドポイント、スタッフはテスト用エンドポイントを使用
      const endpoint = userType === 'seller'
        ? `/api/notifications?role=${userType}`
        : `/api/notifications/test?role=${userType}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(endpoint, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const notificationData = Array.isArray(data) ? data : [];
      
      setNotifications(notificationData);
      
      // バッジ数も更新
      const unreadCount = notificationData.filter(n => !n.read).length;
      onNotificationUpdate?.(unreadCount);
      
      console.log('[DEBUG] 通知パネル更新:', notificationData.length, '件, 未読:', unreadCount, '件 (エンドポイント:', endpoint, ')');
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // エラー時は空配列を設定
      setNotifications([]);
      onNotificationUpdate?.(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // 通知を取得
  useEffect(() => {
    if (isOpen && userType) {
      fetchNotifications();
    }
  }, [isOpen, userType]);

  // パネルの位置を計算
  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      
      // ボタンが適切に配置されている場合のみ位置を計算
      if (rect.width > 0 && rect.height > 0) {
        const topPosition = rect.bottom + 8;
        const rightPosition = window.innerWidth - rect.right;
        
        setPanelPosition({
          top: topPosition,
          right: rightPosition
        });
      }
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

  const handleNotificationClick = async (notification: Notification) => {
    try {
      console.log('📱 通知クリック開始:', notification);
      
      // 1. 即座にローカル状態を更新（既読にする）
      if (!notification.read) {
        console.log('📱 既読処理開始:', notification.id);
        
        setNotifications(prev => {
          const updated = prev.map(notif => 
            notif.id === notification.id 
              ? { ...notif, read: true }
              : notif
          );
          const newUnreadCount = updated.filter(n => !n.read).length;
          console.log('📱 ローカル状態更新 - 未読数:', newUnreadCount, '(通知ID:', notification.id, ')');
          
          // バッジ数を即座に更新
          onNotificationUpdate?.(newUnreadCount);
          return updated;
        });
        
        // バックグラウンドでDBも更新（セラーとスタッフで異なるエンドポイントを使用）
        const endpoint = userType === 'seller'
          ? '/api/notifications/mark-as-read'
          : '/api/notifications/test';
        const method = 'POST';
        const body = JSON.stringify({ notificationId: notification.id });
        
        console.log('[DEBUG] 既読リクエスト:', { endpoint, method, body });
        
        fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body
        }).then(response => {
          console.log('[DEBUG] 既読レスポンス:', response.status);
          return response.json();
        }).then(data => {
          console.log('[DEBUG] 既読結果:', data);

          // 既読処理成功 - ローカル状態は既に更新済みなので再取得は不要
          if (data.success) {
            console.log('[DEBUG] 既読処理成功 - DB更新完了');
          }
        }).catch(error => {
          console.error('DB既読更新エラー:', error);
        });
      }
      
      // 2. 通知タイプに応じた画面に遷移
      const navigationPath = getNavigationPath(notification);
      
      console.log(`📱 通知クリック: ${notification.title} -> ${navigationPath}`);
      
      if (navigationPath) {
        router.push(navigationPath);
      }
      
      // 3. パネルを閉じる
      onClose();
      
    } catch (error) {
      console.error('通知クリック処理エラー:', error);
      onClose();
    }
  };

  /**
   * 通知タイプに応じた遷移先を取得
   */
  const getNavigationPath = (notification: Notification): string | null => {
    const { action, notificationType } = notification as any;
    
    // 1. actionフィールドがある場合はそれを優先
    if (action) {
      switch (action) {
        case 'sales':
          return '/sales';
        case 'inventory':
          return '/inventory';
        case 'returns':
          return '/returns';
        case 'billing':
          return '/billing';
        case 'shipping':
          return userType === 'staff' ? '/staff/shipping' : '/delivery';
        case 'tasks':
          return userType === 'staff' ? '/staff/tasks' : '/dashboard';
        case 'inspection':
          return userType === 'staff' ? '/staff/inspection' : '/inventory';
        case 'system':
          return '/settings';
        default:
          break;
      }
    }
    
    // 2. notificationTypeに基づく遷移先
    if (notificationType) {
      switch (notificationType) {
        // 商品関連
        case 'product_sold':
          return '/sales';
          
        case 'product_issue':
          return '/inventory'; // 商品管理は在庫画面で統合
          
        // 在庫関連
        case 'inventory_alert':
          return '/inventory';
          
        // 返品関連
        case 'return_request':
          return '/returns';
          
        // 支払い関連
        case 'payment_issue':
        case 'payment_received':
          return '/billing';
          
        // 配送関連
        case 'shipping_issue':
          return userType === 'staff' ? '/staff/shipping' : '/delivery';
          
        // 検品関連
        case 'inspection_complete':
          return userType === 'staff' ? '/staff/inspection' : '/inventory';
          
        // 納品プラン関連
        case 'delivery_plan_created':
          return userType === 'staff' ? '/staff/inspection' : '/inventory';
          
        // 保管完了関連
        case 'storage_complete':
          return userType === 'staff' ? '/staff/inventory' : '/inventory';
          
        // 商品購入関連
        case 'product_purchased':
          return userType === 'staff' ? '/staff/orders' : '/orders';
          
        // 出荷完了関連
        case 'shipping_complete':
          return userType === 'staff' ? '/staff/shipping' : '/tracking';
          
        // レポート関連
        case 'report_ready':
        case 'monthly_summary':
          return '/reports';
          
        // システム関連
        case 'system_update':
          return '/settings';
          
        // プロモーション
        case 'promotion_available':
          return '/dashboard'; // プロモーション専用画面がないためダッシュボードに
          
        default:
          break;
      }
    }
    
    // 3. 通知タイトルに基づく推測（フォールバック）
    const title = notification.title.toLowerCase();
    
    if (title.includes('売れ') || title.includes('販売') || title.includes('注文')) {
      return '/sales';
    } else if (title.includes('在庫') || title.includes('アラート')) {
      return '/inventory';
    } else if (title.includes('返品')) {
      return '/returns';
    } else if (title.includes('支払い') || title.includes('入金') || title.includes('決済')) {
      return '/billing';
    } else if (title.includes('配送') || title.includes('発送')) {
      return userType === 'staff' ? '/staff/shipping' : '/delivery';
    } else if (title.includes('検品')) {
      return userType === 'staff' ? '/staff/inspection' : '/inventory';
    } else if (title.includes('タスク') || title.includes('作業')) {
      return userType === 'staff' ? '/staff/tasks' : '/dashboard';
    } else if (title.includes('レポート') || title.includes('サマリー')) {
      return '/reports';
    }
    
    // 4. デフォルトはダッシュボード
    return userType === 'staff' ? '/staff/dashboard' : '/dashboard';
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-read', role: userType })
      });
      
      setNotifications(prev => {
        const updated = prev.map(notif => ({ ...notif, read: true }));
        // 全て既読にしたので未読数は0
        onNotificationUpdate?.(0);
        return updated;
      });
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
    } else {
      return date.toLocaleDateString('ja-JP');
    }
  };

  /**
   * 通知タイプに応じたアイコンを取得
   */
  const getNotificationIcon = (notification: Notification) => {
    const { type, notificationType } = notification as any;
    
    // delivery_plan_created の場合は青い箱アイコン
    if (notificationType === 'delivery_plan_created') {
      return (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      );
    }
    
    // その他のタイプに基づくアイコン
    switch (type) {
      case 'success':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  // 表示条件を厳格化
  if (!isOpen || !anchorRef?.current) return null;

  return (
    <div
      ref={panelRef}
      data-testid="notification-panel"
      className="fixed z-[10000] w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
      style={{ 
        top: `${panelPosition.top}px`, 
        right: `${panelPosition.right}px`,
        minHeight: '120px'
      }}
    >
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">通知</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                {unreadCount}件
              </span>
            )}
          </div>
          
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

      <div className="max-h-60 overflow-y-auto" data-testid="notification-list">
        {loading ? (
          <div className="p-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-600">
              {showUnreadOnly ? '未読の通知はありません' : '通知がありません'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                data-testid="notification-item"
                data-read={notification.read}
                data-type={notification.type}
                data-priority={notification.priority}
                data-action={notification.action}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification)}
                  <div className="flex-1 min-w-0">
                    <p 
                      className={`text-sm font-medium truncate ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}
                      data-testid="notification-title"
                    >
                      {notification.title}
                    </p>
                    <p 
                      className="text-xs text-gray-500 mt-1 line-clamp-2"
                      data-testid="notification-message"
                    >
                      {notification.message}
                    </p>
                    <p 
                      className="text-xs text-gray-400 mt-1"
                      data-testid="notification-time"
                    >
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showUnreadOnly ? '全て表示' : '未読のみ'}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              全て既読
            </button>
          )}
        </div>
      )}
    </div>
  );
}

