<template>
  <div class="p-6 pb-0 w-[1032px]">
    <div class="mb-4">
      <div class="flex items-center gap-2 flex-wrap">
        <!-- 游戏类型筛选 -->
        <CustomSelect
          class="w-[240px]"
          v-model="filters.gameType"
          :options="gameTypeOptions"
          :placeholder="$t('betHistory.filters.all')"
        />

        <!-- 资产类型筛选 -->
        <CustomSelect
          class="w-[240px]"
          v-model="filters.assetType"
          :options="assetTypeOptions"
          :placeholder="$t('betHistory.filters.allAssets')"
        />
      </div>
    </div>

    <div class="table-wrapper">
      <div class="table-header-bar bg-bg-3 rounded-lg py-3">
        <div class="grid grid-cols-4 gap-3">
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('transaction.type') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('transaction.time') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('transaction.amount') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('transaction.balance') }}
          </div>
        </div>
      </div>

      <div class="table-body">
        <template v-if="betList.length > 0">
          <div
            v-for="bet in betList"
            :key="bet.id"
            class="table-row-item grid grid-cols-4 gap-3 py-3 cursor-pointer border-b border-opacity-5"
            @click="handleRowClick(bet)"
          >
            <div class="flex items-center justify-center gap-3">
              <span class="text-text-1 text-sm font-[700] text-center">{{ bet.gameName }}</span>
            </div>
            <div class="text-text-2 text-sm font-[700] text-center">{{ bet.time }}</div>
            <div class="text-text-1 text-sm font-[700] text-center">
              <span
                :class="bet.amount >= 0 ? 'text-secondary-4' : 'text-secondary-2'"
                class="font-[700] text-sm"
              >
                {{ bet.amount >= 0 ? '+' : '' }}{{ bet.amount }}
              </span>
            </div>
            <div class="flex items-center justify-center gap-1">
              {{ bet.balance }}
              <ArrowRightIcon class="w-4 h-4 text-text-1" />
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- No More -->
    <div v-if="betList.length > 0" class="pagination-section mt-4 pb-4">
      <div v-if="!hasMore" class="text-center">
        <p class="text-text-1 text-sm font-[700]">{{ $t('betHistory.noMore') }}</p>
      </div>
    </div>
    <NoData v-if="betList.length == 0" />
    <!-- 详情弹窗 -->
    <BetDetailsModal v-model="showDetailModal" :bet="selectedBet" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CustomSelect from '@/components/common/CustomSelect.vue'
import BetDetailsModal from './betDetails/BetDetailsModal.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import bet from '@/static/img/personalCenter/bet.png'
import NoData from './components/noData.vue'

// 筛选条件
const filters = ref({
  gameType: '',
  assetType: '',
  timeRange: '24h'
})

// 筛选选项
const gameTypeOptions = computed(() => [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 3 Days', value: 'last_3_days' },
  { label: 'Last 15 Days', value: 'last_15_days' },
  { label: 'Last 30 Days', value: 'last_30_days' }
])

const assetTypeOptions = computed(() => [
  { label: 'All', value: 'all' },
  { label: 'Deposit', value: 'Deposit1' },
  { label: 'Deposit', value: 'Deposit2' },
  { label: 'Deposit', value: 'Deposit3' },
  { label: 'Deposit', value: 'Deposit4' }
])

const hasMore = ref(false)

interface BetItem {
  id: number
  gameName: string
  gameIcon: string
  gameType: string
  time: string
  amount: number
  balance: string
  result: 'win' | 'loss'
  currency: string
  orderNo: string
  remarks: string
}

// 投注列表
const betList = ref<BetItem[]>([
  {
    id: 1,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    gameType: 'Slot',
    time: '12/18/2026 11:14:15 AM',
    amount: 1000,
    balance: '₱ 1000',
    result: 'win',
    currency: 'PHP',
    orderNo: 'ts0768456746746746746',
    remarks: '--'
  },
  {
    id: 2,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    gameType: 'Slot',
    time: '12/18/2026 11:14:15 AM',
    amount: -1000,
    balance: '₱ 1000',
    result: 'win',
    currency: 'PHP',
    orderNo: 'ts0768456746746746747',
    remarks: '--'
  },
  {
    id: 3,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    gameType: 'Slot',
    time: '12/18/2026 11:14:15 AM',
    amount: -1000,
    balance: '₱ 1000',
    result: 'loss',
    currency: 'PHP',
    orderNo: 'ts0768456746746746748',
    remarks: '--'
  }
])

// 弹窗
const showDetailModal = ref(false)
const selectedBet = ref<BetItem | null>(null)

const handleRowClick = (bet: BetItem) => {
  selectedBet.value = bet
  showDetailModal.value = true
}
</script>

<style scoped></style>
