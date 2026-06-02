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
      :stub-game-component="stubGameComponent"
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
import { buildGameHeader, findGameIndex } from './shared/gameHeaderConfig'
import { getTicketGameComponent } from './shell/registry'
import { openTicketReminderDialog } from './shell/ticketDialog'
import { globalTicketToastState, switchTicketGame } from './shell/ticketToast'
import type { TicketGameId } from './shared/types'
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

const handleOpenReminder = () => {
  if (!spinInfo.value) return
  openTicketReminderDialog({
    tasks: spinInfo.value.tasks,
    rules: spinInfo.value.rules
  })
}

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
