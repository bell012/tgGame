<template>
  <!-- PC 页面内容区 -->
  <div class="space-y-4">
    <!-- PC 顶部切换栏 -->
    <div
      class="grid h-[48px] grid-cols-2 rounded-[10px] bg-bg-2 p-1 text-center text-[14px] font-[700]"
    >
      <!-- PC 充值订单切换按钮 -->
      <button
        type="button"
        class="flex items-center justify-center rounded-[8px] transition-colors"
        :class="[activeTopTab === 'deposits' ? 'bg-bg-4 text-text-1' : 'text-text-2']"
        @click="handleTopTabChange('deposits')"
      >
        Deposits
      </button>

      <!-- PC 提现订单切换按钮 -->
      <button
        type="button"
        class="flex items-center justify-center rounded-[8px] transition-colors"
        :class="[activeTopTab === 'withdrawals' ? 'bg-bg-4 text-text-1' : 'text-text-2']"
        @click="handleTopTabChange('withdrawals')"
      >
        Withdrawals
      </button>
    </div>

    <!-- PC 表格容器 -->
    <section class="rounded-[12px] bg-bg-2 p-5">
      <!-- PC 筛选区域 -->
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <!-- PC 日期筛选框 -->
        <CustomSelect
          v-model="desktopFilterValues.time"
          class="w-[240px]"
          :options="timeOptions"
          :placeholder="'Date Selection'"
        />

        <!-- PC 类型筛选框 -->
        <CustomSelect
          v-model="desktopFilterValues.type"
          class="w-[240px]"
          :options="typeOptions"
          :placeholder="'Types Selection'"
        />

        <!-- PC 状态筛选框 -->
        <CustomSelect
          v-model="desktopFilterValues.status"
          class="w-[240px]"
          :options="statusOptions"
          :placeholder="'Statuses Selection'"
        />
      </div>

      <!-- PC 表格组件 -->
      <MyOrdersTablePanel
        :view-state="desktopViewState"
        :rows="desktopRows"
        :empty-img="EmptyImg"
        @row-click="handleDesktopRowClick"
      />

      <!-- PC 分页组件 -->
      <DesktopPagination
        v-if="desktopViewState === 'table'"
        class="mt-5"
        :current-page="desktopPagination.page"
        :total-pages="desktopTotalPages"
        @change="handleDesktopPageChange"
      />
    </section>
  </div>

  <!-- PC 订单详情弹窗 -->
  <depositPopShell :model-value="!!selectedDesktopOrder" @overlay-close="handleCloseDetail">
    <div
      v-if="selectedDesktopOrder"
      class="relative h-[500px] w-[480px] flex flex-col items-center gap-4 rounded-lg modal-container bg-bg-1 font-['Inter']"
    >
      <!-- 订单弹窗头部 -->
      <div class="relative h-14 w-full shrink-0 rounded-t-lg bg-bg-2">
        <!-- 订单标题 -->
        <h2
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[18px] font-bold leading-[22px] text-text-1"
        >
          {{
            activeTopTab === 'deposits' ? t('deposit.deposit_order') : t('withdraw.withdraw_order')
          }}
        </h2>

        <!-- 桌面端头部操作区 -->
        <button
          type="button"
          class="absolute right-4 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-opacity-10"
          @click="handleCloseDetail"
        >
          <CloseIcon class="h-3 w-3 fill-none" />
        </button>
      </div>

      <OrderDetailScrollPanel
        :order="selectedDesktopOrder"
        :tab="activeTopTab"
        mode="pc"
        @copy-order-no="handleCopyOrderNo"
      />
    </div>
  </depositPopShell>
</template>

<script setup lang="ts">
import Api from '@/api'
import type {
  QueryMemberPayOrderPageRecord,
  QueryMemberPayOrderPageResult
} from '@/api/interface/wallet'
import CustomSelect from '@/components/common/CustomSelect.vue'
import DesktopPagination from '@/components/common/DesktopPagination.vue'
import depositPopShell from '@/components/deposit/shared/depositPopShell.vue'
import EmptyImg from '@/static/img/personalCenter/noData.png'
import CloseIcon from '@/static/svg/close.svg?component'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import MyOrdersTablePanel from './MyOrdersTablePanel.vue'
import OrderDetailScrollPanel from './OrderDetailScrollPanel.vue'
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
  getMyOrderTypeLabel,
  matchMyOrdersTypeFilter,
  type MyOrdersFilterValues,
  type OrderTab,
  type OrderTimeFilter,
  type OrderTypeFilter
} from './shared'

