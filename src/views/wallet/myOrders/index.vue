<template>
  <div>
    <!-- H5 端页面容器 -->
    <div
      v-if="isReady && isMobile"
      class="fixed inset-0 flex flex-col overflow-hidden bg-bg-1 sm:hidden"
    >
      <!-- H5 订单详情页面 -->
      <template v-if="selectedMobileOrder">
        <!-- H5 详情头部 -->
        <H5Header
          :title="
            activeTopTab === 'deposits'
              ? t('wallet.myOrdersPage.depositDetails')
              : t('wallet.myOrdersPage.withdrawalDetails')
          "
          showSort
          :right-icon="CustomerServiceIcon"
          :disable-default-back="true"
          @sort="handleCustomerServiceClick"
          @back="handleBackFromDetail"
        />

        <OrderDetailScrollPanel
          :order="selectedMobileOrder"
          :tab="activeTopTab"
          @copy-order-no="handleCopyOrderNo"
        />
      </template>

      <!-- H5 订单列表页面 -->
      <template v-else>
        <!-- H5 列表头部 -->
        <H5Header :title="t('wallet.myOrders')" :show-sort="true" @sort="handleOpenMobileFilter" />

        <!-- H5 列表滚动区域 -->
        <div ref="scrollRoot" class="flex-1 overflow-y-auto">
          <!-- H5 列表内容区域 -->
          <div class="px-3.5 pb-4 pt-3.5">
            <!-- H5 顶部切换栏 -->
            <div class="mb-3.5 rounded-[8px] bg-bg-2 p-0.5">
              <!-- H5 顶部切换栏按钮组 -->
              <div class="grid h-[39px] grid-cols-2 gap-0.5 rounded-[8px]">
                <!-- H5 充值订单切换按钮 -->
                <button
                  type="button"
                  class="flex items-center justify-center rounded-[8px] text-sm leading-[17px] transition-colors"
                  :class="
                    activeTopTab === 'deposits'
                      ? 'bg-bg-3 font-[700] text-text-1'
                      : 'font-[400] text-text-2'
                  "
                  @click="handleTopTabChange('deposits')"
                >
                  {{ t('wallet.deposit') }}
                </button>

                <!-- H5 提现订单切换按钮 -->
                <button
                  type="button"
                  class="flex items-center justify-center rounded-[8px] text-sm leading-[17px] transition-colors"
                  :class="
                    activeTopTab === 'withdrawals'
                      ? 'bg-bg-3 font-[700] text-text-1'
                      : 'font-[400] text-text-2'
                  "
                  @click="handleTopTabChange('withdrawals')"
                >
                  {{ t('wallet.withdraw') }}
                </button>
              </div>
            </div>

            <!-- H5 请求错误状态 -->
            <div
              v-if="mobileError && mobileRows.length === 0"
              class="mt-[100px] flex flex-col items-center justify-center gap-3"
            >
              <!-- H5 请求错误文案 -->
              <p class="text-xs font-[500] text-secondary-4" @click="handleRetry">
                {{ t('common.requestError') }}
              </p>
            </div>

            <!-- H5 空状态 -->
            <div
              v-else-if="!mobileLoading && mobileRows.length === 0"
              class="mt-[100px] flex flex-col items-center justify-center"
            >
              <!-- 空状态 -->
              <ThemedEmptyState
                :dark-image="EmptyImg"
                :image-alt="t('common.noData')"
                :message="t('common.noData')"
                container-class="mt-0"
                image-class="mb-2.5 h-[200px] w-auto"
                text-class="mb-5 text-xs font-[500] text-text-1"
              />

              <!-- H5 空状态按钮 -->
              <button
                class="flex h-[40px] w-[200px] items-center justify-center rounded-lg bg-theme-primary text-sm font-[700] text-text-4"
                @click="handleStartPlaying"
              >
                {{ t('betHistory.startPlaying') }}
              </button>
            </div>

            <!-- H5 订单列表 -->
            <div v-else class="flex flex-col gap-2.5">
              <!-- H5 订单卡片 -->
              <button
                v-for="item in mobileRows"
                :key="item.orderId"
                type="button"
                class="overflow-hidden rounded-[10px] bg-bg-2 text-left"
                @click="handleMobileOrderClick(item)"
              >
                <!-- H5 订单卡片顶部 -->
                <div
                  class="flex items-center justify-between gap-3 border-b border-opacity-5 px-3.5 py-3"
                >
                  <!-- H5 订单卡片顶部左侧 -->
                  <div class="flex min-w-0 items-center gap-2.5">
                    <!-- H5 订单方式图标 -->
                    <div
                      class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-bg-4"
                    >
                      <img
                        :src="getOrderTypeIcon(item)"
                        :alt="getOrderTypeLabel(item)"
                        class="h-full w-full object-cover"
                      />
                    </div>

                    <!-- H5 订单方式名称 -->
                    <p class="truncate text-sm font-[700] leading-[17px] text-text-1">
                      {{ getOrderTypeLabel(item) }}
                    </p>
                  </div>

                  <!-- H5 订单金额区域 -->
                  <div class="flex min-w-0 items-center gap-1.5">
                    <!-- H5 订单币种标签 -->
                    <!-- <span class="text-[10px] font-[400] leading-[12px] text-text-2">
                      {{ item.currency }}
                    </span> -->

                    <!-- H5 订单金额文本 -->
                    <span class="truncate text-base font-[700] leading-[19px] text-text-1">
                      {{ formatDisplayAmount(Number(item.busiAmount ?? 0), item.currency) }}
                    </span>
                  </div>
                </div>

                <!-- H5 订单卡片底部 -->
                <div class="flex items-center justify-between px-3.5 py-3">
                  <!-- H5 订单时间 -->
                  <p class="text-xs leading-[15px] text-text-2">
                    {{ formatMyOrderTime(item.createTime) }}
                  </p>

                  <!-- H5 订单状态操作区 -->
                  <div class="flex items-center gap-2.5">
                    <!-- H5 订单状态文案 -->
                    <span :class="['text-xs font-[700] leading-[15px]', getOrderStatusClass(item)]">
                      {{ getOrderStatusText(item) }}
                    </span>

                    <!-- H5 订单详情按钮 -->
                    <div
                      class="flex h-5 w-5 items-center justify-center rounded-md bg-opacity-10 text-text-2"
                    >
                      <ArrowRightIcon class="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </button>

              <!-- H5 加载中提示 -->
              <p v-if="mobileLoading" class="py-3 text-center text-xs text-text-2">
                {{ mobileRows.length === 0 ? t('common.loading') : t('common.loadingMore') }}
              </p>

              <!-- H5 加载失败提示 -->
              <p
                v-else-if="mobileError"
                class="py-3 text-center text-xs text-secondary-4"
                @click="handleRetry"
              >
                {{ t('common.requestError') }}
              </p>

              <!-- H5 无更多数据提示 -->
              <p
                v-else-if="mobileFinished && mobileRows.length > 0"
                class="py-3 text-center text-xs text-text-2"
              >
                {{ t('wallet.myOrdersPage.noMoreOrders') }}
              </p>

              <!-- H5 无限滚动哨兵 -->
              <div ref="loadMoreSentinel" class="h-px w-full"></div>
            </div>
          </div>
        </div>

        <!-- H5 筛选弹窗 -->
        <FilterPopup
          v-model:visible="showMobileFilterPopup"
          v-model="mobileFilterValues"
          :filter-groups="mobileFilterGroups"
          @apply="handleMobileFilterApply"
        />
      </template>
    </div>

    <!-- PC 端页面容器 -->
    <WalletLayout v-else-if="isReady" current-tab="my-orders">
      <!-- PC 端布局组件 -->
      <PcLayout />
    </WalletLayout>
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import type {
  QueryMemberPayOrderPageRecord,
  QueryMemberPayOrderPageResult
} from '@/api/interface/wallet'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import H5Header from '@/components/common/H5Header.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useIsMobile } from '@/composables/useMediaQuery'
import EmptyImg from '@/static/img/personalCenter/noData.png'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import CustomerServiceIcon from '@/static/svg/customer-service.svg?component'
import { navigateTo } from '@/utils/router'
import { showToast } from 'vant'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import WalletLayout from '../index.vue'
import OrderDetailScrollPanel from './OrderDetailScrollPanel.vue'
import PcLayout from './pc-layout.vue'
import {
  MY_ORDERS_PAGE_SIZE,
  buildMyOrdersQueryParams,
  copyTextWithFallback,
  createDefaultMyOrdersFilterValues,
  createMyOrdersStatusOptions,
  createMyOrdersTimeOptions,
  createMyOrdersTypeOptions,
  formatMyOrderTime,
  formatOrderAmount,
  getMyOrderStatusClass,
  getMyOrderStatusText,
  getMyOrderTypeIcon,
  getMyOrderTypeLabel,
  matchMyOrdersTypeFilter,
  type MyOrdersFilterValues,
  type OrderTab,
  type OrderTimeFilter,
  type OrderTypeFilter
} from './shared'

