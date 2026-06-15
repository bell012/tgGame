<template>
  <transition name="ticket-toast-fade">
    <div
      v-show="visible"
      class="ticket-toast-modal fixed inset-0 overscroll-contain"
      :class="[
        isMobile ? LUCKY_SPIN_TOKENS.modalMaskClass : TICKET_PC_LAYOUT.overlayMaskClass,
        isMobile
          ? 'flex h-[100dvh] min-h-0 flex-col overflow-hidden'
          : 'flex items-center justify-center overflow-y-auto p-6'
      ]"
      :style="modalOverlayStyle"
    >
      <component
        :is="isMobile ? TicketActivityMobileLayout : TicketActivityDesktopLayout"
        v-bind="layoutBindings"
        v-on="layoutListeners"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { LUCKY_SPIN_TOKENS } from '../../shared/design-tokens'
import { TICKET_PC_LAYOUT } from '../../shared/layout-tokens/ticketPcLayout'
import type {
  TicketActivitySession,
  TicketGameId,
  TicketModalHeaderData,
  WinnerTickerItem
} from '../../shared/types'
import { useTicketGameSlot } from '../composables/useTicketGameSlot'
import { useTicketOverlayStyle } from '../composables/useTicketOverlayStyle'
import type { TicketActivityCoreEmits } from './activity-props'
import TicketActivityDesktopLayout from './TicketActivityDesktopLayout.vue'
import TicketActivityMobileLayout from './TicketActivityMobileLayout.vue'
import { computed, toRefs } from 'vue'

interface Props {
  visible: boolean
  isLoading: boolean
  loadError: boolean
  isInteractionLocked: boolean
  activitySession: TicketActivitySession | null
  winnerRecords?: WinnerTickerItem[]
  gameId: TicketGameId
  headerData: TicketModalHeaderData
  activeGameIndex: number
}

const props = withDefaults(defineProps<Props>(), {
  winnerRecords: () => []
})

const emit = defineEmits<TicketActivityCoreEmits>()

const isMobile = useIsMobile()
const { modalOverlayStyle } = useTicketOverlayStyle(isMobile)

const { gameId, activitySession, activeGameIndex } = toRefs(props)

const {
  gameComponent,
  gameComponentProps,
  gameComponentListeners,
  setGameRef,
  voucherSwitcherProps
} = useTicketGameSlot({ gameId, activitySession, activeGameIndex })

const layoutBindings = computed(() => ({
  isLoading: props.isLoading,
  loadError: props.loadError,
  isInteractionLocked: props.isInteractionLocked,
  activitySession: props.activitySession,
  headerData: props.headerData,
  gameId: props.gameId,
  winnerRecords: props.winnerRecords,
  gameComponent: gameComponent.value,
  gameComponentProps: gameComponentProps.value,
  gameComponentListeners: gameComponentListeners.value,
  setGameRef,
  voucherSwitcherProps: voucherSwitcherProps.value
}))

const layoutListeners = {
  close: () => emit('close'),
  'open-reminder': () => emit('open-reminder'),
  retry: () => emit('retry'),
  select: (index: number) => emit('select', index),
  prev: () => emit('prev'),
  next: () => emit('next'),
  'open-voucher-list': () => emit('open-voucher-list')
}
</script>

<style scoped lang="scss">
.ticket-toast-fade-enter-active,
.ticket-toast-fade-leave-active {
  transition: opacity 0.24s ease;
}

.ticket-toast-fade-enter-from,
.ticket-toast-fade-leave-to {
  opacity: 0;
}
</style>
