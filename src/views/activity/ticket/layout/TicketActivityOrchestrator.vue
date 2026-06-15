<template>
  <LuckySpinRuntimeProvider v-if="shouldMountSpinProvider" />
  <TicketActivityPage
    :visible="toastState.visible"
    :is-loading="shell.isLoading.value"
    :load-error="shell.loadError.value"
    :is-interaction-locked="isInteractionLocked"
    :activity-session="shell.activitySession.value"
    :winner-records="winnerRecords"
    :game-id="toastState.gameId"
    :header-data="headerData"
    :active-game-index="shell.activeGameIndex.value"
    @close="shell.handleClosePage"
    @open-reminder="handleOpenReminder"
    @retry="shell.loadActivitySession"
    @select="handleGameSelect"
    @prev="handleFooterPrev"
    @next="handleFooterNext"
    @open-voucher-list="handleOpenMyVouchers"
  />
</template>

<script setup lang="ts">
import LuckySpinRuntimeProvider from '../components/lucky-spin/LuckySpinRuntimeProvider.vue'
import type { LuckySpinRuntimeExpose } from '../components/lucky-spin/useLuckySpinRuntime'
import { useLockBodyScroll } from '@/composables/useLockBodyScroll'
import { navigateTo } from '@/utils/router'
import TicketActivityPage from './page/TicketActivityPage.vue'
import { computed, provide, shallowRef, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLuckySpinProviderMount } from './composables/useLuckySpinProviderMount'
import { useTicketActivityHeader } from './composables/useTicketActivityHeader'
import { useTicketEscapeClose } from './composables/useTicketEscapeClose'
import { useTicketMarquee } from './composables/useTicketMarquee'
import { openTicketReminderDialog } from '../shell/ticketDialog'
import {
  TICKET_ACTIVITY_CONTEXT_KEY,
  TICKET_GAME_RUNTIME_CONTEXT_KEY,
  type TicketGameRuntimeContext
} from '../shell/ticketActivityContext'
import { REGISTER_LUCKY_SPIN_RUNTIME_KEY } from '../shell/registerLuckySpinRuntime'
import { getActiveTicketParams, globalTicketToastState } from '../shell/ticketToast'
import { useTicketActivityShell } from '../shell/useTicketActivityShell'

const { t } = useI18n()
const toastState = globalTicketToastState

const visible = computed(() => toastState.visible)
useLockBodyScroll(visible)

const { winnerRecords } = useTicketMarquee(visible)

const gameId = computed(() => toastState.gameId)
const { spinRuntime, shouldMountSpinProvider, isInteractionLocked } = useLuckySpinProviderMount({
  visible,
  gameId
})

const shell = useTicketActivityShell(visible, {
  isInteractionLocked,
  onResultDismiss: () => void spinRuntime.value?.shellHooks.onResultDismiss?.(),
  onReset: () => void spinRuntime.value?.shellHooks.onReset?.()
})

const { headerData } = useTicketActivityHeader(shell.activitySession, t)

const spinContext = shallowRef<TicketGameRuntimeContext['spin']>(undefined)

const gameRuntimeContext: TicketGameRuntimeContext = {
  activitySession: shell.activitySession,
  isInteractionLocked,
  get spin() {
    return spinContext.value
  }
}

provide(TICKET_ACTIVITY_CONTEXT_KEY, {
  activeTicketRecord: toRef(globalTicketToastState, 'activeTicketRecord'),
  getActiveTicketParams
})

provide(TICKET_GAME_RUNTIME_CONTEXT_KEY, gameRuntimeContext)

provide(REGISTER_LUCKY_SPIN_RUNTIME_KEY, (runtime: LuckySpinRuntimeExpose | null) => {
  spinRuntime.value = runtime
  spinContext.value = runtime?.spinContext
})

const handleOpenMyVouchers = () => {
  if (isInteractionLocked.value) return
  shell.handleClosePage()
  navigateTo('/myVouchers')
}

const handleOpenReminder = () => {
  if (!shell.activitySession.value) return
  openTicketReminderDialog({
    tasks: shell.activitySession.value.tasks,
    rules: shell.activitySession.value.rules,
    voucherName: headerData.value.title,
    maxPrizeText: shell.activitySession.value.maxPrizeText
  })
}

const handleGameSelect = (index: number) => {
  shell.applyVoucherSelection(index)
}

const handleFooterPrev = () => {
  shell.handleGamePrev()
  shell.applyVoucherSelection(shell.activeGameIndex.value)
}

const handleFooterNext = () => {
  shell.handleGameNext()
  shell.applyVoucherSelection(shell.activeGameIndex.value)
}

useTicketEscapeClose(visible, shell.handleClosePage)
</script>
