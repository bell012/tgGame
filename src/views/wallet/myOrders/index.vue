<template>
  <div>
    <div v-if="isMobile" class="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1">
      <H5Header :title="t('wallet.myOrders')" />
      <div class="flex-1 min-h-0 px-3 pb-3">
        <div class="h-full overflow-auto rounded-xl bg-bg-2 p-3">
          <div class="mb-3 grid h-[40px] grid-cols-2 rounded-lg bg-bg-4 p-1 text-center text-xs">
            <button
              type="button"
              class="flex items-center justify-center rounded-md transition-colors"
              :class="[
                activeTopTab === 'deposits' ? 'bg-bg-3 font-[700] text-text-1' : 'text-text-2'
              ]"
              @click="activeTopTab = 'deposits'"
            >
              Deposits
            </button>
            <button
              type="button"
              class="flex items-center justify-center rounded-md transition-colors"
              :class="[
                activeTopTab === 'withdrawals' ? 'bg-bg-3 font-[700] text-text-1' : 'text-text-2'
              ]"
              @click="activeTopTab = 'withdrawals'"
            >
              Withdrawals
            </button>
          </div>
          <div
            class="grid grid-cols-4 rounded-lg bg-bg-4 px-3 py-2 text-[12px] font-[700] text-text-1"
          >
            <div>Type</div>
            <div>Time</div>
            <div>Amount</div>
            <div class="text-right">Status</div>
          </div>
          <div
            v-for="(item, idx) in rows"
            :key="`${item.type}-${idx}`"
            class="grid grid-cols-4 border-b border-[#FFFFFF0A] px-3 py-3 text-[12px]"
          >
            <div class="font-[700] text-text-1">{{ item.type }}</div>
            <div class="text-text-2">{{ item.time }}</div>
            <div class="font-[700] text-text-1">{{ item.amount }}</div>
            <div class="text-right font-[700]">
              <span :class="statusClassMap[item.status]">{{ item.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <WalletLayout v-else current-tab="my-orders">
      <div class="space-y-4">
        <div
          class="grid h-[48px] grid-cols-2 rounded-[10px] bg-bg-2 p-1 text-center text-[14px] font-[700]"
        >
          <button
            type="button"
            class="flex items-center justify-center rounded-[8px] transition-colors"
            :class="[activeTopTab === 'deposits' ? 'bg-bg-4 text-text-1' : 'text-text-2']"
            @click="activeTopTab = 'deposits'"
          >
            Deposits
          </button>
          <button
            type="button"
            class="flex items-center justify-center rounded-[8px] transition-colors"
            :class="[activeTopTab === 'withdrawals' ? 'bg-bg-4 text-text-1' : 'text-text-2']"
            @click="activeTopTab = 'withdrawals'"
          >
            Withdrawals
          </button>
        </div>

        <section class="rounded-[12px] bg-bg-2 p-5">
          <div ref="filtersWrapRef" class="mb-4 grid grid-cols-3 gap-3">
            <div v-for="filter in desktopFilters" :key="filter.key" class="relative">
              <button
                type="button"
                class="flex h-[46px] w-full items-center justify-between rounded-[10px] border border-[var(--color-opacity-10)] bg-bg-4 px-2 text-[14px] text-text-1"
                @click="toggleFilter(filter.key)"
                @click.stop
              >
                <span>{{ getFilterDisplayLabel(filter.key, filter.title) }}</span>
                <span
                  class="ml-4 flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#3A4148] text-text-1 transition-transform"
                  :class="[openFilters[filter.key] ? 'rotate-180' : 'rotate-0']"
                >
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                    <path
                      d="M2 2L6 6L10 2"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>

              <transition name="dropdown-fade">
                <div
                  v-if="openFilters[filter.key]"
                  class="absolute left-0 top-[calc(100%+10px)] z-20 w-full rounded-[10px] bg-bg-4 p-3 shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
                  @click.stop
                >
                  <button
                    v-for="option in filter.options"
                    :key="option.value"
                    type="button"
                    class="mb-2 flex h-[34px] w-full items-center justify-between rounded-[10px] px-3 text-left text-[14px] last:mb-0"
                    :class="[
                      selectedFilters[filter.key] === option.value
                        ? 'bg-bg-4 font-[700] text-text-1'
                        : 'text-text-1 hover:bg-[var(--color-opacity-3)]'
                    ]"
                    @click.stop="selectFilterOption(filter.key, option.value)"
                  >
                    <span>{{ option.label }}</span>
                    <span
                      class="h-[18px] w-[18px] rounded-full border"
                      :class="[
                        selectedFilters[filter.key] === option.value
                          ? 'border-[#2AEE88] border-[6px]'
                          : 'border-[var(--color-opacity-15)]'
                      ]"
                    />
                  </button>
                </div>
              </transition>
            </div>
          </div>
          <MyOrdersTablePanel
            :view-state="viewState"
            :rows="paginatedRows"
            :status-class-map="statusClassMap"
            :empty-img="EmptyImg"
            :visible-page-numbers="visiblePageNumbers"
            :current-page="pagination.page"
            :is-first-page="isFirstPage"
            :is-last-page="isLastPage"
            @prev-page="goPrevPage"
            @next-page="goNextPage"
            @to-page="goToPage"
          />
        </section>
      </div>
    </WalletLayout>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import H5Header from '@/components/common/H5Header.vue'
