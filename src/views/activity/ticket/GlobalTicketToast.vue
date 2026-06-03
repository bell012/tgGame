<template>
  <Teleport to="body">
    <!-- 活动抽奖页面 -->
    <TicketActivityPage
      :visible="toastState.visible"
      :is-loading="isLoading"
      :load-error="loadError"
      :is-spinning="isSpinning"
      :spin-info="spinInfo"
      :game-id="toastState.gameId"
      :header-data="headerData"
      :active-game-index="activeGameIndex"
      :register-wheel-ref="registerWheelRef"
      @close="handleClosePage"
      @open-reminder="handleOpenReminder"
      @retry="loadSpinInfo"
      @go="handleWheelGo"
      @spin-end="handleSpinEnd"
      @select="handleGameSelect"
      @prev="handleFooterPrev"
      @next="handleFooterNext"
      @open-voucher-list="handleOpenMyVouchers"
    />
    <!-- 帮助中心弹窗 -->
    <TicketReminderPopup />
    <!-- 活动抽奖结果弹窗1 -->
    <TicketResultHeroPopup />
    <!-- 活动抽奖结果弹窗2 -->
    <TicketResultCardsPopup />
    <!-- TODO 活动抽奖结果弹窗3 后续可扩展 -->
  </Teleport>
</template>

<script setup lang="ts">
import TicketResultCardsPopup from './layout/dialogs/result/TicketResultCardsPopup.vue'
import TicketResultHeroPopup from './layout/dialogs/result/TicketResultHeroPopup.vue'
import { useLockBodyScroll } from '@/composables/useLockBodyScroll'
import TicketReminderPopup from './layout/dialogs/TicketReminderPopup.vue'
import TicketActivityPage from './layout/TicketActivityPage.vue'
import { getLanguageCode } from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import { getMbTicketLanguageCopy } from './shared/mbTicketMapper'
import { getTicketActivityEndUseTime } from './shared/ticketActivityCountdown'
import { buildGameHeader, findTicketIndex } from './shared/gameHeaderConfig'
import { openTicketReminderDialog } from './shell/ticketDialog'
import {
  globalTicketToastState,
  setActiveTicketRecord,
  switchTicketGame
} from './shell/ticketToast'
import type { LuckySpinWheelExpose } from './components/lucky-spin/useLuckySpinGame'
import { useLuckySpinGame } from './components/lucky-spin/useLuckySpinGame'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const toastState = globalTicketToastState

const visible = computed(() => toastState.visible)
useLockBodyScroll(visible)

const wheelRef = ref<LuckySpinWheelExpose | null>(null)

const registerWheelRef = (el: LuckySpinWheelExpose | null) => {
  wheelRef.value = el
}

const {
  isLoading,
  loadError,
  isSpinning,
  spinInfo,
  activeGameIndex,
  loadSpinInfo,
  handleWheelGo,
  handleSpinEnd,
  handleGamePrev,
  handleGameNext,
  handleClosePage
} = useLuckySpinGame(wheelRef, visible)

const headerData = computed(() => {
  const record = globalTicketToastState.activeTicketRecord
  const { description: voucherDescription } = getMbTicketLanguageCopy(record, getLanguageCode())
  const voucherEndTime = getTicketActivityEndUseTime(record)

  if (!spinInfo.value) {
    return {
      title: '',
      subtitle: voucherDescription,
      theme: toastState.gameId,
      endTime: voucherEndTime > 0 ? voucherEndTime : undefined
    }
  }

  const baseHeader = buildGameHeader(toastState.gameId, spinInfo.value, t)

  return {
    ...baseHeader,
    subtitle: voucherDescription || baseHeader.subtitle,
    endTime: voucherEndTime > 0 ? voucherEndTime : undefined
  }
})

const handleOpenMyVouchers = () => {
  if (isSpinning.value) return
  handleClosePage()
  navigateTo('/myVouchers')
}

const handleOpenReminder = () => {
  if (!spinInfo.value) return
  openTicketReminderDialog({
    tasks: spinInfo.value.tasks,
    rules: spinInfo.value.rules,
    voucherName: headerData.value.title,
    maxPrizeText: spinInfo.value.maxPrizeText
  })
}

const applyVoucherSelection = (index: number) => {
  const item = spinInfo.value?.voucherGames[index]
  const record = globalTicketToastState.mbTicketRecords[index]
  if (!item || !record) return

  activeGameIndex.value = index

  if (item.gameId) {
    switchTicketGame(item.gameId, record)
    return
  }

  setActiveTicketRecord(record)
}

const handleGameSelect = (index: number) => {
  applyVoucherSelection(index)
}

const handleFooterPrev = () => {
  handleGamePrev()
  applyVoucherSelection(activeGameIndex.value)
}

const handleFooterNext = () => {
  handleGameNext()
  applyVoucherSelection(activeGameIndex.value)
}

watch(
  () => toastState.gameId,
  gameId => {
    if (!spinInfo.value) return
    activeGameIndex.value = findTicketIndex(spinInfo.value.voucherGames, {
      gameId,
      record: globalTicketToastState.activeTicketRecord
    })
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
