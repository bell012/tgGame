<template>
  <!-- 哈希游戏投注记录 -->
  <div
    class="fixed w-full h-full inset-0 flex flex-col overflow-hidden bg-bg-1 sm:relative sm:inset-auto sm:mx-auto sm:my-4 sm:max-w-[720px] sm:rounded-lg"
  >
    <H5Header :title="t('betHistory.title')" :fixed-top="false" show-sort @sort="openFilters" />

    <div ref="scrollRoot" class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5">
      <div class="flex flex-col gap-2">
        <button
          v-for="item in items"
          :key="item.orderNo"
          type="button"
          class="w-full rounded-lg bg-bg-2 py-2.5 text-left"
          @click="openBetDetail(item.orderNo)"
        >
          <div class="flex items-center gap-2.5 px-3.5">
            <SmartImage
              :src="item.gameIcon"
              class="h-[65px] w-[49px] shrink-0 rounded-lg object-cover"
            />
            <div class="min-w-0 flex-1">
              <h3 class="mb-2.5 truncate text-sm font-bold text-text-1">{{ item.gameName }}</h3>
              <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm">
                <span class="text-text-1">{{ t('betHistory.betAmount') }} : {{ item.amount }}</span>
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
            class="mt-2.5 flex items-center justify-between border-t border-opacity-5 px-3.5 pt-2.5"
          >
            <span class="text-xs text-text-2">{{ item.time }}</span>
            <span class="grid size-[20px] place-items-center rounded-md bg-opacity-10">
              <ArrowRightIcon class="size-3.5 text-text-2" />
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
      v-model:visible="showFilters"
      :model-value="filterValues"
      :filter-groups="filterGroups"
      :contained="!isMobile"
      @apply="applyFilters"
    />
  </div>
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
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import { formatTimestamp, getHistoryTimeRange } from '@/utils/date'
import { resolveGameImageUrl } from '@/utils/image'
import { navigateTo } from '@/utils/router'
import {
  createBetHistoryTimeOptions,
  getSingleFilterValue,
  hasMoreByTotal
} from '@/views/wallet/betHistory/shared'
import { formatStakeAmount, getHashBetProfit, HASH_BET_STATUS_KEYS } from './lotteryDisplay'

type FilterValues = Record<string, string | string[]>

const props = defineProps<{ initialGameCode?: string }>()

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
const showFilters = ref(false)
const getInitialFilters = (): FilterValues => ({
  gameCode: props.initialGameCode || 'all',
  status: 'all',
  time: 'all',
  ...window.history.state?.hashGameBetHistoryFilters
})
const filterValues = ref(getInitialFilters())

usePageScrollLock(() => isMobile.value)
void catalog.load()

const filterGroups = computed<FilterGroup[]>(() => [
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
  window.history.replaceState({ ...window.history.state, hashGameBetHistoryFilters: values }, '')
  scrollRoot.value?.scrollTo({ top: 0 })
  void refresh()
}

watch(
  [
    () => props.initialGameCode,
    currentCurrencyCode,
    () => user.userInfo?.memberId ?? user.acctInfo?.memberId
  ],
  ([gameCode, currency], [previousGameCode, previousCurrency]) => {
    if (gameCode !== previousGameCode) {
      filterValues.value = getInitialFilters()
    } else if (currency !== previousCurrency) {
      filterValues.value = { ...filterValues.value, gameCode: gameCode || 'all' }
    }
    scrollRoot.value?.scrollTo({ top: 0 })
    void refresh()
  }
)

const handleStartPlaying = () => {
  const { back } = router.options.history.state
  const previousRouteName = typeof back === 'string' ? router.resolve(back).name : undefined
  if (previousRouteName === 'hashGame' || previousRouteName === 'LocalehashGame') {
    router.back()
    return
  }

  void navigateTo('/hash-game', { replace: true })
}

const openBetDetail = (orderNo: string) => {
  void navigateTo(`/hash-game/bet-details/${encodeURIComponent(orderNo)}`)
}

onBeforeUnmount(reset)
</script>
