import { computed, onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useSportsAuthStore } from '@/stores/sportsAuth'
import { useSportsStore } from '@/stores/sports'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import Api from '@/api'
import type { SportsBetHistoryWager } from '@/api/interface/sport'
import { globalShowToast } from '@/utils/toast'
import { canCashOut } from './shared'

/** 两端只共享提交动作；确认界面分别由 PC 卡片和 H5 底部弹层承载。 */
export const useHistoryCashOut = (onAccepted: (wager: SportsBetHistoryWager) => void) => {
  const { t } = useI18n()
  const auth = useSportsAuthStore()
  const sports = useSportsStore()
  const site = useSiteConfigStore()
  const user = useUserStore()
  const { currentCurrencyCode } = useDisplayCurrency()
  const owner = computed(() =>
    JSON.stringify([
      user.userInfo?.tradeToken,
      user.userInfo?.memberId,
      user.acctInfo?.memberId,
      currentCurrencyCode.value,
      sports.languageCode
    ])
  )
  const selected = ref<SportsBetHistoryWager | null>(null)
  const submitting = ref(false)
  let generation = 0
  const close = () => {
    if (submitting.value) return
    generation += 1
    selected.value = null
  }
  const open = (wager: SportsBetHistoryWager) => {
    if (submitting.value || !canCashOut(wager)) return
    generation += 1
    selected.value = wager
  }
  watch(
    owner,
    () => {
      generation += 1
      selected.value = null
    },
    { flush: 'sync' }
  )
  onScopeDispose(() => {
    generation += 1
  })

  const submit = async () => {
    const wager = selected.value
    if (!wager || submitting.value || !canCashOut(wager)) return
    const version = generation
    const account = owner.value
    let context: number | undefined
    let finish: ReturnType<typeof sports.beginSportsBalanceUpdate> | undefined
    const current = () =>
      version === generation &&
      account === owner.value &&
      selected.value === wager &&
      (context === undefined || context === auth.contextVersion)
    submitting.value = true
    try {
      await site.initSiteConfig()
      if (!current()) return
      const baseUrl = site.getConfigString('IM.im_app_url')
      if (!baseUrl) throw new Error('Sports gateway unavailable')
      context = auth.contextVersion
      const credentials = await auth.ensureCredentials()
      if (!current()) return
      if (!credentials || !auth.isCredentialsCurrent(credentials))
        throw new Error('Sports credentials unavailable')
      finish = sports.beginSportsBalanceUpdate(credentials)
      const response = await Api.sport.submitBuyBack(baseUrl, {
        WagerId: wager.wid,
        BuyBackPricing: Number(wager.bbp),
        PricingId: wager.prid ?? '',
        LanguageCode: sports.languageCode,
        MemberCode: credentials.memberCode,
        Token: credentials.token
      })
      const code = Number(response.stc ?? response.code)
      if ([102, 202].includes(code)) auth.clearCredentials(credentials)
      if (code === 100) {
        finish({ refresh: true })
        void user.refreshBalance({ force: true })
      }
      if (!current()) return
      if (code === 100) {
        // 只标记请求已受理；是否已兑现仍由重新查询得到的 bts/bss 确认。
        selected.value = null
        onAccepted(wager)
        globalShowToast({ type: 'success', message: t('betDetails.buyBackSuccess') })
      } else {
        globalShowToast({
          type: 'fail',
          message: response.std || t('betDetails.buyBackSubmitFailed')
        })
      }
    } catch {
      if (current()) globalShowToast({ type: 'fail', message: t('betDetails.buyBackSubmitFailed') })
    } finally {
      finish?.()
      submitting.value = false
    }
  }
  return { selected, submitting, open, close, submit }
}
