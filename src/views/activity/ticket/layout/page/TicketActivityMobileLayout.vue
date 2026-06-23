<template>
  <TicketLayoutControls
    variant="mobile-bar"
    :is-interaction-locked="isInteractionLocked"
    @close="emit('close')"
    @open-help="openTicketTaskPop()"
  />

  <TicketActivityStateGate
    :is-loading="isLoading"
    :load-error="loadError"
    :activity-session="activitySession"
    state-layout="mobile"
    @retry="emit('retry')"
  >
    <div
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

        <TicketWinnerTicker
          :class="ticketMobileSectionClass.wheelToTicker"
          :items="winnerRecords"
        />

        <TicketVoucherFooter
          v-bind="voucherSwitcherProps"
          @select="emit('select', $event)"
          @prev="emit('prev')"
          @next="emit('next')"
          @open-voucher-list="emit('open-voucher-list')"
        />
      </div>
    </div>
  </TicketActivityStateGate>
</template>

<script setup lang="ts">
import { openTicketTaskPop } from '../../shell/ticketToast'
import { ticketMobileSectionClass } from '../../shared/layout-tokens/ticketMobileLayout'
import TicketLayoutControls from '../widgets/TicketLayoutControls.vue'
import TicketModalHeader from '../widgets/TicketModalHeader.vue'
import TicketWinnerTicker from '../widgets/TicketWinnerTicker.vue'
import TicketVoucherFooter from '../widgets/TicketVoucherFooter.vue'
import type { TicketActivityCoreEmits, TicketActivityLayoutProps } from './activity-props'
import TicketActivityStateGate from './TicketActivityStateGate.vue'

defineProps<TicketActivityLayoutProps>()

const emit = defineEmits<TicketActivityCoreEmits>()
</script>

<style scoped lang="scss">
.ticket-mobile-content {
  -webkit-overflow-scrolling: touch;
}

.ticket-mobile-content__center {
  box-sizing: border-box;
}
</style>
