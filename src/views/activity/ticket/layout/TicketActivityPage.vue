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
          <!-- 大转盘游戏组件 -->
          <LuckySpinWheel
            v-if="gameId === 'lucky_spin'"
            :ref="setWheelRef"
            :prizes="spinInfo.prizes"
            :disabled="spinInfo.remainingSpins <= 0 || isSpinning"
            @go="emit('go')"
            @spin-end="emit('spin-end')"
          />
          <!-- 除了大转盘的其他游戏组件 -->
          <component :is="stubGameComponent" v-else />
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
import LuckySpinWheel from '../components/lucky-spin/LuckySpinWheel.vue'
import type { LuckySpinWheelExpose } from '../components/lucky-spin/useLuckySpinGame'
import { LUCKY_SPIN_TOKENS } from '../shared/design-tokens'
import type { LuckySpinInfoResult, TicketGameId, TicketModalHeaderData } from '../shared/types'
import TicketModalHeader from './TicketModalHeader.vue'
import TicketVoucherFooter from './TicketVoucherFooter.vue'
import TicketWinnerTicker from './TicketWinnerTicker.vue'
import type { Component } from 'vue'
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
  stubGameComponent: Component
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

const setWheelRef = (el: unknown) => {
  props.registerWheelRef(el as LuckySpinWheelExpose | null)
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
