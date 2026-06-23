<template>
  <div class="pc-activity-stack flex w-full flex-col items-center" :style="pcStackStyle">
    <div class="pc-modal-shell relative w-full overflow-hidden" :style="pcModalShellStyle">
      <TicketLayoutControls
        variant="pc-close"
        :is-interaction-locked="isInteractionLocked"
        :control-btn-style="pcControlBtnStyle"
        @close="emit('close')"
      />

      <TicketActivityStateGate
        :is-loading="isLoading"
        :load-error="loadError"
        :activity-session="activitySession"
        state-layout="desktop"
        :panel-style="pcFallbackPanelStyle"
        @retry="emit('retry')"
      >
        <div class="pc-modal-body flex items-stretch" :style="pcModalBodyStyle">
          <aside
            class="pc-modal-panel pc-modal-panel--left flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
            :style="pcLeftPanelSyncedStyle"
          >
            <div class="flex w-full shrink-0 flex-col items-center">
              <TicketModalHeader v-bind="headerData" align="center" layout="pc" />
            </div>
            <TicketVoucherPcPanel
              :voucher-props="voucherSwitcherProps"
              :section-divider-style="pcSectionDividerStyle"
              @select="emit('select', $event)"
              @prev="emit('prev')"
              @next="emit('next')"
              @open-voucher-list="emit('open-voucher-list')"
            />
          </aside>

          <main
            ref="rightPanelRef"
            class="pc-modal-panel pc-modal-panel--right relative isolate flex h-full min-h-0 min-w-0 flex-1 items-center justify-center self-stretch overflow-hidden"
            :style="pcRightPanelStyle"
          >
            <TicketLayoutControls
              variant="pc-help"
              :is-interaction-locked="isInteractionLocked"
              :control-btn-style="pcControlBtnStyle"
              :help-icon-style="pcHelpIconStyle"
              @open-help="openTicketTaskPop()"
            />
            <component
              :is="gameComponent"
              :key="gameId"
              :ref="setGameRef"
              v-bind="gameComponentProps"
              v-on="gameComponentListeners"
            />
          </main>
        </div>
      </TicketActivityStateGate>
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
import { openTicketTaskPop } from '../../shell/ticketToast'
import TicketLayoutControls from '../widgets/TicketLayoutControls.vue'
import TicketModalHeader from '../widgets/TicketModalHeader.vue'
import TicketWinnerTicker from '../widgets/TicketWinnerTicker.vue'
import TicketVoucherPcPanel from '../widgets/TicketVoucherPcPanel.vue'
import { useTicketDesktopPanelStyle } from '../composables/useTicketDesktopPanelStyle'
import type { TicketActivityCoreEmits, TicketActivityLayoutProps } from './activity-props'
import TicketActivityStateGate from './TicketActivityStateGate.vue'

defineProps<TicketActivityLayoutProps>()

const emit = defineEmits<TicketActivityCoreEmits>()

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
} = useTicketDesktopPanelStyle()

void rightPanelRef
</script>
