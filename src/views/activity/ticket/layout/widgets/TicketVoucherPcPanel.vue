<template>
  <!--
    PC 左栏 Figma 分栏：footer 条与可滚动 grid 各需一份 TicketVoucherSwitcher，
    通过 show-pc-voucher-* 拆分展示区域，避免单实例无法满足固定头 + 滚动体布局。
  -->
  <div class="flex w-full shrink-0 flex-col items-center" :style="pcVoucherFooterSectionStyle">
    <div class="w-full" :style="sectionDividerStyle" />
    <TicketVoucherSwitcher
      v-bind="voucherProps"
      variant="grid"
      :show-pc-voucher-grid="false"
      @select="emit('select', $event)"
      @prev="emit('prev')"
      @next="emit('next')"
      @open-voucher-list="emit('open-voucher-list')"
    />
  </div>
  <div
    class="pc-left-panel-scroll flex min-h-0 flex-1 flex-col items-center overflow-y-auto overscroll-contain"
    @scroll="handleGridScroll"
  >
    <TicketVoucherSwitcher
      v-bind="voucherProps"
      variant="grid"
      :show-pc-voucher-footer="false"
      @select="emit('select', $event)"
      @prev="emit('prev')"
      @next="emit('next')"
      @open-voucher-list="emit('open-voucher-list')"
    />
  </div>
</template>

<script setup lang="ts">
import type { TicketVoucherFooterData } from '../../shared/types'
import { TICKET_PC_LAYOUT } from '../../shared/layout-tokens/ticketPcLayout'
import { computed, ref, type CSSProperties } from 'vue'
import TicketVoucherSwitcher from './TicketVoucherSwitcher.vue'

defineProps<{
  voucherProps: TicketVoucherFooterData
  sectionDividerStyle?: CSSProperties
}>()

const emit = defineEmits<{
  select: [index: number]
  prev: []
  next: []
  'open-voucher-list': []
}>()

const isGridScrolled = ref(false)

const handleGridScroll = (event: Event) => {
  const target = event.target as HTMLElement
  isGridScrolled.value = target.scrollTop > 0
}

const pcVoucherFooterSectionStyle = computed(() => ({
  marginBottom: isGridScrolled.value ? `${TICKET_PC_LAYOUT.voucher.gridScrollTopGap}px` : '0'
}))
</script>

<style scoped lang="scss">
.pc-left-panel-scroll {
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.pc-left-panel-scroll::-webkit-scrollbar {
  display: none;
}
</style>