const { t, locale } = useI18n()
const activeTopTab = ref<OrderTab>('deposits')
const desktopFilterValues = ref<Record<keyof MyOrdersFilterValues, string>>({
  ...createDefaultMyOrdersFilterValues()
})
const desktopPagination = reactive({
  page: 1,
  pageSize: MY_ORDERS_PAGE_SIZE
})
const selectedDesktopOrder = ref<QueryMemberPayOrderPageRecord | null>(null)
const desktopRecords = ref<QueryMemberPayOrderPageRecord[]>([])
const desktopTotalPages = ref(1)

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

const normalizedDesktopFilters = computed(() => normalizeFilterValues(desktopFilterValues.value))

const timeOptions = computed(() => createMyOrdersTimeOptions(t))
const typeOptions = computed(() => createMyOrdersTypeOptions())
const statusOptions = computed(() => createMyOrdersStatusOptions())

const desktopRows = computed(() =>
  desktopRecords.value.map(item => ({
    id: item.orderId,
    type: getMyOrderTypeLabel(item, String(locale.value || 'eng')),
    time: formatMyOrderTime(item.createTime),
    amount: formatDisplayAmount(Number(item.busiAmount ?? 0), item.currency),
    status: getMyOrderStatusText(activeTopTab.value, item.status, t),
    statusClass: getMyOrderStatusClass(activeTopTab.value, item.status)
  }))
)

const desktopViewState = computed<'table' | 'empty'>(() =>
  desktopRows.value.length > 0 ? 'table' : 'empty'
)

/**
 * 格式化页面展示金额。
 */
const formatDisplayAmount = (amount: number, currency: string) => {
  const formatted = formatOrderAmount(amount, currency)
  return currency === 'PHP' ? formatted.replace('₱', '₱ ') : formatted
}

const fetchDesktopOrders = async () => {
  const response = await Api.wallet.queryMemberPayOrderPage(
    buildMyOrdersQueryParams(
      activeTopTab.value,
      normalizedDesktopFilters.value,
      desktopPagination.page,
      desktopPagination.pageSize
    )
  )

  if (!response.success) {
    throw new Error(response.message || t('common.requestError'))
  }

  const result: QueryMemberPayOrderPageResult = response.result ?? {
    current: desktopPagination.page,
    pages: 1,
    records: [],
    size: desktopPagination.pageSize,
    total: 0
  }

  desktopRecords.value = result.records.filter(record =>
    matchMyOrdersTypeFilter(
      record,
      normalizedDesktopFilters.value.type,
      String(locale.value || 'eng')
    )
  )
  desktopTotalPages.value = Math.max(1, result.pages || 1)
}

/**
 * 处理顶部切换栏点击。
 */
const handleTopTabChange = async (tab: OrderTab) => {
  if (activeTopTab.value === tab) return

  activeTopTab.value = tab
  selectedDesktopOrder.value = null

  if (desktopPagination.page !== 1) {
    desktopPagination.page = 1
    return
  }

  await fetchDesktopOrders()
}

/**
 * 处理 PC 分页切换。
 */
const handleDesktopPageChange = async (page: number) => {
  if (desktopPagination.page === page) return

  desktopPagination.page = page
  selectedDesktopOrder.value = null
}

/**
 * 处理 PC 表格行点击，打开详情弹窗。
 */
const handleDesktopRowClick = (row: { id: string }) => {
  selectedDesktopOrder.value = desktopRecords.value.find(item => item.orderId === row.id) ?? null
}

/**
 * 关闭 PC 详情弹窗。
 */
const handleCloseDetail = () => {
  selectedDesktopOrder.value = null
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

watch(
  normalizedDesktopFilters,
  async () => {
    selectedDesktopOrder.value = null

    if (desktopPagination.page !== 1) {
      desktopPagination.page = 1
      return
    }

    await fetchDesktopOrders()
  },
  { deep: true }
)

watch(
  () => desktopPagination.page,
  async () => {
    selectedDesktopOrder.value = null
    await fetchDesktopOrders()
  },
  { immediate: true }
)
</script>
