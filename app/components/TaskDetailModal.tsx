'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { BaseModal, NexusButton } from './ui';

interface Task {
  id: string;
  title: string;
  category: string;
  assignee: string;
  dueDate: string;
  status: string;
  priority: string;
  description?: string;
  attachments?: string[];
  comments?: Array<{
    id: string;
    user: string;
    timestamp: string;
    content: string;
  }>;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit?: (task: Task) => void;
}

export default function TaskDetailModal({ isOpen, onClose, task, onEdit }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');
  const { showToast } = useToast();

  if (!isOpen || !task) return null;

  const demoComments = [
    {
      id: '1',
      user: '田中スタッフ',
      timestamp: '2024-12-25 14:30',
      content: '注文確認完了。商品の在庫確認を行いました。Canon EOS R5 在庫あり。'
    },
    {
      id: '2',
      user: '佐藤スタッフ',
      timestamp: '2024-12-25 12:15',
      content: '検品作業完了。商品状態良好、付属品すべて揃っています。'
    },
    {
      id: '3',
      user: '山田スタッフ',
      timestamp: '2024-12-25 10:45',
      content: '梱包作業開始。専用ケースに入れて丁寧に梱包します。'
    },
    {
      id: '4',
      user: '配送チーム',
      timestamp: '2024-12-25 16:00',
      content: '出荷完了。追跡番号: 1234567890123'
    },
    {
      id: '5',
      user: 'システム',
      timestamp: '2024-12-24 09:30',
      content: '注文 ORD-2024-005 を受付ました。自動処理を開始します。'
    }
  ];

  const demoAttachments = [
    '商品画像_Canon_EOS_R5.jpg',
    '検品チェックリスト.pdf',
    '仕様書_Canon_EOS_R5.pdf'
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      showToast({
        type: 'info',
        title: 'デモモード',
        message: 'デモ版ではコメントの追加は実装されていません'
      });
      setNewComment('');
    }
  };

  const handleStatusChange = (newStatus: string) => {
    showToast({
      type: 'info',
      title: 'デモモード',
      message: `デモ版ではステータス変更は実装されていません\n変更予定: ${newStatus}`
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      size="lg"
      className="max-w-4xl"
    >
      <div className="max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {task.title}
            </h2>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                優先度: {task.priority === 'urgent' ? '緊急' : task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                {task.status === 'completed' ? '完了' : task.status === 'in_progress' ? '進行中' : task.status === 'pending' ? '未開始' : 'キャンセル'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'details', label: '詳細情報' },
            { id: 'comments', label: '履歴' },
            { id: 'attachments', label: '添付ファイル' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      担当者
                    </label>
                    <p className="text-lg text-gray-900">{task.assignee}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      カテゴリー
                    </label>
                    <p className="text-gray-900">
                      {task.category === 'inspection' ? '検品' : 
                       task.category === 'shipping' ? '出荷' : 
                       task.category === 'returns' ? '返品処理' : 
                       task.category === 'maintenance' ? 'メンテナンス' : task.category}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      期限
                    </label>
                    <p className="text-lg text-gray-900">{task.dueDate}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      作成日時
                    </label>
                    <p className="text-gray-900">2024-12-24 10:00</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      進捗率
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: task.status === 'completed' ? '100%' : task.status === 'in_progress' ? '60%' : '0%' }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {task.status === 'completed' ? '100%' : task.status === 'in_progress' ? '60%' : '0%'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ステータス変更
                    </label>
                    <select 
                      value={task.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="pending">未開始</option>
                      <option value="in_progress">進行中</option>
                      <option value="completed">完了</option>
                      <option value="cancelled">キャンセル</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  タスク詳細
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-900">
                    {task.description || 'Canon EOS R5の検品作業を実施します。外観チェック、動作確認、付属品確認を行い、問題がないことを確認してください。'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  注文履歴
                </h3>
                <span className="text-sm text-gray-500">
                  {demoComments.length}件の履歴
                </span>
              </div>
              
              {/* Add Comment */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">田</span>
                    </div>
                  </div>
                  <div className="flex-1">
                                          <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="履歴メモを追加..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    <div className="flex justify-end mt-2">
                      <NexusButton
                        onClick={handleAddComment}
                        variant="primary"
                        size="sm"
                      >
                        追加
                      </NexusButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {demoComments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {comment.user.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 text-sm">
                            {comment.user}
                          </span>
                          <span className="text-xs text-gray-500">
                            {comment.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  添付ファイル
                </h3>
                                  <NexusButton 
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files) {
                          const fileNames = Array.from(files).map(f => f.name);
                          showToast({
                            type: 'success',
                            title: 'ファイル追加',
                            message: `ファイルを追加しました: ${fileNames.join(', ')}`
                          });
                        }
                      };
                      input.click();
                    }}
                    variant="primary"
                    size="sm"
                  >
                    ファイル追加
                  </NexusButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoAttachments.map((filename, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.floor(Math.random() * 1000) + 100} KB
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = '#';
                        link.download = filename;
                        link.click();
                        showToast({
                          type: 'success',
                          title: 'ファイルダウンロード',
                          message: `ファイルをダウンロードしました: ${filename}`
                        });
                      }}
                      className="text-purple-600 hover:text-purple-700 text-sm"
                    >
                      ダウンロード
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={() => {
                const printContent = `
                  タスク詳細
                  
                  タスク名: ${task.title}
                  カテゴリ: ${task.category}
                  担当者: ${task.assignee}
                  期限: ${task.dueDate}
                  ステータス: ${task.status}
                  優先度: ${task.priority}
                  詳細: ${task.description || 'なし'}
                  印刷日時: ${new Date().toLocaleString('ja-JP')}
                `;
                
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head><title>タスク詳細 - ${task.title}</title></head>
                      <body style="font-family: Arial, sans-serif; padding: 20px;">
                        <pre style="white-space: pre-wrap;">${printContent}</pre>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                }
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              印刷
            </button>
            <button
              onClick={() => {
                const duplicateTask = {
                  ...task,
                  id: `${task.id}-copy`,
                  title: `${task.title} (コピー)`,
                  status: 'pending'
                };
                
                fetch('/api/staff/tasks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(duplicateTask)
                })
                .then(res => res.json())
                .then(data => {
                  showToast({
                    type: 'success',
                    title: 'タスク複製',
                    message: `タスクを複製しました: ${duplicateTask.title}。本番環境ではタスクリストが更新されます。`,
                    duration: 4000
                  });
                  onClose();
                  // 本番運用では親コンポーネントの状態を更新
                  // window.location.reload()は削除し、適切な状態管理を使用
                })
                .catch(err => {
                  console.error('タスク複製エラー:', err);
                  showToast({
                    type: 'error',
                    title: 'エラー',
                    message: 'タスクの複製に失敗しました'
                  });
                });
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              複製
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              閉じる
            </button>
            <NexusButton
              onClick={() => onEdit && onEdit(task)}
              variant="primary"
            >
              編集
            </NexusButton>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}