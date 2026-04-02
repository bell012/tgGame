<template>
  <!-- 订单表格容器 -->
  <div class="overflow-hidden rounded-[10px]">
    <!-- 表格表头 -->
    <div class="grid h-[58px] grid-cols-4 bg-bg-4 px-6 text-[14px] font-[700] text-text-1">
      <!-- 类型表头 -->
      <div class="flex items-center">Type</div>
      <!-- 时间表头 -->
      <div class="flex items-center">Time</div>
      <!-- 金额表头 -->
      <div class="flex items-center">Amount</div>
      <!-- 状态表头 -->
      <div class="flex items-center justify-end">Status</div>
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
          <span :class="statusClassMap[item.status]">{{ item.status }}</span>
          <span class="ml-2 text-[14px] text-text-3">›</span>
        </div>
      </button>
    </template>

    <!-- 空状态区域 -->
    <div v-else class="flex h-[520px] flex-col items-center justify-center text-center">
      <!-- 空状态图片 -->
      <img
        :src="emptyImg"
        alt="no-data"
        class="mb-4 h-[170px] w-[170px] object-contain opacity-90"
      />
      <!-- 空状态文案 -->
      <p class="text-[24px] font-[700] text-text-1">No data available at the moment.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
type ViewState = 'table' | 'empty'

type OrderRowStatus = 'Success' | 'Failed' | 'Processing'

type OrderRow = {
  id: string
  type: string
  time: string
  amount: string
  status: OrderRowStatus
}

defineProps<{
  viewState: ViewState
  rows: readonly OrderRow[]
  statusClassMap: Record<OrderRowStatus, string>
  emptyImg: string
}>()

defineEmits<{
  (event: 'row-click', row: OrderRow): void
}>()
</script>
