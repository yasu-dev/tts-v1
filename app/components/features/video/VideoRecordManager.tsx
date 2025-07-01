'use client';

import { useState, useEffect } from 'react';
import { Video, Play, Calendar, User, Package, FileVideo } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface VideoRecord {
  id: string;
  productId?: string;
  orderId?: string;
  type: 'inspection' | 'packing' | 'shipping' | 'other';
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  duration?: number;
  staffId: string;
  staffName?: string;
  notes?: string;
  createdAt: string;
}

interface VideoRecordManagerProps {
  productId?: string;
  orderId?: string;
  className?: string;
}

export default function VideoRecordManager({
  productId,
  orderId,
  className = ''
}: VideoRecordManagerProps) {
  const [records, setRecords] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchVideoRecords();
  }, [productId, orderId]);

  const fetchVideoRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);
      if (orderId) params.append('orderId', orderId);

      const response = await fetch(`/api/videos?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch video records:', error);
    } finally {
      setLoading(false);
    }
  };

  const typeConfig = {
    inspection: { label: '検品', color: 'text-blue-600 bg-blue-50', icon: '🔍' },
    packing: { label: '梱包', color: 'text-green-600 bg-green-50', icon: '📦' },
    shipping: { label: '出荷', color: 'text-purple-600 bg-purple-50', icon: '🚚' },
    other: { label: 'その他', color: 'text-gray-600 bg-gray-50', icon: '📹' }
  };

  const filteredRecords = selectedType === 'all' 
    ? records 
    : records.filter(r => r.type === selectedType);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openVideo = (url: string) => {
    // 本番環境ではS3のURLを直接開く
    // 開発環境ではモックURLを表示
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">作業動画記録</h3>
          <span className="text-sm text-gray-500">({records.length}件)</span>
        </div>
        
        {/* タイプフィルター */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-full text-sm transition ${
              selectedType === 'all' 
                ? 'bg-primary-blue text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {Object.entries(typeConfig).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                selectedType === type 
                  ? 'bg-primary-blue text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {config.icon} {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* 動画リスト */}
      <div className="space-y-2">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            該当する動画記録がありません
          </div>
        ) : (
          filteredRecords.map((record) => {
            const config = typeConfig[record.type as keyof typeof typeConfig];
            return (
              <div
                key={record.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => openVideo(record.fileUrl)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* タイプアイコン */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.color}`}>
                      <FileVideo className="h-6 w-6" />
                    </div>
                    
                    {/* 動画情報 */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {record.fileName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(record.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {record.staffName || `Staff ${record.staffId}`}
                        </span>
                        <span>{formatFileSize(record.fileSize)}</span>
                        <span>{formatDuration(record.duration)}</span>
                      </div>
                      
                      {record.notes && (
                        <p className="mt-1 text-sm text-gray-600">{record.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* 再生ボタン */}
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      openVideo(record.fileUrl);
                    }}
                  >
                    <Play className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 