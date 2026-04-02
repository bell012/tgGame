<template>
  <div>
    <!-- H5 端页面容器 -->
    <div
      v-if="isReady && isMobile"
      class="fixed inset-0 block bg-bg-1 md:hidden flex flex-col overflow-hidden"
    >
      <!-- H5 订单详情页面 -->
      <template v-if="selectedMobileOrder">
        <!-- H5 详情头部 -->
        <H5Header
          :title="selectedMobileOrder.tab === 'deposits' ? 'Deposit Order' : 'Withdrawal Order'"
          :disable-default-back="true"
          @back="handleBackFromDetail"
        />

        <!-- H5 详情滚动区域 -->
        <div class="flex-1 overflow-y-auto">
          <!-- H5 详情内容区域 -->
          <div class="px-3.5 pb-4 pt-3.5">
            <!-- H5 详情卡片 -->
            <section class="rounded-[12px] bg-bg-2 px-3.5 pb-3.5 pt-[30px]">
              <!-- H5 详情顶部金额区域 -->
              <div class="flex flex-col items-center gap-3">
                <!-- H5 详情顶部金额展示 -->
                <div class="flex items-center gap-1">
                  <!-- H5 详情顶部币种图标 -->
                  <div
                    class="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full"
                  >
                    <img
                      :src="selectedMobileOrder.icon"
                      :alt="selectedMobileOrder.typeLabel"
                      class="h-full w-full object-cover"
                    />
                  </div>

                  <!-- H5 详情顶部金额文本 -->
                  <span class="text-[25px] font-[700] leading-[30px] text-text-1">
                    {{ formatHeroAmount(selectedMobileOrder.amount) }}
                  </span>
                </div>

                <!-- H5 详情顶部标题 -->
                <p class="text-sm leading-[17px] text-text-1">
                  {{
                    selectedMobileOrder.tab === 'deposits' ? 'Deposit Amount' : 'Withdrawal Amount'
                  }}
                </p>
              </div>

              <!-- H5 详情信息面板 -->
              <div class="mt-5 rounded-[12px] bg-bg-3 p-3.5">
                <!-- H5 详情币种行 -->
                <div class="flex items-center justify-between py-2">
                  <span class="text-sm leading-[17px] text-text-3">Currency</span>
                  <span class="text-sm leading-[17px] text-text-1">
                    {{ selectedMobileOrder.currency }}
                  </span>
                </div>

                <!-- H5 详情支付金额行 -->
                <div class="flex items-center justify-between py-2">
                  <span class="text-sm leading-[17px] text-text-3">Payment Amount</span>
                  <span class="text-sm leading-[17px] text-text-1">
                    {{
                      formatDisplayAmount(
                        selectedMobileOrder.paymentAmount,
                        selectedMobileOrder.currency
                      )
                    }}
                  </span>
                </div>

                <!-- H5 详情优惠金额行 -->
                <div
                  v-if="selectedMobileOrder.tab === 'deposits'"
                  class="flex items-center justify-between py-2"
                >
                  <span class="text-sm leading-[17px] text-text-3">Deposit Bonus</span>
                  <span class="text-sm leading-[17px] text-text-1">
                    {{
                      formatDisplayAmount(
                        selectedMobileOrder.bonusAmount,
                        selectedMobileOrder.currency
                      )
                    }}
                  </span>
                </div>

                <!-- H5 详情状态行 -->
                <div class="flex items-center justify-between py-2">
                  <span class="text-sm leading-[17px] text-text-3">Order Status</span>
                  <span
                    :class="['text-sm leading-[17px]', statusClassMap[selectedMobileOrder.status]]"
                  >
                    {{ selectedMobileOrder.status }}
                  </span>
                </div>

                <!-- H5 详情订单号行 -->
                <div class="flex items-center justify-between py-2">
                  <span class="text-sm leading-[17px] text-text-3">Order No.</span>

                  <!-- H5 详情订单号操作区 -->
                  <div class="flex items-center gap-2">
                    <span class="text-sm leading-[17px] text-text-1">
                      {{ selectedMobileOrder.orderNo }}
                    </span>

                    <!-- H5 详情复制按钮 -->
                    <button
                      type="button"
                      class="flex h-4 w-4 items-center justify-center text-text-2"
                      @click="handleCopyOrderNo(selectedMobileOrder.orderNo)"
                    >
                      <CopyIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <!-- H5 详情创建时间行 -->
                <div class="flex items-center justify-between py-2">
                  <span class="text-sm leading-[17px] text-text-3">Created At</span>
                  <span class="text-sm leading-[17px] text-text-1">
                    {{ selectedMobileOrder.createdAt }}
                  </span>
                </div>

                <!-- H5 详情方式行 -->
                <div class="flex items-center justify-between py-2">
                  <span class="text-sm leading-[17px] text-text-3">
                    {{
                      selectedMobileOrder.tab === 'deposits'
                        ? 'Deposit Method'
                        : 'Withdrawal Method'
                    }}
                  </span>

                  <!-- H5 详情方式内容区 -->
                  <div class="flex items-center gap-2">
                    <div
                      class="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full"
                    >
                      <img
                        :src="selectedMobileOrder.icon"
                        :alt="selectedMobileOrder.typeLabel"
                        class="h-full w-full object-cover"
                      />
                    </div>
                    <span class="text-sm leading-[17px] text-text-1">
                      {{ selectedMobileOrder.typeLabel }}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
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
                  Deposits
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
                  Withdrawals
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
              <!-- H5 空状态图片 -->
              <img :src="EmptyImg" alt="No data" class="mb-2.5 h-[200px] w-auto" />

              <!-- H5 空状态文案 -->
              <p class="mb-5 text-xs font-[500] text-text-1">
                {{ t('common.noData') }}
              </p>

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
                :key="item.id"
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
                        :src="item.icon"
                        :alt="item.typeLabel"
                        class="h-full w-full object-cover"
                      />
                    </div>

                    <!-- H5 订单方式名称 -->
                    <p class="truncate text-sm font-[700] leading-[17px] text-text-1">
                      {{ item.typeLabel }}
                    </p>
                  </div>

                  <!-- H5 订单金额区域 -->
                  <div class="flex min-w-0 items-center gap-1.5">
                    <!-- H5 订单币种标签 -->
                    <span class="text-[10px] font-[400] leading-[12px] text-text-2">
                      {{ item.currency }}
                    </span>

                    <!-- H5 订单金额文本 -->
                    <span class="truncate text-base font-[700] leading-[19px] text-text-1">
                      {{ formatDisplayAmount(item.amount, item.currency) }}
                    </span>
                  </div>
                </div>

                <!-- H5 订单卡片底部 -->
                <div class="flex items-center justify-between px-3.5 py-3">
                  <!-- H5 订单时间 -->
                  <p class="text-xs leading-[15px] text-text-2">{{ item.timeLabel }}</p>

                  <!-- H5 订单状态操作区 -->
                  <div class="flex items-center gap-2.5">
                    <!-- H5 订单状态文案 -->
                    <span
                      :class="['text-xs font-[700] leading-[15px]', statusClassMap[item.status]]"
                    >
                      {{ item.status }}
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
                No more orders
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
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateTo } from '@/utils/router'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useIsMobile } from '@/composables/useMediaQuery'
import H5Header from '@/components/common/H5Header.vue'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import EmptyImg from '@/static/img/personalCenter/noData.png'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import CopyIcon from '@/static/svg/copy.svg?component'
import WalletLayout from '../index.vue'
import PcLayout from './pc-layout.vue'
import {
  MOCK_DEPOSIT_ORDERS,
  MOCK_WITHDRAWAL_ORDERS,
  MY_ORDERS_PAGE_SIZE,
  createDefaultMyOrdersFilterValues,
  createMyOrdersStatusOptions,
  createMyOrdersTimeOptions,
  createMyOrdersTypeOptions,
  filterMyOrders,
  formatOrderAmount,
  hasMoreMyOrders,
  sliceMyOrdersByPage,
  type MyOrderItem,
  type MyOrdersFilterValues,
  type OrderStatus,
  type OrderStatusFilter,
  type OrderTab,
  type OrderTimeFilter,
  type OrderTypeFilter
} from './shared'

