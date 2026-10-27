import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import type { SportsOddsType } from '@/api/interface/sport'
import { useSportsAuthStore } from './sportsAuth'
import { useUserStore } from './user'
import { useSportsBetSlipStore } from './sportsBetSlip'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { isSportsOddsType } from '@/views/sports/shared/odds'
import { stripLocalePrefix } from '@/utils/locale'

/** 盘型仅在本次体育访问期间共享；刷新页面或离开体育后恢复欧洲盘。 */
export const useSportsOddsStore = defineStore('sportsOdds', () => {
  const router = useRouter()
  const auth = useSportsAuthStore()
  const user = useUserStore()
  const draft = useSportsBetSlipStore()
  const { currentCurrencyCode } = useDisplayCurrency()
  const preference = ref<SportsOddsType>(3)
  const memberCode = ref('')
  const locked = computed(() => draft.submitting || draft.reusing)

  watch(
    () => {
      const path = stripLocalePrefix(router.currentRoute.value.path)
      return path === '/sports' || path.startsWith('/sports/')
    },
    (isSportsRoute, wasSportsRoute) => {
      if (wasSportsRoute && !isSportsRoute) preference.value = 3
    },
    { flush: 'sync' }
  )

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
    },
    { immediate: true, flush: 'sync' }
  )
  const select = (type: SportsOddsType) => {
    if (locked.value || !isSportsOddsType(type)) return
    preference.value = type
  }
  return { preference, locked, select }
})
