<template>
  <section
    class="mx-auto w-full max-w-[340px] overflow-visible px-[14px] pb-4"
    :class="ticketMobileSectionClass.tickerToFooter"
  >
    <TicketVoucherSwitcher
      :games="games"
      :active-index="activeIndex"
      :total-vouchers="totalVouchers"
      :active-game-id="activeGameId"
      variant="carousel"
      @select="emit('select', $event)"
      @prev="emit('prev')"
      @next="emit('next')"
      @open-voucher-list="emit('openVoucherList')"
    />
  </section>
</template>

<script setup lang="ts">
import type { TicketVoucherFooterData } from '../shared/types'
import { ticketMobileSectionClass } from '../shared/layout-tokens/ticketMobileLayout'
import TicketVoucherSwitcher from './TicketVoucherSwitcher.vue'

defineProps<TicketVoucherFooterData>()

const emit = defineEmits<{
  select: [index: number]
  prev: []
  next: []
  openVoucherList: []
}>()
</script>