const { t } = useI18n()
const isMobile = useIsMobile()
const isReady = ref(false)

const activeTopTab = ref<OrderTab>('deposits')
const selectedMobileOrder = ref<MyOrderItem | null>(null)

const scrollRoot = ref<HTMLElement | null>(null)
const loadMoreSentinel = ref<HTMLElement | null>(null)
const showMobileFilterPopup = ref(false)
const mobileFilterValues = ref<Record<string, string | string[]>>({
  ...createDefaultMyOrdersFilterValues()
})

const statusClassMap: Record<OrderStatus, string> = {
  Success: 'text-secondary-2',
  Failed: 'text-secondary-4',
  Processing: 'text-secondary-7'
}

const currentOrderSource = computed(() =>
  activeTopTab.value === 'deposits' ? MOCK_DEPOSIT_ORDERS : MOCK_WITHDRAWAL_ORDERS
)

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
    status: (statusValue ?? 'all') as OrderStatusFilter
  }
}

const normalizedMobileFilters = computed(() => normalizeFilterValues(mobileFilterValues.value))

const mobileFilterGroups = computed<FilterGroup[]>(() => [
  {
    key: 'time',
    title: 'Date Selection',
    options: createMyOrdersTimeOptions(t)
  },
  {
    key: 'type',
    title: 'Types Selection',
    options: createMyOrdersTypeOptions()
  },
  {
    key: 'status',
    title: 'Statuses Selection',
    options: createMyOrdersStatusOptions()
  }
])

/**
 * 加载 H5 订单分页数据。
 */
const loadMobileOrders = async (page: number, pageSize: number) => {
  const filteredOrders = filterMyOrders(currentOrderSource.value, normalizedMobileFilters.value)
  return sliceMyOrdersByPage(filteredOrders, page, pageSize)
}

const {
  list: mobileRows,
  loading: mobileLoading,
  finished: mobileFinished,
  error: mobileError,
  refresh
} = useInfiniteScroll<MyOrderItem, Awaited<ReturnType<typeof loadMobileOrders>>>({
  sentinel: loadMoreSentinel,
  root: scrollRoot,
  enabled: () => isReady.value && isMobile.value && !selectedMobileOrder.value,
  pageSize: MY_ORDERS_PAGE_SIZE,
  load: async ({ page, pageSize }) => loadMobileOrders(page, pageSize),
  getItems: response => response.items,
  getTotal: response => response.total,
  getHasMore: (response, { page, pageSize }) => hasMoreMyOrders(response.total, page, pageSize),
  dedupeBy: item => item.id,
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

/**
 * 格式化详情顶部大金额。
 */
const formatHeroAmount = (amount: number) => String(amount)

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
const handleMobileOrderClick = (item: MyOrderItem) => {
  selectedMobileOrder.value = item
}

/**
 * 处理 H5 详情返回。
 */
const handleBackFromDetail = () => {
  selectedMobileOrder.value = null
}

/**
 * 复制订单号。
 */
const handleCopyOrderNo = async (orderNo: string) => {
  await navigator.clipboard.writeText(orderNo)
}

onMounted(() => {
  isReady.value = true
})
</script>
