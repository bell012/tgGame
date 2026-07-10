<template>
  <section class="mx-auto w-full overflow-visible pb-4" :class="sectionClass.tickerToFooter">
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
import { computed } from 'vue'
import type { TicketGameId, TicketVoucherFooterData } from '../../shared/types'
import { getTicketMobileSectionClass } from '../../shared/layout-tokens/ticketMobileLayout'
import TicketVoucherSwitcher from './TicketVoucherSwitcher.vue'

const props = defineProps<
  TicketVoucherFooterData & {
    gameId?: TicketGameId
  }
>()

const sectionClass = computed(() => getTicketMobileSectionClass(props.gameId))

const emit = defineEmits<{
  select: [index: number]
  prev: []
  next: []
  openVoucherList: []
}>()
</script>
