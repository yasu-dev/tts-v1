/**
 * 安全な日付フォーマット関数
 * Invalid Dateを防ぎ、適切なフォールバック表示を提供
 */
export function formatDate(
  dateString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleString('ja-JP', options)
  } catch {
    return ''
  }
}

/**
 * 日時フォーマット（フル）
 */
export function formatDateTime(dateString: string | null | undefined): string {
  return formatDate(dateString)
}

/**
 * 時刻のみフォーマット
 */
export function formatTime(dateString: string | null | undefined): string {
  return formatDate(dateString, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 日付のみフォーマット
 */
export function formatDateOnly(dateString: string | null | undefined): string {
  return formatDate(dateString, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * 短い日時フォーマット（月日時分）
 */
export function formatShortDateTime(dateString: string | null | undefined): string {
  return formatDate(dateString, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}