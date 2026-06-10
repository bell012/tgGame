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

            <TicketWinnerTicker
              :class="ticketMobileSectionClass.wheelToTicker"
              :items="winnerRecords"
            />

            <TicketVoucherFooter
              :games="activitySession.voucherGames"
              :active-index="activeGameIndex"
              :total-vouchers="activitySession.totalVouchers"
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
        <div class="pc-activity-stack flex w-full flex-col items-center" :style="pcStackStyle">
          <div class="pc-modal-shell relative w-full overflow-hidden" :style="pcModalShellStyle">
            <button
              type="button"
              class="pc-modal-control absolute right-4 top-4 z-20 flex items-center justify-center text-[18px] text-common-100 disabled:opacity-40"
              :style="pcControlBtnStyle"
              :disabled="isSpinning"
              :aria-label="t('common.cancel')"
              @click="emit('close')"
            >
              ✕
            </button>

            <div
              v-if="isLoading"
              class="flex items-center justify-center text-common-60"
              :style="pcFallbackPanelStyle"
            >
              {{ t('common.loading') }}
            </div>

            <div
              v-else-if="loadError"
              class="flex flex-col items-center justify-center gap-4 px-6 text-center"
              :style="pcFallbackPanelStyle"
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
              v-else-if="activitySession"
              class="pc-modal-body flex items-stretch"
              :style="pcModalBodyStyle"
            >
              <!-- ② 左栏高度跟随右栏，券种区超出滚动 -->
              <aside
                class="pc-modal-panel pc-modal-panel--left flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
                :style="pcLeftPanelSyncedStyle"
              >
                <div class="flex w-full shrink-0 flex-col items-center">
                  <TicketModalHeader v-bind="headerData" align="center" layout="pc" />
                  <div class="w-full" :style="pcSectionDividerStyle" />
                  <TicketVoucherSwitcher
                    :games="activitySession.voucherGames"
                    :active-index="activeGameIndex"
                    :total-vouchers="activitySession.totalVouchers"
                    :active-game-id="gameId"
                    variant="grid"
                    :show-pc-voucher-grid="false"
                    @select="emit('select', $event)"
                    @prev="emit('prev')"
                    @next="emit('next')"
                    @open-voucher-list="emit('open-voucher-list')"
                  />
                </div>
                <div
                  class="pc-left-panel-scroll flex min-h-0 flex-1 flex-col items-center overflow-y-auto overscroll-contain"
                >
                  <TicketVoucherSwitcher
                    :games="activitySession.voucherGames"
                    :active-index="activeGameIndex"
                    :total-vouchers="activitySession.totalVouchers"
                    :active-game-id="gameId"
                    variant="grid"
                    :show-pc-voucher-footer="false"
                    @select="emit('select', $event)"
                    @prev="emit('prev')"
                    @next="emit('next')"
                    @open-voucher-list="emit('open-voucher-list')"
                  />
                </div>
              </aside>

              <!-- ③ 右栏实色底（转盘区，高度锚点） -->
              <main
                ref="rightPanelRef"
                class="pc-modal-panel pc-modal-panel--right relative isolate flex h-full min-h-0 min-w-0 flex-1 items-center justify-center self-stretch overflow-hidden"
                :style="pcRightPanelStyle"
              >
                <button
                  type="button"
                  class="pc-modal-control absolute left-4 top-4 z-10 flex items-center justify-center border-0 p-0 disabled:opacity-40"
                  :style="pcControlBtnStyle"
                  :disabled="isSpinning"
                  :aria-label="t('luckySpinPage.reminder.title')"
                  @click="emit('open-reminder')"
                >
                  <img
                    :src="LUCKY_SPIN_ASSETS.controls.modalHelpIcon"
                    alt=""
                    class="shrink-0 select-none"
                    :style="pcHelpIconStyle"
                    draggable="false"
                  />
                </button>
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
            v-if="activitySession && !isLoading && !loadError"
            class="w-full"
            :style="pcTickerStyle"
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
import { TICKET_ACTIVITY_Z } from '../shared/constants'
import { LUCKY_SPIN_ASSETS } from '../shared/assets'
import { LUCKY_SPIN_TOKENS } from '../shared/design-tokens'
import { getTicketPcRightPanelPaddingX, TICKET_PC_LAYOUT } from '../shared/ticketPcLayout'
import { TICKET_PC_TOKENS } from '../shared/design-tokens'
import { ticketMobileSectionClass } from '../shared/ticketMobileLayout'
import type {
  LuckySpinPrize,
  TicketActivitySession,
  TicketGameId,
  TicketModalHeaderData,
  WinnerTickerItem
} from '../shared/types'
import { getTicketGameComponent } from '../shell/registry'
import TicketModalHeader from './TicketModalHeader.vue'
import TicketVoucherFooter from './TicketVoucherFooter.vue'
import TicketVoucherSwitcher from './TicketVoucherSwitcher.vue'
import TicketWinnerTicker from './TicketWinnerTicker.vue'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  visible: boolean
  isLoading: boolean
  loadError: boolean
  isSpinning: boolean
  activitySession: TicketActivitySession | null
  wheelPrizes?: LuckySpinPrize[]
  canSpin?: boolean
  winnerRecords?: WinnerTickerItem[]
  gameId: TicketGameId
  headerData: TicketModalHeaderData
  activeGameIndex: number
  registerWheelRef: (el: LuckySpinWheelExpose | null) => void
}

