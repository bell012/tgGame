const INVITATION_CODE_STORAGE_KEY = 'referral-invitation-code'

/**
 * 从异常 query 值中提取邀请码，例如 site=gifphcb9/?id=1000019684。
 */
const extractInvitationCodeFromNestedValue = (value: unknown) => {
  const normalizedValue = normalizeInvitationCode(value)

  if (!normalizedValue) {
    return ''
  }

  const matchedValue = normalizedValue.match(/(?:^|[?&])id=([^&#]+)/i)

  if (!matchedValue?.[1]) {
    return ''
  }

  return normalizeInvitationCode(decodeURIComponent(matchedValue[1]))
}

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
 * 从路由 query 中解析邀请码，兼容错误格式的邀请链接。
 */
export const resolveInvitationCodeFromQuery = (query: Record<string, unknown>) => {
  const directInvitationCode = normalizeInvitationCode(query.id)

  if (directInvitationCode) {
    return directInvitationCode
  }

  for (const value of Object.values(query)) {
    const nestedInvitationCode = Array.isArray(value)
      ? value.map(item => extractInvitationCodeFromNestedValue(item)).find(Boolean)
      : extractInvitationCodeFromNestedValue(value)

    if (nestedInvitationCode) {
      return nestedInvitationCode
    }
  }

  return ''
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
