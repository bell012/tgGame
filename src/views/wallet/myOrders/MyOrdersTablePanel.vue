<template>
  <div class="overflow-hidden rounded-[10px]">
    <div class="grid h-[58px] grid-cols-4 bg-bg-4 px-6 text-[14px] font-[700] text-text-1">
      <div class="flex items-center">Type</div>
      <div class="flex items-center">Time</div>
      <div class="flex items-center">Amount</div>
      <div class="flex items-center justify-end">Status</div>
    </div>

    <template v-if="viewState === 'table'">
      <div
        v-for="(item, idx) in rows"
        :key="`${item.type}-${idx}`"
        class="grid h-[74px] grid-cols-4 border-b border-[#FFFFFF0A] px-6 text-[14px]"
      >
        <div class="flex items-center font-[700] text-text-1">{{ item.type }}</div>
        <div class="flex items-center text-text-2">{{ item.time }}</div>
        <div class="flex items-center font-[700] text-text-1">{{ item.amount }}</div>
        <div class="flex items-center justify-end font-[700]">
          <span :class="statusClassMap[item.status]">{{ item.status }}</span>
          <span class="ml-2 text-[14px] text-text-3">›</span>
        </div>
      </div>
    </template>

    <div v-else class="flex h-[520px] flex-col items-center justify-center text-center">
      <img
        :src="emptyImg"
        alt="no-data"
        class="mb-4 h-[170px] w-[170px] object-contain opacity-90"
      />
      <p class="text-[24px] font-[700] text-text-1">No data available at the moment.</p>
    </div>
  </div>

  <div v-if="viewState === 'table'" class="mt-5 flex justify-center gap-2">
    <button
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--color-opacity-10)] bg-bg-4 text-[14px]"
      :class="[isFirstPage ? 'cursor-not-allowed text-text-3' : 'cursor-pointer text-text-2']"
      :disabled="isFirstPage"
      @click="$emit('prev-page')"
    >
      ‹
    </button>
    <button
      v-for="num in visiblePageNumbers"
      :key="num"
      type="button"
      :class="[
        'flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border text-[14px]',
        num === currentPage
          ? 'border-theme-primary bg-theme-primary text-text-4 font-[700]'
          : 'border-[var(--color-opacity-10)] bg-bg-4 text-text-2'
      ]"
      @click="$emit('to-page', num)"
    >
      {{ num }}
    </button>
    <button
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--color-opacity-10)] bg-bg-4 text-[14px]"
      :class="[isLastPage ? 'cursor-not-allowed text-text-3' : 'cursor-pointer text-text-2']"
      :disabled="isLastPage"
      @click="$emit('next-page')"
    >
      ›
    </button>
  </div>
</template>

<script setup lang="ts">
type ViewState = 'table' | 'empty'

type OrderRowStatus = 'Success' | 'Failed' | 'Processing'

type OrderRow = {
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
  visiblePageNumbers: number[]
  currentPage: number
  isFirstPage: boolean
  isLastPage: boolean
}>()

defineEmits<{
  (event: 'prev-page'): void
  (event: 'next-page'): void
  (event: 'to-page', page: number): void
}>()
</script>
