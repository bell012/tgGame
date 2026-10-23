import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { SportsOddsType } from '@/api/interface/sport'
import { useSportsAuthStore } from './sportsAuth'
import { useUserStore } from './user'
import { useSportsBetSlipStore } from './sportsBetSlip'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { isSportsOddsType } from '@/views/sports/shared/odds'

/** 账号盘口偏好独立于 Token 生命周期；游客选择只保留在内存中。 */
export const useSportsOddsStore = defineStore('sportsOdds', () => {
  const auth = useSportsAuthStore()
  const user = useUserStore()
  const draft = useSportsBetSlipStore()
  const { currentCurrencyCode } = useDisplayCurrency()
  const preference = ref<SportsOddsType>(3)
  const memberCode = ref('')
  const locked = computed(() => draft.submitting || draft.reusing)
  const storageKey = (code: string) => `sports_odds_type:${code}`

  watch(
    () =>
      JSON.stringify([
        user.userInfo?.memberId ?? user.acctInfo?.memberId,
        Boolean(user.userInfo?.tradeToken || user.acctInfo?.memberId),
        currentCurrencyCode.value
      ]),
    () => {
      memberCode.value = ''
      preference.value = 3
    },
    { flush: 'sync' }
  )
  watch(
    () => auth.peekCredentials()?.memberCode,
    code => {
      // 刷新 Token 的短暂空凭据不清掉同账号偏好。
      if (!code || code === memberCode.value) return
      memberCode.value = code
      preference.value = 3
      try {
        const saved = Number(localStorage.getItem(storageKey(code)))
        if (isSportsOddsType(saved)) preference.value = saved
      } catch {
        // 存储不可用时保留默认值，不阻碍赛事加载。
      }
    },
    { immediate: true, flush: 'sync' }
  )
  const select = (type: SportsOddsType) => {
    if (locked.value || !isSportsOddsType(type)) return
    preference.value = type
    if (!memberCode.value) return
    try {
      localStorage.setItem(storageKey(memberCode.value), String(type))
    } catch {
      // 保存失败仍允许本次使用新盘型。
    }
  }
  return { preference, locked, select }
})
