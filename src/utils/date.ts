import { getLanguageCode } from './locale'

const DATE_TIME_FORMAT_LOCALE_MAP: Record<string, string> = {
  zh: 'zh-CN',
  eng: 'en-US'
}

const DISPLAY_TIME_LABEL_MAP: Record<
  string,
  {
    justNow: string
    today: string
    yesterday: string
  }
> = {
  zh: {
    justNow: '刚刚',
    today: '今天',
    yesterday: '昨天'
  },
  eng: {
    justNow: 'Just now',
    today: 'Today',
    yesterday: 'Yesterday'
  }
}

const getDateTimeLocale = () => {
  const languageCode = getLanguageCode()

  return {
    languageCode,
    locale: DATE_TIME_FORMAT_LOCALE_MAP[languageCode] || DATE_TIME_FORMAT_LOCALE_MAP.eng,
    labels: DISPLAY_TIME_LABEL_MAP[languageCode] || DISPLAY_TIME_LABEL_MAP.eng
  }
}

/** 本地日期键 YYYY-MM-DD：用于「每日一次」类弹窗的去重 */
export const getTodayKey = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isChineseLanguage = (languageCode: string) => languageCode === 'zh'

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()

const getFormattedDatePart = (date: Date, locale: string, options: Intl.DateTimeFormatOptions) => {
  return new Intl.DateTimeFormat(locale, options).format(date)
}

const getTwoDigitNumber = (value: number) => String(value).padStart(2, '0')

const formatDisplayClockTime = (date: Date, locale: string, languageCode: string) => {
  if (isChineseLanguage(languageCode)) {
    return `${getTwoDigitNumber(date.getHours())}:${getTwoDigitNumber(date.getMinutes())}`
  }

  const parts = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).formatToParts(date)

  const partMap = parts.reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value
    }
    return acc
  }, {})

  const time = `${partMap.hour ?? '00'}:${partMap.minute ?? '00'}`

  return partMap.dayPeriod ? `${time} ${partMap.dayPeriod}` : time
}

const formatDisplayDateTime = (date: Date, locale: string, languageCode: string) => {
  if (isChineseLanguage(languageCode)) {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${formatDisplayClockTime(date, locale, languageCode)}`
  }

  const month = getFormattedDatePart(date, locale, { month: 'short' })
  const day = getTwoDigitNumber(date.getDate())
  const year = String(date.getFullYear())

  return `${month} ${day}, ${year}, ${formatDisplayClockTime(date, locale, languageCode)}`
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

// 13位时间戳转换  月/日/年 + 12小时制 + AM/PM 格式化函数
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

  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })

  const parts = formatter.formatToParts(date)
  const partMap = parts.reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value
    }
    return acc
  }, {})

  return `${partMap.month ?? '00'}/${partMap.day ?? '00'}/${partMap.year ?? '0000'} ${partMap.hour ?? '00'}:${partMap.minute ?? '00'}:${partMap.second ?? '00'} ${partMap.dayPeriod ?? ''}`.trim()
}

/** ISO 字符串、数字时间戳（秒/毫秒）等 → Date */
const coerceToDate = (value: unknown): Date | null => {
  if (value === null || value === undefined) {
    return null
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  const s = String(value).trim()
  if (!s) {
    return null
  }
  const ts = normalizeTimestamp(s)
  if (ts != null) {
    const d = new Date(ts)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const parsed = Date.parse(s)
  if (!Number.isFinite(parsed)) {
    return null
  }
  const d = new Date(parsed)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * 固定 US 展示：12/18/2026 11:14:15 AM（与接口 ISO 或时间戳兼容）
 */
export const formatUsDateTime12h = (value?: number | string | null): string => {
  const date = coerceToDate(value)
  if (!date) {
    return '--'
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    hourCycle: 'h12'
  })

  const parts = formatter.formatToParts(date)
  const partMap = parts.reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value
    }
    return acc
  }, {})

  return `${partMap.month ?? '00'}/${partMap.day ?? '00'}/${partMap.year ?? '0000'} ${partMap.hour ?? '00'}:${partMap.minute ?? '00'}:${partMap.second ?? '00'} ${partMap.dayPeriod ?? ''}`.trim()
}

// 展示层时间格式：刚刚 / 今天 / 昨天 / 具体日期。
export const formatDisplayTime = (value?: number | string | null): string => {
  const timestamp = normalizeTimestamp(value)
  const { languageCode, locale, labels } = getDateTimeLocale()

  if (!timestamp) {
    return labels.justNow
  }

  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return labels.justNow
  }

  const now = new Date()
  const elapsedMs = now.getTime() - date.getTime()

  if (elapsedMs >= 0 && elapsedMs < 5 * 60 * 1000) {
    return labels.justNow
  }

  if (isSameDay(date, now)) {
    return `${labels.today} ${formatDisplayClockTime(date, locale, languageCode)}`
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  if (isSameDay(date, yesterday)) {
    return `${labels.yesterday} ${formatDisplayClockTime(date, locale, languageCode)}`
  }

  return formatDisplayDateTime(date, locale, languageCode)
}
