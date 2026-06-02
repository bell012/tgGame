<template>
  <section class="mx-4 mt-3 pb-4">
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
import TicketVoucherSwitcher from './TicketVoucherSwitcher.vue'

defineProps<TicketVoucherFooterData>()

const emit = defineEmits<{
  select: [index: number]
  prev: []
  next: []
  openVoucherList: []
}>()
</script>
