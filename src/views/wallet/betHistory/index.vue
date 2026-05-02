<template>
  <div>
    <div
      v-if="isReady && isMobile"
      class="fixed inset-0 bg-bg-1 sm:hidden flex flex-col overflow-hidden"
    >
      <H5Header :title="$t('betHistory.title')" :show-sort="true" @sort="handleSort" />

      <div
        ref="scrollRoot"
        class="bet-history-scroll-root flex-1 min-h-0 overflow-y-auto overscroll-contain"
      >
        <div class="py-3.5 px-3.5">
          <!-- 无数据状态 -->
          <div
            v-if="error && dataList.length === 0"
            class="flex flex-col items-center justify-center mt-[100px] gap-3"
          >
            <p class="text-secondary-4 text-xs font-[500]" @click="handleRetry">
              {{ $t('common.requestError') }}
            </p>
          </div>

          <div
            v-else-if="!loading && dataList.length === 0"
            class="flex flex-col items-center justify-center mt-[100px]"
          >
            <!-- 空状态 -->
            <ThemedEmptyState
              :dark-image="defaultImgDark"
              :light-image="defaultImgLight"
              :image-alt="$t('common.noData')"
              :message="$t('common.noData')"
              container-class="mt-0"
              image-class="h-[200px] w-auto mb-2.5"
              text-class="text-text-1 text-xs font-[500] mb-5"
            />
            <button
              class="w-[200px] h-[40px] rounded-lg bg-theme-primary text-text-4 font-[700] text-sm flex items-center justify-center"
              @click="handleStartPlaying"
            >
              {{ $t('betHistory.startPlaying') }}
            </button>
          </div>

          <!-- 有数据状态 -->
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="item in dataList"
              :key="item.id"
              class="bg-bg-2 rounded-lg py-2.5 cursor-pointer"
              @click="handleBetClick(item)"
            >
              <div class="flex items-center px-3.5">
                <div class="w-[49px] h-[65px] rounded-lg overflow-hidden flex-shrink-0 mr-2.5">
                  <img :src="item.gameIcon" alt="" class="w-full h-full object-cover" />
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="text-text-1 font-[700] text-sm mb-2.5 truncate">
                    {{ item.gameName }}
                  </h3>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-text-1">
                      {{ $t('betHistory.betAmount') }} : {{ item.betAmount }}
                    </span>
                    <span
                      :class="[
                        'font-bold',
                        item.result === 'win'
                          ? 'text-secondary-2'
                          : item.result === 'loss'
                            ? 'text-secondary-4'
                            : 'text-text-1'
                      ]"
                    >
                      {{ item.result === 'win' ? $t('betHistory.win') : $t('betHistory.loss') }}
                      :
                      {{ item.resultAmount }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 线 -->
              <div class="w-full h-[1px] bg-opacity-15 my-2.5"></div>

              <div class="flex items-center justify-between px-3.5">
                <p class="text-text-2 text-xs">
                  {{ item.time }}
                </p>
                <div
                  class="size-[20px] bg-opacity-10 rounded-md flex items-center justify-center cursor-pointer"
                  @click.stop="handleBetClick(item)"
                >
                  <ArrowRightIcon class="w-3.5 h-3.5 text-text-2" />
                </div>
              </div>
            </div>

            <p v-if="loading" class="py-3 text-center text-xs text-text-2">
              {{ dataList.length === 0 ? $t('common.loading') : $t('common.loadingMore') }}
            </p>
            <p
              v-else-if="error"
              class="py-3 text-center text-xs text-secondary-4"
              @click="handleRetry"
            >
              {{ $t('common.requestError') }}
            </p>
            <p
              v-else-if="finished && dataList.length > 0"
              class="py-3 text-center text-xs text-text-2"
            >
              {{ $t('betHistory.noMore') }}
            </p>

            <div ref="loadMoreSentinel" class="h-px w-full"></div>
          </div>
        </div>
      </div>

      <!-- 筛选弹窗 -->
      <FilterPopup
        v-model:visible="showFilterPopup"
        v-model="filterValues"
        :filter-groups="filterGroups"
        @apply="handleFilterApply"
      />
    </div>

    <WalletLayout v-else-if="isReady" current-tab="bet-history">
      <div class="bg-bg-2 rounded-xl overflow-hidden">
        <PcLayout />
      </div>
    </WalletLayout>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Api from '@/api'
import { navigateTo } from '@/utils/router'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import WalletLayout from '../index.vue'
import PcLayout from './pc-layout.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import {
  BET_HISTORY_PAGE_SIZE,
  buildBetHistoryQueryForm,
  createBetHistoryGameTypeOptions,
  createBetHistoryPlatformOptions,
  createBetHistoryStatusOptions,
  createBetHistoryTimeOptions,
  createBetHistoryWinlostOptions,
  createDefaultBetHistoryFilterValues,
  hasMoreByTotal,
  mapRecordToItem,
  type Item
} from './shared'