import WalletLayout from '../index.vue'
import MyOrdersTablePanel from './MyOrdersTablePanel.vue'
import EmptyImg from '@/static/img/personalCenter/noData.png'

const { t } = useI18n()
const isMobile = useIsMobile()
const activeTopTab = ref<'deposits' | 'withdrawals'>('withdrawals')

const viewState = 'table' as 'table' | 'empty'
const pagination = reactive({
  page: 1,
  pageSize: 10
})

type FilterKey = 'date' | 'type' | 'status'

const filtersWrapRef = ref<HTMLElement | null>(null)
const openFilters = ref<Record<FilterKey, boolean>>({
  date: false,
  type: false,
  status: false
})
const selectedFilters = ref<Record<FilterKey, string>>({
  date: 'all',
  type: 'all',
  status: 'all'
})

const desktopFilters = [
  {
    key: 'date' as const,
    title: 'Date Selection',
    options: [
      { label: 'All', value: 'all' },
      { label: 'Today', value: 'today' },
      { label: 'Yesterday', value: 'yesterday' },
      { label: 'Last 3 Days', value: 'last_3_days' },
      { label: 'Last 15 Days', value: 'last_15_days' },
      { label: 'Last 30 Days', value: 'last_30_days' }
    ]
  },
  {
    key: 'type' as const,
    title: 'Type Selection',
    options: [
      { label: 'All', value: 'all' },
      { label: 'GCash', value: 'gcash' },
      { label: 'Maya', value: 'maya' },
      { label: 'GrabPya', value: 'grabpya' },
      { label: 'ShopeePay', value: 'shopeepay' },
      { label: 'USDT', value: 'usdt' }
    ]
  },
  {
    key: 'status' as const,
    title: 'Statuses Selection',
    options: [
      { label: 'All', value: 'all' },
      { label: 'Success', value: 'success' },
      { label: 'Failed', value: 'failed' },
      { label: 'Processing', value: 'processing' }
    ]
  }
] as const

const toggleFilter = (key: FilterKey) => {
  openFilters.value[key] = !openFilters.value[key]
}

const closeAllFilters = () => {
  openFilters.value.date = false
  openFilters.value.type = false
  openFilters.value.status = false
}

const selectFilterOption = (key: FilterKey, value: string) => {
  selectedFilters.value[key] = value
  openFilters.value[key] = false
}

const getFilterDisplayLabel = (key: FilterKey, fallbackTitle: string) => {
  const selectedValue = selectedFilters.value[key]
  if (!selectedValue || selectedValue === 'all') return fallbackTitle
  const targetFilter = desktopFilters.find(filter => filter.key === key)
  const selectedOption = targetFilter?.options.find(option => option.value === selectedValue)
  return selectedOption?.label ?? fallbackTitle
}

const handleClickOutsideFilters = (event: MouseEvent) => {
  if (!filtersWrapRef.value) return
  if (filtersWrapRef.value.contains(event.target as Node)) return
  closeAllFilters()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutsideFilters)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutsideFilters)
})

const rows = [
  { type: 'Gcash1', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Success' },
  { type: 'Gcash2', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Failed' },
  { type: 'Gcash3', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Success' },
  { type: 'Gcash4', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Processing' },
  { type: 'Gcash5', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Processing' },
  { type: 'Gcash6', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Processing' },
  { type: 'Gcash7', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Processing' },
  { type: 'Gcash8', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Processing' },
  { type: 'Gcash9', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Processing' },
  { type: 'Gcash10', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Processing' },
  { type: 'Gcash11', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Success' },
  { type: 'Gcash12', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Failed' },
  { type: 'Gcash13', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Success' },
  { type: 'Gcash14', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Processing' },
  { type: 'Gcash15', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Processing' },
  { type: 'Gcash16', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Processing' },
  { type: 'Gcash17', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Processing' },
  { type: 'Gcash18', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Processing' },
  { type: 'Gcash19', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Processing' },
  { type: 'Gcash20', time: '12/18/2026 11:14:15 AM', amount: '₱ 2000.00', status: 'Processing' }
] as const

const total = computed(() => rows.length)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / Math.max(1, pagination.pageSize)))
)
const isFirstPage = computed(() => pagination.page <= 1)
const isLastPage = computed(() => pagination.page >= totalPages.value)

const paginatedRows = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return rows.slice(start, end)
})

const visiblePageNumbers = computed(() => {
  const maxButtons = 6
  const allPages = totalPages.value
  if (allPages <= maxButtons) {
    return Array.from({ length: allPages }, (_, index) => index + 1)
  }

  let start = Math.max(1, pagination.page - 2)
  let end = start + maxButtons - 1
  if (end > allPages) {
    end = allPages
    start = end - maxButtons + 1
  }
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

const goToPage = (page: number) => {
  const safePage = Math.min(Math.max(page, 1), totalPages.value)
  pagination.page = safePage
}

const goPrevPage = () => {
  if (isFirstPage.value) return
  pagination.page -= 1
}

const goNextPage = () => {
  if (isLastPage.value) return
  pagination.page += 1
}

const statusClassMap: Record<'Success' | 'Failed' | 'Processing', string> = {
  Success: 'text-[#2AEE88]',
  Failed: 'text-[#FF4D4F]',
  Processing: 'text-[#F4A322]'
}
</script>

<style scoped lang="scss">
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
  transform-origin: top center;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
