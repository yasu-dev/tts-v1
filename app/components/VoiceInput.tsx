'use client'

import { useState, useRef } from 'react'

interface VoiceInputProps {
  onTranscript: (text: string) => void
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('音声認識は未対応のブラウザです')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()

    recognitionRef.current.lang = 'ja-JP'
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript + interimTranscript)
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
    }

    recognitionRef.current.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleConfirm = () => {
    onTranscript(transcript)
    setTranscript('')
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        className={`w-full py-8 rounded-lg text-xl font-bold transition-all $${
          isRecording
            ? 'bg-red-500 text-white animate-pulse scale-105'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isRecording ? '🎤 録音中... (離すと停止)' : '🎤 長押しして話す'}
      </button>

      {transcript && (
        <div className="mt-4 bg-white p-4 rounded-lg">
          <p className="text-sm text-gray-500 mb-2">音声認識結果:</p>
          <p className="text-lg mb-4">{transcript}</p>

          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600"
            >
              確定
            </button>
            <button
              onClick={() => setTranscript('')}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
            >
              クリア
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
