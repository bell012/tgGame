<template>
  <div>
    <div
      v-if="isReady && isMobile"
      class="fixed inset-0 bg-bg-1 sm:hidden flex flex-col overflow-hidden"
    >
      <H5Header :title="$t('personalCenter.transaction')" :show-sort="true" @sort="handleSort" />

      <div ref="scrollRoot" class="flex-1 overflow-y-auto">
        <div class="py-3.5 px-3.5">
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

          <div v-else class="flex flex-col gap-2">
            <div
              v-for="item in dataList"
              :key="item.id"
              class="bg-bg-2 rounded-lg py-2.5 px-3.5 cursor-pointer"
              @click="handleTransactionClick(item)"
            >
              <div class="flex items-center mb-5">
                <div class="mr-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-bg-4">
                  <TransactionAddIcon
                    v-if="item.direction === 'add'"
                    class="h-[22px] w-[22px] text-text-1"
                  />
                  <TransactionDecIcon v-else class="h-[22px] w-[22px] text-text-1" />
                </div>

                <div class="flex items-center justify-between w-full gap-3">
                  <h3 class="text-text-1 font-[700] text-sm">
                    {{ item.gameName }}
                  </h3>
                  <p
                    :class="item.direction === 'add' ? 'text-secondary-2' : 'text-secondary-4'"
                    class="text-sm font-[700]"
                  >
                    {{ item.betAmount }}
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <p class="text-text-2 text-xs">
                  {{ item.time }}
                </p>
                <div
                  class="size-[20px] bg-opacity-10 rounded-md flex items-center justify-center cursor-pointer"
                  @click.stop="handleTransactionClick(item)"
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

      <FilterPopup
        v-model:visible="showFilterPopup"
        v-model="filterValues"
        :filter-groups="filterGroups"
        @apply="handleFilterApply"
      />
    </div>

    <WalletLayout v-else-if="isReady" current-tab="transaction">
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
import TransactionAddIcon from '@/static/svg/transaction_add.svg?component'
import TransactionDecIcon from '@/static/svg/transaction_dec.svg?component'
import {
  TRANSACTION_PAGE_SIZE,
  buildTransactionQueryForm,
  createDefaultTransactionFilterValues,
  createTransactionTimeOptions,
  createTransactionTypeOptions,
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
  ...createDefaultTransactionFilterValues()
})

const filterGroups = computed<FilterGroup[]>(() => [
  {
    key: 'time',
    title: t('betHistory.filterGroups.time'),
    options: createTransactionTimeOptions(t)
  },
  {
    key: 'type',
    title: t('transaction.filterGroups.type'),
    options: createTransactionTypeOptions(t)
  }
])

const fetchTransaction = async (page: number, pageSize: number) => {
  const response = await Api.record.queryAcctHisPage(
    buildTransactionQueryForm({
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
} = useInfiniteScroll<Item, Awaited<ReturnType<typeof Api.record.queryAcctHisPage>>>({
  sentinel: loadMoreSentinel,
  root: scrollRoot,
  enabled: () => isReady.value && isMobile.value,
  pageSize: TRANSACTION_PAGE_SIZE,
  load: async ({ page, pageSize }) => fetchTransaction(page, pageSize),
  getItems: response => response.result?.records?.map(record => mapRecordToItem(record, t)) ?? [],
  getTotal: response => response.result?.total,
  getHasMore: (response, { page, pageSize, items }) =>
    hasMoreByTotal(response.result?.total, page, pageSize, items.length),
  dedupeBy: item => item.id,
  onError: requestError => {
    console.error(requestError)
  }
})

const handleTransactionClick = (item: Item) => {
  navigateTo(`/transaction-details/${item.id}`, {
    state: { data: JSON.stringify(item) }
  })
}

const showFilterPopup = ref(false)

const handleSort = () => {
  showFilterPopup.value = true
}

const handleFilterApply = async (values: Record<string, string | string[]>) => {
  filterValues.value = {
    ...createDefaultTransactionFilterValues(),
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

<style scoped lang="scss"></style>
