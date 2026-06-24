import { getLanguageCode } from '@/utils/locale'
import { fetchMbTicketListRecords, mapMbTicketListToFooter } from '../shared/mappers/mbTicketMapper'
import { setUserTicketInventoryRecords } from '../shared/userTicketInventory'
import {
  buildTicketActivitySession,
  mapMbTicketToReminderContext
} from '../shared/mappers/mapTicketActivityContext'
import { findTicketIndex } from '../shared/mappers/gameHeaderConfig'
import type { TicketActivitySession, TicketGameId } from '../shared/types'
import { closeTicketDialog, globalTicketDialogState } from './ticketDialog'
import {
  closeTicketToast,
  globalTicketToastState,
  setActiveTicketRecord,
  switchTicketGame
} from './ticketToast'
import type { Ref } from 'vue'
import { nextTick, ref, watch } from 'vue'

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
    setUserTicketInventoryRecords(records)
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

export interface TicketActivityShellOptions {
  isInteractionLocked: Ref<boolean>
  onResultDismiss?: () => void | Promise<void>
  onReset?: () => void
}

export const useTicketActivityShell = (
  visible: Ref<boolean>,
  options: TicketActivityShellOptions
) => {
  const isLoading = ref(false)
  const loadError = ref(false)
  const activitySession = ref<TicketActivitySession | null>(null)
  const activeGameIndex = ref(0)

  const syncActiveGameIndex = (session: TicketActivitySession, gameId?: string) => {
    activeGameIndex.value = findTicketIndex(session.voucherGames, {
      gameId: (gameId ?? 'lucky_spin') as TicketGameId,
      record: globalTicketToastState.activeTicketRecord
    })
  }

  const resetModalState = () => {
    loadError.value = false
    activitySession.value = null
    closeTicketDialog()
    options.onReset?.()
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

  const refreshSessionAfterResultDismiss = async () => {
    const consumedRecord = globalTicketToastState.lastConsumedTicketRecord
    if (!consumedRecord) return

    // 结果弹窗关闭（点「确定」或下一轮领取完）后：重新拉取 mbTicketList 刷新列表，
    // 并自动选中已消耗票券位置上的下一张票券。
    const session = activitySession.value
    const consumedIndex = session
      ? findTicketIndex(session.voucherGames, { record: consumedRecord })
      : 0

    try {
      const languageCode = getLanguageCode()
      const records = await fetchMbTicketListRecords(languageCode)
      globalTicketToastState.mbTicketRecords = records
      setUserTicketInventoryRecords(records)
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
    if (options.isInteractionLocked.value) return
    closeTicketToast()
  }

  const applyVoucherSelection = (index: number) => {
    const item = activitySession.value?.voucherGames[index]
    const record = globalTicketToastState.mbTicketRecords[index]
    if (!item || !record) return

    activeGameIndex.value = index

    if (item.gameId) {
      switchTicketGame(item.gameId, record)
    } else {
      setActiveTicketRecord(record)
    }
  }

  let pendingRefreshAfterReceive = false

  watch(
    () => globalTicketDialogState.kind,
    async (kind, prevKind) => {
      if (prevKind === 'result' && kind === 'receive') {
        pendingRefreshAfterReceive = true
        await options.onResultDismiss?.()
        return
      }

      if (prevKind === 'receive' && kind === 'none' && pendingRefreshAfterReceive) {
        pendingRefreshAfterReceive = false
        await refreshSessionAfterResultDismiss()
        return
      }

      if (prevKind === 'result' && kind === 'none') {
        await options.onResultDismiss?.()
        await refreshSessionAfterResultDismiss()
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
    () => globalTicketToastState.gameId,
    gameId => {
      if (!activitySession.value) return
      activeGameIndex.value = findTicketIndex(activitySession.value.voucherGames, {
        gameId,
        record: globalTicketToastState.activeTicketRecord
      })
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
    activitySession,
    activeGameIndex,
    loadActivitySession,
    syncActiveGameIndex,
    handleGamePrev,
    handleGameNext,
    handleClosePage,
    applyVoucherSelection
  }
}
