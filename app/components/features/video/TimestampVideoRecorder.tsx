'use client';

import { useState, useEffect } from 'react';
import { Clock, Video, Play, Pause, Calendar, MapPin, FileText, Trash2 } from 'lucide-react';
import { NexusButton, NexusCard, NexusInput, NexusTextarea } from '@/app/components/ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface VideoTimestamp {
  id: string;
  timestamp: string; // ISO datetime string
  description: string;
  s3VideoPath: string;
  isPlaying?: boolean;
}

interface TimestampVideoRecorderProps {
  productId: string;
  phase: 'phase2' | 'phase4';
  type: 'inspection' | 'packing';
  onRecordingComplete?: (timestamps: VideoTimestamp[]) => void;
}

export default function TimestampVideoRecorder({
  productId,
  phase,
  type,
  onRecordingComplete
}: TimestampVideoRecorderProps) {
  const { showToast } = useToast();
  const [timestamps, setTimestamps] = useState<VideoTimestamp[]>([]);
  const [currentDescription, setCurrentDescription] = useState('');
  const [isRecordingSession, setIsRecordingSession] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [selectedVideoPath, setSelectedVideoPath] = useState<string>('');
  const [videoPlayer, setVideoPlayer] = useState<HTMLVideoElement | null>(null);

  // セッション開始
  const startRecordingSession = () => {
    setIsRecordingSession(true);
    setSessionStartTime(new Date());
    setTimestamps([]);
    showToast({
      title: '記録セッション開始',
      message: '重要なタイミングでタイムスタンプボタンを押してください',
      type: 'info'
    });
  };

  // タイムスタンプ記録
  const recordTimestamp = () => {
    if (!isRecordingSession) {
      showToast({
        title: 'セッションが開始されていません',
        message: '先に記録セッションを開始してください',
        type: 'warning'
      });
      return;
    }

    if (!currentDescription.trim()) {
      showToast({
        title: '説明を入力してください',
        message: 'タイムスタンプの説明を入力してください',
        type: 'warning'
      });
      return;
    }

    const now = new Date();
    const newTimestamp: VideoTimestamp = {
      id: `${productId}-${now.getTime()}`,
      timestamp: now.toISOString(),
      description: currentDescription.trim(),
      s3VideoPath: generateS3VideoPath(now),
      isPlaying: false
    };

    setTimestamps(prev => [...prev, newTimestamp]);
    setCurrentDescription('');
    
    showToast({
      title: 'タイムスタンプ記録完了',
      message: `${formatTimestamp(now)} - ${newTimestamp.description}`,
      type: 'success'
    });
  };

  // S3動画パス生成（日付ベース）
  const generateS3VideoPath = (timestamp: Date): string => {
    const year = timestamp.getFullYear();
    const month = String(timestamp.getMonth() + 1).padStart(2, '0');
    const day = String(timestamp.getDate()).padStart(2, '0');
    const hour = String(timestamp.getHours()).padStart(2, '0');
    
    return `security-camera/${year}/${month}/${day}/${hour}/camera-${type}-${productId}.mp4`;
  };

  // タイムスタンプ削除
  const deleteTimestamp = (timestampId: string) => {
    const targetTimestamp = timestamps.find(ts => ts.id === timestampId);
    if (!targetTimestamp) return;

    const confirmed = window.confirm(
      `タイムスタンプを削除しますか？\n\n時刻: ${formatTimestamp(new Date(targetTimestamp.timestamp))}\n内容: ${targetTimestamp.description}\n\n※この操作は取り消せません。`
    );

    if (confirmed) {
      setTimestamps(prev => prev.filter(ts => ts.id !== timestampId));
      showToast({
        title: 'タイムスタンプを削除しました',
        message: '記録済みタイムスタンプを削除しました',
        type: 'info'
      });
    }
  };

  // 動画再生
  const playVideoAtTimestamp = async (timestamp: VideoTimestamp) => {
    try {
      // S3から動画URLを取得
      const response = await fetch('/api/videos/s3-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          s3Path: timestamp.s3VideoPath,
          timestamp: timestamp.timestamp
        })
      });

      if (!response.ok) {
        throw new Error('動画の取得に失敗しました');
      }

      const { signedUrl, seekTime } = await response.json();
      
      // 動画プレーヤーを開く
      setSelectedVideoPath(signedUrl);
      setTimestamps(prev => prev.map(t => 
        t.id === timestamp.id ? { ...t, isPlaying: true } : { ...t, isPlaying: false }
      ));
      
      // 指定時刻にシーク
      if (videoPlayer) {
        videoPlayer.currentTime = seekTime;
        videoPlayer.play();
      }

      showToast({
        title: '動画再生開始',
        message: `${formatTimestamp(new Date(timestamp.timestamp))} から再生`,
        type: 'info'
      });
    } catch (error) {
      console.error('Video playback error:', error);
      showToast({
        title: '動画再生エラー',
        message: '動画の再生に失敗しました',
        type: 'error'
      });
    }
  };

  // セッション終了
  const endRecordingSession = async () => {
    if (timestamps.length === 0) {
      showToast({
        title: 'タイムスタンプが記録されていません',
        message: '少なくとも1つのタイムスタンプを記録してください',
        type: 'warning'
      });
      return;
    }

    try {
      // データの妥当性チェック
      const validTimestamps = timestamps.filter(ts => 
        ts.id && ts.timestamp && ts.description && ts.s3VideoPath
      );

      if (validTimestamps.length === 0) {
        throw new Error('有効なタイムスタンプが見つかりません');
      }

      const requestData = {
        productId: productId || null,
        orderId: null,
        type: type || 'other',
        sessionId: `${type}-${productId}-${Date.now()}`,
        timestamps: validTimestamps,
        s3VideoPath: validTimestamps[0].s3VideoPath,
        notes: `${type === 'inspection' ? '検品' : '梱包'}作業の動画記録`
      };

      console.log('Sending timestamp data:', requestData);

      // タイムスタンプ記録をAPIに保存
      const response = await fetch('/api/videos/timestamps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('API response:', result);
      
      setIsRecordingSession(false);
      setSessionStartTime(null);
      
      // 親コンポーネントに結果を通知
      onRecordingComplete?.(timestamps);
      
      showToast({
        title: '記録セッション完了',
        message: `${validTimestamps.length}個のタイムスタンプを記録しました`,
        type: 'success'
      });
    } catch (error) {
      console.error('Session end error:', error);
      const errorMessage = error instanceof Error ? error.message : 'タイムスタンプ記録の保存に失敗しました';
      showToast({
        title: 'セッション終了エラー',
        message: errorMessage,
        type: 'error'
      });
    }
  };

  // 時刻フォーマット
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 経過時間計算
  const getElapsedTime = (): string => {
    if (!sessionStartTime) return '00:00';
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 1秒ごとに経過時間を更新
  useEffect(() => {
    if (!isRecordingSession) return;
    
    const interval = setInterval(() => {
      // 強制的にコンポーネントを再レンダリング
      setSessionStartTime(prev => prev);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRecordingSession]);

  const quickDescriptions = [
    `${type === 'inspection' ? '検品' : '梱包'}開始`,
    `${type === 'inspection' ? '外観確認' : '商品梱包'}`,
    `${type === 'inspection' ? '機能確認' : '緩衝材追加'}`,
    `${type === 'inspection' ? '品質評価' : '封印・完了'}`,
    `${type === 'inspection' ? '検品完了' : '梱包完了'}`
  ];

  return (
    <NexusCard className="p-6">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Video className="w-5 h-5" />
              {type === 'inspection' ? '検品作業' : '梱包作業'}動画記録
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {phase === 'phase2' ? 'フェーズ2: 入庫検品' : 'フェーズ4: 出荷梱包'}
            </p>
          </div>
          {isRecordingSession && (
            <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-700">記録中</span>
              <span className="text-sm text-red-600">{getElapsedTime()}</span>
            </div>
          )}
        </div>

        {/* 説明テキスト */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">動画記録の仕組み</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• 防犯カメラが作業の全工程を自動録画しています</p>
            <p>• 重要なタイミングでタイムスタンプボタンを押してください</p>
            <p>• 記録したタイムスタンプから後で動画を再生できます</p>
            <p>• 動画はAmazon S3に安全に保存されます</p>
          </div>
        </div>

        {!isRecordingSession ? (
          /* セッション開始画面 */
          <div className="text-center py-8">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">記録セッションを開始</h4>
            <p className="text-gray-600 mb-6">
              {type === 'inspection' ? '検品作業' : '梱包作業'}を開始し、重要なタイミングでタイムスタンプを記録します
            </p>
            <NexusButton
              onClick={startRecordingSession}
              variant="primary"
              size="lg"
              icon={<Play className="w-5 h-5" />}
            >
              記録セッション開始
            </NexusButton>
          </div>
        ) : (
          /* 記録中画面 */
          <div className="space-y-6">
            {/* タイムスタンプ記録エリア */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                タイムスタンプ記録
              </h4>
              
              {/* 説明入力 */}
              <div className="space-y-3">
                <NexusInput
                  label="作業説明"
                  value={currentDescription}
                  onChange={(e) => setCurrentDescription(e.target.value)}
                  placeholder="今の作業内容を入力してください"
                />
                
                {/* クイック説明ボタン */}
                <div className="flex flex-wrap gap-2">
                  {quickDescriptions.map((desc) => (
                    <NexusButton
                      key={desc}
                      onClick={() => setCurrentDescription(desc)}
                      variant="default"
                      size="sm"
                    >
                      {desc}
                    </NexusButton>
                  ))}
                </div>
                
                {/* タイムスタンプ記録ボタン */}
                <NexusButton
                  onClick={recordTimestamp}
                  variant="primary"
                  size="lg"
                  disabled={!currentDescription.trim()}
                  icon={<Calendar className="w-5 h-5" />}
                  className="w-full"
                >
                  タイムスタンプ記録
                </NexusButton>
              </div>
            </div>

            {/* 記録済みタイムスタンプ */}
            {timestamps.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">記録済みタイムスタンプ ({timestamps.length}個)</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {timestamps.map((timestamp) => (
                    <div
                      key={timestamp.id}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {formatTimestamp(new Date(timestamp.timestamp))}
                        </div>
                        <p className="font-medium text-gray-900 mt-1">
                          {timestamp.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <NexusButton
                          onClick={() => playVideoAtTimestamp(timestamp)}
                          variant="secondary"
                          size="sm"
                          icon={<Play className="w-4 h-4" />}
                        >
                          再生
                        </NexusButton>
                        <NexusButton
                          onClick={() => deleteTimestamp(timestamp.id)}
                          variant="default"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4" />}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          削除
                        </NexusButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* セッション終了ボタン */}
            <div className="flex justify-end">
              <NexusButton
                onClick={endRecordingSession}
                variant="primary"
                size="lg"
                icon={<Pause className="w-5 h-5" />}
              >
                記録セッション終了
              </NexusButton>
            </div>
          </div>
        )}

        {/* 動画プレーヤー */}
        {selectedVideoPath && (
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              ref={setVideoPlayer}
              src={selectedVideoPath}
              controls
              className="w-full aspect-video"
              onLoadedMetadata={(e) => {
                // 動画読み込み完了時の処理
                console.log('Video loaded:', e.currentTarget.duration);
              }}
            />
          </div>
        )}
      </div>
    </NexusCard>
  );
} 