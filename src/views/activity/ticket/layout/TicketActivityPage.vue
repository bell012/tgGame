<template>
  <transition name="ticket-toast-fade">
    <div
      v-show="visible"
      class="ticket-toast-modal fixed inset-0 z-[70] overscroll-contain"
      :class="[
        LUCKY_SPIN_TOKENS.modalMaskClass,
        isMobile
          ? 'flex h-[100dvh] min-h-0 flex-col overflow-hidden'
          : 'flex items-center justify-center overflow-y-auto p-6'
      ]"
      :style="modalBackdropStyle"
    >
      <!-- Mobile layout -->
      <template v-if="isMobile">
        <div
          class="flex shrink-0 items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+8px)]"
        >
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

        <div
          v-if="isLoading"
          class="flex min-h-0 flex-1 items-center justify-center text-common-60"
        >
          {{ t('common.loading') }}
        </div>

        <div
          v-else-if="loadError"
          class="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 text-center"
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

        <div
          v-else-if="spinInfo"
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
              :games="spinInfo.voucherGames"
              :active-index="activeGameIndex"
              :total-vouchers="spinInfo.totalVouchers"
              :active-game-id="gameId"
              @select="emit('select', $event)"
              @prev="emit('prev')"
              @next="emit('next')"
              @open-voucher-list="emit('open-voucher-list')"
            />
          </div>
        </div>
      </template>

      <!-- Desktop layout -->
      <template v-else>
        <div class="flex w-full max-w-[960px] flex-col items-center">
          <div
            class="relative w-full rounded-[24px] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
            :style="pcModalCardStyle"
          >
            <div class="absolute right-4 top-4 z-10 flex items-center gap-2">
              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white/10 text-[18px] text-common-80 disabled:opacity-40"
                :disabled="isSpinning"
                :aria-label="t('luckySpinPage.reminder.title')"
                @click="emit('open-reminder')"
              >
                ?
              </button>
              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white/10 text-[18px] text-common-100 disabled:opacity-40"
                :disabled="isSpinning"
                :aria-label="t('common.cancel')"
                @click="emit('close')"
              >
                ✕
              </button>
            </div>

            <div
              v-if="isLoading"
              class="flex min-h-[420px] items-center justify-center text-common-60"
            >
              {{ t('common.loading') }}
            </div>

            <div
              v-else-if="loadError"
              class="flex min-h-[420px] flex-col items-center justify-center gap-4 px-6 text-center"
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

            <div
              v-else-if="spinInfo"
              class="grid items-center gap-6 p-7 pt-14"
              :style="pcGridStyle"
            >
              <aside class="min-w-0">
                <TicketModalHeader v-bind="headerData" align="start" />
                <TicketVoucherSwitcher
                  :games="spinInfo.voucherGames"
                  :active-index="activeGameIndex"
                  :total-vouchers="spinInfo.totalVouchers"
                  :active-game-id="gameId"
                  variant="grid"
                  @select="emit('select', $event)"
                  @prev="emit('prev')"
                  @next="emit('next')"
                  @open-voucher-list="emit('open-voucher-list')"
                />
              </aside>

              <main class="flex min-w-0 items-center justify-center">
                <component
                  :is="gameComponent"
                  :key="gameId"
                  :ref="setGameRef"
                  v-bind="gameComponentProps"
                  v-on="gameComponentListeners"
                />
              </main>
            </div>
          </div>

          <TicketWinnerTicker
            v-if="spinInfo && !isLoading && !loadError"
            class="mt-3 w-full"
            :items="winnerRecords"
            compact
          />
        </div>
      </template>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { LuckySpinWheelExpose } from '../components/lucky-spin/useLuckySpinGame'
import { useIsMobile } from '@/composables/useMediaQuery'
import { LUCKY_SPIN_TOKENS, TICKET_PC_TOKENS } from '../shared/design-tokens'
import { ticketMobileSectionClass } from '../shared/ticketMobileLayout'
import type {
  LuckySpinInfoResult,
  TicketGameId,
  TicketModalHeaderData,
  WinnerTickerItem
} from '../shared/types'
import { getTicketGameComponent } from '../shell/registry'
import TicketModalHeader from './TicketModalHeader.vue'
import TicketVoucherFooter from './TicketVoucherFooter.vue'
import TicketVoucherSwitcher from './TicketVoucherSwitcher.vue'
import TicketWinnerTicker from './TicketWinnerTicker.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  visible: boolean
  isLoading: boolean
  loadError: boolean
  isSpinning: boolean
  spinInfo: LuckySpinInfoResult | null
  winnerRecords?: WinnerTickerItem[]
  gameId: TicketGameId
  headerData: TicketModalHeaderData
  activeGameIndex: number
  registerWheelRef: (el: LuckySpinWheelExpose | null) => void
}

const props = withDefaults(defineProps<Props>(), {
  winnerRecords: () => []
})

const emit = defineEmits<{
  close: []
  'open-reminder': []
  retry: []
  go: []
  'spin-end': []
  select: [index: number]
  prev: []
  next: []
  'open-voucher-list': []
}>()

const { t } = useI18n()
const isMobile = useIsMobile()

const modalBackdropStyle = computed(() => ({
  backdropFilter: `blur(${LUCKY_SPIN_TOKENS.modalBlur})`,
  WebkitBackdropFilter: `blur(${LUCKY_SPIN_TOKENS.modalBlur})`
}))

const pcModalCardStyle = computed(() => ({
  background: TICKET_PC_TOKENS.activityModalBg,
  backdropFilter: `blur(${LUCKY_SPIN_TOKENS.modalBlur})`,
  WebkitBackdropFilter: `blur(${LUCKY_SPIN_TOKENS.modalBlur})`
}))

const pcGridStyle = computed(() => ({
  gridTemplateColumns: `${TICKET_PC_TOKENS.leftColumnRatio} ${TICKET_PC_TOKENS.rightColumnRatio}`
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
  z-index: 99;
}

.ticket-mobile-content {
  -webkit-overflow-scrolling: touch;
}

.ticket-mobile-content__center {
  box-sizing: border-box;
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
