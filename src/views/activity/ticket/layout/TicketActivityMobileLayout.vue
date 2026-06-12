<template>
  <div
    class="flex shrink-0 items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+8px)]"
  >
    <button
      type="button"
      class="flex h-9 w-9 items-center justify-center text-[18px] text-common-100 disabled:opacity-40"
      :disabled="isInteractionLocked"
      :aria-label="t('common.cancel')"
      @click="emit('close')"
    >
      ✕
    </button>
    <button
      type="button"
      class="flex h-9 w-9 items-center justify-center text-[18px] text-common-80 disabled:opacity-40"
      :disabled="isInteractionLocked"
      :aria-label="t('luckySpinPage.reminder.title')"
      @click="emit('open-reminder')"
    >
      ?
    </button>
  </div>

  <TicketActivityStatePanel v-if="isLoading" state="loading" layout="mobile" />
  <TicketActivityStatePanel
    v-else-if="loadError"
    state="error"
    layout="mobile"
    @retry="emit('retry')"
  />

  <div
    v-else-if="activitySession"
    class="ticket-mobile-content flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
  >
    <div
      class="ticket-mobile-content__center flex w-full min-h-full flex-col items-center justify-center"
    >
      <TicketModalHeader v-bind="headerData" align="center" />

      <div :class="ticketMobileSectionClass.headerToWheel">
        <component
          :is="gameComponent"
          :key="gameId"
          :ref="setGameRef"
          v-bind="gameComponentProps"
          v-on="gameComponentListeners"
        />
      </div>

      <TicketWinnerTicker :class="ticketMobileSectionClass.wheelToTicker" :items="winnerRecords" />

      <TicketVoucherFooter
        v-bind="voucherSwitcherProps"
        @select="emit('select', $event)"
        @prev="emit('prev')"
        @next="emit('next')"
        @open-voucher-list="emit('open-voucher-list')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ticketMobileSectionClass } from '../shared/ticketMobileLayout'
import type {
  TicketActivitySession,
  TicketGameId,
  TicketModalHeaderData,
  TicketVoucherFooterData,
  WinnerTickerItem
} from '../shared/types'
import type { Component } from 'vue'
import TicketActivityStatePanel from './TicketActivityStatePanel.vue'
import TicketModalHeader from './TicketModalHeader.vue'
import TicketVoucherFooter from './TicketVoucherFooter.vue'
import TicketWinnerTicker from './TicketWinnerTicker.vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  isLoading: boolean
  loadError: boolean
  isInteractionLocked: boolean
  activitySession: TicketActivitySession | null
  headerData: TicketModalHeaderData
  gameId: TicketGameId
  gameComponent: Component
  gameComponentProps: Record<string, unknown>
  gameComponentListeners: Record<string, (...args: unknown[]) => void>
  setGameRef: (el: unknown) => void
  winnerRecords: WinnerTickerItem[]
  voucherSwitcherProps: TicketVoucherFooterData
}>()

const emit = defineEmits<{
  close: []
  'open-reminder': []
  retry: []
  select: [index: number]
  prev: []
  next: []
  'open-voucher-list': []
}>()

const { t } = useI18n()
</script>

<style scoped lang="scss">
.ticket-mobile-content {
  -webkit-overflow-scrolling: touch;
}

.ticket-mobile-content__center {
  box-sizing: border-box;
}
</style>
