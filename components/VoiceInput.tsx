'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
}

// Web Speech API 型定義（DOM lib に未含のためローカル定義）
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike> & {
    [index: number]: ArrayLike<{ transcript: string }>;
  };
}
interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export default function VoiceInput({
  onTranscript,
  placeholder: _placeholder = '音声入力のテキストがここに表示されます',
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    // Web Speech API の対応チェック
    if (typeof window !== 'undefined') {
      const w = window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ja-JP';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          const result = event.results[0][0].transcript;
          setTranscript(result);
          onTranscript(result);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
          setIsListening(false);
          const errorMsg =
            event.error === 'no-speech'
              ? '音声が認識されませんでした。もう一度お試しください。'
              : event.error === 'network'
                ? 'ネットワークエラーが発生しました。'
                : event.error === 'not-allowed'
                  ? 'マイクのアクセス許可が必要です。'
                  : '音声認識エラーが発生しました。';
          setError(errorMsg);
          setTimeout(() => setError(''), 5000);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onstart = () => {};

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (_error) {
        setError('音声認識を開始できませんでした。');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="rounded border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800">
        <p className="text-sm">お使いのブラウザは音声入力に対応していません</p>
        <p className="mt-1 text-xs">Chrome または Edge をご利用ください</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {!isListening ? (
          <button
            type="button"
            onClick={startListening}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
          >
            音声入力開始
          </button>
        ) : (
          <button
            type="button"
            onClick={stopListening}
            className="flex flex-1 animate-pulse items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
          >
            停止
          </button>
        )}
      </div>

      {transcript && (
        <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4">
          <p className="mb-1 text-sm font-bold text-green-700">
            認識成功（メモ欄に追加されました）:
          </p>
          <p className="text-lg font-bold text-gray-800">{transcript}</p>
        </div>
      )}

      {isListening && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-center text-sm font-bold text-blue-800">聞き取り中...話してください</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-center text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
