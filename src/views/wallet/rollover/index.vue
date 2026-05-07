<template>
  <div>
    <!-- PC 端布局 -->
    <WalletLayout current-tab="rollover" class="hidden sm:block">
      <div class="bg-bg-2 rounded-xl overflow-hidden">
        <PcLayout />
      </div>
    </WalletLayout>

    <!-- H5 端布局 -->
    <div class="fixed inset-0 bg-bg-1 sm:hidden flex flex-col overflow-hidden">
      <H5Header :title="$t('wallet.rollover')" :show-sort="true" @sort="handleSort" />

      <div
        ref="scrollRoot"
        class="rollover-scroll-root flex-1 min-h-0 overflow-y-auto overscroll-contain"
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
          <!-- 空状态 -->
          <ThemedEmptyState
            v-else-if="!loading && dataList.length === 0"
            :dark-image="defaultImgDark"
            :light-image="defaultImgLight"
            :image-alt="$t('common.noData')"
            :message="$t('common.noData')"
            container-class="mt-[100px] justify-center"
            image-class="h-[200px] w-auto mb-2.5"
            text-class="text-text-1 text-xs font-[500] mb-5"
          />

          <!-- 有数据状态 -->
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="item in dataList"
              :key="item.id"
              class="bg-bg-2 rounded-lg py-2.5 px-3.5 cursor-pointer"
              @click="handleBetClick(item)"
            >
              <div class="flex items-center">
                <div
                  class="w-10 h-10 rounded-full bg-opacity-5 mr-1.5 flex items-center justify-center"
                >
                  <Transaction_add
                    v-if="item.direction === 'add'"
                    class="w-[22px] h-[22px] text-text-1"
                  />
                  <Transaction_dec v-else class="w-[22px] h-[22px] text-text-1" />
                </div>

                <div class="flex items-center justify-between w-full gap-3">
                  <h3 class="text-text-1 font-[700] text-sm">
                    {{ item.gameName }}
                  </h3>
                  <p class="text-base font-[700] text-text-1">
                    {{ item.amount }}
                  </p>
                </div>
              </div>

              <div class="bg-bg-4 rounded-[10px] px-3 py-2.5 mb-2.5 mt-2.5">
                <div class="flex items-center justify-between">
                  <p class="text-text-3 font-[400] text-xs">{{ $t('wallet.actualTurnover') }}</p>
                  <p class="text-text-1 font-[700] text-xs">
                    {{ item.direction === 'add' ? '+' : '-' }}{{ item.actualTurnover }}
                  </p>
                </div>
                <div class="flex items-center justify-between mt-2.5">
                  <p class="text-text-3 font-[400] text-xs">{{ $t('wallet.requiredTurnover') }}</p>
                  <p class="text-text-1 font-[700] text-xs">
                    {{ item.direction === 'add' ? '+' : '-' }}{{ item.requiredTurnover }}
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <p class="text-text-2 text-xs">
                  {{ item.time }}
                </p>
                <div class="flex items-center">
                  <div
                    class="text-xs font-[700] mr-2.5"
                    :class="item.status ? 'text-secondary-4' : 'text-secondary-2'"
                  >
                    {{ item.status ? $t('transaction.completed') : $t('transaction.notCompleted') }}
                  </div>
                  <div
                    class="size-[20px] bg-opacity-10 rounded-md flex items-center justify-center cursor-pointer"
                    @click.stop="handleBetClick(item)"
                  >
                    <ArrowRightIcon class="w-3.5 h-3.5 text-text-2" />
                  </div>
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

      <FilterPopup
        v-model:visible="showFilterPopup"
        v-model="filterValues"
        :filter-groups="filterGroups"
        @apply="handleFilterApply"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
import Transaction_add from '@/static/svg/transaction_add.svg?component'
import Transaction_dec from '@/static/svg/transaction_dec.svg?component'
import {
  ROLLOVER_PAGE_SIZE,
  buildRolloverQueryForm,
  createDefaultRolloverFilterValues,
  createRolloverStatusOptions,
  createRolloverTimeOptions,
  createRolloverTypeOptions,
  hasMoreByTotal,
  mapRecordToItem,
  shouldDisplayRolloverItem,
  type Item
} from './shared'

const { t } = useI18n()
const isMobile = useIsMobile()

const scrollRoot = ref<HTMLElement | null>(null)
const loadMoreSentinel = ref<HTMLElement | null>(null)
const showFilterPopup = ref(false)

const filterValues = ref<Record<string, string | string[]>>({
  ...createDefaultRolloverFilterValues()
})

const filterGroups = computed<FilterGroup[]>(() => [
  {
    key: 'time',
    title: t('betHistory.filterGroups.date'),
    options: createRolloverTimeOptions(t)
  },
  {
    key: 'status',
    title: t('betHistory.filterGroups.status'),
    options: createRolloverStatusOptions(t)
  },
  {
    key: 'type',
    title: t('betHistory.filterGroups.transaction'),
    options: createRolloverTypeOptions(t)
  }
])

const fetchRollover = async (page: number, pageSize: number) => {
  const response = await Api.record.queryInspectPage(
    buildRolloverQueryForm({
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
} = useInfiniteScroll<Item, Awaited<ReturnType<typeof Api.record.queryInspectPage>>>({
  sentinel: loadMoreSentinel,
  root: scrollRoot,
  enabled: () => isMobile.value,
  pageSize: ROLLOVER_PAGE_SIZE,
  load: async ({ page, pageSize }) => fetchRollover(page, pageSize),
  getItems: response =>
    response.result?.records
      ?.map(record => mapRecordToItem(record, t))
      .filter(item => shouldDisplayRolloverItem(item)) ?? [],
  getTotal: response => response.result?.total,
  getHasMore: (response, { page, pageSize, items }) =>
    hasMoreByTotal(response.result?.total, page, pageSize, items.length),
  dedupeBy: item => item.id,
  onError: requestError => {
    console.error(requestError)
  }
})

const handleBetClick = (item: Item) => {
  navigateTo(`/rollover-details/${item.id}`, {
    state: { data: JSON.stringify(item) }
  })
}

const handleSort = () => {
  showFilterPopup.value = true
}

const handleFilterApply = async (values: Record<string, string | string[]>) => {
  filterValues.value = {
    ...createDefaultRolloverFilterValues(),
    ...values
  }
  await refresh()
}

const handleRetry = async () => {
  await refresh()
}
</script>

<style scoped>
.rollover-scroll-root {
  -webkit-overflow-scrolling: touch;
}
</style>

<style scoped lang="scss"></style>
