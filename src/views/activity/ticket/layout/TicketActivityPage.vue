<template>
  <transition name="ticket-toast-fade">
    <div
      v-show="visible"
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
          @click="emit('close')"
        >
          ✕
        </button>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center text-[18px] text-common-80 disabled:opacity-40"
          :disabled="isSpinning"
          :aria-label="t('luckySpinPage.reminder.title')"
          @click="emit('open-reminder')"
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
          @click="emit('retry')"
        >
          {{ t('luckySpinPage.retry') }}
        </button>
      </div>

      <template v-else-if="spinInfo">
        <!-- 活动页头 -->
        <TicketModalHeader v-bind="headerData" />

        <div class="mt-1">
          <!-- 游戏组件：大转盘、红包、砸金蛋、开盲盒、现金券 -->
          <component
            :is="gameComponent"
            :key="gameId"
            :ref="setGameRef"
            v-bind="gameComponentProps"
            v-on="gameComponentListeners"
          />
        </div>

        <!-- 中奖者列表 -->
        <TicketWinnerTicker :items="spinInfo.winnerRecords" />

        <!-- 优惠券列表 -->
        <TicketVoucherFooter
          :games="spinInfo.voucherGames"
          :active-index="activeGameIndex"
          :total-vouchers="spinInfo.totalVouchers"
          :active-game-id="gameId"
          @select="emit('select', $event)"
          @prev="emit('prev')"
          @next="emit('next')"
          @open-voucher-list="emit('open-reminder')"
        />
      </template>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { LuckySpinWheelExpose } from '../components/lucky-spin/useLuckySpinGame'
import { LUCKY_SPIN_TOKENS } from '../shared/design-tokens'
import type { LuckySpinInfoResult, TicketGameId, TicketModalHeaderData } from '../shared/types'
import { getTicketGameComponent } from '../shell/registry'
import TicketModalHeader from './TicketModalHeader.vue'
import TicketVoucherFooter from './TicketVoucherFooter.vue'
import TicketWinnerTicker from './TicketWinnerTicker.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  visible: boolean
  isLoading: boolean
  loadError: boolean
  isSpinning: boolean
  spinInfo: LuckySpinInfoResult | null
  gameId: TicketGameId
  headerData: TicketModalHeaderData
  activeGameIndex: number
  registerWheelRef: (el: LuckySpinWheelExpose | null) => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'open-reminder': []
  retry: []
  go: []
  'spin-end': []
  select: [index: number]
  prev: []
  next: []
}>()

const { t } = useI18n()

const modalBackdropStyle = computed(() => ({
  backdropFilter: `blur(${LUCKY_SPIN_TOKENS.modalBlur})`,
  WebkitBackdropFilter: `blur(${LUCKY_SPIN_TOKENS.modalBlur})`
}))

const gameComponent = computed(() => getTicketGameComponent(props.gameId))

const gameComponentProps = computed(() => {
  if (props.gameId !== 'lucky_spin' || !props.spinInfo) return {}
  return {
    prizes: props.spinInfo.prizes,
    disabled: props.spinInfo.remainingSpins <= 0 || props.isSpinning
  }
})

const gameComponentListeners = computed(() => {
  if (props.gameId !== 'lucky_spin') return {}
  return {
    go: () => emit('go'),
    spinEnd: () => emit('spin-end')
  }
})

const setGameRef = (el: unknown) => {
  if (el && props.gameId === 'lucky_spin') {
    props.registerWheelRef(el as LuckySpinWheelExpose)
    return
  }
  if (!el) {
    props.registerWheelRef(null)
  }
}
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
