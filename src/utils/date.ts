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
