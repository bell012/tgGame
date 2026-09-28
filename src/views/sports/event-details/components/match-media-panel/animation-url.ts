const ANIMATION_LANGUAGE_CODE: Record<string, string> = {
  eng: 'en',
  pt_BR: 'pt',
  vn: 'vi',
  fil: 'fi'
}

/** 站内语言码转换为动画页 language 参数。 */
export const animationLanguageCode = (code: string) => ANIMATION_LANGUAGE_CODE[code] ?? code

/** 拼接动画页地址；缺域名或 BREventId 时返回空字符串。 */
export function buildAnimationUrl(baseUrl: string, brEventId: number, language: string): string {
  const origin = baseUrl.trim().replace(/\/+$/, '')
  if (!origin || !Number.isSafeInteger(brEventId) || brEventId < 0) {
    return ''
  }
  const params = new URLSearchParams({ matchId: String(brEventId), language })
  return `${origin}/liveSport.html?${params.toString()}`
}
