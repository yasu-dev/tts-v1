'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, CameraOff, Mic, MicOff, StopCircle, Wifi, WifiOff } from 'lucide-react'
import { NexusButton, NexusCard } from '@/app/components/ui'
import { useToast } from '@/app/components/features/notifications/ToastProvider'

interface WebRTCVideoRecorderProps {
  productId: string
  phase: 'phase2' | 'phase4'
  type: 'inspection' | 'packing'
  onRecordingComplete?: (videoId: string) => void
}

export default function WebRTCVideoRecorder({
  productId,
  phase,
  type,
  onRecordingComplete
}: WebRTCVideoRecorderProps) {
  const { showToast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [duration, setDuration] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // デバイス状態
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  
  // ストリーミング設定
  const [streamConfig, setStreamConfig] = useState<any>(null)

  // タイマー
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording, isPaused])

  // ストリーミング設定を取得
  useEffect(() => {
    fetch('/api/streaming/server')
      .then(res => res.json())
      .then(data => {
        setStreamConfig(data)
        setIsConnected(true)
      })
      .catch(err => {
        console.error('Failed to get streaming config:', err)
        showToast({ title: 'ストリーミング設定の取得に失敗しました', type: 'error' })
      })
  }, [showToast])

  // カメラとマイクの初期化
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment'
        },
        audio: true
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      return stream
    } catch (error) {
      console.error('Media initialization error:', error)
      showToast({ title: 'カメラまたはマイクへのアクセスが拒否されました', type: 'error' })
      throw error
    }
  }

  // 録画開始
  const startRecording = async () => {
    try {
      const stream = streamRef.current || await initializeMedia()
      
      // ストリーミングセッション作成
      const sessionRes = await fetch('/api/streaming/server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, productId, phase })
      })
      
      const sessionData = await sessionRes.json()
      setSessionId(sessionData.session.id)
      
      // MediaRecorder設定
      const options = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 3000000 // 3 Mbps
      }
      
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      
      // チャンク受信時の処理
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          
          // リアルタイムでサーバーに送信
          const formData = new FormData()
          formData.append('chunk', event.data)
          formData.append('timestamp', new Date().toISOString())
          formData.append('isLastChunk', 'false')
          
          fetch(`/api/videos/stream/${sessionData.session.id}`, {
            method: 'POST',
            body: formData
          }).catch(err => console.error('Chunk upload error:', err))
        }
      }
      
      // 録画停止時の処理
      mediaRecorder.onstop = async () => {
        // 最後のチャンクを送信
        const lastChunk = new Blob(chunksRef.current, { type: 'video/webm' })
        const formData = new FormData()
        formData.append('chunk', lastChunk)
        formData.append('timestamp', new Date().toISOString())
        formData.append('isLastChunk', 'true')
        
        try {
          const res = await fetch(`/api/videos/stream/${sessionData.session.id}`, {
            method: 'POST',
            body: formData
          })
          
          const result = await res.json()
          if (result.success) {
            showToast({ title: '動画の保存が完了しました', type: 'success' })
            onRecordingComplete?.(result.videoId)
          }
        } catch (error) {
          console.error('Final upload error:', error)
          showToast({ title: '動画の保存に失敗しました', type: 'error' })
        }
        
        chunksRef.current = []
      }
      
      // 録画開始（1秒ごとにチャンクを生成）
      mediaRecorder.start(1000)
      setIsRecording(true)
      showToast({ title: '録画を開始しました', type: 'success' })
      
    } catch (error) {
      console.error('Recording start error:', error)
      showToast({ title: '録画の開始に失敗しました', type: 'error' })
    }
  }

  // 録画停止
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setDuration(0)
    }
  }

  // カメラのオン/オフ
  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn
        setIsCameraOn(!isCameraOn)
      }
    }
  }

  // マイクのオン/オフ
  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isMicOn
        setIsMicOn(!isMicOn)
      }
    }
  }

  // 時間フォーマット
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <NexusCard className="p-6">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {type === 'inspection' ? '検品作業' : '梱包作業'}動画記録
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {phase === 'phase2' ? 'フェーズ2: 入庫' : 'フェーズ4: 出荷'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-gray-600">
              {isConnected ? 'ストリーミング接続中' : '未接続'}
            </span>
          </div>
        </div>

        {/* ビデオプレビュー */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-medium">録画中</span>
              <span className="text-sm">{formatTime(duration)}</span>
            </div>
          )}
          
          {!isCameraOn && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <CameraOff className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* コントロール */}
        <div className="flex items-center justify-center gap-4">
          {/* カメラトグル */}
          <NexusButton
            onClick={toggleCamera}
            variant={isCameraOn ? 'secondary' : 'danger'}
            size="lg"
            className="rounded-full p-3"
          >
            {isCameraOn ? <Camera className="h-6 w-6" /> : <CameraOff className="h-6 w-6" />}
          </NexusButton>

          {/* 録画ボタン */}
          {!isRecording ? (
            <NexusButton
              onClick={startRecording}
              variant="danger"
              size="lg"
              className="rounded-full px-8 py-3"
              disabled={!isConnected}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full" />
                <span>録画開始</span>
              </div>
            </NexusButton>
          ) : (
            <NexusButton
              onClick={stopRecording}
              variant="secondary"
              size="lg"
              className="rounded-full px-8 py-3"
            >
              <div className="flex items-center gap-2">
                <StopCircle className="h-5 w-5" />
                <span>録画停止</span>
              </div>
            </NexusButton>
          )}

          {/* マイクトグル */}
          <NexusButton
            onClick={toggleMic}
            variant={isMicOn ? 'secondary' : 'danger'}
            size="lg"
            className="rounded-full p-3"
          >
            {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </NexusButton>
        </div>

        {/* 録画情報 */}
        {sessionId && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">セッションID:</span>
                <span className="ml-2 font-mono">{sessionId}</span>
              </div>
              <div>
                <span className="text-gray-500">録画品質:</span>
                <span className="ml-2">1080p 30fps</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </NexusCard>
  )
} 