const props = withDefaults(defineProps<Props>(), {
  wheelPrizes: () => [],
  canSpin: false,
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

const rightPanelRef = ref<HTMLElement | null>(null)
const rightPanelHeight = ref(0)
let rightPanelResizeObserver: ResizeObserver | null = null

const syncRightPanelHeight = () => {
  rightPanelHeight.value = rightPanelRef.value?.offsetHeight ?? 0
}

const observeRightPanelHeight = () => {
  rightPanelResizeObserver?.disconnect()
  rightPanelResizeObserver = null

  if (!rightPanelRef.value) {
    rightPanelHeight.value = 0
    return
  }

  rightPanelResizeObserver = new ResizeObserver(() => {
    syncRightPanelHeight()
  })
  rightPanelResizeObserver.observe(rightPanelRef.value)
  syncRightPanelHeight()
}

watch(
  [() => props.visible, () => props.activitySession, () => props.gameId, isMobile],
  async ([visible]) => {
    if (!visible || isMobile.value) {
      rightPanelResizeObserver?.disconnect()
      rightPanelResizeObserver = null
      rightPanelHeight.value = 0
      return
    }

    await nextTick()
    observeRightPanelHeight()
  },
  { immediate: true }
)

onUnmounted(() => {
  rightPanelResizeObserver?.disconnect()
  rightPanelResizeObserver = null
})

const modalOverlayStyle = computed(() => {
  const blurStyle = isMobile.value
    ? {
        backdropFilter: `blur(${LUCKY_SPIN_TOKENS.modalBlur})`,
        WebkitBackdropFilter: `blur(${LUCKY_SPIN_TOKENS.modalBlur})`
      }
    : {
        backdropFilter: `blur(${TICKET_PC_LAYOUT.overlayBlur})`,
        WebkitBackdropFilter: `blur(${TICKET_PC_LAYOUT.overlayBlur})`
      }

  return {
    zIndex: TICKET_ACTIVITY_Z.modal,
    ...blurStyle
  }
})

const pcStackStyle = computed(() => ({
  width: `${TICKET_PC_LAYOUT.modalMaxWidth}px`,
  maxWidth: `${TICKET_PC_LAYOUT.modalMaxWidth}px`
}))

const pcModalBodyStyle = {
  width: `${TICKET_PC_LAYOUT.modalMaxWidth}px`,
  height: `${TICKET_PC_LAYOUT.modalBodyHeight}px`,
  minHeight: `${TICKET_PC_LAYOUT.modalBodyHeight}px`
}

const pcModalShellStyle = computed(() => ({
  borderRadius: `${TICKET_PC_LAYOUT.modalRadius}px`,
  boxShadow: TICKET_PC_LAYOUT.modalShadow
}))

const pcLeftPanelStyle = computed(() => ({
  background: TICKET_PC_LAYOUT.shellMask.bg,
  borderTopLeftRadius: `${TICKET_PC_LAYOUT.modalRadius}px`,
  borderBottomLeftRadius: `${TICKET_PC_LAYOUT.modalRadius}px`,
  paddingTop: `${TICKET_PC_LAYOUT.leftPanel.paddingTop}px`,
  paddingRight: `${TICKET_PC_LAYOUT.leftPanel.paddingRight}px`,
  paddingBottom: `${TICKET_PC_LAYOUT.leftPanel.paddingBottom}px`,
  paddingLeft: `${TICKET_PC_LAYOUT.leftPanel.paddingLeft}px`
}))

const pcLeftPanelSyncedStyle = computed(() => ({
  ...pcLeftPanelStyle.value,
  height: '100%'
}))

const pcRightPanelPaddingX = getTicketPcRightPanelPaddingX(TICKET_PC_TOKENS.wheelSizePc)

const pcRightPanelStyle = computed(() => ({
  backgroundColor: TICKET_PC_LAYOUT.rightPanelMask.bg,
  borderTopRightRadius: `${TICKET_PC_LAYOUT.modalRadius}px`,
  borderBottomRightRadius: `${TICKET_PC_LAYOUT.modalRadius}px`,
  paddingTop: `${TICKET_PC_LAYOUT.rightPanelMask.paddingTop}px`,
  paddingBottom: `${TICKET_PC_LAYOUT.rightPanelMask.paddingBottom}px`,
  paddingLeft: `${pcRightPanelPaddingX}px`,
  paddingRight: `${pcRightPanelPaddingX}px`
}))

const pcFallbackPanelStyle = computed(() => ({
  minHeight: `${TICKET_PC_LAYOUT.modalMinHeight}px`,
  padding: `${TICKET_PC_LAYOUT.modalPadding}px`
}))

const pcSectionDividerStyle = {
  marginTop: `${TICKET_PC_LAYOUT.headerToVoucherGap}px`,
  marginBottom: `${TICKET_PC_LAYOUT.headerToVoucherGap}px`,
  borderTop: TICKET_PC_LAYOUT.sectionDivider
}

const pcControlBtnStyle = {
  width: `${TICKET_PC_LAYOUT.controlBtnSize}px`,
  height: `${TICKET_PC_LAYOUT.controlBtnSize}px`,
  borderRadius: `${TICKET_PC_LAYOUT.controlBtnRadius}px`,
  backgroundColor: TICKET_PC_LAYOUT.controlBtnBg,
  border: 'none'
}

const pcHelpIconStyle = {
  width: `${TICKET_PC_LAYOUT.controlBtnIconSize}px`,
  height: `${TICKET_PC_LAYOUT.controlBtnIconSize}px`
}

const pcTickerStyle = {
  marginTop: `${TICKET_PC_LAYOUT.marquee.marginTop}px`
}

const gameComponent = computed(() => getTicketGameComponent(props.gameId))

const gameComponentProps = computed(() => {
  if (props.gameId !== 'lucky_spin' || !props.activitySession) return {}
  return {
    prizes: props.wheelPrizes,
    disabled: !props.canSpin || props.isSpinning
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

.pc-left-panel-scroll {
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.pc-left-panel-scroll::-webkit-scrollbar {
  display: none;
}
</style>
