<template>
  <div class="p-6 pb-0 w-[1032px]">
    <div class="mb-4">
      <div class="flex items-center gap-2 flex-wrap">
        <!-- 游戏类型 -->
        <CustomSelect
          class="w-[240px]"
          v-model="filterValues.gameType"
          :options="gameTypeOptions"
          :placeholder="$t('customSelect.placeholder')"
        />
        <!-- 输赢 -->
        <CustomSelect
          class="w-[240px]"
          v-model="filterValues.winlost"
          :options="winlostOptions"
          :placeholder="$t('customSelect.placeholder')"
        />
        <!-- 状态 -->
        <CustomSelect
          class="w-[240px]"
          v-model="filterValues.status"
          :options="statusOptions"
          :placeholder="$t('customSelect.placeholder')"
        />
        <!-- 日期 -->
        <CustomSelect
          class="w-[240px]"
          v-model="filterValues.time"
          :options="timeOptions"
          :placeholder="$t('customSelect.placeholder')"
        />
      </div>
    </div>

    <div class="table-wrapper">
      <div class="table-header-bar bg-bg-3 rounded-lg py-3 px-[24px]">
        <div class="grid grid-cols-4 gap-3">
          <div class="text-text-1 text-sm font-bold text-left">
            {{ $t('betHistory.type') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('betHistory.time') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('betHistory.betAmount') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-right">
            {{ $t('betHistory.profit') }}
          </div>
        </div>
      </div>

      <div class="table-body min-h-[520px]">
        <div
          v-if="error && dataList.length === 0"
          class="flex h-[520px] items-center justify-center text-sm font-[700] text-secondary-4 cursor-pointer"
          @click="handleRetry"
        >
          {{ $t('common.requestError') }}
        </div>
        <!-- 空状态 -->
        <ThemedEmptyState
          v-else-if="!loading && dataList.length === 0"
          :dark-image="defaultImgDark"
          :light-image="defaultImgLight"
          :image-alt="$t('common.noData')"
          :message="$t('common.noData')"
          container-class="h-[520px] justify-center"
          image-class="mb-2.5 h-[200px] w-auto"
          text-class="text-text-1 text-sm font-[700]"
        />

        <template v-else>
          <div
            v-for="item in dataList"
            :key="item.id"
            class="table-row-item grid grid-cols-4 gap-3 py-3 cursor-pointer border-b border-opacity-5 px-[24px]"
            @click="handleRowClick(item)"
          >
            <div class="flex items-center justify-start gap-3">
              <span class="text-text-1 text-sm font-[700] text-center truncate">{{
                item.gameName
              }}</span>
            </div>
            <div class="text-text-2 text-sm font-[700] text-center">{{ item.time }}</div>
            <div class="text-text-1 text-sm font-[700] text-center">{{ item.betAmount }}</div>
            <div class="flex items-center justify-end gap-1">
              <span
                :class="item.result === 'win' ? 'text-secondary-2' : 'text-secondary-4'"
                class="font-[700] text-sm"
              >
                {{ item.resultAmount }}
              </span>
              <ArrowLeftIcon class="w-4 h-4 text-text-1" />
            </div>
          </div>

          <p v-if="loading" class="py-6 text-center text-sm text-text-2">
            {{ $t('common.loading') }}
          </p>
        </template>
      </div>
    </div>

    <div v-if="totalPages > 1 && dataList.length > 0" class="mt-5 flex justify-center pb-6">
      <DesktopPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @change="handlePageChange"
      />
    </div>

    <BetDetailsModal v-model="showDetailModal" :bet="selectedBet" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Api from '@/api'
import { useI18n } from 'vue-i18n'
import CustomSelect from '@/components/common/CustomSelect.vue'
import DesktopPagination from '@/components/common/DesktopPagination.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import BetDetailsModal from '../betDetails/BetDetailsModal.vue'
import ArrowLeftIcon from '@/static/svg/arrow_left2.svg?component'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import {
  BET_HISTORY_PAGE_SIZE,
  buildBetHistoryQueryForm,
  createBetHistoryGameTypeOptions,
  createBetHistoryStatusOptions,
  createBetHistoryTimeOptions,
  createBetHistoryWinlostOptions,
  createDefaultBetHistoryFilterValues,
  mapRecordToItem,
  type Item
} from './shared'

const { t } = useI18n()
const filterValues = ref(createDefaultBetHistoryFilterValues())
const dataList = ref<Item[]>([])
const loading = ref(false)
const error = ref<unknown | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)

const timeOptions = computed(() => createBetHistoryTimeOptions(t))
const winlostOptions = computed(() => createBetHistoryWinlostOptions(t))
const statusOptions = computed(() => createBetHistoryStatusOptions(t))
const gameTypeOptions = computed(() => createBetHistoryGameTypeOptions(t))

const fetchBetHistory = async (page = 1) => {
  loading.value = true
  error.value = null

  try {
    const response = await Api.record.queryOrderInfoPage(
      buildBetHistoryQueryForm({
        page,
        pageSize: BET_HISTORY_PAGE_SIZE,
        filterValues: filterValues.value
      })
    )

    if (!response.success) {
      throw new Error(response.message || t('common.requestError'))
    }

    dataList.value = response.result?.records?.map(record => mapRecordToItem(record, t)) ?? []
    currentPage.value = response.result?.current || page
    totalPages.value = Math.max(1, response.result?.pages || 1)
  } catch (requestError) {
    error.value = requestError
  } finally {
    loading.value = false
  }
}

const showDetailModal = ref(false)
const selectedBet = ref<Item | null>(null)

const handleRowClick = (item: Item) => {
  selectedBet.value = item
  showDetailModal.value = true
}

const handlePageChange = async (page: number) => {
  if (page === currentPage.value || loading.value) return
  await fetchBetHistory(page)
}

const handleRetry = async () => {
  await fetchBetHistory(currentPage.value)
}

watch(
  filterValues,
  async () => {
    currentPage.value = 1
    await fetchBetHistory(1)
  },
  { deep: true }
)

onMounted(() => {
  void fetchBetHistory(1)
})
</script>

<style scoped></style>
