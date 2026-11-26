<template>
  <Teleport to="body" :disabled="variant === 'h5'">
    <Transition name="bottom-sheet">
      <div
        v-if="variant === 'h5' || visible"
        :class="
          variant === 'pc'
            ? 'fixed inset-0 z-[1100] grid place-items-center bg-mask-60-1 p-[12px]'
            : 'fixed inset-0 flex min-h-0 flex-col overflow-hidden bg-bg-1'
        "
        @click.self="close"
      >
        <section
          :class="
            variant === 'pc'
              ? 'bottom-sheet-panel flex max-h-[85vh] w-full max-w-[480px] flex-col overflow-hidden rounded-[8px] bg-bg-1'
              : 'flex min-h-0 flex-1 flex-col overflow-hidden bg-bg-1'
          "
          :role="variant === 'pc' ? 'dialog' : undefined"
          :aria-modal="variant === 'pc' ? 'true' : undefined"
          :aria-labelledby="variant === 'pc' ? 'hash-bet-detail-title' : undefined"
        >
          <header
            v-if="variant === 'pc'"
            class="grid h-[56px] shrink-0 grid-cols-[1fr_auto_1fr] items-center bg-bg-2 px-[16px]"
          >
            <span aria-hidden="true" />
            <h2 id="hash-bet-detail-title" class="text-[18px] font-[700] text-text-1">
              {{ t('betDetails.title') }}
            </h2>
            <button
              type="button"
              class="ml-auto grid size-[24px] place-items-center rounded-[4px] bg-opacity-10"
              :aria-label="t('common.close')"
              @click="close"
            >
              <CloseIcon class="size-[12px] text-icon-1" />
            </button>
          </header>
          <H5Header
            v-else
            :title="t('betDetails.title')"
            :fixed-top="false"
            :right-icon="KefuIcon"
            show-sort
            @sort="openOnlineCustomer()"
          />

          <main
            :class="
              variant === 'pc'
                ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain p-[16px]'
                : 'min-h-0 flex-1 overflow-y-auto overscroll-contain p-[14px]'
            "
          >
            <!-- 加载中 -->
            <p v-if="loading" role="status" class="py-8 text-center text-sm text-text-2">
              {{ t('common.loading') }}
            </p>
            <!-- 请求错误 -->
            <button
              v-else-if="loadFailed"
              type="button"
              class="w-full py-8 text-sm text-secondary-4"
              @click="retryCount++"
            >
              {{ t('common.requestError') }}
            </button>
            <section
              v-else-if="bet"
              :class="
                variant === 'pc'
                  ? 'rounded-[8px] bg-bg-2 px-[16px] pb-[16px] pt-[32px]'
                  : 'rounded-[8px] bg-bg-2 px-[14px] pb-[14px] pt-[30px]'
              "
            >
              <div
                :class="
                  variant === 'pc'
                    ? 'mb-[32px] flex flex-col items-center text-text-1'
                    : 'mb-[30px] flex flex-col items-center text-text-1'
                "
              >
                <SmartImage
                  :src="bet.gameIcon"
                  :class="
                    variant === 'pc'
                      ? 'mb-[12px] h-[97px] w-[73px] rounded-[7px] object-cover'
                      : 'mb-[8px] h-[65px] w-[49px] rounded-[7px] object-cover'
                  "
                />
                <h2
                  :class="
                    variant === 'pc'
                      ? 'mb-[5px] text-[18px] font-[700] text-text-1'
                      : 'mb-[5px] text-[18px] font-[700] text-text-1'
                  "
                >
                  {{ t('hashGame.betDetails.gameType') }}
                </h2>
                <p
                  :class="
                    variant === 'pc'
                      ? 'text-[14px] font-[400] text-text-1'
                      : 'text-[14px] font-[400] text-text-1'
                  "
                >
                  {{ bet.gameName }}
                </p>
              </div>

              <div
                :class="[
                  variant === 'pc'
                    ? 'mb-[12px] flex items-center justify-between rounded-[8px] bg-bg-4 p-[16px]'
                    : 'mb-[10px] flex items-center justify-between rounded-[8px] bg-bg-4 p-[14px]',
                  bet.resultColor
                ]"
              >
                <span
                  :class="variant === 'pc' ? 'text-[14px] font-[400]' : 'text-[14px] font-[400]'"
                  >{{ bet.resultLabel }}</span
                >
                <strong
                  v-if="bet.profitText"
                  :class="variant === 'pc' ? 'text-[16px] font-[700]' : 'text-[16px] font-[700]'"
                  >{{ bet.profitText }}</strong
                >
              </div>

              <dl
                :class="
                  variant === 'pc'
                    ? 'space-y-[16px] rounded-[8px] bg-bg-4 py-[16px] px-[20px] text-[16px]'
                    : 'space-y-[20px] rounded-[8px] bg-bg-4 p-[14px] text-[14px]'
                "
              >
                <div v-for="row in bet.fields" :key="row.label" class="flex justify-between gap-3">
                  <dt class="shrink-0 text-text-3">{{ row.label }}</dt>
                  <dd
                    :class="[
                      'flex min-w-0 items-baseline gap-1.5 text-right',
                      row.color || 'text-text-1'
                    ]"
                  >
                    <span
                      :class="row.copy ? 'min-w-0 truncate' : 'break-words'"
                      :title="row.copy ? row.value : undefined"
                    >
                      {{ row.value }}
                    </span>
                    <span v-if="row.outcomes" class="shrink-0 text-theme-primary">{{
                      row.outcomes
                    }}</span>
                    <button
                      v-if="row.copy"
                      type="button"
                      class="flex shrink-0 self-center"
                      :aria-label="`${t('common.copy')} ${row.label}`"
                      @click="copyValue(row.value)"
                    >
                      <CopyIcon
                        :class="
                          variant === 'pc' ? 'size-[24px] text-icon-2' : 'size-[16px] text-icon-2'
                        "
                      />
                    </button>
                    <a
                      v-if="row.href"
                      :href="row.href"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="shrink-0 text-theme-primary"
                    >
                      {{ t('hashGame.verify') }}
                    </a>
                  </dd>
                </div>
              </dl>
            </section>
          </main>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { HashGameLotteryBetDetail } from '@/api/interface/hash_game.interface'
