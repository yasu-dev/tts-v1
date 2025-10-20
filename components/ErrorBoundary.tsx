'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーをログサービスに送信（将来拡張用）
    // logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              エラーが発生しました
            </h2>

            <p className="text-gray-600 text-center mb-4">
              申し訳ございません。予期しないエラーが発生しました。
            </p>

            {this.state.error && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-mono text-gray-700 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary w-full py-3"
              >
                ページを再読み込み
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="btn-secondary w-full py-3"
              >
                ホームに戻る
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              問題が続く場合は、システム管理者にお問い合わせください。
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
