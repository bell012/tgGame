import type { UseTicketResult } from '@/api/interface/activity'
import { getLanguageCode } from '@/utils/locale'
import { fetchMbTicketListRecords, mapMbTicketListToFooter } from '../../shared/mbTicketMapper'
import {
  buildTicketActivitySession,
  mapMbTicketToReminderContext
} from '../../shared/mapTicketActivityContext'
import { findTicketIndex } from '../../shared/gameHeaderConfig'
import type { TicketActivitySession, TicketGameId } from '../../shared/types'
import {
  closeTicketDialog,
  globalTicketDialogState,
  openTicketReminderDialog,
  openTicketResultDialog
} from '../../shell/ticketDialog'
import {
  closeTicketToast,
  getActiveTicketParams,
  globalTicketToastState,
  setActiveTicketRecord,
  switchTicketGame
} from '../../shell/ticketToast'
import {
  buildResultDialogFromUse,
  findPrizeIndexInWheelConfig,
  mapWheelConfigToPrizes
} from '../../shared/mapWheelConfig'
import { useTicketUseAction } from '../../shared'
import { globalShowToast } from '@/utils/toast'
import type { Ref } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const buildFallbackFooter = () => ({
  games: [] as TicketActivitySession['voucherGames'],
  totalVouchers: 0
})

const fetchVoucherFooter = async () => {
  const languageCode = getLanguageCode()
  const cachedRecords = globalTicketToastState.mbTicketRecords

  if (cachedRecords.length > 0) {
    return mapMbTicketListToFooter(cachedRecords, languageCode)
  }

  try {
    const records = await fetchMbTicketListRecords(languageCode)
    globalTicketToastState.mbTicketRecords = records
    return mapMbTicketListToFooter(records, languageCode)
  } catch {
    // mbTicketList 失败不阻断活动页
  }

  return buildFallbackFooter()
}

const syncReminderContext = (session: TicketActivitySession) => {
  const reminder = mapMbTicketToReminderContext(globalTicketToastState.activeTicketRecord)
  session.maxPrizeText = reminder.maxPrizeText
  session.tasks = reminder.tasks
  session.rules = reminder.rules
}

const clearPendingSpin = (pendingUseResult: Ref<UseTicketResult | null>) => {
  pendingUseResult.value = null
}

export interface LuckySpinWheelExpose {
  spinTo: (index: number) => void
  init: () => void
  clearSectorHighlight: () => void
}

