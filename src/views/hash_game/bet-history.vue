<template>
  <!-- 哈希游戏投注记录 -->
  <Teleport to="body" :disabled="variant === 'h5'">
    <Transition name="bottom-sheet">
      <div
        v-if="isVisible"
        :class="
          variant === 'pc'
            ? 'fixed inset-0 z-[1000] grid place-items-center bg-mask-60-1 p-[12px]'
            : 'fixed inset-0 z-[1000] flex h-full w-full items-end bg-mask-60-1'
        "
        :inert="betDetailOpen"
        @click.self="close"
        @keydown.esc="handleEscape"
      >
        <section
          class="flex min-h-0 w-full flex-col overflow-hidden bg-bg-1"
          :class="
            variant === 'pc'
              ? 'bottom-sheet-panel max-h-[85vh] min-h-[85vh] w-full max-w-[480px] rounded-[8px]'
              : 'relative h-full'
          "
          :role="variant === 'pc' ? 'dialog' : undefined"
          :aria-modal="variant === 'pc' ? 'true' : undefined"
          :aria-labelledby="variant === 'pc' ? 'hash-bet-history-title' : undefined"
        >
          <header
            v-if="variant === 'pc'"
            class="grid h-[56px] shrink-0 grid-cols-[1fr_auto_1fr] items-center bg-bg-2 px-[16px]"
          >
            <span aria-hidden="true" />
            <h2 id="hash-bet-history-title" class="text-[18px] font-[700] text-text-1">
              {{ t('betHistory.title') }}
            </h2>
            <button
              ref="closeButton"
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
            :title="t('betHistory.title')"
            :fixed-top="false"
            show-sort
            @sort="openFilters"
          />

          <div
            v-if="variant === 'pc'"
            class="relative z-10 grid shrink-0 grid-cols-2 gap-[10px] p-[16px]"
          >
            <CustomSelect
              class="w-[220px]"
              v-for="group in filterGroups"
              :key="group.key"
              :model-value="getSingleFilterValue(filterValues[group.key])"
              :options="group.options"
              :placeholder="group.title"
              use-placeholder-when-all
              @update:model-value="applyFilters({ ...filterValues, [group.key]: $event })"
            />
          </div>
          <div
            ref="scrollRoot"
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            :class="variant === 'pc' ? 'px-[16px] pb-[16px]' : 'p-[14px]'"
          >
            <div class="flex flex-col" :class="variant === 'pc' ? 'gap-[16px]' : 'gap-[7px]'">
              <button
                v-for="item in items"
                :key="item.orderNo"
                type="button"
                class="w-full bg-bg-2 text-left"
                :class="variant === 'pc' ? 'rounded-[12px] pt-[16px]' : 'rounded-[10px] py-[10px]'"
                @click="openBetDetail(item.orderNo)"
              >
                <div
                  class="flex items-center"
                  :class="variant === 'pc' ? 'gap-[16px] px-[16px]' : 'gap-2.5 px-[14px]'"
                >
                  <SmartImage
                    :src="item.gameIcon"
                    class="shrink-0 object-cover"
                    :class="
                      variant === 'pc'
                        ? 'h-[96px] w-[82px] rounded-[21px]'
                        : 'h-[65px] w-[49px] rounded-lg'
                    "
                  />
                  <div class="min-w-0 flex-1">
                    <h3
                      class="truncate text-sm font-bold text-text-1"
                      :class="variant === 'pc' ? 'mb-[16px]' : 'mb-[10px]'"
                    >
                      {{ item.gameName }}
                    </h3>
                    <div
                      class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm"
                    >
                      <span class="text-text-1"
                        >{{ t('betHistory.betAmount') }} : {{ item.amount }}</span
                      >
                      <span :class="['font-bold', item.result.color]">
                        {{ item.result.label
                        }}<template v-if="item.result.amount != null">
                          : {{ item.result.amount }}</template
                        >
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  class="flex items-center justify-between border-t border-opacity-5"
                  :class="
                    variant === 'pc' ? 'mt-[16px] px-[16px] py-[16px]' : 'mt-2.5 px-3.5 pt-2.5'
                  "
                >
                  <span :class="variant === 'pc' ? 'text-sm text-text-2' : 'text-xs text-text-2'">
                    {{ item.time }}
                  </span>
                  <span
                    class="grid place-items-center bg-opacity-10"
                    :class="
                      variant === 'pc' ? 'size-[21px] rounded-[5px]' : 'size-[20px] rounded-[6px]'
                    "
                  >
                    <ArrowRightIcon class="size-[16px] text-icon-2" />
                  </span>
                </div>
              </button>

              <p v-if="loading" role="status" class="py-3 text-center text-xs text-text-2">
                {{ t(items.length ? 'common.loadingMore' : 'common.loading') }}
              </p>
              <button
                v-else-if="error"
                type="button"
                class="py-3 text-xs text-secondary-4"
                @click="retry"
              >
                {{ t('common.requestError') }}
              </button>
              <div
                v-else-if="finished && items.length === 0"
                class="flex flex-col items-center justify-center mt-[100px]"
              >
                <ThemedEmptyState
                  :dark-image="defaultImgDark"
                  :light-image="defaultImgLight"
                  :image-alt="t('common.noData')"
                  :message="t('betHistory.noBetHistoryYet')"
                  container-class="mt-0"
                  image-class="h-[200px] w-auto mb-2.5"
                  text-class="text-text-1 text-xs font-[500] mb-5"
                />
                <button
                  type="button"
                  class="w-[200px] h-[40px] rounded-lg bg-theme-primary text-text-4 font-[700] text-sm flex items-center justify-center"
                  @click="handleStartPlaying"
                >
                  {{ t('betHistory.startPlaying') }}
                </button>
              </div>
              <p v-else-if="finished" class="py-3 text-center text-xs text-text-2">
                {{ t('betHistory.noMore') }}
              </p>
              <div ref="loadMoreSentinel" class="h-px" />
            </div>
          </div>

          <FilterPopup
            v-if="variant === 'h5'"
            v-model:visible="showFilters"
            :model-value="filterValues"
            :filter-groups="filterGroups"
            :contained="!isMobile"
            @apply="applyFilters"
          />
        </section>
      </div>
    </Transition>
    <HashGameBetDetailPopup
      v-if="variant === 'pc'"
      v-model:visible="betDetailOpen"
      variant="pc"
      :order-no="selectedOrderNo"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type {
  HashGameBetPageResult,
  HashGameBetStatus,
  HashGameLotteryBet
} from '@/api/interface/hash_game.interface'
import { getHashGameBetPage } from '@/api/modules/hash_game'
import CustomSelect from '@/components/common/CustomSelect.vue'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import H5Header from '@/components/common/H5Header.vue'
import SmartImage from '@/components/common/SmartImage.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useIsMobile } from '@/composables/useMediaQuery'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useHashGameCatalogStore } from '@/stores/hashGameCatalog'
import { useUserStore } from '@/stores/user'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import fallbackGameIcon from '@/static/img/personalCenter/bet.png'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import { formatTimestamp, getHistoryTimeRange } from '@/utils/date'
import { resolveGameImageUrl } from '@/utils/image'
import { navigateTo } from '@/utils/router'
import {
  createBetHistoryTimeOptions,
  getSingleFilterValue,
  hasMoreByTotal
} from '@/views/wallet/betHistory/shared'
import HashGameBetDetailPopup from './bet-detail.vue'
import { formatStakeAmount, getHashBetProfit, HASH_BET_STATUS_KEYS } from './lotteryDisplay'

