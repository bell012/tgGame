<template>
  <!-- 提前结算弹窗 -->
  <Teleport to="body">
    <Transition name="bottom-sheet">
      <div
        v-if="props.visible && props.wager"
        :class="[
          'sports-buy-back-overlay fixed inset-0 z-[1000] flex justify-center bg-mask-60-1',
          isMobile ? 'items-end' : 'items-center'
        ]"
        @click="closeBuyBackSheet"
      >
        <section
          :class="[
            'sports-buy-back-sheet w-full overflow-y-auto overscroll-contain bg-bg-1',
            isMobile
              ? 'max-h-[calc(100dvh-33px)] rounded-t-[12px] px-[14px] pb-[calc(env(safe-area-inset-bottom)+18px)]'
              : 'max-h-[calc(100dvh-64px)] max-w-[520px] rounded-[12px] px-4 pb-5'
          ]"
          @click.stop
        >
          <header class="flex items-center justify-center py-[10px]">
            <h2 class="min-w-0 flex-1 text-center text-[16px] font-[700] text-text-1">
              {{ t('betHistory.earlySettlement') }}
            </h2>
            <button
              type="button"
              class="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] bg-opacity-10"
              @click="closeBuyBackSheet"
            >
              <CloseIcon class="h-2.5 w-2.5 text-text-1" />
            </button>
          </header>

          <div class="mt-3.5">
            <h3 class="text-[14px] font-[700] text-text-1">{{ betDetail.matchName }}</h3>
            <p class="mt-2 text-[12px] font-[400] text-text-2">{{ betDetail.leagueName }}</p>
            <p class="mt-2 text-[12px] font-[400] text-text-2">{{ betDetail.createdAt }}</p>
          </div>

          <section class="mt-[8px] rounded-lg bg-bg-4 p-3.5">
            <p class="text-[14px] font-[400] text-text-2">{{ betDetail.marketName }}</p>
            <p class="mt-[8px] text-[14px] font-[400] text-text-1">
              {{ betDetail.selectionName }}
              <span v-if="betDetail.handicapText" class="ml-1">
                {{ betDetail.handicapText }}
              </span>
              <span class="ml-2">{{ betDetail.oddsText }}</span>
            </p>
            <button
              type="button"
              class="mt-3.5 text-[14px] font-[400] text-theme-primary disabled:opacity-60"
              :disabled="isSubmittingBuyBack"
              @click="submitBuyBack"
            >
              {{ t('betDetails.confirm') }}
            </button>
          </section>

          <section class="mt-2 space-y-5 rounded-lg bg-bg-4 p-3.5">
            <div class="flex items-center justify-between gap-4">
              <span class="text-[14px] font-[400] text-text-3">
                {{ t('betDetails.currency') }}
              </span>
              <span class="text-right text-[14px] font-[400] text-text-1">
                {{ betDetail.currency }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-[14px] font-[400] text-text-3">
                {{ t('betHistory.betAmount') }}
              </span>
              <span class="text-right text-[14px] font-[400] text-text-1">
                {{ betDetail.betAmount }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-[14px] font-[400] text-text-3">
                {{ t('betDetails.winLoss') }}
              </span>
              <span class="text-right text-[14px] font-[400] text-text-1">
                {{ betDetail.winLossText }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-[14px] font-[400] text-text-3">
                {{ t('betDetails.orderNo') }}
              </span>
              <div class="flex min-w-0 items-center gap-1">
                <span class="min-w-0 truncate text-right text-[14px] font-[400] text-text-1">
                  {{ betDetail.orderNo }}
                </span>
                <button type="button" class="shrink-0 p-1" @click="copyOrderNo">
                  <CopyIcon class="h-4 w-4 text-icon-2" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-[14px] font-[400] text-text-3">
                {{ t('betDetails.createdAt') }}
              </span>
              <span class="text-right text-[14px] font-[400] text-text-1">
                {{ betDetail.createdAt }}
              </span>
            </div>

            <div class="flex justify-end">
              <span class="text-right text-[14px] font-[400] text-text-1">
                {{ betDetail.oddsTypeLabel }}
              </span>
            </div>
          </section>

          <button
            type="button"
            class="mt-[30px] flex h-[40px] w-full items-center justify-center rounded-lg bg-theme-primary text-[14px] font-[400] text-text-4 disabled:opacity-60"
            :disabled="isSubmittingBuyBack"
            @click="submitBuyBack"
          >
            {{ t('common.confirm') }}
          </button>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useIsMobile } from '@/composables/useMediaQuery'
import { formatUsDateTime12h } from '@/utils/date'
import { globalShowToast } from '@/utils/toast'
import type { SportsBetHistoryWager } from '@/api/interface/sport'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useSportsStore } from '@/stores/sports'
import { useSportsAuthStore } from '@/stores/sportsAuth'
import { useUserStore } from '@/stores/user'
import CopyIcon from '@/static/svg/copy.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'

type SportsBuyBackDetail = {
  matchName: string
  leagueName: string
  marketName: string
  selectionName: string
  handicapText: string
  oddsText: string
  currency: string
  betAmount: string
  winLossText: string
  orderNo: string
  createdAt: string
  oddsTypeLabel: string
}

const props = defineProps<{
  visible: boolean
  wager?: SportsBetHistoryWager | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: [wager: SportsBetHistoryWager]
}>()

const { t } = useI18n()
const isMobile = useIsMobile()
const { currentCurrencyCode } = useDisplayCurrency()
const siteConfigStore = useSiteConfigStore()
const sportsStore = useSportsStore()
const { languageCode } = storeToRefs(sportsStore)
const sportsAuth = useSportsAuthStore()
const userStore = useUserStore()
const getCredentialOwner = () =>
  JSON.stringify([
    userStore.userInfo?.tradeToken,
    userStore.userInfo?.memberId,
    userStore.acctInfo?.memberId,
    currentCurrencyCode.value,
    languageCode.value
  ])
let submissionGeneration = 0
watch(
  () => [props.visible, props.wager?.wid],
  () => {
    submissionGeneration += 1
  },
  { flush: 'sync' }
)
onScopeDispose(() => {
  submissionGeneration += 1
})

const isSubmittingBuyBack = ref(false)
const sportsOddsTypeI18nKeys: Record<string, string> = {
  '1': 'betDetails.oddsTypes.malay',
  '2': 'betDetails.oddsTypes.hongKong',
  '3': 'betDetails.oddsTypes.europe',
  '4': 'betDetails.oddsTypes.indonesia'
}

// 转成数字，兼容接口返回字符串、空值或 null。
const toSportsBetNumber = (value: number | string | null | undefined) => {
  const numericValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

// 金额展示统一保留两位小数。
const formatSportsBetAmount = (value: number | string | null | undefined) => {
  const fixed = toSportsBetNumber(value).toFixed(2)
  return fixed.endsWith('.00') ? fixed.slice(0, -3) : fixed
}

// 赔率按接口原始数字展示，避免强制补零影响体育赔率阅读。
const formatSportsBetOdds = (value: number | string | null | undefined) => {
  const numericValue = toSportsBetNumber(value)
  return numericValue ? String(numericValue) : '--'
}

// 根据接口金额字段判断注单是否已结算。
const isSportsBetSettled = (item: SportsBetHistoryWager) =>
  toSportsBetNumber(item.btbba) > 0 || toSportsBetNumber(item.mwla) !== 0

// 未结算取 pp，已结算取 btbba；btbba 为 0 时回退 mwla。
const getSportsBetResultAmount = (item: SportsBetHistoryWager) =>
  isSportsBetSettled(item) ? (toSportsBetNumber(item.btbba) > 0 ? item.btbba : item.mwla) : item.pp

// 生成带正负号的输赢金额文本。
const formatWinLossText = (value: number | string | null | undefined) => {
  const amount = toSportsBetNumber(value)
  const prefix = amount > 0 ? '+' : amount < 0 ? '-' : ''
  return `${prefix}${formatSportsBetAmount(Math.abs(amount))}`
}

// 按体育网关 ot 字段转换盘型展示文案。
const getSportsOddsTypeLabel = (value: number | string | null | undefined) => {
  const i18nKey = sportsOddsTypeI18nKeys[String(value ?? '')]
  return i18nKey ? t(i18nKey) : '--'
}

// 将体育投注原始注单转换为提前结算弹窗展示字段。
const mapSportsBuyBackDetail = (item?: SportsBetHistoryWager | null): SportsBuyBackDetail => {
  const selection = item?.wil[0]
  const resultAmount = item ? getSportsBetResultAmount(item) : 0

  return {
    matchName: `${selection?.htn ?? '--'} VS ${selection?.atn ?? '--'}`,
    leagueName: selection?.cn ?? '--',
    marketName: selection?.btn ?? '--',
    selectionName: selection?.sen ?? '--',
    handicapText: selection?.dih ? `(${selection.dih})` : '',
    oddsText: `@ ${formatSportsBetOdds(selection?.o)}`,
    currency: currentCurrencyCode.value,
    betAmount: formatSportsBetAmount(item?.isa),
    winLossText: formatWinLossText(resultAmount),
    orderNo: String(item?.wid ?? ''),
    createdAt: item ? formatUsDateTime12h(item.wcdt) : '--',
    oddsTypeLabel: getSportsOddsTypeLabel(item?.ot)
  }
}

const betDetail = computed(() => mapSportsBuyBackDetail(props.wager))

// 兼容体育网关返回 stc 或 code 两种状态码字段。
const getSportsResponseCode = (response: { stc?: number | string; code?: number | string }) =>
  response.stc ?? response.code ?? ''

// 关闭提前结算弹窗，提交中不允许关闭。
const closeBuyBackSheet = () => {
  if (isSubmittingBuyBack.value) {
    return
  }
  emit('update:visible', false)
}

// 提交体育投注提前结算；100 为成功，其余直接展示接口 std。
const submitBuyBack = async () => {
  if (isSubmittingBuyBack.value) {
    return
  }

  const wager = props.wager
  if (!wager) {
    globalShowToast({
      message: t('betDetails.buyBackSubmitFailed'),
      type: 'fail'
    })
    return
  }

  const generation = submissionGeneration
  const owner = getCredentialOwner()
  let context: number | undefined
  let finishBalanceUpdate: ReturnType<typeof sportsStore.beginSportsBalanceUpdate> | undefined
  const isCurrent = () =>
    generation === submissionGeneration &&
    props.visible &&
    props.wager === wager &&
    owner === getCredentialOwner() &&
    (context === undefined || context === sportsAuth.contextVersion)
  isSubmittingBuyBack.value = true

  try {
    await siteConfigStore.initSiteConfig()
    if (!isCurrent()) return
    const baseUrl = siteConfigStore.getConfigString('IM.im_app_url')
    if (!baseUrl) {
      globalShowToast({ message: t('betDetails.buyBackSubmitFailed'), type: 'fail' })
      return
    }
    context = sportsAuth.contextVersion
    const credentials = await sportsAuth.ensureCredentials()
    if (!isCurrent() || !credentials || !sportsAuth.isCredentialsCurrent(credentials)) return
    finishBalanceUpdate = sportsStore.beginSportsBalanceUpdate(credentials)
    const response = await Api.sport.submitBuyBack(baseUrl, {
      WagerId: wager.wid ?? '',
      BuyBackPricing: toSportsBetNumber(wager.bbp),
      PricingId: wager.prid ?? '',
      LanguageCode: languageCode.value,
      MemberCode: credentials.memberCode,
      Token: credentials.token
    })
    if ([102, 202].includes(Number(getSportsResponseCode(response))))
      sportsAuth.clearCredentials(credentials)
    const responseCode = getSportsResponseCode(response)
    // 结算响应没有余额；关闭弹窗或离开页面后仍由钱包上下文完成一次补查。
    if (String(responseCode) === '100') finishBalanceUpdate({ refresh: true })
    if (!isCurrent()) return

    if (String(responseCode) === '100') {
      emit('update:visible', false)
      emit('success', wager)
      globalShowToast({
        message: t('betDetails.buyBackSuccess'),
        type: 'success'
      })
      return
    }

    globalShowToast({
      message: response.std || t('betDetails.buyBackSubmitFailed'),
      type: 'fail'
    })
  } catch {
    if (!isCurrent()) return
    globalShowToast({
      message: t('betDetails.buyBackSubmitFailed'),
      type: 'fail'
    })
  } finally {
    finishBalanceUpdate?.()
    isSubmittingBuyBack.value = false
  }
}

// 复制订单号并展示公共成功提示。
const copyOrderNo = () => {
  void navigator.clipboard?.writeText(betDetail.value.orderNo)
  globalShowToast(t('betDetails.copy'))
}
</script>

<style scoped>
.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition: opacity 0.3s ease;
}

.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  opacity: 0;
}

.bottom-sheet-enter-active .sports-buy-back-sheet,
.bottom-sheet-leave-active .sports-buy-back-sheet {
  transition: transform 0.3s ease;
}

.bottom-sheet-enter-from .sports-buy-back-sheet,
.bottom-sheet-leave-to .sports-buy-back-sheet {
  transform: translateY(100%);
}

.bottom-sheet-enter-to .sports-buy-back-sheet,
.bottom-sheet-leave-from .sports-buy-back-sheet {
  transform: translateY(0);
}
</style>