export const useLuckySpinGame = (
  wheelRef: Ref<LuckySpinWheelExpose | null>,
  visible: Ref<boolean>
) => {
  const { t } = useI18n()

  const isLoading = ref(false)
  const loadError = ref(false)
  const isSpinning = ref(false)
  const activitySession = ref<TicketActivitySession | null>(null)
  const activeGameIndex = ref(0)
  const pendingUseResult = ref<UseTicketResult | null>(null)

  const { runUseTicket } = useTicketUseAction()

  const wheelPrizes = computed(() =>
    mapWheelConfigToPrizes(globalTicketToastState.activeTicketRecord?.wheelConfig)
  )

  const canSpin = computed(() => Boolean(getActiveTicketParams().rowId))

  const syncActiveGameIndex = (session: TicketActivitySession, gameId?: string) => {
    activeGameIndex.value = findTicketIndex(session.voucherGames, {
      gameId: (gameId ?? 'lucky_spin') as TicketGameId,
      record: globalTicketToastState.activeTicketRecord
    })
  }

  const resetModalState = () => {
    isSpinning.value = false
    clearPendingSpin(pendingUseResult)
    loadError.value = false
    activitySession.value = null
    closeTicketDialog()
    wheelRef.value?.init()
  }

  const loadActivitySession = async () => {
    isLoading.value = true
    loadError.value = false

    try {
      const footer = await fetchVoucherFooter()

      if (footer.games.length === 0 && globalTicketToastState.mbTicketRecords.length === 0) {
        loadError.value = true
        activitySession.value = null
        return
      }

      activitySession.value = buildTicketActivitySession(
        footer,
        globalTicketToastState.activeTicketRecord
      )
      syncActiveGameIndex(activitySession.value, globalTicketToastState.gameId)
    } catch {
      activitySession.value = null
      loadError.value = true
    } finally {
      isLoading.value = false
    }
  }

  const openResultFromUse = (result: UseTicketResult) => {
    openTicketResultDialog(buildResultDialogFromUse(result))
  }

  const failSpin = () => {
    isSpinning.value = false
    clearPendingSpin(pendingUseResult)
    wheelRef.value?.clearSectorHighlight()
  }

  const openReminderDialog = () => {
    const reminder =
      activitySession.value ??
      mapMbTicketToReminderContext(globalTicketToastState.activeTicketRecord)

    openTicketReminderDialog({
      tasks: reminder.tasks ?? [],
      rules: reminder.rules ?? [],
      voucherName: t('luckySpinPage.title'),
      maxPrizeText: reminder.maxPrizeText ?? ''
    })
  }

  const handleWheelGo = async () => {
    if (isSpinning.value) return

    const params = getActiveTicketParams()

    if (!params.rowId) {
      openReminderDialog()
      return
    }

    isSpinning.value = true
    clearPendingSpin(pendingUseResult)

    await runUseTicket({
      voucherName: t('luckySpinPage.title'),
      fallbackErrorMessage: t('luckySpinPage.loadFailed'),
      openReminderOnMissingRow: false,
      onSuccess: useResult => {
        const wheelConfig = globalTicketToastState.activeTicketRecord?.wheelConfig
        const prizeIndex = findPrizeIndexInWheelConfig(
          wheelConfig,
          Number(useResult.rewardType ?? 2),
          useResult.rewardAmount
        )

        if (prizeIndex < 0) {
          failSpin()
          globalShowToast({
            message: t('luckySpinPage.loadFailed'),
            type: 'fail'
          })
          return
        }

        pendingUseResult.value = useResult
        wheelRef.value?.spinTo(prizeIndex)
      },
      onError: failSpin
    })
  }

  const handleSpinEnd = () => {
    isSpinning.value = false
    if (pendingUseResult.value) {
      openResultFromUse(pendingUseResult.value)
      clearPendingSpin(pendingUseResult)
    }
  }

  const refreshSessionAfterResultDismiss = async () => {
    const consumedRecord = globalTicketToastState.lastConsumedTicketRecord
    if (!consumedRecord) return

    const session = activitySession.value
    const consumedIndex = session
      ? findTicketIndex(session.voucherGames, { record: consumedRecord })
      : 0

    try {
      const languageCode = getLanguageCode()
      const records = await fetchMbTicketListRecords(languageCode)
      globalTicketToastState.mbTicketRecords = records
      const footer = mapMbTicketListToFooter(records, languageCode)

      globalTicketToastState.lastConsumedTicketRecord = null

      if (footer.games.length === 0) {
        closeTicketToast()
        return
      }

      if (session) {
        session.voucherGames = footer.games
        session.totalVouchers = footer.totalVouchers
      }

      const nextIndex = Math.min(Math.max(consumedIndex, 0), footer.games.length - 1)
      const nextItem = footer.games[nextIndex]
      const nextRecord = records[nextIndex]

      if (nextItem && nextRecord) {
        await nextTick()

        activeGameIndex.value = nextIndex
        if (nextItem.gameId) {
          switchTicketGame(nextItem.gameId, nextRecord)
        } else {
          setActiveTicketRecord(nextRecord)
        }
        if (session) {
          syncReminderContext(session)
        }
      }
    } catch {
      globalTicketToastState.lastConsumedTicketRecord = null
    }
  }

  const handleGamePrev = () => {
    if (!activitySession.value?.voucherGames.length) return
    activeGameIndex.value =
      (activeGameIndex.value - 1 + activitySession.value.voucherGames.length) %
      activitySession.value.voucherGames.length
  }

  const handleGameNext = () => {
    if (!activitySession.value?.voucherGames.length) return
    activeGameIndex.value = (activeGameIndex.value + 1) % activitySession.value.voucherGames.length
  }

  const handleClosePage = () => {
    if (isSpinning.value) return
    closeTicketToast()
  }

  watch(
    () => globalTicketDialogState.kind,
    (kind, prevKind) => {
      if (prevKind === 'result' && kind === 'none') {
        wheelRef.value?.clearSectorHighlight()
        void refreshSessionAfterResultDismiss()
      }
    }
  )

  watch(
    () => globalTicketToastState.activeTicketRecord,
    () => {
      if (!activitySession.value) return
      syncReminderContext(activitySession.value)
    }
  )

  watch(
    visible,
    nextVisible => {
      if (nextVisible) {
        void loadActivitySession()
        return
      }
      resetModalState()
    },
    { immediate: false }
  )

  return {
    isLoading,
    loadError,
    isSpinning,
    activitySession,
    wheelPrizes,
    canSpin,
    activeGameIndex,
    loadActivitySession,
    syncActiveGameIndex,
    handleWheelGo,
    handleSpinEnd,
    handleGamePrev,
    handleGameNext,
    handleClosePage
  }
}