type FilterValues = Record<string, string | string[]>

const props = withDefaults(defineProps<{ initialGameCode?: string; variant?: 'h5' | 'pc' }>(), {
  variant: 'h5'
})
const visible = defineModel<boolean>('visible', { default: false })
const isVisible = computed(() => props.variant === 'h5' || visible.value)

const requestStatuses: Record<string, HashGameBetStatus[]> = {
  drawn: ['WIN', 'LOSE', 'REFUND'],
  LOSE: ['LOSE'],
  PENDING: ['PENDING'],
  WIN: ['WIN']
}

const { t } = useI18n()
const router = useRouter()
const isMobile = useIsMobile()
const { currentCurrencyCode } = useDisplayCurrency()
const catalog = useHashGameCatalogStore()
const user = useUserStore()
const scrollRoot = ref<HTMLElement | null>(null)
const loadMoreSentinel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const showFilters = ref(false)
const betDetailOpen = ref(false)
const selectedOrderNo = ref<string>()
const getInitialFilters = (): FilterValues => ({
  gameCode: props.initialGameCode || 'all',
  status: 'all',
  time: 'all',
  ...(props.variant === 'h5' ? window.history.state?.hashGameBetHistoryFilters : undefined)
})
const filterValues = ref(getInitialFilters())

usePageScrollLock(() => (props.variant === 'pc' ? isVisible.value : isMobile.value))

const filterGroups = computed<(FilterGroup & { key: string })[]>(() => [
  {
    key: 'gameCode',
    title: t('betHistory.filterGroups.gameType'),
    options: [
      { value: 'all', label: t('betHistory.filterOptions.all') },
      ...catalog.games.map(game => ({ value: game.gameCode, label: game.gameName }))
    ]
  },
  {
    key: 'status',
    title: t('betHistory.filterGroups.status'),
    options: [
      { value: 'all', label: t('hashGame.betHistory.allStatuses') },
      { value: 'drawn', label: t('hashGame.betHistory.drawn') },
      { value: 'LOSE', label: t('hashGame.betDetailStatus.lose') },
      { value: 'PENDING', label: t('hashGame.betHistory.pending') },
      { value: 'WIN', label: t('hashGame.betDetailStatus.win') }
    ]
  },
  {
    key: 'time',
    title: t('betHistory.filterGroups.date'),
    options: createBetHistoryTimeOptions(t)
  }
])

