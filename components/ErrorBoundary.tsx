'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // エラーをログサービスに送信（将来拡張用）
    // logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
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

            <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
              エラーが発生しました
            </h2>

            <p className="mb-4 text-center text-gray-600">
              申し訳ございません。予期しないエラーが発生しました。
            </p>

            {this.state.error && (
              <div className="mb-4 rounded-lg bg-gray-50 p-4">
                <p className="break-all font-mono text-sm text-gray-700">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button onClick={() => window.location.reload()} className="btn-primary w-full py-3">
                ページを再読み込み
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="btn-secondary w-full py-3"
              >
                ホームに戻る
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              問題が続く場合は、システム管理者にお問い合わせください。
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
