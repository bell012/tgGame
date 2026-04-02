import { getLanguageCode } from './locale'

const DATE_TIME_FORMAT_LOCALE_MAP: Record<string, string> = {
  zh: 'zh-CN',
  eng: 'en-US'
}

export const normalizeTimestamp = (value?: number | string | null): number | null => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numericValue = typeof value === 'string' ? Number(value) : value

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null
  }

  return numericValue < 1_000_000_000_000 ? numericValue * 1000 : numericValue
}

// 13位时间戳转换
export const formatTimestamp = (value?: number | string | null): string => {
  const timestamp = normalizeTimestamp(value)

  if (!timestamp) {
    return '--'
  }

  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return '--'
  }

  const languageCode = getLanguageCode()
  const locale = DATE_TIME_FORMAT_LOCALE_MAP[languageCode] || DATE_TIME_FORMAT_LOCALE_MAP.eng

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}
