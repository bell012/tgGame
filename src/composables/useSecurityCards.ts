import type { Component } from 'vue'
import { computed, type Ref } from 'vue'
import type { StoredProfileUserInfo } from '@/utils/profile-customization'
import PasswordIcon from '@/static/svg/security/password.svg?component'
import MobileIcon from '@/static/svg/security/mobile.svg?component'

export type SecurityCardKey = 'loginPassword' | 'transactionPassword' | 'mobile'

/**
 * 安全页卡片状态：与 userInfo 字段对应
 * - memberPwd：登录密码
 * - busiPwd：交易密码
 * - telephone：手机号码
 */
export function useSecurityCards(userInfo: Ref<StoredProfileUserInfo | null | undefined>) {
  const cards = computed(() => {
    const u = userInfo.value
    const memberPwd = String(u?.memberPwd ?? '').trim()
    const busiPwd = String(u?.busiPwd ?? '').trim()
    const telephone = String(u?.telephone ?? '').trim()
    console.log(memberPwd, busiPwd, telephone, 'memberPwd, busiPwd, telephone')
    return [
      { cardKey: 'loginPassword' as const, icon: PasswordIcon, active: memberPwd.length > 0 },
      { cardKey: 'transactionPassword' as const, icon: PasswordIcon, active: busiPwd.length > 0 },
      { cardKey: 'mobile' as const, icon: MobileIcon, active: telephone.length > 0 }
    ] as { cardKey: SecurityCardKey; icon: Component; active: boolean }[]
  })

  const displayMobile = computed(() => {
    const tel = userInfo.value?.telephone
    const areaCode = userInfo.value?.areaCode
    if (tel && String(tel).trim()) {
      return `+${areaCode} ${tel}`
    }
    return '—'
  })

  return { cards, displayMobile }
}