import { getHashGameBetDetail } from '@/api/modules/hash_game'
import H5Header from '@/components/common/H5Header.vue'
import SmartImage from '@/components/common/SmartImage.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useOnlineCustomerService } from '@/composables/useOnlineCustomerService'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import fallbackGameIcon from '@/static/img/personalCenter/bet.png'
import CloseIcon from '@/static/svg/close.svg?component'
import CopyIcon from '@/static/svg/copy.svg?component'
import KefuIcon from '@/static/svg/vip/kefu.svg?component'
import { useHashGameCatalogStore } from '@/stores/hashGameCatalog'
import { useUserStore } from '@/stores/user'
import { isApiBusinessSuccess } from '@/utils/apiBusiness'
import { copyTextWithFallback } from '@/utils/clipboard'
import { formatTimestamp } from '@/utils/date'
import { resolveGameImageUrl } from '@/utils/image'
import { globalShowToast } from '@/utils/toast'
import {
  BET_KEYS,
  formatOdds,
  formatStakeAmount,
  getHashBetProfit,
  HASH_BET_STATUS_KEYS,
  issueExplorerUrl,
  issueOutcome
} from './lotteryDisplay'

const props = withDefaults(defineProps<{ variant?: 'h5' | 'pc'; orderNo?: string }>(), {
  variant: 'h5'
})
const visible = defineModel<boolean>('visible', { default: false })

const { t } = useI18n()
const route = useRoute()
const userStore = useUserStore()
const catalog = useHashGameCatalogStore()
const { open: openOnlineCustomer } = useOnlineCustomerService()
const mobile = useIsMobile()
usePageScrollLock(() => props.variant === 'h5' && mobile.value)

const detail = shallowRef<HashGameLotteryBetDetail>()
const loading = ref(false)
const loadFailed = ref(false)
const retryCount = ref(0)
const orderNo = computed(() => {
  if (props.variant === 'pc') return visible.value ? props.orderNo : undefined
  return typeof route.params.id === 'string' ? route.params.id : undefined
})

watch(
  [
    orderNo,
    () => userStore.userInfo?.memberId ?? userStore.acctInfo?.memberId,
    () => userStore.userInfo?.tradeToken,
    retryCount
  ],
  async ([id], _, onCleanup) => {
    detail.value = undefined
    loading.value = Boolean(id)
    loadFailed.value = false
    if (!id) return

    void catalog.load()
    let active = true
    onCleanup(() => {
      active = false
    })
    try {
      const response = await getHashGameBetDetail(id)
      if (!active) return
      if ((response.success ?? isApiBusinessSuccess(response)) && response.result?.orderNo === id) {
        detail.value = response.result
      } else {
        loadFailed.value = true
      }
    } catch {
      if (active) loadFailed.value = true
    } finally {
      if (active) loading.value = false
    }
  },
  { immediate: true }
)

