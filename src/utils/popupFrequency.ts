import { getTodayKey } from './date'

export const POPUP_FREQUENCY_STORAGE_PREFIX = 'popup-frequency:v1:'
export type PopupMode = 'none' | 'daily' | 'each-login' | 'once' | 'frequent'
export type PopupPhase = 'guest' | 'authenticated'
export interface PopupFrequencyContext {
  memberId: string
  loginSessionId: string
  homeVisitId: string
}
export interface PopupFrequencyOptions extends PopupFrequencyContext {
  key: string
  mode: PopupMode
}

export const resolvePopupMode = (value: unknown, phase: PopupPhase): PopupMode => {
  if (typeof value !== 'number' && typeof value !== 'string') return 'none'
  const modes: Partial<Record<number, PopupMode>> =
    phase === 'guest'
      ? { 1: 'once', 2: 'frequent' }
      : { 1: 'daily', 2: 'each-login', 4: 'frequent' }
  return modes[Number(value)] ?? 'none'
}

// 读写失败时使用内存兜底；正常读取仍以存储为准，以便其他标签页的记录生效。
const fallback = new Map<string, string>()
const memoryOnlyKeys = new Set<string>()
const shownVisits = new Set<string>()
export const readPopupStorage = (key: string): string | null => {
  if (memoryOnlyKeys.has(key)) return fallback.get(key) ?? null
  try {
    return localStorage.getItem(key) ?? fallback.get(key) ?? null
  } catch {
    return fallback.get(key) ?? null
  }
}
export const writePopupStorage = (key: string, value: string) => {
  fallback.set(key, value)
  try {
    localStorage.setItem(key, value)
    memoryOnlyKeys.delete(key)
  } catch {
    memoryOnlyKeys.add(key)
  }
}
export const removePopupStorage = (key: string) => {
  fallback.delete(key)
  try {
    localStorage.removeItem(key)
    memoryOnlyKeys.delete(key)
  } catch {
    memoryOnlyKeys.add(key)
  }
}

const recordKey = (options: PopupFrequencyOptions) =>
  `${POPUP_FREQUENCY_STORAGE_PREFIX}${JSON.stringify([options.memberId ? `member:${options.memberId}` : 'guest', options.key, options.mode])}`

const recordValue = (options: PopupFrequencyOptions): string => {
  switch (options.mode) {
    case 'daily':
      return getTodayKey()
    case 'each-login':
      return options.memberId ? options.loginSessionId : ''
    case 'once':
      return '1'
    case 'frequent':
      return options.homeVisitId
    default:
      return ''
  }
}

export const shouldShowPopup = (options: PopupFrequencyOptions): boolean => {
  if (!options.key.trim()) return false
  const value = recordValue(options)
  if (options.mode === 'frequent') {
    return Boolean(value) && !shownVisits.has(JSON.stringify([recordKey(options), value]))
  }
  return Boolean(value) && readPopupStorage(recordKey(options)) !== value
}

/** 业务确认已打开后调用；过滤/网络请求阶段不能调用。 */
export const markPopupShown = (options: PopupFrequencyOptions): void => {
  if (!options.key.trim()) return
  const value = recordValue(options)
  if (options.mode === 'frequent') {
    if (value) shownVisits.add(JSON.stringify([recordKey(options), value]))
    return
  }
  if (value) writePopupStorage(recordKey(options), value)
}

/** 业务 ID 只能为有效的非零标识，不以空 ID 创建共享次数记录。 */
export const popupKey = (namespace: string, id: unknown): string => {
  const value = String(id ?? '').trim()
  return value && value !== '0' && value !== 'NaN' ? `${namespace}:${value}` : ''
}
