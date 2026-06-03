<template>
  <div class="p-6 pb-0 w-[1032px]">
    <!-- 筛选区 -->
    <div class="mb-5 flex items-center gap-3 flex-wrap">
      <CustomSelect
        class="w-[240px]"
        v-model="filterValues.time"
        :options="timeOptions"
        :placeholder="$t('betHistory.filterGroups.date')"
        use-placeholder-when-all
      />
      <CustomSelect
        class="w-[240px]"
        v-model="filterValues.type"
        :options="typeOptions"
        :placeholder="$t('vouchers.type')"
        use-placeholder-when-all
      />
    </div>

    <!-- Total Bonus Won-->
    <div class="mb-5 flex items-center">
      <span class="text-base font-[400] text-text-2">{{ $t('vouchers.totalBonusWon') }}：</span>
      <span :class="['text-xl font-[700] text-secondary-7']">
        {{ totalBonusWonText }}
      </span>
    </div>

    <!-- 列表区 -->
    <div class="table-body min-h-[520px]">
      <!-- 错误字 -->
      <div v-if="error && dataList.length === 0" class="flex h-[520px] items-center justify-center">
        <p class="cursor-pointer text-sm font-[700] text-secondary-4" @click="() => fetchData(1)">
          {{ $t('common.requestError') }}
        </p>
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
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="item in dataList"
            :key="item.id"
            class="flex items-center rounded-[16px] bg-bg-3 px-5 py-4"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate text-xl font-[700] text-text-1">{{ item.name }}</p>
              <p class="mt-4 truncate text-base text-text-3">
                {{ $t('vouchers.usedAt') }}: {{ item.usedAtText }}
              </p>
            </div>
            <span v-if="item.amountText" :class="['shrink-0 text-2xl font-[700] text-text-1']">
              {{ item.amountText }}
            </span>
          </div>
        </div>

        <p v-if="loading" class="py-6 text-center text-sm text-text-2">
          {{ $t('common.loading') }}
        </p>
      </template>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1 && dataList.length > 0" class="mt-5 flex justify-center pb-6">
      <DesktopPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CustomSelect from '@/components/common/CustomSelect.vue'
import DesktopPagination from '@/components/common/DesktopPagination.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import {
  createVoucherHistoryTimeOptions,
  createVoucherHistoryTypeOptions,
  useVoucherHistoryPagedPage
} from './shared'

const { t } = useI18n()
const {
  filterValues,
  dataList,
  loading,
  error,
  currentPage,
  totalPages,
  totalBonusWonText,
  fetchData,
  handlePageChange
} = useVoucherHistoryPagedPage()

const timeOptions = computed(() => createVoucherHistoryTimeOptions(t))
const typeOptions = computed(() => createVoucherHistoryTypeOptions(t))
</script>

<style scoped></style>
