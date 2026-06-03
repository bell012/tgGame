<template>
  <div>
    <div
      v-if="isReady && isMobile"
      class="voucherHistory-mobile-page fixed inset-0 bg-bg-1 sm:hidden flex flex-col overflow-hidden"
    >
      <H5Header :title="$t('vouchers.voucherHistory')" :show-sort="true" @sort="handleSort" />

      <div
        ref="scrollRoot"
        class="voucherHistory-scroll-root flex-1 min-h-0 overflow-y-auto overscroll-contain"
      >
        <div class="py-[20px] px-3.5">
          <div class="flex items-center mb-[20px]">
            <span class="text-sm font-[400] text-text-2">{{ $t('vouchers.totalBonusWon') }}：</span>
            <span :class="['text-sm font-[700] text-secondary-7']">
              {{ totalBonusWonText }}
            </span>
          </div>

          <!-- 错误字 -->
          <div
            v-if="error && dataList.length === 0"
            class="flex flex-col items-center justify-center mt-[100px] gap-3"
          >
            <p class="text-secondary-4 text-xs font-[500]" @click="handleRetry">
              {{ $t('common.requestError') }}
            </p>
          </div>

          <!-- 空状态 -->
          <div
            v-else-if="!loading && dataList.length === 0"
            class="flex flex-col items-center justify-center mt-[100px]"
          >
            <ThemedEmptyState
              :dark-image="defaultImgDark"
              :light-image="defaultImgLight"
              :image-alt="$t('common.noData')"
              :message="$t('common.noData')"
              container-class="mt-0"
              image-class="h-[200px] w-auto mb-2.5"
              text-class="text-text-1 text-xs font-[500]"
            />
          </div>

          <!-- 列表 -->
          <div v-else class="flex flex-col gap-[10px]">
            <div
              v-for="item in dataList"
              :key="item.id"
              class="rounded-[10px] bg-bg-2 px-3.5 py-3.5"
            >
              <div class="flex items-center">
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-[700] text-text-1">{{ item.name }}</p>
                  <p class="mt-[7px] truncate text-[10px] text-text-3">
                    {{ $t('vouchers.usedAt') }}: {{ item.usedAtText }}
                  </p>
                </div>
                <span v-if="item.amountText" :class="['text-lg font-[700] text-text-1']">
                  {{ item.amountText }}
                </span>
              </div>
            </div>

            <p v-if="loading" class="py-3 text-center text-xs text-text-2">
              {{ dataList.length === 0 ? $t('common.loading') : $t('common.loadingMore') }}
            </p>
            <p
              v-else="finished && dataList.length > 0"
              class="py-3 text-center text-xs text-text-2"
            >
              {{ $t('betHistory.noMore') }}
            </p>

            <div ref="loadMoreSentinel" class="h-px w-full"></div>
          </div>
        </div>
      </div>

      <!-- 筛选弹窗 -->
      <FilterPopup
        v-model:visible="showFilterPopup"
        v-model="filterValues"
        :filter-groups="filterGroups"
        @apply="handleFilterApply"
      />
    </div>

    <WalletLayout v-else-if="isReady" current-tab="voucherHistory">
      <div class="bg-bg-2 rounded-xl overflow-hidden">
        <PcLayout />
      </div>
    </WalletLayout>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useIsMobile } from '@/composables/useMediaQuery'
import H5Header from '@/components/common/H5Header.vue'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import WalletLayout from '../index.vue'
import PcLayout from './pc-layout.vue'
import {
  createDefaultVoucherHistoryFilterValues,
  createVoucherHistoryTimeOptions,
  createVoucherHistoryTypeOptions,
  useVoucherHistoryInfinitePage
} from './shared'

const { t } = useI18n()
const isMobile = useIsMobile()
const isReady = ref(false)

usePageScrollLock(() => isMobile.value)

const scrollRoot = ref<HTMLElement | null>(null)
const loadMoreSentinel = ref<HTMLElement | null>(null)

const { filterValues, dataList, loading, finished, error, totalBonusWonText, refresh } =
  useVoucherHistoryInfinitePage({
    scrollRoot,
    sentinel: loadMoreSentinel,
    enabled: () => isReady.value && isMobile.value
  })

const filterGroups = computed<FilterGroup[]>(() => [
  {
    key: 'time',
    title: t('betHistory.filterGroups.date'),
    options: createVoucherHistoryTimeOptions(t)
  },
  {
    key: 'type',
    title: t('vouchers.type'),
    options: createVoucherHistoryTypeOptions(t)
  }
])

const showFilterPopup = ref(false)

const handleSort = () => {
  showFilterPopup.value = true
}

const handleFilterApply = async (values: Record<string, string | string[]>) => {
  filterValues.value = {
    ...createDefaultVoucherHistoryFilterValues(),
    ...values
  }
  await refresh()
}

const handleRetry = async () => {
  await refresh()
}

onMounted(() => {
  isReady.value = true
})
</script>

<style scoped lang="scss">
.voucherHistory-mobile-page {
  height: 100vh;
  height: 100dvh;
  overscroll-behavior: none;
}

.voucherHistory-scroll-root {
  overscroll-behavior: contain;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}
</style>
