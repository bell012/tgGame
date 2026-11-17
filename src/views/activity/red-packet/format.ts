import type {
  RedEnvelopeI18nText,
  RedEnvelopeItem,
  RedEnvelopeType
} from '@/api/interface/red-envelope'
import { getCurrencySymbol } from '@/utils/locale'

const DAILY_RED_ENVELOPE_TYPE = 1
const FALLBACK_LANGUAGE_CODE = 'zh'

const pad = (value: number) => String(value).padStart(2, '0')

/** 剩余毫秒数格式化为 HH:mm:ss（超过 99 小时按实际小时数显示）。 */
export const formatCountdown = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

/** 时间戳格式化为 MM/DD HH:mm，withSeconds 时追加秒。 */
export const formatDateTime = (timestamp?: number, withSeconds = false) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const base = `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  return withSeconds ? `${base}:${pad(date.getSeconds())}` : base
}

/** 时间戳格式化为 MM/DD/YYYY HH:mm:ss。 */
export const formatFullDateTime = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** 去掉 toFixed 末尾多余的 0，digits 为保留的小数位。 */
export const formatAmount = (value: number, digits: number) => String(Number(value.toFixed(digits)))

/** 币种符号加金额。传入 digits 时先按 formatAmount 收口。 */
export const formatMoney = (currency: string | undefined, amount: number, digits?: number) => {
  const value = digits === undefined ? amount : formatAmount(amount, digits)
  return `${getCurrencySymbol(currency)}${value}`
}

export const isDailyRedEnvelope = (item: Pick<RedEnvelopeItem, 'redEnvelopeType'>) =>
  item.redEnvelopeType === DAILY_RED_ENVELOPE_TYPE

const LOCALIZED_RED_ENVELOPE_TYPES: RedEnvelopeType[] = [1, 2, 3, 4]

// 四种红包才有本地三语文案，其余类型继续用后端字段。
export const localizedRedPacketType = (type: number): RedEnvelopeType | null =>
  LOCALIZED_RED_ENVELOPE_TYPES.includes(type as RedEnvelopeType) ? (type as RedEnvelopeType) : null

/** 统一后端与前端语言编码，避免 zh-CN / en 匹配不到。 */
export const normalizeRedEnvelopeLanguageCode = (languageCode?: string) => {
  const normalizedLanguageCode = String(languageCode ?? '')
    .trim()
    .toLowerCase()

  if (normalizedLanguageCode.startsWith('zh')) {
    return 'zh'
  }

  if (normalizedLanguageCode === 'eng' || normalizedLanguageCode.startsWith('en')) {
    return 'eng'
  }

  return normalizedLanguageCode
}

const isI18nTextItem = (value: unknown): value is RedEnvelopeI18nText =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const getI18nTextName = (item?: RedEnvelopeI18nText) => {
  const name = item?.name?.trim()
  return name || ''
}

/** 解析名称/描述字段：兼容数组、JSON 字符串、旧版纯文本。 */
export const parseRedEnvelopeI18n = (
  value?: RedEnvelopeI18nText[] | string
): RedEnvelopeI18nText[] => {
  if (Array.isArray(value)) {
    return value.filter(isI18nTextItem)
  }

  if (typeof value !== 'string') {
    return []
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (Array.isArray(parsed)) {
      return parsed.filter(isI18nTextItem)
    }
  } catch {
    // 旧版纯文本：当作任意语言都可用的单条文案。
  }

  return [{ name: trimmed }]
}

/** 取当前语言对应文案；没有命中返回空串。 */
export const pickRedEnvelopeText = (
  value: RedEnvelopeI18nText[] | string | undefined,
  languageCode?: string
) => {
  const items = parseRedEnvelopeI18n(value)
  if (!items.length) {
    return ''
  }

  const normalizedLanguageCode = normalizeRedEnvelopeLanguageCode(languageCode)
  const matched = items.find(item => {
    // 旧版纯文本没有 languageCode，任意语言都可直接用。
    if (!item.languageCode) {
      return true
    }

    return normalizeRedEnvelopeLanguageCode(item.languageCode) === normalizedLanguageCode
  })

  return getI18nTextName(matched)
}

/** 未知类型回退：优先 zh，再第一条。 */
export const pickRedEnvelopeFallbackText = (value: RedEnvelopeI18nText[] | string | undefined) => {
  const items = parseRedEnvelopeI18n(value)
  if (!items.length) {
    return ''
  }

  const zhItem = items.find(
    item => normalizeRedEnvelopeLanguageCode(item.languageCode) === FALLBACK_LANGUAGE_CODE
  )
  return getI18nTextName(zhItem) || getI18nTextName(items[0])
}

type TranslateFn = (key: string) => string

const resolveRedPacketField = (
  value: RedEnvelopeI18nText[] | string | undefined,
  redEnvelopeType: number,
  languageCode: string | undefined,
  localKeyPrefix: 'redPacketPanel.type' | 'redPacketPanel.desc',
  t: TranslateFn
) => {
  const matched = pickRedEnvelopeText(value, languageCode)
  if (matched) {
    return matched
  }

  const type = localizedRedPacketType(redEnvelopeType)
  if (type) {
    return t(`${localKeyPrefix}.${type}`)
  }

  return pickRedEnvelopeFallbackText(value)
}

/** 红包名称：后端当前语言优先 → 本地 type 文案 → zh/第一条。 */
export const resolveRedPacketName = (
  item: Pick<RedEnvelopeItem, 'redEnvelopeName' | 'redEnvelopeType'>,
  languageCode: string | undefined,
  t: TranslateFn
) =>
  resolveRedPacketField(
    item.redEnvelopeName,
    item.redEnvelopeType,
    languageCode,
    'redPacketPanel.type',
    t
  )

/** 红包描述：后端当前语言优先 → 本地 desc 文案 → zh/第一条。 */
export const resolveRedPacketDesc = (
  item: Pick<RedEnvelopeItem, 'redEnvelopeDesc' | 'redEnvelopeType'>,
  languageCode: string | undefined,
  t: TranslateFn
) =>
  resolveRedPacketField(
    item.redEnvelopeDesc,
    item.redEnvelopeType,
    languageCode,
    'redPacketPanel.desc',
    t
  )
