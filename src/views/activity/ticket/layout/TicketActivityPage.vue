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
      <TicketActivityMobileLayout
        v-if="isMobile"
        :is-loading="isLoading"
        :load-error="loadError"
        :is-interaction-locked="isInteractionLocked"
        :activity-session="activitySession"
        :header-data="headerData"
        :game-id="gameId"
        :game-component="gameComponent"
        :game-component-props="gameComponentProps"
        :game-component-listeners="gameComponentListeners"
        :set-game-ref="setGameRef"
        :winner-records="winnerRecords"
        :voucher-switcher-props="voucherSwitcherProps"
        @close="emit('close')"
        @open-reminder="emit('open-reminder')"
        @retry="emit('retry')"
        @select="emit('select', $event)"
        @prev="emit('prev')"
        @next="emit('next')"
        @open-voucher-list="emit('open-voucher-list')"
      />

      <TicketActivityDesktopLayout
        v-else
        :visible="visible"
        :is-loading="isLoading"
        :load-error="loadError"
        :is-interaction-locked="isInteractionLocked"
        :activity-session="activitySession"
        :header-data="headerData"
        :game-id="gameId"
        :game-component="gameComponent"
        :game-component-props="gameComponentProps"
        :game-component-listeners="gameComponentListeners"
        :set-game-ref="setGameRef"
        :winner-records="winnerRecords"
        :voucher-switcher-props="voucherSwitcherProps"
        :is-mobile="isMobile"
        @close="emit('close')"
        @open-reminder="emit('open-reminder')"
        @retry="emit('retry')"
        @select="emit('select', $event)"
        @prev="emit('prev')"
        @next="emit('next')"
        @open-voucher-list="emit('open-voucher-list')"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { getTicketGameAdapter } from '../shell/gameRegistry'
import { TICKET_GAME_RUNTIME_CONTEXT_KEY } from '../shell/ticketActivityContext'
import { LUCKY_SPIN_TOKENS } from '../shared/design-tokens'
import { TICKET_PC_LAYOUT } from '../shared/ticketPcLayout'
import type {
  TicketActivitySession,
  TicketGameId,
  TicketModalHeaderData,
  WinnerTickerItem
} from '../shared/types'
import { useTicketActivityPcLayout } from './composables/useTicketActivityPcLayout'
import TicketActivityDesktopLayout from './TicketActivityDesktopLayout.vue'
import TicketActivityMobileLayout from './TicketActivityMobileLayout.vue'
import { computed, inject, toRef } from 'vue'

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

const emit = defineEmits<{
  close: []
  'open-reminder': []
  retry: []
  select: [index: number]
  prev: []
  next: []
  'open-voucher-list': []
}>()

const isMobile = useIsMobile()
const gameRuntimeContext = inject(TICKET_GAME_RUNTIME_CONTEXT_KEY)

const { modalOverlayStyleMobile, modalOverlayStylePc } = useTicketActivityPcLayout({
  visible: toRef(props, 'visible'),
  activitySession: computed(() => props.activitySession),
  gameId: toRef(props, 'gameId'),
  isMobile
})

const modalOverlayStyle = computed(() =>
  isMobile.value ? modalOverlayStyleMobile.value : modalOverlayStylePc.value
)

const gameAdapter = computed(() => getTicketGameAdapter(props.gameId))

const gameComponent = computed(() => gameAdapter.value.component)

const gameComponentProps = computed(() => {
  if (!gameRuntimeContext) return {}
  void gameRuntimeContext.spin
  return gameAdapter.value.resolveProps(gameRuntimeContext)
})

const gameComponentListeners = computed(() => {
  if (!gameRuntimeContext) return {}
  void gameRuntimeContext.spin
  return gameAdapter.value.resolveListeners(gameRuntimeContext)
})

const setGameRef = (el: unknown) => {
  if (!gameRuntimeContext) return
  void gameRuntimeContext.spin
  gameAdapter.value.registerRef?.(el, gameRuntimeContext)
}

const voucherSwitcherProps = computed(() => ({
  games: props.activitySession?.voucherGames ?? [],
  activeIndex: props.activeGameIndex,
  totalVouchers: props.activitySession?.totalVouchers ?? 0,
  activeGameId: props.gameId
}))
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
