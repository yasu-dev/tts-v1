import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { useModal } from './ModalContext';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

// コンパクトで効率的なサイズ設定
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  full: 'max-w-full mx-4'
};

export default function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}: BaseModalProps) {
  const { setIsAnyModalOpen } = useModal();

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // モーダル表示時にbodyのスクロールを防ぐ
      document.body.style.overflow = 'hidden';
      // グローバル状態を更新（業務フローの状態は変更しない）
      setIsAnyModalOpen(true);
    } else {
      // グローバル状態をリセット（業務フローの状態は変更しない）
      setIsAnyModalOpen(false);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      // クリーンアップ時もグローバル状態をリセット（業務フローの状態は変更しない）
      setIsAnyModalOpen(false);
    };
  }, [isOpen, onClose, setIsAnyModalOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[9999] p-2"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        className={`
          bg-nexus-bg-primary 
          rounded-xl 
          shadow-2xl 
          w-full 
          ${sizeClasses[size]} 
          max-h-[88vh] 
          overflow-hidden 
          flex 
          flex-col
          border border-nexus-border
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー - paddingを削減 */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-3 border-b border-nexus-border">
            <div className="flex-1">
              {title && (
                <h2 
                  id="modal-title" 
                  className="text-lg font-semibold text-nexus-text-primary font-display"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-nexus-text-secondary mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-nexus-bg-secondary rounded-lg transition-colors ml-3"
                aria-label="モーダルを閉じる"
              >
                <X size={18} className="text-nexus-text-secondary" />
              </button>
            )}
          </div>
        )}

        {/* コンテンツ - paddingを削減 */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
} 