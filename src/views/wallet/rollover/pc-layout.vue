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
            {{ $t('betHistory.time') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('betHistory.amount') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('betHistory.status') }}
          </div>
        </div>
      </div>

      <div class="table-body">
        <template v-if="dataList.length > 0">
          <div
            v-for="item in dataList"
            :key="item.id"
            class="table-row-item grid grid-cols-4 gap-3 py-3 cursor-pointer border-b border-opacity-5"
            @click="handleRowClick(item)"
          >
            <div class="flex items-center justify-center gap-3">
              <span class="text-text-1 text-sm font-[700] text-center">{{ item.gameName }}</span>
            </div>
            <div class="text-text-2 text-sm font-[700] text-center">{{ item.time }}</div>
            <div class="flex items-center justify-center gap-1">
              <span
                :class="item.profit >= 0 ? 'text-secondary-4' : 'text-secondary-2'"
                class="font-[700] text-sm"
              >
                {{ item.profit >= 0 ? '+' : '-' }}{{ item.betAmount }}
              </span>
            </div>
            <div class="flex items-center justify-center gap-1">
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="item.status ? 'bg-secondary-4' : 'bg-secondary-2'"
              ></span>
              <span class="font-[700] text-sm">
                {{ item.status ? $t('transaction.completed') : $t('transaction.notCompleted') }}
              </span>
              <ArrowRightIcon class="w-4 h-4 text-text-1" />
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- No More -->
    <div v-if="dataList.length > 0" class="pagination-section mt-4 pb-4">
      <div v-if="!hasMore" class="text-center">
        <p class="text-text-1 text-sm font-[700]">{{ $t('betHistory.noMore') }}</p>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <DetailsModal v-model="showDetailModal" :data="selectedData" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CustomSelect from '@/components/common/CustomSelect.vue'
import DetailsModal from '../rolloverDetails/detailsModal.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import bet from '@/static/img/personalCenter/bet.png'

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

interface Item {
  id: number
  gameName: string
  gameIcon: string
  gameType: string
  time: string
  betAmount: string
  profit: number
  result: 'win' | 'loss'
  currency: string
  orderNo: string
  status: boolean
  actualTurnover: string
  requiredTurnover: string
  applicableGames: string
}

// 投注列表
const dataList = ref<Item[]>([
  {
    id: 1,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    gameType: 'Slot',
    time: '12/18/2026 11:14:15 AM',
    betAmount: '1000',
    profit: 1000.0,
    result: 'win',
    currency: 'PHP',
    actualTurnover: '1004',
    requiredTurnover: '1004',
    applicableGames: 'All Games',
    orderNo: 'ts0768456746746746746',
    status: true
  },
  {
    id: 2,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    gameType: 'Slot',
    time: '12/18/2026 11:14:15 AM',
    betAmount: '1000',
    profit: 1000.0,
    result: 'win',
    currency: 'PHP',
    actualTurnover: '1004',
    requiredTurnover: '1004',
    applicableGames: 'All Games',
    orderNo: 'ts0768456746746746747',
    status: true
  },
  {
    id: 3,
    gameName: 'Dragon Hatch',
    gameIcon: bet,
    gameType: 'Slot',
    time: '12/18/2026 11:14:15 AM',
    betAmount: '1000',
    profit: -1000.0,
    result: 'loss',
    currency: 'PHP',
    actualTurnover: '1004',
    requiredTurnover: '1004',
    applicableGames: 'All Games',
    orderNo: 'ts0768456746746746748',
    status: false
  }
])

// 弹窗
const showDetailModal = ref(false)
const selectedData = ref<Item | null>(null)

const handleRowClick = (item: Item) => {
  selectedData.value = item
  showDetailModal.value = true
}
</script>

<style scoped></style>
