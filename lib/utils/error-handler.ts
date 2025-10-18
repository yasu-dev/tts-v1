// エラーハンドリングユーティリティ

export class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NetworkError extends AppError {
  constructor(message = 'ネットワークエラーが発生しました') {
    super(message, 'NETWORK_ERROR', 0)
    this.name = 'NetworkError'
  }
}

export class AuthError extends AppError {
  constructor(message = '認証エラーが発生しました') {
    super(message, 'AUTH_ERROR', 401)
    this.name = 'AuthError'
  }
}

export class ValidationError extends AppError {
  constructor(message = '入力内容に誤りがあります') {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'データが見つかりませんでした') {
    super(message, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

/**
 * エラーメッセージをユーザーフレンドリーな形式に変換
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    // Supabaseエラーメッセージの変換
    if (error.message.includes('JWT')) {
      return 'セッションの有効期限が切れました。再度ログインしてください。'
    }
    if (error.message.includes('Network')) {
      return 'ネットワーク接続を確認してください。'
    }
    if (error.message.includes('duplicate key')) {
      return 'このデータは既に登録されています。'
    }
    if (error.message.includes('Foreign key violation')) {
      return '関連するデータが見つかりません。'
    }

    return error.message
  }

  return '予期しないエラーが発生しました。'
}

/**
 * エラーログを記録（開発環境のみ）
 */
export function logError(error: unknown, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error)
    if (context) {
      console.error('Context:', context)
    }
  }

  // 本番環境では外部ログサービスに送信
  // if (process.env.NODE_ENV === 'production') {
  //   sendToLogService(error, context)
  // }
}

/**
 * エラーをキャッチして処理
 */
export async function handleAsyncError<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<[T | null, Error | null]> {
  try {
    const result = await fn()
    return [result, null]
  } catch (error) {
    logError(error)
    const message = errorMessage || formatErrorMessage(error)
    return [null, new Error(message)]
  }
}

/**
 * リトライ処理付きの非同期関数実行
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delayMs?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, onRetry } = options

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt, lastError)
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
      }
    }
  }

  throw lastError
}

/**
 * オフライン状態を検知
 */
export function isOffline(): boolean {
  return typeof window !== 'undefined' && !window.navigator.onLine
}

/**
 * エラーの種類を判定
 */
export function getErrorType(error: unknown): 'network' | 'auth' | 'validation' | 'not_found' | 'unknown' {
  if (error instanceof NetworkError || isOffline()) {
    return 'network'
  }
  if (error instanceof AuthError) {
    return 'auth'
  }
  if (error instanceof ValidationError) {
    return 'validation'
  }
  if (error instanceof NotFoundError) {
    return 'not_found'
  }
  return 'unknown'
}
