import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useUserStore } from '@/stores/user'
import i18n from '@/i18n'
import { globalShowToast } from '@/utils/toast'
import type { SportsBetMode, SportsBetSelection } from '@/views/sports/shared/types'
import type { BetInfoSource } from '@/views/sports/components/bet-slip/useBetInfo'

export type SelectedOutcome = {
  id: string
  matchId: string
  MarketlineId: number
  WagerSelectionId: number
  odds: number
  stake: string
  sportId: number
  eventId: number
  snapshot: SportsBetSelection
  source: BetInfoSource
}

/** 首页和赛事详情共用草稿；弹窗、报价和结果提示仍由所在页面管理。 */
export const useSportsBetSlipStore = defineStore('sportsBetSlip', () => {
  const userStore = useUserStore()
  const { currentCurrencyCode } = useDisplayCurrency()
  const memberId = computed(() => userStore.userInfo?.memberId ?? userStore.acctInfo?.memberId)
  const accountKey = computed(() => JSON.stringify([memberId.value, currentCurrencyCode.value]))
  const outcomes = ref<SelectedOutcome[]>([])
  const mode = ref<SportsBetMode>('single')
  const parlayStakes = ref<Record<string, string>>({})
  // 提交与恢复状态跨页面共享，避免另一入口重复发起操作。
  const submitting = ref(false)
  const reusing = ref(false)
  const acceptAnyOdds = ref(true)
  const oddsPreferenceKey = computed(() =>
    memberId.value ? `sports_accept_any_odds:${memberId.value}` : ''
  )
  watch(
    oddsPreferenceKey,
    key => {
      acceptAnyOdds.value = true
      if (!key) return
      try {
        acceptAnyOdds.value = localStorage.getItem(key) !== 'false'
      } catch {
        // 本地存储不可用时沿用默认值。
      }
    },
    { immediate: true, flush: 'sync' }
  )
  // 即使两个页面均已卸载，切换账号或币种也不能沿用上一份草稿。
  watch(
    [accountKey, currentCurrencyCode],
    ([, currency], [, previousCurrency]) => {
      const hadSelections = outcomes.value.length > 0
      outcomes.value = []
      parlayStakes.value = {}
      mode.value = 'single'
      if (hadSelections && currency !== previousCurrency)
        globalShowToast({ type: 'fail', message: i18n.global.t('sports.betCurrencyChanged') })
    },
    { flush: 'sync' }
  )

  return {
    accountKey,
    outcomes,
    mode,
    parlayStakes,
    submitting,
    reusing,
    acceptAnyOdds,
    oddsPreferenceKey
  }
})