const appliedFilters = computed(() => {
  const gameCode = getSingleFilterValue(filterValues.value.gameCode)
  const status = requestStatuses[getSingleFilterValue(filterValues.value.status)]
  const { startTime, endTime } = getHistoryTimeRange(getSingleFilterValue(filterValues.value.time))

  return {
    gameCode: gameCode === 'all' ? undefined : gameCode,
    status,
    betTimeStart: startTime ?? undefined,
    betTimeEnd: endTime ?? undefined
  }
})

const { list, loading, finished, error, refresh, retry, reset } = useInfiniteScroll<
  HashGameLotteryBet,
  HashGameBetPageResult
>({
  sentinel: loadMoreSentinel,
  root: scrollRoot,
  enabled: isVisible,
  immediate: false,
  pageSize: 20,
  load: async ({ page, pageSize, signal }) => {
    const response = ensureApiBusinessSuccess(
      await getHashGameBetPage(
        {
          page: { current: page, size: pageSize },
          currency: currentCurrencyCode.value,
          ...appliedFilters.value
        },
        signal
      )
    )
    if (!Array.isArray(response.result?.list)) throw new Error('Invalid hash bet history')
    return response.result
  },
  getItems: result => result.list,
  getHasMore: (result, { page, pageSize, items }) =>
    items.length > 0 && hasMoreByTotal(result.total, page, pageSize, items.length),
  dedupeBy: item => item.orderNo
})

const items = computed(() =>
  list.value.map(bet => {
    const game = catalog.gamesByCode.get(bet.gameCode)
    const won = bet.status === 'WIN'
    const lost = bet.status === 'LOSE'
    const profit = getHashBetProfit(bet.status, bet.amount, bet.payoutAmount)

    return {
      orderNo: bet.orderNo,
      gameName: bet.gameName || game?.gameName || bet.gameCode,
      gameIcon: resolveGameImageUrl(game?.imageUrl) || fallbackGameIcon,
      amount: bet.amount == null ? '—' : formatStakeAmount(bet.amount),
      time: formatTimestamp(bet.betTime),
      result: {
        label:
          won || lost
            ? t(won ? 'betHistory.win' : 'betHistory.loss')
            : t(`hashGame.betDetailStatus.${HASH_BET_STATUS_KEYS[bet.status]}`),
        color: won ? 'text-secondary-2' : lost ? 'text-secondary-4' : 'text-text-2',
        amount:
          profit == null
            ? null
            : Math.abs(profit).toLocaleString('en-US', { maximumFractionDigits: 8 })
      }
    }
  })
)

const openFilters = () => {
  showFilters.value = true
  if (catalog.failed) void catalog.load()
}

const applyFilters = (values: FilterValues) => {
  filterValues.value = values
  if (props.variant === 'h5') {
    window.history.replaceState({ ...window.history.state, hashGameBetHistoryFilters: values }, '')
  }
  scrollRoot.value?.scrollTo({ top: 0 })
  void refresh()
}

watch(
  [
    isVisible,
    () => props.initialGameCode,
    currentCurrencyCode,
    () => user.userInfo?.memberId ?? user.acctInfo?.memberId
  ],
  ([open, gameCode, currency], [wasOpen, previousGameCode, previousCurrency]) => {
    if (!open) {
      betDetailOpen.value = false
      selectedOrderNo.value = undefined
      reset()
      return
    }
    if (!wasOpen) void catalog.load()
    if (!wasOpen || gameCode !== previousGameCode) {
      filterValues.value = getInitialFilters()
    } else if (currency !== previousCurrency) {
      filterValues.value = { ...filterValues.value, gameCode: gameCode || 'all' }
    }
    scrollRoot.value?.scrollTo({ top: 0 })
    void refresh()
  },
  { immediate: true }
)

watch(
  [closeButton, betDetailOpen],
  ([button, detailOpen]) => {
    if (!detailOpen) button?.focus({ preventScroll: true })
  },
  { flush: 'post' }
)

const close = () => {
  if (props.variant === 'pc') visible.value = false
}

const handleEscape = (event: KeyboardEvent) => {
  if (props.variant !== 'pc' || betDetailOpen.value) return
  event.preventDefault()
  event.stopPropagation()
  close()
}

const handleStartPlaying = () => {
  if (props.variant === 'pc') {
    close()
    return
  }
  const { back } = router.options.history.state
  const previousRouteName = typeof back === 'string' ? router.resolve(back).name : undefined
  if (previousRouteName === 'hashGame' || previousRouteName === 'LocalehashGame') {
    router.back()
    return
  }

  void navigateTo('/hash-game', { replace: true })
}

const openBetDetail = (orderNo: string) => {
  if (props.variant === 'pc') {
    selectedOrderNo.value = orderNo
    betDetailOpen.value = true
    return
  }
  void navigateTo(`/hash-game/bet-details/${encodeURIComponent(orderNo)}`)
}

onBeforeUnmount(reset)
</script>
