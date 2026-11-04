import type { RedEnvelopeItem } from '@/api/interface/red-envelope'
import { getCurrencySymbol } from '@/utils/locale'

const DAILY_RED_ENVELOPE_TYPE = 1

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
