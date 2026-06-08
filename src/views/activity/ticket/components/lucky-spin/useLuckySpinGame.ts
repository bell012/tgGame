import Api from '@/api'
import type { UseTicketResponse, UseTicketResult } from '@/api/interface/activity'
import { getLanguageCode } from '@/utils/locale'
import { normalizeApiResponseMessage, translateApiMessageByCode } from '@/utils/request'
import {
  fetchMbTicketListRecords,
  findMbTicketsByGameId,
  mapMbTicketListToFooter
} from '../../shared/mbTicketMapper'
import { findTicketIndex } from '../../shared/gameHeaderConfig'
import type { LuckySpinInfoResult, TicketGameId } from '../../shared/types'
import {
  closeTicketDialog,
  globalTicketDialogState,
  openTicketReminderDialog,
  openTicketResultDialog
} from '../../shell/ticketDialog'
import {
  closeTicketToast,
  getActiveTicketParams,
  globalTicketToastState
} from '../../shell/ticketToast'
import {
  buildResultDialogFromUse,
  findPrizeIndexInWheelConfig,
  mapWheelConfigToPrizes
} from '../../shared/mapWheelConfig'
import { globalShowToast } from '@/utils/toast'
import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const buildFallbackFooter = () => ({
  games: [] as LuckySpinInfoResult['voucherGames'],
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

const refreshTicketSessionAfterList = (
  records: Awaited<ReturnType<typeof fetchMbTicketListRecords>>
) => {
  globalTicketToastState.mbTicketRecords = records
  const active = globalTicketToastState.activeTicketRecord

  if (active) {
    const sameRecord = records.find(
      record => record.rowId === active.rowId && record.ticketId === active.ticketId
    )
    if (sameRecord) {
      globalTicketToastState.activeTicketRecord = sameRecord
      return
    }
  }

  const matches = findMbTicketsByGameId(records, globalTicketToastState.gameId)

  if (matches.length > 0) {
    globalTicketToastState.activeTicketRecord = matches[0]!
  }
}

const clearPendingSpin = (pendingUseResult: Ref<UseTicketResult | null>) => {
  pendingUseResult.value = null
}

const isUseTicketSuccess = (response: UseTicketResponse) =>
  response.code === 'C2' && response.result != null

const resolveUseTicketErrorMessage = (
  response: Pick<UseTicketResponse, 'code' | 'message'>,
  fallback: string
) => {
  const normalized = normalizeApiResponseMessage(response)
  const translated = translateApiMessageByCode(normalized.code, normalized.message || '')

  return translated || normalized.message || fallback
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
  const spinInfo = ref<LuckySpinInfoResult | null>(null)
  const activeGameIndex = ref(0)
  const pendingUseResult = ref<UseTicketResult | null>(null)

  const wheelPrizes = computed(() => {
    const fromRecord = mapWheelConfigToPrizes(
      globalTicketToastState.activeTicketRecord?.wheelConfig
    )
    if (fromRecord.length > 0) return fromRecord
    return spinInfo.value?.prizes ?? []
  })

  const canSpin = computed(() => Boolean(getActiveTicketParams().rowId))

  const syncActiveGameIndex = (info: LuckySpinInfoResult, gameId?: string) => {
    activeGameIndex.value = findTicketIndex(info.voucherGames, {
      gameId: (gameId ?? 'lucky_spin') as TicketGameId,
      record: globalTicketToastState.activeTicketRecord
    })
  }

  const resetModalState = () => {
    isSpinning.value = false
    clearPendingSpin(pendingUseResult)
    loadError.value = false
    spinInfo.value = null
    closeTicketDialog()
    wheelRef.value?.init()
  }

  const loadSpinInfo = async () => {
    isLoading.value = true
    loadError.value = false

    try {
      const [spinResponse, footer] = await Promise.all([
        Api.activity.queryLuckySpinInfo(getActiveTicketParams()),
        fetchVoucherFooter()
      ])

      if (spinResponse.success && spinResponse.result) {
        spinInfo.value = {
          ...spinResponse.result,
          voucherGames: footer.games,
          totalVouchers: footer.totalVouchers
        }
        syncActiveGameIndex(spinInfo.value, globalTicketToastState.gameId)
        return
      }

      spinInfo.value = null
      loadError.value = true
    } catch {
      spinInfo.value = null
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

  const handleWheelGo = async () => {
    if (isSpinning.value) return

    const params = getActiveTicketParams()

    if (!params.rowId) {
      openTicketReminderDialog({
        tasks: spinInfo.value?.tasks ?? [],
        rules: spinInfo.value?.rules ?? [],
        voucherName: t('luckySpinPage.title'),
        maxPrizeText: spinInfo.value?.maxPrizeText ?? ''
      })
      return
    }

    isSpinning.value = true
    clearPendingSpin(pendingUseResult)

    try {
      const response = await Api.activity.useTicket(
        {
          rowId: params.rowId,
          ticketId: params.ticketId
        },
        { showErrorToast: false }
      )

      if (!isUseTicketSuccess(response)) {
        failSpin()
        globalShowToast({
          message: resolveUseTicketErrorMessage(response, t('luckySpinPage.loadFailed')),
          type: 'fail'
        })
        return
      }

      const useResult = response.result!
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
    } catch {
      failSpin()
      globalShowToast({
        message: t('luckySpinPage.loadFailed'),
        type: 'fail'
      })
    }
  }

  const handleSpinEnd = async () => {
    isSpinning.value = false
    if (pendingUseResult.value) {
      openResultFromUse(pendingUseResult.value)
      clearPendingSpin(pendingUseResult)
    }

    try {
      const languageCode = getLanguageCode()
      const records = await fetchMbTicketListRecords(languageCode).catch(() => null)

      if (records) {
        refreshTicketSessionAfterList(records)
      }

      const footer =
        records != null
          ? mapMbTicketListToFooter(records, languageCode)
          : await fetchVoucherFooter()

      if (spinInfo.value) {
        spinInfo.value.voucherGames = footer.games
        spinInfo.value.totalVouchers = footer.totalVouchers
      }
    } catch {
      // ignore refresh failure
    }
  }

  const handleGamePrev = () => {
    if (!spinInfo.value?.voucherGames.length) return
    activeGameIndex.value =
      (activeGameIndex.value - 1 + spinInfo.value.voucherGames.length) %
      spinInfo.value.voucherGames.length
  }

  const handleGameNext = () => {
    if (!spinInfo.value?.voucherGames.length) return
    activeGameIndex.value = (activeGameIndex.value + 1) % spinInfo.value.voucherGames.length
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
      }
    }
  )

  watch(
    visible,
    nextVisible => {
      if (nextVisible) {
        void loadSpinInfo()
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
    spinInfo,
    wheelPrizes,
    canSpin,
    activeGameIndex,
    loadSpinInfo,
    syncActiveGameIndex,
    handleWheelGo,
    handleSpinEnd,
    handleGamePrev,
    handleGameNext,
    handleClosePage
  }
}