const { t, locale } = useI18n()
const isMobile = useIsMobile()
const isReady = ref(false)

const activeTopTab = ref<OrderTab>('deposits')
const selectedMobileOrder = ref<QueryMemberPayOrderPageRecord | null>(null)

const scrollRoot = ref<HTMLElement | null>(null)
const loadMoreSentinel = ref<HTMLElement | null>(null)
const showMobileFilterPopup = ref(false)
const mobileFilterValues = ref<Record<string, string | string[]>>({
  ...createDefaultMyOrdersFilterValues()
})

/**
 * 归一化筛选值。
 */
const normalizeFilterValues = (values: Record<string, string | string[]>): MyOrdersFilterValues => {
  const timeValue = Array.isArray(values.time) ? values.time[0] : values.time
  const typeValue = Array.isArray(values.type) ? values.type[0] : values.type
  const statusValue = Array.isArray(values.status) ? values.status[0] : values.status

  return {
    time: (timeValue ?? 'all') as OrderTimeFilter,
    type: (typeValue ?? 'all') as OrderTypeFilter,
    status: (statusValue ?? 'all') as MyOrdersFilterValues['status']
  }
}

const normalizedMobileFilters = computed(() => normalizeFilterValues(mobileFilterValues.value))

const mobileFilterGroups = computed<FilterGroup[]>(() => [
  {
    key: 'time',
    title: t('wallet.myOrdersPage.filterGroups.date'),
    options: createMyOrdersTimeOptions(t)
  },
  {
    key: 'type',
    title: t('wallet.myOrdersPage.filterGroups.type'),
    options: createMyOrdersTypeOptions(t)
  },
  {
    key: 'status',
    title: t('wallet.myOrdersPage.filterGroups.status'),
    options: createMyOrdersStatusOptions(t)
  }
])