const { t } = useI18n()
const isMobile = useIsMobile()
const isReady = ref(false)

const scrollRoot = ref<HTMLElement | null>(null)
const loadMoreSentinel = ref<HTMLElement | null>(null)

const filterValues = ref<Record<string, string | string[]>>({
  ...createDefaultBetHistoryFilterValues()
})

const filterGroups = computed<FilterGroup[]>(() => [
  {
    key: 'gameType',
    title: t('betHistory.filterGroups.gameType'),
    options: createBetHistoryGameTypeOptions(t)
  },
  {
    key: 'winlost',
    title: t('betHistory.filterGroups.winLoss'),
    options: createBetHistoryWinlostOptions(t)
  },
  {
    key: 'status',
    title: t('betHistory.filterGroups.status'),
    options: createBetHistoryStatusOptions(t)
  },
  {
    key: 'time',
    title: t('betHistory.filterGroups.date'),
    options: createBetHistoryTimeOptions(t)
  },
  {
    key: 'platform',
    title: t('betHistory.filterGroups.platform'),
    options: createBetHistoryPlatformOptions(t)
  }
])

const fetchBetHistory = async (page: number, pageSize: number) => {
  const response = await Api.record.queryOrderInfoPage(
    buildBetHistoryQueryForm({
      page,
      pageSize,
      filterValues: filterValues.value
    })
  )

  if (!response.success) {
    throw new Error(response.message || t('common.requestError'))
  }

  return response
}

const {
  list: dataList,
  loading,
  finished,
  error,
  refresh
} = useInfiniteScroll<Item, Awaited<ReturnType<typeof Api.record.queryOrderInfoPage>>>({
  sentinel: loadMoreSentinel,
  root: scrollRoot,
  enabled: () => isReady.value && isMobile.value,
  pageSize: BET_HISTORY_PAGE_SIZE,
  load: async ({ page, pageSize }) => fetchBetHistory(page, pageSize),
  getItems: response => response.result?.records?.map(record => mapRecordToItem(record, t)) ?? [],
  getTotal: response => response.result?.total,
  getHasMore: (response, { page, pageSize, items }) =>
    hasMoreByTotal(response.result?.total, page, pageSize, items.length),
  dedupeBy: item => item.id,
  onError: requestError => {
    console.error(requestError)
  }
})

const handleStartPlaying = () => {
  navigateTo('/')
}

const handleBetClick = (item: Item) => {
  navigateTo(`/bet-details/${item.id}`, {
    state: { betData: JSON.stringify(item) }
  })
}

// 筛选弹窗
const showFilterPopup = ref(false)

const handleSort = () => {
  showFilterPopup.value = true
}

const handleFilterApply = async (values: Record<string, string | string[]>) => {
  filterValues.value = {
    ...createDefaultBetHistoryFilterValues(),
    ...values
  }
  await refresh()
}

const handleRetry = async () => {
  await refresh()
}

onMounted(() => {
  isReady.value = true
})
</script>

<style scoped>
.bet-history-scroll-root {
  -webkit-overflow-scrolling: touch;
}
</style>

<style scoped lang="scss"></style>
