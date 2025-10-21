// シンプルな共通ロガー（クライアント/サーバ両対応）

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
}

function resolveLogLevel(): LogLevel {
  const envLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL || '').toLowerCase()
  if (envLevel === 'debug' || envLevel === 'info' || envLevel === 'warn' || envLevel === 'error' || envLevel === 'silent') {
    return envLevel
  }

  if (process.env.NODE_ENV === 'development') return 'debug'
  if (process.env.NODE_ENV === 'test') return 'error'
  return 'warn'
}

const currentLevel: LogLevel = resolveLogLevel()

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel] && currentLevel !== 'silent'
}

function formatPrefix(level: LogLevel, scope: string): string {
  const ts = new Date().toISOString()
  return `[${ts}] [${level.toUpperCase()}] [${scope}]`
}

export type Logger = {
  debug: (message: string, meta?: unknown) => void
  info: (message: string, meta?: unknown) => void
  warn: (message: string, meta?: unknown) => void
  error: (message: string, meta?: unknown) => void
}

export function createLogger(scope: string): Logger {
  return {
    debug(message, meta) {
      if (!shouldLog('debug')) return
      if (meta !== undefined) {
        // eslint-disable-next-line no-console
        console.debug(formatPrefix('debug', scope), message, meta)
      } else {
        // eslint-disable-next-line no-console
        console.debug(formatPrefix('debug', scope), message)
      }
    },
    info(message, meta) {
      if (!shouldLog('info')) return
      if (meta !== undefined) {
        // eslint-disable-next-line no-console
        console.info(formatPrefix('info', scope), message, meta)
      } else {
        // eslint-disable-next-line no-console
        console.info(formatPrefix('info', scope), message)
      }
    },
    warn(message, meta) {
      if (!shouldLog('warn')) return
      if (meta !== undefined) {
        // eslint-disable-next-line no-console
        console.warn(formatPrefix('warn', scope), message, meta)
      } else {
        // eslint-disable-next-line no-console
        console.warn(formatPrefix('warn', scope), message)
      }
    },
    error(message, meta) {
      if (!shouldLog('error')) return
      if (meta !== undefined) {
        // eslint-disable-next-line no-console
        console.error(formatPrefix('error', scope), message, meta)
      } else {
        // eslint-disable-next-line no-console
        console.error(formatPrefix('error', scope), message)
      }
    },
  }
}


