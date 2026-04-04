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
        :status-class-map="statusClassMap"
        :empty-img="EmptyImg"
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
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CustomSelect from '@/components/common/CustomSelect.vue'
import DesktopPagination from '@/components/common/DesktopPagination.vue'
import EmptyImg from '@/static/img/personalCenter/noData.png'
import MyOrdersTablePanel from './MyOrdersTablePanel.vue'
import {
  MOCK_DEPOSIT_ORDERS,
  MOCK_WITHDRAWAL_ORDERS,
  createDefaultMyOrdersFilterValues,
  createMyOrdersStatusOptions,
  createMyOrdersTimeOptions,
  createMyOrdersTypeOptions,
  filterMyOrders,
  formatOrderAmount,
  type MyOrdersFilterValues,
  type OrderStatus,
  type OrderStatusFilter,
  type OrderTab,
  type OrderTimeFilter,
  type OrderTypeFilter
} from './shared'

const { t } = useI18n()
const activeTopTab = ref<OrderTab>('deposits')
const desktopFilterValues = ref<Record<keyof MyOrdersFilterValues, string>>({
  ...createDefaultMyOrdersFilterValues()
})
const desktopPagination = reactive({
  page: 1,
  pageSize: 10
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

const normalizedDesktopFilters = computed(() => normalizeFilterValues(desktopFilterValues.value))

const timeOptions = computed(() => createMyOrdersTimeOptions(t))
const typeOptions = computed(() => createMyOrdersTypeOptions())
const statusOptions = computed(() => createMyOrdersStatusOptions())

const filteredDesktopOrders = computed(() =>
  filterMyOrders(currentOrderSource.value, normalizedDesktopFilters.value)
)

const desktopTotalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(filteredDesktopOrders.value.length / Math.max(1, desktopPagination.pageSize))
  )
)

const desktopPaginatedOrders = computed(() => {
  const start = (desktopPagination.page - 1) * desktopPagination.pageSize
  const end = start + desktopPagination.pageSize
  return filteredDesktopOrders.value.slice(start, end)
})

const desktopRows = computed(() =>
  desktopPaginatedOrders.value.map(item => ({
    id: item.id,
    type: item.typeLabel,
    time: item.timeLabel,
    amount: formatDisplayAmount(item.amount, item.currency),
    status: item.status
  }))
)

const desktopViewState = computed<'table' | 'empty'>(() =>
  filteredDesktopOrders.value.length > 0 ? 'table' : 'empty'
)

/**
 * 格式化页面展示金额。
 */
const formatDisplayAmount = (amount: number, currency: string) => {
  const formatted = formatOrderAmount(amount, currency)
  return currency === 'PHP' ? formatted.replace('₱', '₱ ') : formatted
}

/**
 * 处理顶部切换栏点击。
 */
const handleTopTabChange = (tab: OrderTab) => {
  if (activeTopTab.value === tab) return
  activeTopTab.value = tab
  desktopPagination.page = 1
}

/**
 * 处理 PC 分页切换。
 */
const handleDesktopPageChange = (page: number) => {
  desktopPagination.page = page
}
</script>