/**
 * 加载 H5 订单分页数据。
 */
const loadMobileOrders = async (page: number, pageSize: number) => {
  const response = await Api.wallet.queryMemberPayOrderPage(
    buildMyOrdersQueryParams(activeTopTab.value, normalizedMobileFilters.value, page, pageSize)
  )

  if (!response.success) {
    throw new Error(response.message || t('common.requestError'))
  }

  const result: QueryMemberPayOrderPageResult = response.result ?? {
    current: page,
    pages: 0,
    records: [],
    size: pageSize,
    total: 0
  }

  return {
    ...result,
    records: result.records.filter(record =>
      matchMyOrdersTypeFilter(
        record,
        normalizedMobileFilters.value.type,
        String(locale.value || 'eng')
      )
    )
  }
}

const {
  list: mobileRows,
  loading: mobileLoading,
  finished: mobileFinished,
  error: mobileError,
  refresh
} = useInfiniteScroll<QueryMemberPayOrderPageRecord, Awaited<ReturnType<typeof loadMobileOrders>>>({
  sentinel: loadMoreSentinel,
  root: scrollRoot,
  enabled: () => isReady.value && isMobile.value && !selectedMobileOrder.value,
  pageSize: MY_ORDERS_PAGE_SIZE,
  load: async ({ page, pageSize }) => loadMobileOrders(page, pageSize),
  getItems: response => response.records,
  getTotal: response => response.total,
  getHasMore: (response, { page, pageSize }) => page * pageSize < response.total,
  dedupeBy: item => item.orderId,
  onError: error => {
    console.error(error)
  }
})

/**
 * 格式化页面展示金额。
 */
const formatDisplayAmount = (amount: number, currency: string) => {
  const formatted = formatOrderAmount(amount, currency)
  return currency === 'PHP' ? formatted.replace('₱', '₱ ') : formatted
}

const getOrderTypeLabel = (record: QueryMemberPayOrderPageRecord) =>
  getMyOrderTypeLabel(record, String(locale.value || 'eng'))

const getOrderTypeIcon = (record: QueryMemberPayOrderPageRecord) =>
  getMyOrderTypeIcon(record, String(locale.value || 'eng'))

const getOrderStatusText = (record: QueryMemberPayOrderPageRecord) =>
  getMyOrderStatusText(activeTopTab.value, record.status, t)

const getOrderStatusClass = (record: QueryMemberPayOrderPageRecord) =>
  getMyOrderStatusClass(activeTopTab.value, record.status)

/**
 * 处理顶部切换栏点击。
 */
const handleTopTabChange = async (tab: OrderTab) => {
  if (activeTopTab.value === tab) return

  activeTopTab.value = tab
  selectedMobileOrder.value = null

  if (isReady.value && isMobile.value) {
    await refresh()
  }
}

/**
 * 打开 H5 筛选弹窗。
 */
const handleOpenMobileFilter = () => {
  showMobileFilterPopup.value = true
}

/**
 * 应用 H5 筛选条件。
 */
const handleMobileFilterApply = async (values: Record<string, string | string[]>) => {
  mobileFilterValues.value = {
    ...createDefaultMyOrdersFilterValues(),
    ...values
  }
  selectedMobileOrder.value = null
  await refresh()
}

/**
 * 处理 H5 列表重试。
 */
const handleRetry = async () => {
  await refresh()
}

/**
 * 处理开始游戏按钮点击。
 */
const handleStartPlaying = () => {
  navigateTo('/')
}

/**
 * 打开 H5 订单详情。
 */
const handleMobileOrderClick = (item: QueryMemberPayOrderPageRecord) => {
  selectedMobileOrder.value = item
}

/**
 * 处理 H5 详情返回。
 */
const handleBackFromDetail = () => {
  selectedMobileOrder.value = null
}

/**
 * 处理客服按钮点击。
 */
const handleCustomerServiceClick = () => {
  // TODO：处理客服按钮点击。
  showToast({
    message: t('sidebar_menu.customer_service')
  })
}

/**
 * 复制订单号。
 */
const handleCopyOrderNo = async (orderNo: string) => {
  const copied = await copyTextWithFallback(orderNo)
  showToast({
    message: copied ? t('betDetails.copy') : t('common.error'),
    type: copied ? 'success' : 'fail'
  })
}

onMounted(() => {
  isReady.value = true
})
</script>
