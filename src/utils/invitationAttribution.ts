const INVITATION_CODE_STORAGE_KEY = 'referral-invitation-code'

/**
 * 规范化邀请参数值。
 */
export const normalizeInvitationCode = (value: unknown) => {
  const normalizedValue = Array.isArray(value)
    ? String(value[0] ?? '').trim()
    : String(value ?? '').trim()

  if (!normalizedValue || normalizedValue === '-') {
    return ''
  }

  return normalizedValue
}

/**
 * 持久化末次归因邀请码。
 */
export const saveInvitationCode = (value: unknown) => {
  const invitationCode = normalizeInvitationCode(value)

  if (!invitationCode) {
    return
  }

  localStorage.setItem(INVITATION_CODE_STORAGE_KEY, invitationCode)
}

/**
 * 读取当前缓存的邀请码。
 */
export const getInvitationCode = () => {
  return normalizeInvitationCode(localStorage.getItem(INVITATION_CODE_STORAGE_KEY))
}

/**
 * 清除当前缓存的邀请码。
 */
export const clearInvitationCode = () => {
  localStorage.removeItem(INVITATION_CODE_STORAGE_KEY)
}