type DetailField = {
  label: string
  value: string
  copy?: boolean
  href?: string
  outcomes?: string
  color?: string
}

const bet = computed(() => {
  const value = detail.value
  if (!value) return null

  const game = catalog.gamesByCode.get(value.gameCode)
  const won = value.status === 'WIN'
  const lost = value.status === 'LOSE'
  const settled = won || lost || value.status === 'REFUND'
  const status = t(`hashGame.betDetailStatus.${HASH_BET_STATUS_KEYS[value.status]}`)
  const profit = getHashBetProfit(value.status, value.betAmount, value.payoutAmount)
  const option = BET_KEYS[value.betOption]
  const odds = formatOdds(value.appliedOdds, value.betOption)
  const block =
    Number.isSafeInteger(value.anchorBlockNum) && value.anchorBlockNum > 0
      ? value.anchorBlockNum
      : undefined
  const hash = value.blockHash
  const result = value.result
  const outcomes = result
    ? (['size', 'parity', 'winner'] as const).flatMap(mode => {
        const outcome = issueOutcome(result, mode)
        return outcome ? [t(`hashGame.${outcome}`)] : []
      })
    : []
  const drawHash =
    result && hash
      ? hash.length > 11
        ? `${hash.slice(0, 3)}...${hash.slice(-5)}`
        : hash
      : undefined
  const digit = result?.sum ?? result?.digit ?? result?.lastTwo
  const fieldLabel = (key: string) => t(`hashGame.betDetails.${key}`)

  const fields: DetailField[] = [
    { label: fieldLabel('selection'), value: option ? t(`hashGame.${option}`) : '—' },
    {
      label: t('betHistory.betAmount'),
      value: value.betAmount == null ? '—' : formatStakeAmount(value.betAmount)
    },
    { label: fieldLabel('period'), value: String(block ?? '—') },
    { label: fieldLabel('odds'), value: odds === '—' ? odds : `@${odds}` },
    {
      label: fieldLabel('betBlock'),
      value: hash || String(block ?? '—'),
      copy: Boolean(hash || block),
      href: block ? issueExplorerUrl(value.explorerUrl, block) : undefined
    },
    {
      label: fieldLabel('result'),
      value: drawHash ?? (digit == null ? (outcomes.length ? '' : '—') : String(digit)),
      outcomes: outcomes.length ? `（${outcomes.join('、')}）` : undefined
    },
    {
      label: fieldLabel('orderStatus'),
      value: settled ? t('betHistory.filterOptions.settled') : status,
      color: settled ? 'text-secondary-7' : undefined
    },
    { label: t('betDetails.currency'), value: value.currency || '—' },
    { label: fieldLabel('gameTypeLabel'), value: fieldLabel('gameType') },
    { label: fieldLabel('orderNo'), value: value.orderNo, copy: true },
    { label: fieldLabel('placedAt'), value: formatTimestamp(value.betTime) },
    { label: fieldLabel('settledAt'), value: formatTimestamp(value.settleTime) }
  ]

  return {
    gameIcon: resolveGameImageUrl(game?.imageUrl) || fallbackGameIcon,
    gameName: value.gameName || game?.gameName || value.gameCode,
    resultLabel: won || lost ? t(won ? 'betHistory.win' : 'betHistory.loss') : status,
    resultColor: won ? 'text-secondary-2' : lost ? 'text-secondary-4' : 'text-text-2',
    profitText:
      profit == null
        ? undefined
        : `${profit > 0 ? '+' : ''}${profit.toLocaleString('en-US', { maximumFractionDigits: 8 })}`,
    fields
  }
})

const close = () => {
  if (props.variant === 'pc') visible.value = false
}

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (props.variant === 'pc' && visible.value && event.key === 'Escape') close()
}

onMounted(() => document.addEventListener('keydown', handleDocumentKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleDocumentKeydown))

const copyValue = async (value: string) => {
  const copied = await copyTextWithFallback(value)
  globalShowToast(t(copied ? 'betDetails.copy' : 'common.copyFailedRetry'))
}
</script>
