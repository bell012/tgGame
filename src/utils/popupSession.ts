import { readPopupStorage, writePopupStorage, removePopupStorage } from './popupFrequency'

const SESSION_KEY = 'popup-login-session:v1'
export const createPopupId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

export const startPopupLoginSession = (memberId: string): string => {
  if (!memberId) return ''
  const id = createPopupId()
  writePopupStorage(SESSION_KEY, JSON.stringify({ memberId, id }))
  return id
}

/** 升级时已登录的用户首次获取时补建；刷新继续使用原会话，无需保存 token。 */
export const getPopupLoginSession = (memberId: string): string => {
  if (!memberId) return ''
  try {
    const saved = JSON.parse(readPopupStorage(SESSION_KEY) ?? 'null')
    if (saved?.memberId === memberId && typeof saved.id === 'string' && saved.id) return saved.id
  } catch {
    /* 损坏记录重新创建。 */
  }
  return startPopupLoginSession(memberId)
}

export const clearPopupLoginSession = () => removePopupStorage(SESSION_KEY)
