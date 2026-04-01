<template>
  <div class="p-6 pb-0">
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

        <!-- 时间范围 -->
        <CustomSelect class="w-[240px]" v-model="filters.timeRange" :options="timeRangeOptions" />
      </div>
    </div>

    <div class="table-wrapper">
      <div class="table-header-bar bg-bg-3 rounded-lg py-3">
        <div class="grid grid-cols-4 gap-3">
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('betHistory.type') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('transaction.time') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('transaction.amount') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('transaction.status') }}
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
              <div
                :class="bet.status == 1 ? 'bg-theme-primary' : 'bg-secondary-2'"
                class="w-1.5 h-1.5 rounded-full"
              ></div>
              <span class="font-[700] text-sm">
                {{ bet.status == 1 ? $t('transaction.completed') : $t('transaction.notCompleted') }}
              </span>
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
import { useI18n } from 'vue-i18n'
import CustomSelect from '@/components/common/CustomSelect.vue'
import BetDetailsModal from './rolloverDetails/BetDetailsModal.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import bet from '@/static/img/personalCenter/bet.png'
import NoData from './components/noData.vue'

const { t } = useI18n()

// 筛选条件
const filters = ref({
  gameType: '',
  assetType: '',
  timeRange: '24h'
})

// 筛选选项
const gameTypeOptions = computed(() => [
  { label: t('betHistory.filters.all'), value: '' },
  { label: t('betHistory.filters.slot'), value: 'slot' },
  { label: t('betHistory.filters.chess'), value: 'chess' },
  { label: t('betHistory.filters.fishing'), value: 'fishing' },
  { label: t('betHistory.filters.live'), value: 'live' }
])

const assetTypeOptions = computed(() => [
  { label: t('betHistory.filters.allAssets'), value: '' },
  { label: 'USDT', value: 'usdt' },
  { label: 'BTC', value: 'btc' },
  { label: 'ETH', value: 'eth' }
])

const timeRangeOptions = computed(() => [
  { label: t('betHistory.filters.past24Hours'), value: '24h' },
  { label: t('betHistory.filters.past7Days'), value: '7d' },
  { label: t('betHistory.filters.past30Days'), value: '30d' }
])

const hasMore = ref(false)

interface BetItem {
  id: number
  gameName: string
  gameIcon: string
  gameType: string
  time: string
  amount: number
  status: number
  result: 'win' | 'loss'
  currency: string
  orderNo: string
}

// 投注列表
const betList = ref<BetItem[]>([
  {
    id: 1,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    gameType: 'Slot',
    time: '12/18/2026 11:14:15 AM',
    amount: 1000.0,
    status: 1,
    result: 'win',
    currency: 'PHP',
    orderNo: 'ts0768456746746746746'
  },
  {
    id: 2,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    gameType: 'Slot',
    time: '12/18/2026 11:14:15 AM',
    amount: 1000.0,
    status: 1,
    result: 'win',
    currency: 'PHP',
    orderNo: 'ts0768456746746746747'
  },
  {
    id: 3,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    gameType: 'Slot',
    time: '12/18/2026 11:14:15 AM',
    amount: -1000.0,
    status: 2,
    result: 'loss',
    currency: 'PHP',
    orderNo: 'ts0768456746746746748'
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
