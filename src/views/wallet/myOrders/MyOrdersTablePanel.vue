<template>
  <!-- 订单表格容器 -->
  <div class="overflow-hidden rounded-[10px]">
    <!-- 表格表头 -->
    <div class="grid h-[58px] grid-cols-4 bg-bg-4 px-6 text-[14px] font-[700] text-text-1">
      <!-- 类型表头 -->
      <div class="flex items-center">{{ t('wallet.myOrdersPage.table.type') }}</div>
      <!-- 时间表头 -->
      <div class="flex items-center">{{ t('wallet.myOrdersPage.table.time') }}</div>
      <!-- 金额表头 -->
      <div class="flex items-center">{{ t('wallet.myOrdersPage.table.amount') }}</div>
      <!-- 状态表头 -->
      <div class="flex items-center justify-end">{{ t('wallet.myOrdersPage.table.status') }}</div>
    </div>

    <!-- 表格数据区域 -->
    <template v-if="viewState === 'table'">
      <!-- 表格数据行 -->
      <button
        v-for="item in rows"
        :key="item.id"
        type="button"
        class="grid h-[74px] w-full grid-cols-4 border-b border-opacity-5 px-6 text-left text-[14px]"
        @click="$emit('row-click', item)"
      >
        <!-- 类型单元格 -->
        <div class="flex items-center font-[700] text-text-1">{{ item.type }}</div>
        <!-- 时间单元格 -->
        <div class="flex items-center text-text-2">{{ item.time }}</div>
        <!-- 金额单元格 -->
        <div class="flex items-center font-[700] text-text-1">{{ item.amount }}</div>
        <!-- 状态单元格 -->
        <div class="flex items-center justify-end font-[700]">
          <span :class="item.statusClass">{{ item.status }}</span>
          <span class="ml-2 text-[14px] text-text-3">›</span>
        </div>
      </button>
    </template>

    <!-- 空状态区域 -->
    <div v-else class="flex h-[520px] flex-col items-center justify-center text-center">
      <!-- 空状态 -->
      <ThemedEmptyState
        :dark-image="EmptyImg"
        :image-alt="t('common.noData')"
        :message="t('common.noData')"
        container-class="mt-0"
        image-class="mb-2.5 h-[200px] w-auto"
        text-class="mb-5 text-text-1 text-sm font-[700]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import EmptyImg from '@/static/img/personalCenter/noData.png'

type ViewState = 'table' | 'empty'

type OrderRow = {
  id: string
  type: string
  time: string
  amount: string
  status: string
  statusClass: string
}

defineProps<{
  viewState: ViewState
  rows: readonly OrderRow[]
  emptyImg: string
}>()

const { t } = useI18n()

defineEmits<{
  (event: 'row-click', row: OrderRow): void
}>()
</script>
