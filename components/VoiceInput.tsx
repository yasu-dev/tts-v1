'use client'

import { useState, useEffect, useRef } from 'react'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  placeholder?: string
}

export default function VoiceInput({ onTranscript, placeholder = '音声入力のテキストがここに表示されます' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Web Speech API の対応チェック
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.lang = 'ja-JP'
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onresult = (event: any) => {
          const result = event.results[0][0].transcript
          setTranscript(result)
          onTranscript(result)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [onTranscript])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
        <p className="text-sm">お使いのブラウザは音声入力に対応していません</p>
        <p className="text-xs mt-1">Chrome または Edge をご利用ください</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {!isListening ? (
          <button
            onClick={startListening}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            🎤 音声入力開始
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2 animate-pulse"
          >
            ⏹ 停止
          </button>
        )}
      </div>

      {transcript && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">認識結果:</p>
          <p className="text-lg font-bold text-gray-800">{transcript}</p>
        </div>
      )}

      {isListening && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800 text-center">🎤 聞き取り中...</p>
        </div>
      )}

      {!transcript && !isListening && (
        <p className="text-xs text-gray-500 text-center">{placeholder}</p>
      )}
    </div>
  )
}
