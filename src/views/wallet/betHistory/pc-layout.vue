<template>
  <div class="p-6 pb-0 w-[1032px]">
    <div class="mb-4">
      <div class="flex items-center gap-2 flex-wrap">
        <!-- 游戏类型筛选 -->
        <CustomSelect
          v-model="filters.gameType"
          :options="gameTypeOptions"
          :placeholder="$t('betHistory.filters.all')"
        />

        <!-- 资产类型筛选 -->
        <CustomSelect
          v-model="filters.assetType"
          :options="assetTypeOptions"
          :placeholder="$t('betHistory.filters.allAssets')"
        />

        <!-- 时间范围 -->
        <CustomSelect v-model="filters.timeRange" :options="timeRangeOptions" />
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
            {{ $t('betHistory.payout') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('betHistory.profit') }}
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
            <div class="text-text-1 text-sm font-[700] text-center">{{ bet.betAmount }}</div>
            <div class="flex items-center justify-center gap-1">
              <span
                :class="bet.profit >= 0 ? 'text-secondary-4' : 'text-secondary-2'"
                class="font-[700] text-sm"
              >
                {{ bet.profit >= 0 ? '+' : '' }}{{ bet.profit }}
              </span>
              <ArrowRightIcon class="w-4 h-4" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CustomSelect from '@/components/common/CustomSelect.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'

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

// 投注列表
const betList = ref([
  {
    id: 1,
    gameName: 'Sweet Bonanza',
    time: '2024-03-24 14:30:25',
    betAmount: '10.00 USDT',
    profit: 25.5
  },
  {
    id: 2,
    gameName: 'Gates of Olympus',
    time: '2024-03-24 14:25:10',
    betAmount: '5.00 USDT',
    profit: -5.0
  }
])

const handleRowClick = (bet: any) => {
  console.log('Row clicked:', bet)
}
</script>

<style scoped></style>
