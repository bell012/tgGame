import type { Component } from 'vue'
import { computed, type Ref } from 'vue'
import type { StoredProfileUserInfo } from '@/utils/profile-customization'
import PasswordIcon from '@/static/svg/security/password.svg?component'
import MobileIcon from '@/static/svg/security/mobile.svg?component'

export type SecurityCardKey = 'loginPassword' | 'transactionPassword' | 'mobile'

/**
 * 根据 userInfo 生成安全设置卡片状态。
 */
export function useSecurityCards(userInfo: Ref<StoredProfileUserInfo | null | undefined>) {
  const cards = computed(() => {
    const u = userInfo.value
    const memberPwd = String(u?.memberPwd ?? '').trim()
    const busiPwd = String(u?.busiPwd ?? '').trim()
    const telephone = String(u?.telephone ?? '').trim()
    const areaCode = String(u?.areaCode ?? '').trim()

    return [
      { cardKey: 'loginPassword' as const, icon: PasswordIcon, active: memberPwd.length > 0 },
      { cardKey: 'transactionPassword' as const, icon: PasswordIcon, active: busiPwd.length > 0 },
      {
        cardKey: 'mobile' as const,
        icon: MobileIcon,
        active: areaCode.length > 0 && telephone.length > 0
      }
    ] as { cardKey: SecurityCardKey; icon: Component; active: boolean }[]
  })

  const displayMobile = computed(() => {
    const tel = String(userInfo.value?.telephone ?? '').trim()
    const areaCode = String(userInfo.value?.areaCode ?? '').trim()

    if (tel && areaCode) {
      return `+${areaCode} ${tel}`
    }

    return '--'
  })

  return { cards, displayMobile }
}
