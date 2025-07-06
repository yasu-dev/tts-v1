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
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit?: (task: Task) => void;
}

export default function TaskDetailModal({ isOpen, onClose, task, onEdit }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const { showToast } = useToast();

  if (!isOpen || !task) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      size="lg"
    >
      <div className="p-6">
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
            <p className="text-gray-900">{task.category}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              期限
            </label>
            <p className="text-lg text-gray-900">{task.dueDate}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <p className="text-gray-900">{task.status}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              優先度
            </label>
            <p className="text-gray-900">{task.priority}</p>
          </div>
          
          {task.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                詳細
              </label>
              <p className="text-gray-900">{task.description}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <NexusButton onClick={onClose}>
            閉じる
          </NexusButton>
          <NexusButton
            onClick={() => {
              if (onEdit) {
                onEdit(task);
              }
              showToast({
                title: 'タスク編集',
                message: 'タスク編集機能を開きます',
                type: 'info'
              });
            }}
            variant="primary"
          >
            編集
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
} 