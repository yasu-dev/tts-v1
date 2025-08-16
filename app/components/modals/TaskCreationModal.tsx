'use client';

import { useState } from 'react';
import { BaseModal, NexusButton, NexusInput, NexusSelect, NexusTextarea } from '../ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
}

export default function TaskCreationModal({ isOpen, onClose, onSubmit }: TaskCreationModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'inspection',
    assignedTo: '',
    dueDate: '',
    estimatedTime: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showToast({
        type: 'warning',
        title: '入力エラー',
        message: 'タスク名を入力してください'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // デモ版: 実際のAPIが存在しなくても動作するモック実装
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機でAPI呼び出しをシミュレート
      
      // 新しいタスクデータを作成
      const newTask = {
        id: `task-${Date.now()}`,
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        assignedToName: getStaffName(formData.assignedTo)
      };

      // 成功メッセージを表示
      showToast({
        type: 'success',
        title: 'タスク作成完了',
        message: `新しいタスクを作成しました: ${formData.title}`
      });

      // 親コンポーネントに通知
      onSubmit(newTask);
      
      // フォームをリセット
      setFormData({
        title: '',
        description: '',

        category: 'inspection',
        assignedTo: '',
        dueDate: '',
        estimatedTime: '',
        notes: ''
      });
      
      // モーダルを閉じる
      onClose();
      
      // デモ版: 状態管理による更新（本番運用と同じ挙動）
      // 実際のアプリでは親コンポーネントの状態を更新
      // window.location.reload()は削除し、適切な状態管理を使用
      
    } catch (error) {
      console.error('タスク作成エラー:', error);
      showToast({
        type: 'error',
        title: 'エラー',
        message: 'タスクの作成に失敗しました。もう一度お試しください。'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // スタッフ名を取得するヘルパー関数
  const getStaffName = (staffId: string) => {
    const staffMap: { [key: string]: string } = {
      'staff001': '田中太郎',
      'staff002': '佐藤花子',
      'staff003': '山田次郎',
      'staff004': '鈴木美香'
    };
    return staffMap[staffId] || '未割り当て';
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="新規タスク作成"
      size="lg"
    >
      <div>
        <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <NexusInput
              label="タスク名 *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="例: Canon EOS R5の検品作業"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <NexusTextarea
              label="詳細説明"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="タスクの詳細な説明を入力してください"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


            <div>
              <NexusSelect
                label="カテゴリ *"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                options={[
                  { value: "inspection", label: "検品" },
                  { value: "photography", label: "撮影" },
                  { value: "shipping", label: "出荷" },
                  { value: "inventory", label: "在庫管理" },
                  { value: "returns", label: "返品処理" },

                  { value: "other", label: "その他" }
                ]}
              />
            </div>

            <div>
              <NexusSelect
                label="担当者"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                disabled={isSubmitting}
                options={[
                  { value: "", label: "未割り当て" },
                  { value: "staff001", label: "スタッフA" },
                  { value: "staff002", label: "スタッフB" },
                  { value: "staff003", label: "スタッフC" },
                  { value: "staff004", label: "スタッフD" }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <NexusInput
                label="期限"
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <NexusInput
                label="予想作業時間 (分)"
                type="number"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleChange}
                placeholder="30"
                min="1"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <NexusTextarea
              label="備考"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="特記事項や注意点"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <NexusButton
              variant="default"
              size="lg"
              onClick={onClose}
              disabled={isSubmitting}
            >
              キャンセル
            </NexusButton>
            <NexusButton
              variant="primary"
              size="lg"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  作成中...
                </>
              ) : (
                '作成'
              )}
            </NexusButton>
          </div>
        </form>
      </div>
    </BaseModal>
  );
} 