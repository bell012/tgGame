<template>
  <div class="pc-activity-stack flex w-full flex-col items-center" :style="pcStackStyle">
    <div class="pc-modal-shell relative w-full overflow-hidden" :style="pcModalShellStyle">
      <button
        type="button"
        class="pc-modal-control absolute right-4 top-4 z-20 flex items-center justify-center text-[18px] text-common-100 disabled:opacity-40"
        :style="pcControlBtnStyle"
        :disabled="isInteractionLocked"
        :aria-label="t('common.cancel')"
        @click="emit('close')"
      >
        ✕
      </button>

      <TicketActivityStatePanel
        v-if="isLoading"
        state="loading"
        layout="desktop"
        :panel-style="pcFallbackPanelStyle"
      />
      <TicketActivityStatePanel
        v-else-if="loadError"
        state="error"
        layout="desktop"
        :panel-style="pcFallbackPanelStyle"
        @retry="emit('retry')"
      />

      <div
        v-else-if="activitySession"
        class="pc-modal-body flex items-stretch"
        :style="pcModalBodyStyle"
      >
        <aside
          class="pc-modal-panel pc-modal-panel--left flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          :style="pcLeftPanelSyncedStyle"
        >
          <div class="flex w-full shrink-0 flex-col items-center">
            <TicketModalHeader v-bind="headerData" align="center" layout="pc" />
            <div class="w-full" :style="pcSectionDividerStyle" />
            <TicketVoucherSwitcher
              v-bind="voucherSwitcherProps"
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
              v-bind="voucherSwitcherProps"
              variant="grid"
              :show-pc-voucher-footer="false"
              @select="emit('select', $event)"
              @prev="emit('prev')"
              @next="emit('next')"
              @open-voucher-list="emit('open-voucher-list')"
            />
          </div>
        </aside>

        <main
          ref="rightPanelRef"
          class="pc-modal-panel pc-modal-panel--right relative isolate flex h-full min-h-0 min-w-0 flex-1 items-center justify-center self-stretch overflow-hidden"
          :style="pcRightPanelStyle"
        >
          <button
            type="button"
            class="pc-modal-control absolute left-4 top-4 z-10 flex items-center justify-center border-0 p-0 disabled:opacity-40"
            :style="pcControlBtnStyle"
            :disabled="isInteractionLocked"
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

<script setup lang="ts">
import { LUCKY_SPIN_ASSETS } from '../shared/assets'
import type {
  TicketActivitySession,
  TicketGameId,
  TicketModalHeaderData,
  TicketVoucherFooterData,
  WinnerTickerItem
} from '../shared/types'
import type { Component } from 'vue'
import { computed, toRef } from 'vue'
import { useTicketActivityPcLayout } from './composables/useTicketActivityPcLayout'
import TicketActivityStatePanel from './TicketActivityStatePanel.vue'
import TicketModalHeader from './TicketModalHeader.vue'
import TicketVoucherSwitcher from './TicketVoucherSwitcher.vue'
import TicketWinnerTicker from './TicketWinnerTicker.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
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
  isMobile: boolean
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

const {
  rightPanelRef,
  pcStackStyle,
  pcModalBodyStyle,
  pcModalShellStyle,
  pcLeftPanelSyncedStyle,
  pcRightPanelStyle,
  pcFallbackPanelStyle,
  pcSectionDividerStyle,
  pcControlBtnStyle,
  pcHelpIconStyle,
  pcTickerStyle
} = useTicketActivityPcLayout({
  visible: toRef(props, 'visible'),
  activitySession: computed(() => props.activitySession),
  gameId: toRef(props, 'gameId'),
  isMobile: computed(() => props.isMobile)
})
</script>

<style scoped lang="scss">
.pc-left-panel-scroll {
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.pc-left-panel-scroll::-webkit-scrollbar {
  display: none;
}
</style>
