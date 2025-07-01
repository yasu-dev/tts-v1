'use client';

import { useState } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import NotificationPanel from '@/app/components/features/notifications/NotificationPanel';

export default function TestNotificationPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const notificationTypes = ['success', 'warning', 'error', 'info'] as const;
  
  const notificationTemplates = [
    {
      title: '商品が売れました！',
      message: 'Canon EOS R5が¥450,000で売却されました',
      type: 'success',
      action: 'sales',
      priority: 'high'
    },
    {
      title: '在庫滞留アラート',
      message: 'Nikon D850が30日以上在庫にあります',
      type: 'warning',
      action: 'inventory',
      priority: 'medium'
    },
    {
      title: '緊急検品タスク',
      message: 'Rolex GMT Master IIの高額商品検品が必要です',
      type: 'error',
      action: 'tasks',
      priority: 'high'
    },
    {
      title: '新規入庫',
      message: '本日8件の商品が入庫予定です',
      type: 'info',
      action: 'tasks',
      priority: 'low'
    }
  ];

  const sendTestNotification = async (template: any) => {
    try {
      setLoading(true);
      
      // 実際のユーザーIDはAuthから取得すべき
      const testUserId = 'test-user-123';
      
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          userId: testUserId,
          notification: template
        }),
      });

      if (!response.ok) {
        throw new Error('通知の送信に失敗しました');
      }

      setMessage('通知が送信されました！');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error sending notification:', error);
      setMessage('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userType="staff">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">リアルタイム通知テスト</h1>
          <p className="text-gray-600">SSEを使用したリアルタイム通知のテストページです</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側：通知送信パネル */}
          <div>
            <NexusCard className="p-6">
              <h2 className="text-lg font-semibold mb-4">テスト通知を送信</h2>
              
              {message && (
                <div className={`mb-4 p-3 rounded-md ${
                  message.includes('エラー') 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-green-50 text-green-700'
                }`}>
                  {message}
                </div>
              )}

              <div className="space-y-4">
                {notificationTemplates.map((template, index) => (
                  <div 
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{template.title}</h3>
                          <span className={`
                            inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                            ${template.type === 'success' ? 'bg-green-100 text-green-800' : ''}
                            ${template.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${template.type === 'error' ? 'bg-red-100 text-red-800' : ''}
                            ${template.type === 'info' ? 'bg-blue-100 text-blue-800' : ''}
                          `}>
                            {template.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{template.message}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            Action: {template.action}
                          </span>
                          <span className="text-xs text-gray-500">
                            Priority: {template.priority}
                          </span>
                        </div>
                      </div>
                      <NexusButton
                        onClick={() => sendTestNotification(template)}
                        disabled={loading}
                        className="ml-4"
                        size="sm"
                      >
                        送信
                      </NexusButton>
                    </div>
                  </div>
                ))}
              </div>

              {/* カスタム通知 */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3">カスタム通知</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="タイトル"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="custom-title"
                  />
                  <textarea
                    placeholder="メッセージ"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="custom-message"
                  />
                  <div className="flex gap-2">
                    <select 
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="custom-type"
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                    <NexusButton
                      onClick={() => {
                        const title = (document.getElementById('custom-title') as HTMLInputElement).value;
                        const message = (document.getElementById('custom-message') as HTMLTextAreaElement).value;
                        const type = (document.getElementById('custom-type') as HTMLSelectElement).value;
                        
                        if (title && message) {
                          sendTestNotification({
                            title,
                            message,
                            type,
                            action: 'test',
                            priority: 'medium'
                          });
                        }
                      }}
                      disabled={loading}
                    >
                      カスタム通知を送信
                    </NexusButton>
                  </div>
                </div>
              </div>
            </NexusCard>
          </div>

          {/* 右側：通知パネル */}
          <div>
            <NexusCard className="p-6">
              <h2 className="text-lg font-semibold mb-4">リアルタイム通知パネル</h2>
              <NotificationPanel showAll={true} />
            </NexusCard>
          </div>
        </div>

        {/* SSE接続情報 */}
        <NexusCard className="mt-6 p-6">
          <h2 className="text-lg font-semibold mb-4">接続情報</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">SSEエンドポイント:</span>
              <code className="px-2 py-1 bg-gray-100 rounded">/api/notifications/stream</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">通知API:</span>
              <code className="px-2 py-1 bg-gray-100 rounded">/api/notifications</code>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                ℹ️ このページでは、Server-Sent Events (SSE) を使用してリアルタイムで通知を受信します。
                左側のパネルから通知を送信すると、右側のパネルにリアルタイムで表示されます。
              </p>
            </div>
          </div>
        </NexusCard>
      </div>
    </DashboardLayout>
  );
} 