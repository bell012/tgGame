<template>
  <Teleport to="body">
    <transition name="ticket-toast-fade">
      <div
        v-show="toastState.visible"
        class="ticket-toast-modal fixed inset-0 z-[60] flex min-h-0 flex-col overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
        :class="LUCKY_SPIN_TOKENS.modalMaskClass"
        :style="modalBackdropStyle"
      >
        <div class="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+8px)]">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center text-[18px] text-common-100 disabled:opacity-40"
            :disabled="isSpinning"
            :aria-label="t('common.cancel')"
            @click="handleClosePage"
          >
            ✕
          </button>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center text-[18px] text-common-80 disabled:opacity-40"
            :disabled="isSpinning"
            :aria-label="t('luckySpinPage.reminder.title')"
            @click="showReminder = true"
          >
            ?
          </button>
        </div>

        <div v-if="isLoading" class="flex min-h-[60vh] items-center justify-center text-common-60">
          {{ t('common.loading') }}
        </div>

        <div
          v-else-if="loadError"
          class="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center"
        >
          <p class="text-[14px] text-common-60">{{ t('luckySpinPage.loadFailed') }}</p>
          <button
            type="button"
            class="rounded-[10px] bg-theme-primary px-6 py-2 text-[14px] font-[700] text-text-4"
            @click="loadSpinInfo"
          >
            {{ t('luckySpinPage.retry') }}
          </button>
        </div>

        <template v-else-if="spinInfo">
          <TicketModalHeader v-bind="headerData" />

          <div class="mt-1">
            <LuckySpinWheel
              v-if="toastState.gameId === 'lucky_spin'"
              ref="wheelRef"
              :prizes="spinInfo.prizes"
              :disabled="spinInfo.remainingSpins <= 0 || isSpinning"
              @go="handleWheelGo"
              @spin-end="handleSpinEnd"
            />
            <component :is="stubGameComponent" v-else />
          </div>

          <TicketWinnerTicker :items="spinInfo.winnerRecords" />

          <TicketVoucherFooter
            :games="spinInfo.voucherGames"
            :active-index="activeGameIndex"
            :total-vouchers="spinInfo.totalVouchers"
            :active-game-id="toastState.gameId"
            @select="handleGameSelect"
            @prev="handleFooterPrev"
            @next="handleFooterNext"
            @open-voucher-list="showReminder = true"
          />
        </template>
      </div>
    </transition>

    <TicketResultPopup
      v-model:visible="showResult"
      :variant="resultVariant"
      :highlight-text="resultHighlight"
      :vouchers="resultVouchers"
      :voucher-count="resultVouchers.length"
    />

    <LuckySpinReminderPopup
      v-model:visible="showReminder"
      :tasks="spinInfo?.tasks ?? []"
      :rules="spinInfo?.rules ?? []"
      @deposit="handleDeposit"
    />
  </Teleport>
</template>

<script setup lang="ts">
import TicketResultPopup from './components/dialogs/TicketResultPopup.vue'
import { useLockBodyScroll } from '@/composables/useLockBodyScroll'
import LuckySpinReminderPopup from './components/dialogs/LuckySpinReminderPopup.vue'
import LuckySpinWheel from './components/LuckySpinWheel.vue'
import TicketModalHeader from './TicketModalHeader.vue'
import TicketWinnerTicker from './TicketWinnerTicker.vue'
import TicketVoucherFooter from './TicketVoucherFooter.vue'
import { buildGameHeader, findGameIndex } from './gameHeaderConfig'
import { getTicketGameComponent } from './registry'
import { globalTicketToastState, switchTicketGame } from './ticketToast'
import type { TicketGameId } from './types'
import { LUCKY_SPIN_TOKENS } from './design-tokens'
import type { LuckySpinWheelExpose } from './useLuckySpinGame'
import { useLuckySpinGame } from './useLuckySpinGame'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const toastState = globalTicketToastState

const visible = computed(() => toastState.visible)
useLockBodyScroll(visible)

const modalBackdropStyle = computed(() => ({
  backdropFilter: `blur(${LUCKY_SPIN_TOKENS.modalBlur})`,
  WebkitBackdropFilter: `blur(${LUCKY_SPIN_TOKENS.modalBlur})`
}))

const wheelRef = ref<LuckySpinWheelExpose | null>(null)

const {
  isLoading,
  loadError,
  isSpinning,
  spinInfo,
  activeGameIndex,
  showReminder,
  showResult,
  resultVariant,
  resultHighlight,
  resultVouchers,
  loadSpinInfo,
  handleWheelGo,
  handleSpinEnd,
  handleGamePrev,
  handleGameNext,
  handleDeposit,
  handleClosePage
} = useLuckySpinGame(wheelRef, visible)

const headerData = computed(() => {
  if (!spinInfo.value) {
    return {
      title: '',
      subtitle: '',
      theme: toastState.gameId
    }
  }
  return buildGameHeader(toastState.gameId, spinInfo.value, t)
})

const stubGameComponent = computed(() => getTicketGameComponent(toastState.gameId))

const handleGameSelect = (index: number) => {
  const game = spinInfo.value?.voucherGames[index]
  if (!game) return

  activeGameIndex.value = index
  switchTicketGame(game.id as TicketGameId)
}

const handleFooterPrev = () => {
  handleGamePrev()
  const game = spinInfo.value?.voucherGames[activeGameIndex.value]
  if (game) switchTicketGame(game.id as TicketGameId)
}

const handleFooterNext = () => {
  handleGameNext()
  const game = spinInfo.value?.voucherGames[activeGameIndex.value]
  if (game) switchTicketGame(game.id as TicketGameId)
}

watch(
  () => toastState.gameId,
  gameId => {
    if (!spinInfo.value) return
    activeGameIndex.value = findGameIndex(spinInfo.value.voucherGames, gameId)
  }
)

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  handleClosePage()
}

watch(visible, nextVisible => {
  if (nextVisible) {
    document.addEventListener('keydown', handleEscapeKey)
    return
  }
  document.removeEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})
</script>

<style scoped lang="scss">
.ticket-toast-modal {
  -webkit-overflow-scrolling: touch;
}

.ticket-toast-fade-enter-active,
.ticket-toast-fade-leave-active {
  transition: opacity 0.24s ease;
}

.ticket-toast-fade-enter-from,
.ticket-toast-fade-leave-to {
  opacity: 0;
}
</style>
