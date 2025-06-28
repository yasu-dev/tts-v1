'use client';

import { useState } from 'react';

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

  if (!isOpen || !task) return null;

  const demoComments = [
    {
      id: '1',
      user: '田中スタッフ',
      timestamp: '2024-12-25 14:30',
      content: '検品作業を開始しました。外観に問題はありません。'
    },
    {
      id: '2',
      user: '佐藤マネージャー',
      timestamp: '2024-12-25 10:15',
      content: '優先度を高に変更しました。至急対応をお願いします。'
    },
    {
      id: '3',
      user: 'システム',
      timestamp: '2024-12-24 16:45',
      content: 'タスクが自動生成されました。'
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
      alert('デモ版ではコメントの追加は実装されていません');
      setNewComment('');
    }
  };

  const handleStatusChange = (newStatus: string) => {
    alert(`デモ版ではステータス変更は実装されていません\n変更予定: ${newStatus}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
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
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'details', label: 'タスク詳細' },
            { id: 'comments', label: 'コメント' },
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      担当者
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">{task.assignee}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      カテゴリー
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {task.category === 'inspection' ? '検品' : 
                       task.category === 'shipping' ? '出荷' : 
                       task.category === 'returns' ? '返品処理' : 
                       task.category === 'maintenance' ? 'メンテナンス' : task.category}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      期限
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">{task.dueDate}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      作成日時
                    </label>
                    <p className="text-gray-900 dark:text-white">2024-12-24 10:00</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  タスク詳細
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white">
                    {task.description || 'Canon EOS R5の検品作業を実施します。外観チェック、動作確認、付属品確認を行い、問題がないことを確認してください。'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  コメント履歴
                </h3>
                <span className="text-sm text-gray-500">
                  {demoComments.length}件のコメント
                </span>
              </div>
              
              {/* Add Comment */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
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
                      placeholder="コメントを追加..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleAddComment}
                        className="px-4 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                      >
                        追加
                      </button>
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
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {comment.user}
                          </span>
                          <span className="text-xs text-gray-500">
                            {comment.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  添付ファイル
                </h3>
                <button 
                  onClick={() => alert('デモ版ではファイルアップロード機能は利用できません')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                >
                  ファイル追加
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoAttachments.map((filename, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.floor(Math.random() * 1000) + 100} KB
                      </p>
                    </div>
                    <button 
                      onClick={() => alert('デモ版ではファイルダウンロード機能は利用できません')}
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
        <div className="flex justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <button
              onClick={() => alert('デモ版では印刷機能は利用できません')}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              印刷
            </button>
            <button
              onClick={() => alert('デモ版では複製機能は利用できません')}
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
            <button
              onClick={() => onEdit && onEdit(task)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              編集
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}